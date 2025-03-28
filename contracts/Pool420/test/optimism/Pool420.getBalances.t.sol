pragma solidity ^0.8.21;

import "../lib/Pool420Test.sol";

contract Optimism_Pool420_getBalances_Test is Pool420Test {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 133634421;
        initialize();
    }

    function test_getBalances() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));

        vm.deal(ALICE, 1 ether);
        _deal$SNX(ALICE, 1000 ether);
        _bypassTimeouts(ALICE);

        uint128 scPoolId = 1; // SC Pool id is always 1

        vm.startPrank(ALICE);
        // Setup 420 position
        uint128 accountId0 = _setupPosition(100 ether);

        // Setup SC position
        uint128 accountId1 = CoreProxy.createAccount();
        _increasePosition(accountId1, 300 ether, scPoolId);
        _maxMint(accountId1, scPoolId); // get the cRatio to 0.2

        Pool420.Balance[] memory balances = pool420.getBalances(ALICE);

        assertEq(2, balances.length, "should have 2 accounts created");

        assertEq(accountId0, balances[0].accountId, "positions[0].accountId == accountId0");
        assertEq(accountId1, balances[1].accountId, "positions[1].accountId == accountId1");

        assertEq(0, balances[0].usdAvailable, "positions[0].usdAvailable == 0");
        assertEq(300 * snxPrice / 5, balances[1].usdAvailable, "positions[1].usdAvailable == 300 * snxPrice / 5");

        assertEq(0, balances[0].usdDeposited, "positions[0].usdDeposited == 0");
        assertEq(300 * snxPrice / 5, balances[1].usdDeposited, "positions[1].usdDeposited == 300 * snxPrice / 5");

        assertEq(0, balances[0].usdAssigned, "positions[0].usdAssigned == 0");
        assertEq(0, balances[1].usdAssigned, "positions[1].usdAssigned == 0");

        assertEq(0, balances[0].usdLocked, "positions[0].usdLocked == 0");
        assertEq(0, balances[1].usdLocked, "positions[1].usdLocked == 0");

        assertEq(snxPrice, balances[0].collateralPrice, "positions[0].collateralPrice == snxPrice");
        assertEq(snxPrice, balances[1].collateralPrice, "positions[1].collateralPrice == snxPrice");

        assertEq(0, balances[0].collateralAvailable, "positions[0].collateralAvailable == 0");
        assertEq(0, balances[1].collateralAvailable, "positions[1].collateralAvailable == 0");

        assertEq(100 ether, balances[0].collateralDeposited, "positions[0].collateralDeposited == 100");
        assertEq(300 ether, balances[1].collateralDeposited, "positions[1].collateralDeposited == 300");

        assertEq(100 ether, balances[0].collateralAssigned, "positions[0].collateralAssigned == 100");
        assertEq(300 ether, balances[1].collateralAssigned, "positions[1].collateralAssigned == 300");

        assertEq(0, balances[0].collateralLocked, "positions[0].collateralLocked == 0");
        assertEq(0, balances[1].collateralLocked, "positions[1].collateralLocked == 0");
    }
}
