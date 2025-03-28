pragma solidity ^0.8.21;

import "../lib/Pool420WithdrawTest.sol";
import "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import "../../src/Pool420Withdraw.sol";

contract Optimism_Pool420Withdraw_closePosition_reverts_Test is Pool420WithdrawTest {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
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
        $sUSD.approve(address(pool420Withdraw), loanedAmount);
        AccountProxy.approve(address(pool420Withdraw), accountId);

        // Unauthorised error transferring Account NFT without approval
        vm.expectRevert(abi.encodeWithSelector(ICoreProxy.MinDelegationTimeoutPending.selector, 8, 7 * 24 * 3600));
        pool420Withdraw.closePosition(accountId);
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
        vm.expectRevert(abi.encodeWithSelector(ICoreProxy.Unauthorized.selector, address(pool420Withdraw)));
        pool420Withdraw.closePosition(accountId);
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
        AccountProxy.approve(address(pool420Withdraw), accountId);

        vm.expectRevert(
            abi.encodeWithSelector(
                Pool420Withdraw.NotEnoughBalance.selector, ALICE, address($sUSD), required$sUSD, 0 ether
            )
        );
        pool420Withdraw.closePosition(accountId);
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
        AccountProxy.approve(address(pool420Withdraw), accountId);

        // NotEnoughAllowance error when not enough SNX approval for Pool420Withdraw
        vm.expectRevert(
            abi.encodeWithSelector(
                Pool420Withdraw.NotEnoughAllowance.selector, ALICE, address($sUSD), required$sUSD, 0 ether
            )
        );
        pool420Withdraw.closePosition(accountId);
    }
}
