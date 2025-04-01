// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Interfaces.sol";

contract Pool420 {
    ICoreProxy public CoreProxy;
    IAccountProxy public AccountProxy;
    ITreasuryMarketProxy public TreasuryMarketProxy;
    ILegacyMarketProxy public LegacyMarketProxy;
    IAddressResolver public V2xResolver;

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
     * @notice Retrieves the list of account IDs associated with the specified wallet address
     * @dev Loops through the tokens owned by the wallet address to gather account IDs
     * @param walletAddress The address of the wallet whose account IDs are being retrieved
     * @return accountIds An array containing all account IDs owned by the specified wallet address
     */
    function getAccounts(address walletAddress) public view returns (uint128[] memory accountIds) {
        uint256 numberOfAccountTokens = AccountProxy.balanceOf(walletAddress);
        if (numberOfAccountTokens == 0) {
            return new uint128[](0);
        }
        accountIds = new uint128[](numberOfAccountTokens);
        for (uint256 i = 0; i < numberOfAccountTokens; i++) {
            accountIds[i] = uint128(AccountProxy.tokenOfOwnerByIndex(walletAddress, i));
        }
        return accountIds;
    }

    /**
     * @notice Retrieves the total deposit, total loan, total burned SNX, and collateral price for all accounts owned by the specified wallet address
     * @dev Iterates through all accounts associated with the wallet address to calculate the summed values
     * @param walletAddress The address of the wallet whose account totals are being retrieved
     * @return totals A struct containing the total deposit of SNX across all accounts, the total SNX loan,
     * the total burned SNX (difference between initial loan and current loan), and the collateral price
     */
    function getTotals(address walletAddress) public view returns (Totals memory totals) {
        uint128 poolId = TreasuryMarketProxy.poolId();
        address $SNX = V2xResolver.getAddress("ProxySynthetix");

        totals = Totals(0, 0, 0, 0);
        totals.collateralPrice = CoreProxy.getCollateralPrice($SNX);

        uint128[] memory accountIds = getAccounts(walletAddress);
        for (uint256 i = 0; i < accountIds.length; i++) {
            totals.deposit = totals.deposit + CoreProxy.getPositionCollateral(accountIds[i], poolId, $SNX);

            uint256 loan = TreasuryMarketProxy.loanedAmount(accountIds[i]);
            totals.loan = totals.loan + loan;

            (,,, uint128 initialLoan) = TreasuryMarketProxy.loans(accountIds[i]);
            totals.burn = totals.burn + (uint256(initialLoan) - loan);
        }
    }

    /**
     * @notice Retrieves all positions for accounts owned by the specified wallet address
     * @dev Aggregates information about each account, including loan details and collateral details
     * @param walletAddress The address of the wallet whose account positions are being retrieved
     * @return positions An array of `Position` structs representing the positions of the wallet's accounts
     */
    function getPositions(address walletAddress) public view returns (Position[] memory positions) {
        uint128 poolId = TreasuryMarketProxy.poolId();
        address $SNX = V2xResolver.getAddress("ProxySynthetix");

        uint256 collateralPrice = CoreProxy.getCollateralPrice($SNX);

        uint128[] memory accountIds = getAccounts(walletAddress);
        positions = new Position[](accountIds.length);

        for (uint256 i = 0; i < accountIds.length; i++) {
            uint256 loan = TreasuryMarketProxy.loanedAmount(accountIds[i]);
            (uint64 loanStartTime, uint32 loanDecayPower, uint32 loanDuration, uint128 initialLoan) =
                TreasuryMarketProxy.loans(accountIds[i]);
            positions[i] = Position({
                accountId: accountIds[i],
                loan: loan,
                burn: initialLoan > loan ? uint256(initialLoan) - loan : 0,
                penalty: initialLoan > 0 ? TreasuryMarketProxy.repaymentPenalty(accountIds[i], 0) : 0,
                collateral: CoreProxy.getPositionCollateral(accountIds[i], poolId, $SNX),
                initialLoan: initialLoan,
                loanStartTime: loanStartTime,
                loanDuration: loanDuration,
                loanDecayPower: loanDecayPower,
                collateralPrice: collateralPrice
            });
        }
    }

    /**
     * @notice Retrieves all liquidity positions for accounts owned by the specified wallet address
     * @dev Aggregates information about each account, including debt and collateral details
     * @param walletAddress The address of the wallet whose liquidity positions are being retrieved
     * @return liquidityPositions An array of `LiquidityPosition` structs representing the liquidity positions of the wallet's accounts
     */
    function getLiquidityPositions(address walletAddress)
        public
        returns (LiquidityPosition[] memory liquidityPositions)
    {
        uint128[] memory accountIds = getAccounts(walletAddress);
        address $SNX = get$SNX();
        uint128 poolId = 1; // SC Pool

        liquidityPositions = new LiquidityPosition[](accountIds.length);

        uint256 collateralPrice = CoreProxy.getCollateralPrice($SNX);
        for (uint256 i = 0; i < accountIds.length; i++) {
            int256 debt = CoreProxy.getPositionDebt(accountIds[i], poolId, $SNX);
            uint256 collateral = CoreProxy.getPositionCollateral(accountIds[i], poolId, $SNX);
            liquidityPositions[i] = LiquidityPosition({
                accountId: accountIds[i],
                debt: debt,
                cRatio: debt > 0 ? collateralPrice * collateral / uint256(debt) : 0,
                collateral: collateral,
                collateralPrice: collateralPrice
            });
        }
    }

    /**
     * @notice Retrieves all balances for accounts owned by the specified wallet address
     * @dev Aggregates information about each account, including USD and collateral details
     * @param walletAddress The address of the wallet whose account balances are being retrieved
     * @return balances An array of `Balance` structs representing the balances of the wallet's accounts
     */
    function getBalances(address walletAddress) public view returns (Balance[] memory balances) {
        uint128[] memory accountIds = getAccounts(walletAddress);
        address $SNX = get$SNX();
        address $snxUSD = get$snxUSD();

        balances = new Balance[](accountIds.length);

        uint256 collateralPrice = CoreProxy.getCollateralPrice($SNX);
        for (uint256 i = 0; i < accountIds.length; i++) {
            (uint256 collateralDeposited, uint256 collateralAssigned, uint256 collateralLocked) =
                CoreProxy.getAccountCollateral(accountIds[i], $SNX);
            uint256 collateralAvailableToDelegate = CoreProxy.getAccountAvailableCollateral(accountIds[i], $SNX);
            (uint256 usdDeposited, uint256 usdAssigned, uint256 usdLocked) =
                CoreProxy.getAccountCollateral(accountIds[i], $snxUSD);
            uint256 usdAvailableToDelegate = CoreProxy.getAccountAvailableCollateral(accountIds[i], $snxUSD);
            balances[i] = Balance({
                accountId: accountIds[i],
                usdAvailable: usdAvailableToDelegate > usdLocked ? usdAvailableToDelegate - usdLocked : 0,
                usdDeposited: usdDeposited,
                usdAssigned: usdAssigned,
                usdLocked: usdLocked,
                collateralPrice: collateralPrice,
                collateralAvailable: collateralAvailableToDelegate > collateralLocked
                    ? collateralAvailableToDelegate - collateralLocked
                    : 0,
                collateralDeposited: collateralDeposited,
                collateralAssigned: collateralAssigned,
                collateralLocked: collateralLocked
            });
        }
    }

    struct Totals {
        uint256 deposit;
        uint256 loan;
        uint256 burn;
        uint256 collateralPrice;
    }

    struct Position {
        uint128 accountId;
        uint256 loan;
        uint256 burn;
        uint256 penalty;
        uint256 collateral;
        uint256 initialLoan;
        uint64 loanStartTime;
        uint32 loanDuration;
        uint32 loanDecayPower;
        uint256 collateralPrice;
    }

    struct LiquidityPosition {
        uint128 accountId;
        int256 debt;
        uint256 cRatio;
        uint256 collateral;
        uint256 collateralPrice;
    }

    struct Balance {
        uint128 accountId;
        uint256 usdAvailable;
        uint256 usdDeposited;
        uint256 usdAssigned;
        uint256 usdLocked;
        uint256 collateralPrice;
        uint256 collateralAvailable;
        uint256 collateralDeposited;
        uint256 collateralAssigned;
        uint256 collateralLocked;
    }
}
