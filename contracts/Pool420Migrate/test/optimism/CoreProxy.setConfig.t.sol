pragma solidity ^0.8.21;

import "../lib/Pool420MigrateTest.sol";
import "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";

contract Optimism_CoreProxy_setConfig_Test is Pool420MigrateTest {
    constructor() {
        deployment = "10-main";
        forkUrl = vm.envString("RPC_OPTIMISM_MAINNET");
        forkBlockNumber = 132431079;
        initialize();
    }

    function test_setConfig() public {
        vm.startPrank(CoreProxy.owner());
        address pm = 0x693CD986B8b840607d3c7952f038bc22DA636f48;
        uint128 scPoolId = uint128(1);
        uint128 poolId = TreasuryMarketProxy.poolId();

        CoreProxy.getConfig(keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), pm, scPoolId)));
        CoreProxy.getConfig(keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), pm, poolId)));
        CoreProxy.getConfig(keccak256(abi.encode(bytes32("senderOverrideWithdrawTimeout"), pm)));

        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), pm, scPoolId)),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideMinDelegateTime"), pm, poolId)),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        CoreProxy.setConfig(
            keccak256(abi.encode(bytes32("senderOverrideWithdrawTimeout"), pm)),
            0x0000000000000000000000000000000000000000000000000000000000000001
        );
        vm.stopPrank();
    }
}
