// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Interfaces.sol";

contract Pool420Migrate {
    error NotEnoughAllowance(
        address walletAddress, address tokenAddress, uint256 requiredAllowance, uint256 availableAllowance
    );
    error NotEnoughBalance(address walletAddress, address tokenAddress, uint256 requiredAmount, uint256 availableAmount);

    ICoreProxy public CoreProxy;
    IAccountProxy public AccountProxy;
    ITreasuryMarketProxy public TreasuryMarketProxy;
    ILegacyMarketProxy public LegacyMarketProxy;
    IAddressResolver public V2xResolver;

    uint256 public constant UINT256_MAX = type(uint256).max;

    constructor(
        //
        address CoreProxy_,
        address AccountProxy_,
        address TreasuryMarketProxy_,
        address LegacyMarketProxy_
    ) {
        CoreProxy = ICoreProxy(CoreProxy_);
        AccountProxy = IAccountProxy(AccountProxy_);
        TreasuryMarketProxy = ITreasuryMarketProxy(TreasuryMarketProxy_);
        LegacyMarketProxy = ILegacyMarketProxy(LegacyMarketProxy_);
        V2xResolver = IAddressResolver(LegacyMarketProxy.v2xResolver());
    }

    function getV2x() public view returns (address v2x) {
        v2x = V2xResolver.getAddress("Synthetix");
    }

    function getV2xUsd() public view returns (address v2xUsd) {
        v2xUsd = V2xResolver.getAddress("SynthsUSD");
    }

    function get$SNX() public view returns (address $SNX) {
        $SNX = V2xResolver.getAddress("ProxySynthetix");
    }

    function get$sUSD() public view returns (address $sUSD) {
        $sUSD = V2xResolver.getAddress("ProxysUSD");
    }

    function get$snxUSD() public view returns (address $snxUSD) {
        $snxUSD = CoreProxy.getUsdToken();
    }

    /**
     * @notice Migrates the user's position from one pool to the Delegated Staking pool.
     * @dev This function transfers the account NFT temporarily to perform necessary actions such as
     * withdrawing snxUSD, migrating the position to the Delegated Staking pool, saddling the account with debt,
     * and finally returning the account NFT to the user's wallet.
     * It ensures all steps for migration are completed in a single transaction.
     * @param sourcePoolId The ID of the source pool from which the position is being migrated.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     */
    function migratePosition(uint128 sourcePoolId, uint128 accountId) public {
        address msgSender = ERC2771Context._msgSender();
        address $SNX = get$SNX();
        address $snxUSD = get$snxUSD();

        // 1. Temporarily transfer Account NFT from the user wallet
        AccountProxy.transferFrom(
            //
            msgSender,
            address(this),
            uint256(accountId)
        );

        // 2. In case debt is negative we mint $snxUSD
        int256 debt = CoreProxy.getPositionDebt(accountId, sourcePoolId, $SNX);
        if (debt < 0) {
            CoreProxy.mintUsd(accountId, sourcePoolId, $SNX, uint256(-debt));
        }

        // 3. Withdraw any available $snxUSD
        _withdrawCollateral(accountId, $snxUSD);

        // 4. Must rebalance the pool
        TreasuryMarketProxy.rebalance();

        // 5. Migrate position to Delegated Staking pool and saddle account with debt
        CoreProxy.migrateDelegation(
            //
            accountId,
            sourcePoolId,
            $SNX,
            TreasuryMarketProxy.poolId()
        );
        TreasuryMarketProxy.saddle(accountId);

        // 6. Send account NFT back to the user wallet
        AccountProxy.transferFrom(
            //
            address(this),
            msgSender,
            uint256(accountId)
        );
    }

    /**
     * @notice Withdraws the available amount of collateral for the given account and sends it to the caller's wallet.
     * @dev Ensures that any available collateral collateral is fully withdrawn and then directly transferred to the caller's wallet.
     *      The function checks the available collateral, withdraws the full amount, and transfers it to the wallet if the amount is greater than zero.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     * @return availableCollateral The amount of collateral that was withdrawn and sent to the caller.
     */
    function _withdrawCollateral(uint128 accountId, address collateralType)
        internal
        returns (uint256 availableCollateral)
    {
        address msgSender = ERC2771Context._msgSender();

        // 1. Get amount of available collateral
        (uint256 totalDeposited,, uint256 totalLocked) = CoreProxy.getAccountCollateral(accountId, collateralType);

        availableCollateral = totalDeposited - totalLocked;

        if (availableCollateral > 0) {
            // 2. Withdraw all the available collateral
            CoreProxy.withdraw(
                //
                accountId,
                collateralType,
                availableCollateral
            );

            // 3. Send all the collateral to the wallet
            IERC20(collateralType).transfer(
                //
                msgSender,
                availableCollateral
            );
        }
    }
}
