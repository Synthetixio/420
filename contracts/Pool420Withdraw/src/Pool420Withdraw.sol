// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {
    ICoreProxy,
    PoolCollateralConfiguration,
    CollateralConfiguration
} from "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import {IAccountProxy} from "@synthetixio/v3-contracts/1-main/IAccountProxy.sol";
import {IUSDProxy} from "@synthetixio/v3-contracts/1-main/IUSDProxy.sol";
import {ITreasuryMarketProxy} from "@synthetixio/v3-contracts/1-main/ITreasuryMarketProxy.sol";
import {ILegacyMarketProxy} from "@synthetixio/v3-contracts/1-main/ILegacyMarketProxy.sol";
import {IV2xUsd} from "@synthetixio/v3-contracts/1-main/IV2xUsd.sol";
import {IV2x} from "@synthetixio/v3-contracts/1-main/IV2x.sol";
import {ERC2771Context} from "@synthetixio/core-contracts/contracts/utils/ERC2771Context.sol";
import {IERC20} from "@synthetixio/core-contracts/contracts/interfaces/IERC20.sol";
import {IAddressResolver} from "./IAddressResolver.sol";

contract Pool420Withdraw {
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

    /**
     * @notice Fully closes the user's position by repaying loans, unsaddling the position,
     *      and transferring ownership of the account NFT back to the user.
     * @dev Temporarily transfers the user's account NFT to perform necessary operations,
     *      ensures all outstanding loans are repaid, unsaddles the account,
     *      and finally transfers the account NFT back to the user's wallet.
     *      This function ensures all these steps are completed in a single transaction.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     */
    function closePosition(uint128 accountId) public {
        address msgSender = ERC2771Context._msgSender();

        // 1. Temporarily transfer Account NFT from the user wallet
        AccountProxy.transferFrom(
            //
            msgSender,
            address(this),
            uint256(accountId)
        );

        // 2. Repay outstanding loan (if needed)
        _repayLoan(accountId);

        // 3. Unsaddle account, TreasuryMarketProxy will close position on behalf
        AccountProxy.approve(address(TreasuryMarketProxy), accountId);
        TreasuryMarketProxy.unsaddle(accountId);

        // 4. Send Account NFT back to the user wallet
        AccountProxy.transferFrom(
            //
            address(this),
            msgSender,
            uint256(accountId)
        );
    }

    /**
     * @notice Withdraws the available amount of collateral for the given account and sends it to the caller's wallet.
     * @dev Ensures the user's account NFT is temporarily transferred to the contract for performing
     *      collateral withdrawal. After successfully withdrawing the collateral, the account NFT is
     *      returned to the user's wallet.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     * @param collateralType The type of collateral to be withdrawn.
     */
    function withdrawCollateral(uint128 accountId, address collateralType) public {
        address msgSender = ERC2771Context._msgSender();

        // 1. Temporarily transfer Account NFT from the user wallet
        AccountProxy.transferFrom(
            //
            msgSender,
            address(this),
            uint256(accountId)
        );

        // 2. Withdraw collateral and send it to user wallet
        _withdrawCollateral(accountId, collateralType);

        // 3. Send account NFT back to the user wallet
        AccountProxy.transferFrom(
            //
            address(this),
            msgSender,
            uint256(accountId)
        );
    }

    /**
     * @notice Withdraws the available amount of collateral for the given account and sends it to the caller's wallet.
     * @dev Gets the total deposited and locked collateral for the specified account ID and collateral type,
     *      calculates the available collateral, withdraws the full amount if available, and transfers it to the caller's wallet.
     *      If the available collateral is zero, no operations are performed.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     * @param collateralType The type of collateral to be withdrawn.
     * @return availableCollateral The amount of collateral that was withdrawn and sent to the caller if available.
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

    /**
     * @notice Repays the full loan amount for the specified account using $sUSD from the caller's wallet and converts it to $snxUSD.
     * @dev The function performs the following steps:
     *      1. Verifies if the caller's wallet has enough transferable $sUSD.
     *      2. Ensures the caller's wallet has provided sufficient allowance to the contract.
     *      3. Transfers $sUSD from the caller's wallet to this contract.
     *      4. Approves the LegacyMarketProxy to spend $sUSD.
     *      5. Converts $sUSD to $snxUSD through the LegacyMarketProxy.
     *      6. Approves the TreasuryMarketProxy to spend $snxUSD.
     *      7. Repays the full loan for the account by depositing $snxUSD into the TreasuryMarketProxy.
     *      If the wallet doesn't have enough $sUSD or allowance, the function reverts with the appropriate error.
     * @param accountId The unique ID of the user's Synthetix account NFT.
     */
    function _repayLoan(uint128 accountId) internal {
        uint256 currentLoan = TreasuryMarketProxy.loanedAmount(accountId);
        if (currentLoan > 0) {
            address msgSender = ERC2771Context._msgSender();
            address $sUSD = V2xResolver.getAddress("ProxysUSD");
            uint256 transferable$sUSDAmount = IV2xUsd(V2xResolver.getAddress("SynthsUSD")).transferableSynths(msgSender);
            uint256 repaymentPenalty = TreasuryMarketProxy.repaymentPenalty(accountId, 0);
            uint256 required$sUSDAmount = currentLoan + repaymentPenalty;

            // 1. Verify wallet has enough transferable $sUSD
            if (required$sUSDAmount > transferable$sUSDAmount) {
                revert NotEnoughBalance(
                    //
                    msgSender,
                    $sUSD,
                    required$sUSDAmount,
                    transferable$sUSDAmount
                );
            }

            // 2. Verify wallet has enough allowance to transfer $sUSD
            uint256 available$sUSDAllowance = IERC20($sUSD).allowance(
                //
                msgSender,
                address(this)
            );
            if (required$sUSDAmount > available$sUSDAllowance) {
                revert NotEnoughAllowance(
                    //
                    msgSender,
                    $sUSD,
                    required$sUSDAmount,
                    available$sUSDAllowance
                );
            }

            // 3. Transfer $sUSD from user wallet to Pool420Withdraw
            IERC20($sUSD).transferFrom(
                //
                msgSender,
                address(this),
                required$sUSDAmount
            );

            // 4. Allow LegacyMarketProxy to spend $sUSD
            IERC20($sUSD).approve(address(LegacyMarketProxy), required$sUSDAmount);

            // 5. Convert $sUSD to $snxUSD
            LegacyMarketProxy.convertUSD(required$sUSDAmount);

            // 6. Allow TreasuryMarketProxy to spend $snxUSD
            IERC20(CoreProxy.getUsdToken()).approve(address(TreasuryMarketProxy), required$sUSDAmount);

            // 7. Repay account loan (must have enough $sUSD that will be deposited to the Treasury Market)
            TreasuryMarketProxy.adjustLoan(
                //
                accountId,
                0
            );
        }
    }
}
