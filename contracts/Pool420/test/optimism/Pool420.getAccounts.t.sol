pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_getAccounts_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
        initialize();
    }

    function test_getAccounts_MultipleAccounts() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");
        vm.deal(ALICE, 1 ether);

        vm.prank(ALICE);
        uint128 ACCOUNT_ID_1 = CoreProxy.createAccount();

        vm.prank(ALICE);
        uint128 ACCOUNT_ID_2 = CoreProxy.createAccount();

        vm.prank(ALICE);
        uint128 ACCOUNT_ID_3 = CoreProxy.createAccount();

        assertEq(ALICE, AccountProxy.ownerOf(ACCOUNT_ID_1));
        assertEq(ALICE, AccountProxy.ownerOf(ACCOUNT_ID_2));
        assertEq(ALICE, AccountProxy.ownerOf(ACCOUNT_ID_3));

        vm.prank(ALICE);
        uint128[] memory accounts = pool420.getAccounts();

        assertEq(accounts.length, 3);
        assertEq(accounts[0], ACCOUNT_ID_1);
        assertEq(accounts[1], ACCOUNT_ID_2);
        assertEq(accounts[2], ACCOUNT_ID_3);
    }

    function test_getAccounts_NoAccounts() public {
        address ALICE = vm.addr(0xA11CE);

        vm.prank(ALICE);
        uint128[] memory accounts = pool420.getAccounts();

        assertEq(accounts.length, 0);
    }
}
