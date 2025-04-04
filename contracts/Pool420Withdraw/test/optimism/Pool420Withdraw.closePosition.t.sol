pragma solidity ^0.8.21;

import "../lib/Pool420WithdrawTest.sol";

contract Optimism_Pool420Withdraw_closePosition_Test is Pool420WithdrawTest {
    // Ensure we have someone migrated to have sUSD available
    address V2X_STAKER = 0xa5f7a39E55D7878bC5bd754eE5d6BD7a7662355b;

    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 132431079; // Block at which V2X_STAKER had debt
        initialize();
    }

    function test_closePosition() public {
        vm.label(V2X_STAKER, "0xV2X_STAKER");
        vm.startPrank(V2X_STAKER);
        uint128 v2x_stakerAccountId = 888;
        LegacyMarketProxy.migrate(v2x_stakerAccountId);
        TreasuryMarketProxy.saddle(v2x_stakerAccountId);

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

        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));
        uint256 loanedAmount = 1000 * snxPrice / 5;

        assertEq(
            loanedAmount,
            TreasuryMarketProxy.loanedAmount(accountId),
            "Loan amount for SNX position should be (1000 * snxPrice / 5) as previously borrowed amount"
        );

        // Return to present
        vm.warp(ts);

        uint256 loanWith1weekForgiveness = TreasuryMarketProxy.loanedAmount(accountId);
        uint256 penalty1week = TreasuryMarketProxy.repaymentPenalty(accountId, 0);

        assertLt(
            //
            loanWith1weekForgiveness + penalty1week,
            loanedAmount,
            "Loan with 1 week forgiveness and penalty should be a little less than original loan"
        );

        // Repayments are made with $sUSD
        _deal$sUSD(ALICE, loanWith1weekForgiveness + penalty1week);
        assertEq(
            //
            loanWith1weekForgiveness + penalty1week,
            $sUSD.balanceOf(ALICE),
            "Wallet balance of sUSD should be at loaned amount with 1 week forgiveness"
        );

        vm.startPrank(ALICE);
        $sUSD.approve(address(pool420Withdraw), loanWith1weekForgiveness + penalty1week);
        AccountProxy.approve(address(pool420Withdraw), accountId);
        pool420Withdraw.closePosition(accountId);

        assertEq(ALICE, AccountProxy.ownerOf(accountId));

        assertEq(
            0,
            TreasuryMarketProxy.loanedAmount(accountId),
            "Loan amount for $SNX position should be reduced to 0 after closing position and loan repayment"
        );
        assertEq(
            0,
            CoreProxy.getPositionDebt(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "Position debt should be reduced to 0"
        );
        assertEq(
            0,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "Position collateral should be reduced to 0"
        );
        assertEq(
            1000 ether,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "User account should have all undelegated $SNX available on the account"
        );
        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($snxUSD)),
            "User account should not have any $snxUSD available as all the $snxUSD should be transferred to the wallet"
        );
        assertEq(
            //
            0 ether,
            $sUSD.balanceOf(ALICE),
            "Wallet balance of $sUSD should be at 0 after loan repayment"
        );
        assertEq(
            //
            loanedAmount,
            $snxUSD.balanceOf(ALICE),
            "Wallet balance of $snxUSD should remain at initial loaned amount as loans are repaid in $sUSD"
        );
        assertEq(
            //
            0,
            $SNX.balanceOf(ALICE),
            "All delegated 1000 $SNX should stay in the system and withdrawn later after timeout"
        );
    }
}
