pragma solidity ^0.8.21;

import "../../src/Pool420Stake.sol";
import "forge-std/src/Test.sol";

contract Pool420StakeTest is Test {
    ICoreProxy internal CoreProxy;
    IAccountProxy internal AccountProxy;
    ITreasuryMarketProxy internal TreasuryMarketProxy;
    ILegacyMarketProxy internal LegacyMarketProxy;
    IV2x internal V2x;
    IAddressResolver internal V2xResolver;

    IERC20 internal $SNX;
    IERC20 internal $snxUSD;
    IERC20 internal $sUSD;

    uint256 internal fork;
    uint256 internal forkBlockNumber;
    string internal deployment;
    string internal forkUrl;

    Pool420Stake internal pool420Stake;

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

        // pool420Stake = Pool420Stake(0x100C6C18381C9A7527762063047236356BBd0b8d);
        pool420Stake = new Pool420Stake(
            //
            address(CoreProxy),
            address(AccountProxy),
            address(TreasuryMarketProxy),
            address(LegacyMarketProxy)
        );
        vm.label(address(pool420Stake), "Pool420Stake");

        $SNX = IERC20(pool420Stake.get$SNX());
        vm.label(address($SNX), "$SNX");

        $snxUSD = IERC20(pool420Stake.get$snxUSD());
        vm.label(address($snxUSD), "$snxUSD");

        $sUSD = IERC20(pool420Stake.get$sUSD());
        vm.label(address($sUSD), "$sUSD");

        V2x = IV2x(pool420Stake.getV2x());
        vm.label(address(V2x), "V2x");

        V2xResolver = IAddressResolver(pool420Stake.V2xResolver());
        vm.label(address(V2xResolver), "V2xResolver");

        //_bypassTimeouts(address(pool420Stake));
        // _setupRewards();
    }

    function _setupRewards() internal {
        ITreasuryMarket.DepositRewardConfiguration[] memory configs =
            new ITreasuryMarket.DepositRewardConfiguration[](1);
        bytes32 constOneOracle = 0x066ef68c9d9ca51eee861aeb5bce51a12e61f06f10bf62243c563671ae3a9733;
        configs[0] = ITreasuryMarket.DepositRewardConfiguration({
            token: address($SNX),
            power: 1,
            duration: 365 * 24 * 3600,
            percent: 0.2 ether,
            valueRatioOracle: constOneOracle,
            penaltyStart: 1.0 ether,
            penaltyEnd: 0.5 ether
        });

        vm.startPrank(TreasuryMarketProxy.owner());
        TreasuryMarketProxy.setDepositRewardConfigurations(configs);
        vm.stopPrank();
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
}
