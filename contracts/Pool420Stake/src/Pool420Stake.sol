// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Interfaces.sol";

contract Pool420Stake {
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
     * @notice Sets up a user's position by creating a new Synthetix V3 account, delegating SNX to the SC pool,
     * minting snxUSD, withdrawing the minted snxUSD, migrating the position to the Delegated Staking pool,
     * and finally transferring the account NFT to the user.
     * @dev This function automates the process of initializing and migrating a user's position.
     * It creates an account, delegates SNX, mints the maximum amount of snxUSD,
     * withdraws the minted snxUSD, migrates the position, and finally sends the account NFT to the user.
     * @param $SNXAmount The amount of SNX to be deposited into the SC pool.
     */
    function setupPosition(uint256 $SNXAmount) public {
        address msgSender = ERC2771Context._msgSender();
        uint128 poolId = TreasuryMarketProxy.poolId();

        // 1. Create new v3 account for the user
        uint128 accountId = CoreProxy.createAccount();

        // 2. Must rebalance the pool
        TreasuryMarketProxy.rebalance();

        // 3. Delegate $SNXAmount to the 420 pool
        _increasePosition(accountId, $SNXAmount, poolId);

        // 4. Saddle account, updating rewards and virtual debt
        TreasuryMarketProxy.saddle(accountId);

        // 5. Send account NFT back to the user wallet
        AccountProxy.transferFrom(
            //
            address(this),
            msgSender,
            uint256(accountId)
        );
    }

    /**
     * @notice Increases a user's position by delegating additional SNX to the pool,
     * rebalancing the pool, and updating the account's rewards and virtual debt.
     * @dev This function temporarily transfers the user's account NFT to the contract
     * to perform the necessary actions. It delegates additional SNX to the pool,
     * ensures the pool is balanced, updates the user's position, and finally
     * returns the account NFT to the user's wallet. All steps are performed within a single transaction.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     * @param snxAmount The additional amount of SNX to be delegated to the pool.
     */
    function increasePosition(uint128 accountId, uint256 snxAmount) public {
        address msgSender = ERC2771Context._msgSender();
        uint128 poolId = TreasuryMarketProxy.poolId();

        // 1. Temporarily transfer Account NFT from the user wallet
        AccountProxy.transferFrom(
            //
            msgSender,
            address(this),
            uint256(accountId)
        );

        // 2. Must rebalance the pool
        TreasuryMarketProxy.rebalance();

        // 3. Delegate $SNXAmount to the 420 pool
        _increasePosition(accountId, snxAmount, poolId);

        // 4. Saddle account, updating rewards and virtual debt
        TreasuryMarketProxy.saddle(accountId);

        // 5. Send account NFT back to the user wallet
        AccountProxy.transferFrom(
            //
            address(this),
            msgSender,
            uint256(accountId)
        );
    }

    /**
     * @notice Increases the position of $SNX collateral for the specified account and pool by transferring the specified amount from the caller's wallet.
     * @dev This function handles the following steps:
     *      1. Verifies if the caller's wallet has sufficient transferable $SNX.
     *      2. If the specified $SNXAmount exceeds transferable $SNX, it adjusts to use only the maximum transferable amount.
     *      3. Ensures the caller's wallet has provided enough allowance to the contract.
     *      4. Transfers $SNX from the wallet to the contract.
     *      5. Deposits the transferred $SNX into the Core system.
     *      6. Delegates the deposited $SNX to the specified pool.
     *      If the caller's wallet doesn't have enough $SNX or allowance, the function reverts with an appropriate error.
     * @param accountId The unique ID of the user's Synthetix v3 Account NFT.
     * @param $SNXAmount The amount of $SNX to increase the position by. If greater than the wallet's transferable $SNX, only the maximum transferrable amount is used.
     * @param poolId The unique ID of the pool to which the $SNX collateral is being delegated.
     */
    function _increasePosition(uint128 accountId, uint256 $SNXAmount, uint128 poolId) internal {
        address msgSender = ERC2771Context._msgSender();
        address $SNX = get$SNX();

        uint256 transferable$SNXAmount = IV2x(getV2x()).transferableSynthetix(msgSender);
        if (transferable$SNXAmount == 0) {
            // 1a. Verify wallet has enough transferable $SNX
            revert NotEnoughBalance(
                //
                msgSender,
                $SNX,
                $SNXAmount,
                transferable$SNXAmount
            );
        }
        if ($SNXAmount > transferable$SNXAmount) {
            // 1b. Use ALL transferable $SNX
            $SNXAmount = transferable$SNXAmount;
        }

        // 2. Verify wallet has enough allowance to transfer $SNX
        uint256 available$SNXAllowance = IERC20($SNX).allowance(
            //
            msgSender,
            address(this)
        );
        if ($SNXAmount > available$SNXAllowance) {
            revert NotEnoughAllowance(
                //
                msgSender,
                $SNX,
                $SNXAmount,
                available$SNXAllowance
            );
        }

        // 3. Transfer $SNX from user wallet to Pool420Stake
        IERC20($SNX).transferFrom(
            //
            msgSender,
            address(this),
            $SNXAmount
        );

        // 4. Deposit $SNX to the Core
        IERC20($SNX).approve(address(CoreProxy), $SNXAmount);
        CoreProxy.deposit(
            //
            accountId,
            $SNX,
            $SNXAmount
        );

        // 5. Delegate $SNX to the Pool
        uint256 currentPosition = CoreProxy.getPositionCollateral(
            //
            accountId,
            poolId,
            $SNX
        );
        CoreProxy.delegateCollateral(
            //
            accountId,
            poolId,
            $SNX,
            currentPosition + $SNXAmount,
            1e18
        );
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
