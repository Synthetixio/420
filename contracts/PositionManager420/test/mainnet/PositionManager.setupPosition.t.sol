pragma solidity ^0.8.21;

import "../lib/PositionManagerTest.sol";

contract Mainnet_PositionManager_setupPosition_Test is PositionManagerTest {
    constructor() {
        deployment = "1-main";
        //        forkUrl = vm.envString("RPC_MAINNET");
        //        forkBlockNumber = 22043658;
        forkUrl = "http://127.0.0.1:8545";
        initialize();
    }

    function test_setupPosition() public {
        TreasuryMarketProxy.depositRewardConfigurations(0);

        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));

        vm.deal(ALICE, 1 ether);
        _deal$SNX(ALICE, 1000 ether);

        vm.startPrank(ALICE);

        $SNX.approve(address(positionManager), 1000 ether);

        positionManager.setupPosition(1000 ether);
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));

        uint256 targetCratio = TreasuryMarketProxy.targetCratio();
        uint256 debtAmount = 1000 * snxPrice * 1 ether / targetCratio;
        uint256 loanedAmount = 0;

        assertEq(loanedAmount, TreasuryMarketProxy.loanedAmount(accountId), "account loan amount should be 0");
        assertEq(
            1000 ether,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "account should have 1000 $SNX position in Delegated Staking pool"
        );
        assertApproxEqAbs(
            debtAmount,
            uint256(CoreProxy.getPositionDebt(accountId, TreasuryMarketProxy.poolId(), address($SNX))),
            0.1 ether,
            "account virtual debt should be at the target C-Ratio (amount * snxPrice / targetCratio)"
        );
        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "account should not have any $SNX available as it is all delegated"
        );
        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($snxUSD)),
            "account should not have any $snxUSD available as it is all sent to user wallet"
        );
        assertEq(0, $snxUSD.balanceOf(ALICE), "should have no $snxUSD in the wallet");

        uint256 ts = vm.getBlockTimestamp();

        (uint64 startTime, uint32 power, uint32 duration, uint128 loanAmount) =
            TreasuryMarketProxy.depositRewards(accountId, address($SNX));

        assertEq(ts, startTime, "rewards should start now");
        assertEq(1, power, "power should be linear 1");
        assertEq(365 * 24 * 3600, duration, "duration should be 1 year");
        assertEq(1000 ether * 0.2, loanAmount, "total rewards should be 20% of deposit amount as configured");
        assertEq(
            0,
            TreasuryMarketProxy.availableDepositRewards(address($SNX)),
            "market should have no deposit rewards to give"
        );
        assertEq(
            0,
            TreasuryMarketProxy.depositRewardAvailable(accountId, address($SNX)),
            "ALICE account should have no deposit rewards at the start"
        );

        // Go forward half a year
        vm.warp(ts + 365 * 24 * 3600 / 2);
        assertEq(
            1000 ether * 0.2 * 0.5,
            TreasuryMarketProxy.depositRewardAvailable(accountId, address($SNX)),
            "should have half of rewards"
        );

        assertEq(
            1000 ether * 0.2 * 0.5,
            TreasuryMarketProxy.repaymentPenalty(accountId, 1000 ether * 0.2),
            "reards penalty should be a half of rewards"
        );
    }
}
