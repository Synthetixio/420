pragma solidity ^0.8.21;

import {
    ICoreProxy,
    PoolCollateralConfiguration,
    CollateralConfiguration
} from "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import {IAccountProxy} from "@synthetixio/v3-contracts/1-main/IAccountProxy.sol";
import {ITreasuryMarketProxy} from "@synthetixio/v3-contracts/1-main/ITreasuryMarketProxy.sol";
import {ILegacyMarketProxy} from "@synthetixio/v3-contracts/1-main/ILegacyMarketProxy.sol";
import {IV2x} from "@synthetixio/v3-contracts/1-main/IV2x.sol";
import {IV2xUsd} from "@synthetixio/v3-contracts/1-main/IV2xUsd.sol";
import {IERC20} from "@synthetixio/core-contracts/contracts/interfaces/IERC20.sol";
import {IAddressResolver} from "../../src/IAddressResolver.sol";

import {Pool420Withdraw} from "../../src/Pool420Withdraw.sol";
import {Test} from "forge-std/src/Test.sol";

contract Pool420WithdrawTest is Test {
    ICoreProxy internal CoreProxy;
    IAccountProxy internal AccountProxy;
    ITreasuryMarketProxy internal TreasuryMarketProxy;
    ILegacyMarketProxy internal LegacyMarketProxy;
    IV2x internal V2x;
    IV2xUsd internal V2xUsd;
    IAddressResolver internal V2xResolver;

    IERC20 internal $SNX;
    IERC20 internal $snxUSD;
    IERC20 internal $sUSD;

    uint256 internal fork;
    uint256 internal forkBlockNumber;
    string internal deployment;
    string internal forkUrl;

    Pool420Withdraw internal pool420Withdraw;

    function initialize() internal {
        string memory root = vm.projectRoot();
        string memory metaPath =
            string.concat(root, "/../../node_modules/@synthetixio/v3-contracts/", deployment, "/meta.json");
        string memory metaJson = vm.readFile(metaPath);

        CoreProxy = ICoreProxy(vm.parseJsonAddress(metaJson, ".contracts.CoreProxy"));
        vm.label(address(CoreProxy), "CoreProxy");

        AccountProxy = IAccountProxy(vm.parseJsonAddress(metaJson, ".contracts.AccountProxy"));
        vm.label(address(AccountProxy), "AccountProxy");

        TreasuryMarketProxy = ITreasuryMarketProxy(vm.parseJsonAddress(metaJson, ".contracts.TreasuryMarketProxy"));
        vm.label(address(TreasuryMarketProxy), "TreasuryMarketProxy");

        LegacyMarketProxy = ILegacyMarketProxy(vm.parseJsonAddress(metaJson, ".contracts.LegacyMarketProxy"));
        vm.label(address(LegacyMarketProxy), "LegacyMarketProxy");
    }

    function setUp() public {
        if (keccak256(abi.encodePacked(forkUrl)) == keccak256(abi.encodePacked("http://127.0.0.1:8545"))) {
            fork = vm.createFork(forkUrl);
            vm.selectFork(fork);
        } else {
            fork = vm.createFork(forkUrl, forkBlockNumber);
            vm.selectFork(fork);
            // Verify fork
            assertEq(block.number, forkBlockNumber);
        }

        assertEq(vm.activeFork(), fork);

        // Pyth bypass
        vm.etch(0x1234123412341234123412341234123412341234, "FORK");

        pool420Withdraw = new Pool420Withdraw(
            //
            address(CoreProxy),
            address(AccountProxy),
            address(TreasuryMarketProxy),
            address(LegacyMarketProxy)
        );
        vm.label(address(pool420Withdraw), "Pool420Withdraw");

        V2xResolver = IAddressResolver(pool420Withdraw.V2xResolver());
        vm.label(address(V2xResolver), "V2xResolver");

        V2x = IV2x(V2xResolver.getAddress("Synthetix"));
        vm.label(address(V2x), "V2x");

        V2xUsd = IV2xUsd(V2xResolver.getAddress("SynthsUSD"));
        vm.label(address(V2xUsd), "V2xUsd");

        $sUSD = IERC20(V2xResolver.getAddress("ProxysUSD"));
        vm.label(address($sUSD), "$sUSD");

        $SNX = IERC20(V2xResolver.getAddress("ProxySynthetix"));
        vm.label(address($SNX), "$SNX");

        $snxUSD = IERC20(CoreProxy.getUsdToken());
        vm.label(address($snxUSD), "$snxUSD");
    }

    function _bypassTimeouts(address addr) internal {
        vm.startPrank(CoreProxy.owner());
        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), addr, uint128(1))),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), addr, TreasuryMarketProxy.poolId())),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideWithdrawTimeout"), addr)),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        vm.stopPrank();
    }

    function _deal$SNX(address walletAddress, uint256 amount) internal {
        $SNX.balanceOf(walletAddress);
        $SNX.balanceOf(address(CoreProxy));

        vm.startPrank(address(CoreProxy));
        $SNX.transfer(walletAddress, amount);
        vm.stopPrank();
    }

    function _deal$snxUSD(address walletAddress, uint256 amount) internal {
        $snxUSD.balanceOf(walletAddress);
        $snxUSD.balanceOf(address(CoreProxy));

        vm.startPrank(address(CoreProxy));
        $snxUSD.transfer(walletAddress, amount);
        vm.stopPrank();
    }

    function _deal$sUSD(address walletAddress, uint256 amount) internal {
        address SynthRedeemer = V2xResolver.getAddress("SynthRedeemer");

        $sUSD.balanceOf(walletAddress);
        $sUSD.balanceOf(SynthRedeemer);

        vm.startPrank(SynthRedeemer);
        $sUSD.transfer(walletAddress, amount);
        vm.stopPrank();
    }

    function _setupPosition(uint256 $SNXAmount) internal {
        // 1. Create new v3 account for the user
        uint128 accountId = CoreProxy.createAccount();

        // 2. Delegate $SNXAmount to the SC pool
        uint128 scPoolId = 1; // SC Pool id is always 1
        _increasePosition(accountId, $SNXAmount, scPoolId);

        // 3. Mint maximum possible amount of $snxUSD against $SNX position in the SC pool
        _maxMint(accountId, scPoolId);

        // 4. Withdraw all the minted $snxUSD
        _withdrawCollateral(accountId, address($snxUSD));

        // 5. Migrate position to Delegated Staking pool and saddle account with debt
        CoreProxy.migrateDelegation(
            //
            accountId,
            scPoolId,
            address($SNX),
            TreasuryMarketProxy.poolId()
        );

        TreasuryMarketProxy.saddle(accountId);
    }

    function _maxMint(uint128 accountId, uint128 poolId) internal returns (uint256 mintable$snxUSD) {
        PoolCollateralConfiguration.Data memory poolCollateralConfig =
            CoreProxy.getPoolCollateralConfiguration(poolId, address($SNX));
        uint256 issuanceRatioD18 = poolCollateralConfig.issuanceRatioD18;
        if (issuanceRatioD18 == 0) {
            CollateralConfiguration.Data memory collateralConfig = CoreProxy.getCollateralConfiguration(address($SNX));
            issuanceRatioD18 = collateralConfig.issuanceRatioD18;
        }

        (, uint256 collateralValue,,) = CoreProxy.getPosition(accountId, poolId, address($SNX));
        mintable$snxUSD = (collateralValue * 1e18) / issuanceRatioD18;
        CoreProxy.mintUsd(accountId, poolId, address($SNX), mintable$snxUSD);
    }

    function _increasePosition(uint128 accountId, uint256 $SNXAmount, uint128 poolId) internal {
        $SNX.approve(address(CoreProxy), $SNXAmount);
        CoreProxy.deposit(
            //
            accountId,
            address($SNX),
            $SNXAmount
        );
        uint256 currentPosition = CoreProxy.getPositionCollateral(
            //
            accountId,
            poolId,
            address($SNX)
        );
        CoreProxy.delegateCollateral(
            //
            accountId,
            poolId,
            address($SNX),
            currentPosition + $SNXAmount,
            1e18
        );
    }

    function _withdrawCollateral(uint128 accountId, address collateralType)
        internal
        returns (uint256 availableCollateral)
    {
        // 1. Get amount of available collateral
        availableCollateral = CoreProxy.getAccountAvailableCollateral(
            //
            accountId,
            collateralType
        );
        if (availableCollateral > 0) {
            // 2. Withdraw all the available collateral
            CoreProxy.withdraw(
                //
                accountId,
                collateralType,
                availableCollateral
            );

            // 3. Send all the collateral to the wallet
            IERC20(collateralType).transfer(
                //
                AccountProxy.ownerOf(accountId),
                availableCollateral
            );
        }
    }
}
