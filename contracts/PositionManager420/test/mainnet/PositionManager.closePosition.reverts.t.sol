pragma solidity ^0.8.21;

import "../lib/PositionManagerTest.sol";
import "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import "../../src/PositionManager420.sol";

contract Mainnet_PositionManager_closePosition_reverts_Test is PositionManagerTest {
    constructor() {
        deployment = "1-main";
        forkUrl = vm.envString("RPC_MAINNET");
        forkBlockNumber = 21921167;
        initialize();
    }

    function test_closePosition_MinDelegationTime() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        _setupPosition(1000 ether);
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));
        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));
        uint256 loanedAmount = 1000 * snxPrice / 5;
        _deal$sUSD(ALICE, loanedAmount);

        vm.startPrank(ALICE);
        $sUSD.approve(address(positionManager), loanedAmount);
        AccountProxy.approve(address(positionManager), accountId);

        // Unauthorised error transferring Account NFT without approval
        vm.expectRevert(abi.encodeWithSelector(ICoreProxy.MinDelegationTimeoutPending.selector, 8, 7 * 24 * 3600));
        positionManager.closePosition(accountId);
    }

    function test_closePosition_Unauthorized() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        // Go back 1 week to bypass the 1 week Min Delegation restriction
        uint256 ts = vm.getBlockTimestamp();
        vm.warp(ts - 86_400 * 7 - 1);
        _setupPosition(1000 ether);
        // Return to present
        vm.warp(ts);
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));

        // Unauthorised error transferring Account NFT without approval
        vm.expectRevert(abi.encodeWithSelector(ICoreProxy.Unauthorized.selector, address(positionManager)));
        positionManager.closePosition(accountId);
    }

    function test_closePosition_NotEnoughBalance() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        // Go back 1 week to bypass the 1 week Min Delegation restriction
        uint256 ts = vm.getBlockTimestamp();
        vm.warp(ts - 86_400 * 7 - 1);
        _setupPosition(1000 ether);
        // Return to present
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));
        vm.warp(ts);

        uint256 loanWith1weekForgiveness = TreasuryMarketProxy.loanedAmount(accountId);
        uint256 penalty1week = TreasuryMarketProxy.repaymentPenalty(accountId, 0);
        uint256 required$sUSD = loanWith1weekForgiveness + penalty1week;

        vm.startPrank(ALICE);
        AccountProxy.approve(address(positionManager), accountId);

        vm.expectRevert(
            abi.encodeWithSelector(
                PositionManager420.NotEnoughBalance.selector, ALICE, address($sUSD), required$sUSD, 0 ether
            )
        );
        positionManager.closePosition(accountId);
    }

    function test_closePosition_NotEnoughAllowance() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        // Go back 1 week to bypass the 1 week Min Delegation restriction
        uint256 ts = vm.getBlockTimestamp();
        vm.warp(ts - 86_400 * 7 - 1);
        _setupPosition(1000 ether);
        // Return to present
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));
        vm.warp(ts);

        uint256 loanWith1weekForgiveness = TreasuryMarketProxy.loanedAmount(accountId);
        uint256 penalty1week = TreasuryMarketProxy.repaymentPenalty(accountId, 0);
        uint256 required$sUSD = loanWith1weekForgiveness + penalty1week;

        _deal$sUSD(ALICE, required$sUSD);

        vm.startPrank(ALICE);
        AccountProxy.approve(address(positionManager), accountId);

        // NotEnoughAllowance error when not enough SNX approval for PositionManager420
        vm.expectRevert(
            abi.encodeWithSelector(
                PositionManager420.NotEnoughAllowance.selector, ALICE, address($sUSD), required$sUSD, 0 ether
            )
        );
        positionManager.closePosition(accountId);
    }
}
