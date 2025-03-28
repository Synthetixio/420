import { useProvider, useSigner } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useMutation } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useManagePermissions');

type Permissions = Array<string>;
const getPermissionDiff = (
  existing: Permissions,
  selected: Permissions
): {
  grants: Permissions;
  revokes: Permissions;
} => {
  let grants: Permissions = [];
  let revokes: Permissions = [];
  for (const permission of existing.concat(selected)) {
    if (!existing.includes(permission)) {
      grants = [...grants, permission];
    }
    if (!selected.includes(permission)) {
      revokes = [...revokes, permission];
    }
  }
  return { grants, revokes };
};

export const useManagePermissions = ({
  accountId,
  target,
  existing = [],
  selected = [],
}: {
  accountId: ethers.BigNumber;
  target: string;
  existing: Permissions;
  selected: Permissions;
}) => {
  const { data: CoreProxy } = useCoreProxy();
  const { data: Multicall3 } = useTrustedMulticallForwarder();
  const signer = useSigner();
  const provider = useProvider();

  return useMutation({
    mutationFn: async () => {
      if (!(CoreProxy && Multicall3 && signer && provider)) {
        throw 'OMFG';
      }

      const { grants, revokes } = getPermissionDiff(existing, selected);
      const CoreProxyInterface = new ethers.utils.Interface(CoreProxy.abi);

      const grantCalls = grants.map((permission) => ({
        target: CoreProxy.address,
        callData: CoreProxyInterface.encodeFunctionData('grantPermission', [
          accountId,
          ethers.utils.formatBytes32String(permission),
          target,
        ]),
        allowFailure: false,
        requireSuccess: true,
      }));

      const revokeCalls = revokes.map((permission) => ({
        target: CoreProxy.address,
        callData: CoreProxyInterface.encodeFunctionData('revokePermission', [
          accountId,
          ethers.utils.formatBytes32String(permission),
          target,
        ]),
        allowFailure: false,
        requireSuccess: true,
      }));

      const Multicall3Contract = new ethers.Contract(Multicall3.address, Multicall3.abi, signer);
      const txn = await Multicall3Contract.aggregate3([...grantCalls, ...revokeCalls]);
      log('txn', txn);
      const receipt = await provider.waitForTransaction(txn.hash);
      log('receipt', receipt);
    },
  });
};
