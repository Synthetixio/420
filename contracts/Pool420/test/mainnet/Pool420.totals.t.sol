pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Mainnet_Pool420_totals_Test is Pool420Test {
    constructor() {
        deployment = "1-main";
        forkUrl = vm.envString("RPC_MAINNET");
        forkBlockNumber = 22120630;
        initialize();
    }

    function test_totals() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));

        vm.deal(ALICE, 1 ether);
        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        vm.startPrank(ALICE);
        _setupPosition(100 ether);
        _setupPosition(300 ether);
        _setupPosition(600 ether);

        Pool420.Totals memory totals = pool420.getTotals(ALICE);
        assertEq(1000 ether, totals.deposit, "totals.deposit === 1000");
        assertEq(1000 * snxPrice / 5, totals.loan, "totals.loan == 1000 * snxPrice / 5");
        assertEq(0, totals.burn, "totals.burn == 0");
        assertEq(snxPrice, totals.collateralPrice, "totals.collateralPrice == snxPrice");
    }
}
