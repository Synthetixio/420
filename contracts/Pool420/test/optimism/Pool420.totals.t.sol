pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_totals_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
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

        uint128[] memory accounts = pool420.getAccounts();
        assertEq(accounts.length, 3, "should have 3 accounts created");

        uint256 loanedAmount = 1000 * snxPrice / 5;

        assertEq(1000 ether, pool420.getTotalDeposit(), "should have combined deposit of 1000 SNX");
        assertEq(loanedAmount, pool420.getTotalLoan(), "should have combined loan amount of (1000 * snxPrice / 5)");
    }
}
