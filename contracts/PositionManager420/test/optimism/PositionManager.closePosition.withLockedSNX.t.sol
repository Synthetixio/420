pragma solidity ^0.8.21;

import "../lib/PositionManagerTest.sol";

contract Optimism_PositionManager_closePosition_withLockedSNX_Test is PositionManagerTest {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
        initialize();
    }

    function test_closePosition_withLockedSNX() public {
        //        address ALICE = vm.addr(0xA11CE);
        address ALICE = 0xFC0283aAf71cE8967a1A6fD3f546B96E52E90a65;
        vm.label(ALICE, "0xA11CE");

        vm.startPrank(ALICE);

        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));

        uint256 positionCollateral =
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX));
        uint256 loan = TreasuryMarketProxy.loanedAmount(accountId);
        uint256 penalty = TreasuryMarketProxy.repaymentPenalty(accountId, 0);

        _deal$sUSD(ALICE, loan + penalty);
        vm.startPrank(ALICE);

        // Allow TreasuryMarket to undelegate
        _bypassTimeouts(address(TreasuryMarketProxy));

        vm.startPrank(ALICE);
        $sUSD.approve(address(positionManager), loan + penalty);
        AccountProxy.approve(address(positionManager), accountId);
        positionManager.closePosition(accountId);

        assertEq(ALICE, AccountProxy.ownerOf(accountId));

        assertEq(0, int256(TreasuryMarketProxy.loanedAmount(accountId)), "Loan amount for $SNX position should be 0");
        assertEq(
            0,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "$SNX position should be 0"
        );
        assertEq(
            positionCollateral,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "Available $SNX collateral should be equal to position collateral before closing account"
        );
        (uint256 totalDeposited, uint256 totalAssigned, uint256 totalLocked) =
            CoreProxy.getAccountCollateral(accountId, address($SNX));
        assertEq(
            positionCollateral,
            totalDeposited,
            "Total deposited $SNX collateral should be equal to position collateral before closing account"
        );
        assertEq(0, totalAssigned, "Total assigned $SNX collateral should be 0 as position is closed");
        assertEq(
            0, CoreProxy.getAccountAvailableCollateral(accountId, address($snxUSD)), "Available $snxUSD should be 0"
        );

        _bypassTimeouts(ALICE);

        uint256 existing$SNXBalance = V2x.transferableSynthetix(ALICE);

        vm.startPrank(ALICE);
        AccountProxy.approve(address(positionManager), accountId);
        positionManager.withdrawCollateral(accountId, address($SNX));

        uint256 withdrawn$SNX = totalDeposited - totalLocked;
        uint256 new$SNXBalance = V2x.transferableSynthetix(ALICE) - existing$SNXBalance;

        assertEq(ALICE, AccountProxy.ownerOf(accountId));
        assertEq(
            //
            withdrawn$SNX,
            new$SNXBalance,
            "All the available and unlocked snx should be transferred to user wallet"
        );
        assertEq(
            totalLocked,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "Only locked $SNX collateral is left under user account"
        );
    }
}
