pragma solidity ^0.8.21;

import "../lib/Pool420StakeTest.sol";

contract Mainnet_Pool420Stake_increasePosition_Test is Pool420StakeTest {
    constructor() {
        deployment = "1-main";
        forkUrl = vm.envString("RPC_MAINNET");
        forkBlockNumber = 22043658;
        initialize();
    }

    function test_increasePosition() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        _deal$SNX(ALICE, 1000 ether);
        //_bypassTimeouts(ALICE);
        vm.startPrank(ALICE);

        // Go back 1 week to bypass the 1 week Min Delegation restriction
        uint256 ts = vm.getBlockTimestamp();
        vm.warp(ts - 86_400 * 7 - 1);

        $SNX.approve(address(pool420Stake), 1000 ether);
        pool420Stake.setupPosition(1000 ether);
        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));

        //        uint128 accountId = CoreProxy.createAccount();
        //
        //        $SNX.approve(address(CoreProxy), 1000 ether);
        //        CoreProxy.deposit(
        //            //
        //            accountId,
        //            address($SNX),
        //            1000 ether
        //        );
        //        CoreProxy.delegateCollateral(
        //            //
        //            accountId,
        //            TreasuryMarketProxy.poolId(),
        //            address($SNX),
        //            1000 ether,
        //            1e18
        //        );

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));
        uint256 targetCratio = TreasuryMarketProxy.targetCratio();
        uint256 virtualDebt = 1000 * snxPrice * 1 ether / targetCratio;

        assertEq(0, TreasuryMarketProxy.loanedAmount(accountId), "Loan amount for SNX position should be 0");
        // Return to present
        vm.warp(ts);

        assertEq(
            1000 ether,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "Should have 1000 SNX position in the 420 Pool"
        );

        assertApproxEqAbs(
            virtualDebt,
            uint256(CoreProxy.getPositionDebt(accountId, TreasuryMarketProxy.poolId(), address($SNX))),
            0.1 ether,
            "Virtual debt for $SNX position should be at target C-Ratio"
        );

        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "Account should have no available $SNX collateral"
        );

        // Increase position by 500 SNX

        _deal$SNX(ALICE, 500 ether);

        vm.startPrank(ALICE);
        AccountProxy.approve(address(pool420Stake), accountId);
        $SNX.approve(address(pool420Stake), 500 ether);
        pool420Stake.increasePosition(accountId, UINT256_MAX);

        assertEq(ALICE, AccountProxy.ownerOf(accountId), "ALICE Should own the account");

        assertEq(
            0,
            TreasuryMarketProxy.loanedAmount(accountId),
            "Loaned amount should not change from the initial position and equal 0"
        );
        assertEq(
            1500 ether,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "Should increase position by 500 SNX and now equal 1500 SNX in total"
        );

        uint256 newVirtualDebt = (1000 + 500) * snxPrice * 1 ether / targetCratio;

        assertApproxEqAbs(
            newVirtualDebt,
            uint256(CoreProxy.getPositionDebt(accountId, TreasuryMarketProxy.poolId(), address($SNX))),
            0.1 ether,
            "Virtual debt for $SNX position should be updated to include extra 500 SNX of collateral at target C-Ratio"
        );

        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "Account should have no available $SNX collateral"
        );
    }
}
