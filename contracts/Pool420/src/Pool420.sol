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
            // Retrieve the token/account ID at the index
            uint256 accountId = AccountProxy.tokenOfOwnerByIndex(
                //
                walletAddress,
                i
            );
            accountIds[i] = uint128(accountId); // Downcast to uint128, assuming IDs fit within uint128
        }
        return accountIds;
    }

    /**
     * @notice Retrieves the total deposit amount of SNX collateral across all accounts owned by the specified wallet address
     * @dev Iterates through all accounts owned by the specified wallet address and sums up their collateral in the specified pool
     * @param walletAddress The address of the wallet whose SNX collateral deposits are being calculated
     * @return totalDeposit The total amount of SNX collateral deposited across all accounts owned by the specified wallet address
     */
    function getTotalDeposit(address walletAddress) public view returns (uint256 totalDeposit) {
        uint128[] memory accountIds = getAccounts(walletAddress);
        totalDeposit = 0;
        uint128 poolId = TreasuryMarketProxy.poolId();
        address $SNX = V2xResolver.getAddress("ProxySynthetix");
        for (uint256 i = 0; i < accountIds.length; i++) {
            totalDeposit = totalDeposit + CoreProxy.getPositionCollateral(accountIds[i], poolId, $SNX);
        }
    }

    /**
     * @notice Retrieves the total loan amount across all accounts owned by the specified wallet address
     * @dev Iterates through all accounts owned by the specified wallet address and sums up their loaned amounts
     * @param walletAddress The address of the wallet whose loan amounts are being calculated
     * @return totalLoan The total loan amount across all accounts owned by the specified wallet address
     */
    function getTotalLoan(address walletAddress) public view returns (uint256 totalLoan) {
        uint128[] memory accountIds = getAccounts(walletAddress);
        totalLoan = 0;
        for (uint256 i = 0; i < accountIds.length; i++) {
            totalLoan = totalLoan + TreasuryMarketProxy.loanedAmount(accountIds[i]);
        }
    }

    /**
     * @notice Retrieves all positions for accounts owned by the specified wallet address
     * @dev Aggregates information about each account, including loan details and collateral details
     * @param walletAddress The address of the wallet whose account positions are being retrieved
     * @return positions An array of `Position` structs representing the positions of the wallet's accounts
     */
    function getPositions(address walletAddress) public view returns (Position[] memory positions) {
        uint128[] memory accountIds = getAccounts(walletAddress);
        uint128 poolId = TreasuryMarketProxy.poolId();
        address $SNX = V2xResolver.getAddress("ProxySynthetix");

        positions = new Position[](accountIds.length);

        uint256 collateralPrice = CoreProxy.getCollateralPrice($SNX);
        for (uint256 i = 0; i < accountIds.length; i++) {
            (uint64 startTime, uint32 power, uint32 duration, uint128 loanAmount) =
                TreasuryMarketProxy.loans(accountIds[i]);
            uint256 collateralAmount = CoreProxy.getPositionCollateral(accountIds[i], poolId, $SNX);
            uint256 collateralValue = collateralPrice * collateralAmount / 1e18;
            positions[i] = Position({
                accountId: accountIds[i],
                loanAmount: loanAmount,
                loanStartTime: startTime,
                loanDuration: duration,
                loanDecayPower: power,
                collateralAmount: collateralAmount,
                collateralPrice: collateralPrice,
                collateralValue: collateralValue
            });
        }
    }

    struct Position {
        uint128 accountId;
        uint128 loanAmount;
        uint64 loanStartTime;
        uint32 loanDuration;
        uint32 loanDecayPower;
        uint256 collateralAmount;
        uint256 collateralPrice;
        uint256 collateralValue;
    }
}
