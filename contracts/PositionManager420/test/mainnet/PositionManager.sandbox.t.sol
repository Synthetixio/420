pragma solidity ^0.8.21;

import "../lib/PositionManagerTest.sol";
import "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";

contract Mainnet_PositionManager_sandbox_Test is PositionManagerTest {
    constructor() {
        deployment = "1-main";
        forkUrl = vm.envString("RPC_MAINNET");
        forkBlockNumber = 22042368;

        initialize();
    }

    function xtest_migratePosition() public {
        address ALICE = vm.addr(0xA11CE);
        vm.label(ALICE, "0xA11CE");

        vm.startPrank(ALICE);

        uint128[] memory accounts = positionManager.getAccounts();

        uint128 accountId = uint128(AccountProxy.tokenOfOwnerByIndex(ALICE, 0));
        uint256 snxPrice = CoreProxy.getCollateralPrice(address($SNX));
        uint128 oldPoolId = 1;
        uint256 positionCollateral = CoreProxy.getPositionCollateral(accountId, oldPoolId, address($SNX));

        //        $SNX.approve(address(positionManager), positionCollateral);

        int256 debtAmount = CoreProxy.getPositionDebt(accountId, oldPoolId, address($SNX));

        AccountProxy.approve(address(positionManager), accountId);
        positionManager.migratePosition(oldPoolId, accountId);

        assertEq(ALICE, AccountProxy.ownerOf(accountId));

        assertEq(
            UINT256_MAX,
            CoreProxy.getPositionCollateralRatio(accountId, oldPoolId, address($SNX)),
            "C-Ratio should be UINT256_MAX"
        );

        assertEq(
            debtAmount,
            int256(TreasuryMarketProxy.loanedAmount(accountId)),
            "Loan amount for $SNX position should be 200 as previously borrowed amount"
        );
        assertEq(
            positionCollateral,
            CoreProxy.getPositionCollateral(accountId, TreasuryMarketProxy.poolId(), address($SNX)),
            "$SNX position should be unchanged at 1000 but in the new pool"
        );
        assertEq(
            0 ether,
            CoreProxy.getAccountAvailableCollateral(accountId, address($SNX)),
            "Available $SNX collateral should be unchanged at 0"
        );
        assertEq(
            0,
            CoreProxy.getAccountAvailableCollateral(accountId, address($snxUSD)),
            "Available $snxUSD should be 0 as $snxUSD are automatically withdrawn during migration"
        );
    }
}
