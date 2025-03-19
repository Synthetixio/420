pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_getters_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133373441;
        initialize();
    }

    function test_getters() public view {
        assertNotEq(address(0), pool420.getV2x());
        assertNotEq(address(0), pool420.getV2xUsd());
        assertNotEq(address(0), pool420.get$SNX());
        assertNotEq(address(0), pool420.get$snxUSD());
        assertNotEq(address(0), pool420.get$sUSD());
    }
}
