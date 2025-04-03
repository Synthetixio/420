// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

//import {
//    ICoreProxy,
//    PoolCollateralConfiguration,
//    CollateralConfiguration
//} from "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import {IAccountProxy} from "@synthetixio/v3-contracts/1-main/IAccountProxy.sol";
//import {ITreasuryMarketProxy} from "@synthetixio/v3-contracts/1-main/ITreasuryMarketProxy.sol";
//import {ILegacyMarketProxy} from "@synthetixio/v3-contracts/1-main/ILegacyMarketProxy.sol";
import {IV2x} from "@synthetixio/v3-contracts/1-main/IV2x.sol";
import {IV2xUsd} from "@synthetixio/v3-contracts/1-main/IV2xUsd.sol";
import {ERC2771Context} from "@synthetixio/core-contracts/contracts/utils/ERC2771Context.sol";
import {IERC20} from "@synthetixio/core-contracts/contracts/interfaces/IERC20.sol";
import {IERC721Receiver} from "@synthetixio/core-contracts/contracts/interfaces/IERC721Receiver.sol";

interface IAddressResolver {
    function getAddress(bytes32 name) external view returns (address);
}

// TODO remove after update deployed
import {ICoreProxy, PoolCollateralConfiguration, CollateralConfiguration} from "./ICoreProxy.sol";
import {ILegacyMarketProxy} from "./ILegacyMarketProxy.sol";
import {ITreasuryMarketProxy} from "./ITreasuryMarketProxy.sol";
