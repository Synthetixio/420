pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_getLiquidityPositions_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133634421;
        initialize();
    }

    function test_getLiquidityPositions() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));

        vm.deal(ALICE, 1 ether);
        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        uint128 scPoolId = 1; // SC Pool id is always 1

        vm.startPrank(ALICE);
        uint128 accountId0 = CoreProxy.createAccount();
        _increasePosition(accountId0, 100 ether, scPoolId);

        uint128 accountId1 = CoreProxy.createAccount();
        _increasePosition(accountId1, 300 ether, scPoolId);
        _maxMint(accountId1, scPoolId); // get the cRatio to 0.2

        Pool420.LiquidityPosition[] memory lp = pool420.getLiquidityPositions(ALICE);

        assertEq(2, lp.length, "should have 2 accounts created");

        assertEq(accountId0, lp[0].accountId, "positions[0].accountId == accountId0");
        assertEq(accountId1, lp[1].accountId, "positions[1].accountId == accountId1");

        assertEq(0, uint256(lp[0].debt), "positions[0].debt == 0");
        assertEq(300 * snxPrice / 5, uint256(lp[1].debt), "positions[1].debt == 300 * snxPrice / 5");

        assertEq(0, lp[0].cRatio, "positions[0].cRatio == 0");
        assertEq(5, lp[1].cRatio, "positions[1].cRatio == 5");

        assertEq(snxPrice, lp[0].collateralPrice, "positions[0].collateralPrice == snxPrice");
        assertEq(snxPrice, lp[1].collateralPrice, "positions[1].collateralPrice == snxPrice");

        assertEq(100 ether, lp[0].collateral, "positions[0].collateral == 100");
        assertEq(300 ether, lp[1].collateral, "positions[1].collateral == 300");
    }
}
