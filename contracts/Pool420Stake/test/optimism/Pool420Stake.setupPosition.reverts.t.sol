pragma solidity ^0.8.21;

import "../lib/Pool420StakeTest.sol";
import "../../src/Pool420Stake.sol";

contract Optimism_Pool420Stake_setupPosition_reverts_Test is Pool420StakeTest {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
        initialize();
    }

    function test_setupPosition_NotEnoughBalance() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        vm.prank(ALICE);
        vm.expectRevert(
            abi.encodeWithSelector(Pool420Stake.NotEnoughBalance.selector, ALICE, address($SNX), 100 ether, 0 ether)
        );
        pool420Stake.setupPosition(100 ether);
    }

    function test_setupPosition_NotEnoughAllowance() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        _deal$SNX(ALICE, 100 ether);

        // NotEnoughAllowance error when not enough SNX approval for Pool420Stake
        vm.expectRevert(
            abi.encodeWithSelector(Pool420Stake.NotEnoughAllowance.selector, ALICE, address($SNX), 100 ether, 0 ether)
        );
        vm.prank(ALICE);
        pool420Stake.setupPosition(100 ether);
    }
}
