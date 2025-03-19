pragma solidity ^0.8.21;

import "../lib/PositionManagerTest.sol";
import "@synthetixio/v3-contracts/1-main/ICoreProxy.sol";

contract Mainnet_CoreProxy_setConfig_Test is PositionManagerTest {
    constructor() {
        deployment = "1-main";
        forkUrl = vm.envString("RPC_MAINNET");
        forkBlockNumber = 22043658;

        initialize();
    }

    function test_setConfig() public {
        vm.startPrank(CoreProxy.owner());
        address pm = 0x100C6C18381C9A7527762063047236356BBd0b8d;
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
