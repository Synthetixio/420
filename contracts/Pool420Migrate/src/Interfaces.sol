// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ICoreProxy} from "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";
import {IAccountProxy} from "@synthetixio/v3-contracts/1-main/IAccountProxy.sol";
import {ITreasuryMarketProxy} from "@synthetixio/v3-contracts/1-main/ITreasuryMarketProxy.sol";
import {ILegacyMarketProxy} from "@synthetixio/v3-contracts/1-main/ILegacyMarketProxy.sol";
import {IV2x} from "@synthetixio/v3-contracts/1-main/IV2x.sol";
import {IV2xUsd} from "@synthetixio/v3-contracts/1-main/IV2xUsd.sol";
import {ERC2771Context} from "@synthetixio/core-contracts/contracts/utils/ERC2771Context.sol";
import {IERC20} from "@synthetixio/core-contracts/contracts/interfaces/IERC20.sol";

interface IAddressResolver {
    function getAddress(bytes32 name) external view returns (address);
}
//
//interface ITreasuryMarket {
//    struct LoanInfo {
//        uint64 startTime;
//        uint32 power;
//        uint32 duration;
//        uint128 loanAmount;
//    }
//
//    struct DepositRewardConfiguration {
//        address token;
//        uint32 power;
//        uint32 duration;
//        uint128 percent;
//        bytes32 valueRatioOracle;
//        uint128 penaltyStart;
//        uint128 penaltyEnd;
//    }
//}
