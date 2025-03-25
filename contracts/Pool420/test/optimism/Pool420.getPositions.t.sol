pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_getPositions_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133634421;
        initialize();
    }

    function test_getPositions() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));

        vm.deal(ALICE, 1 ether);
        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        uint128 accountId0 = _setupPosition(100 ether);
        uint128 accountId1 = _setupPosition(300 ether);
        uint128 accountId2 = _setupPosition(600 ether);

        Pool420.Position[] memory positions = pool420.getPositions(ALICE);

        assertEq(3, positions.length, "should have 3 positions created");

        assertEq(accountId0, positions[0].accountId, "positions[0].accountId == accountId0");
        assertEq(accountId1, positions[1].accountId, "positions[1].accountId == accountId1");
        assertEq(accountId2, positions[2].accountId, "positions[2].accountId == accountId2");

        assertEq(block.timestamp, positions[0].loanStartTime, "positions[0].loanStartTime == block.timestamp");
        assertEq(block.timestamp, positions[1].loanStartTime, "positions[1].loanStartTime == block.timestamp");
        assertEq(block.timestamp, positions[2].loanStartTime, "positions[2].loanStartTime == block.timestamp");

        assertEq(100 ether, positions[0].collateralAmount, "positions[0].collateralAmount == 100 ether");
        assertEq(300 ether, positions[1].collateralAmount, "positions[1].collateralAmount == 300 ether");
        assertEq(600 ether, positions[2].collateralAmount, "positions[2].collateralAmount == 600 ether");

        assertEq(snxPrice, positions[0].collateralPrice, "positions[0].collateralPrice == snxPrice");
        assertEq(snxPrice, positions[1].collateralPrice, "positions[1].collateralPrice == snxPrice");
        assertEq(snxPrice, positions[2].collateralPrice, "positions[2].collateralPrice == snxPrice");

        assertEq(100 * snxPrice, positions[0].collateralValue, "positions[0].collateralValue == 100 * snxPrice");
        assertEq(300 * snxPrice, positions[1].collateralValue, "positions[1].collateralValue == 300 * snxPrice");
        assertEq(600 * snxPrice, positions[2].collateralValue, "positions[2].collateralValue == 600 * snxPrice");
    }
}
