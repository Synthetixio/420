import { importAllErrors, importPositionManager420 } from '@_/contracts';
import { ethers } from 'ethers';

const ERC721_ERRORS: `error ${string}`[] = [
  'error CannotSelfApprove(address addr)',
  'error InvalidTransferRecipient(address addr)',
  'error InvalidOwner(address addr)',
  'error TokenDoesNotExist(uint256 id)',
  'error TokenAlreadyMinted(uint256 id)',
];

export type ContractErrorType = {
  data: string;
  name: string;
  signature: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  args: Record<string, any>;
};

export const PYTH_ERRORS: `error ${string}`[] = [
  // Function arguments are invalid (e.g., the arguments lengths mismatch)
  // Signature: 0xa9cb9e0d
  'error InvalidArgument()',
  // Update data is coming from an invalid data source.
  // Signature: 0xe60dce71
  'error InvalidUpdateDataSource()',
  // Update data is invalid (e.g., deserialization error)
  // Signature: 0xe69ffece
  'error InvalidUpdateData()',
  // Insufficient fee is paid to the method.
  // Signature: 0x025dbdd4
  'error InsufficientFee()',
  // There is no fresh update, whereas expected fresh updates.
  // Signature: 0xde2c57fa
  'error NoFreshUpdate()',
  // There is no price feed found within the given range or it does not exists.
  // Signature: 0x45805f5d
  'error PriceFeedNotFoundWithinRange()',
  // Price feed not found or it is not pushed on-chain yet.
  // Signature: 0x14aebe68
  'error PriceFeedNotFound()',
  // Requested price is stale.
  // Signature: 0x19abf40e
  'error StalePrice()',
  // Given message is not a valid Wormhole VAA.
  // Signature: 0x2acbe915
  'error InvalidWormholeVaa()',
  // Governance message is invalid (e.g., deserialization error).
  // Signature: 0x97363b35
  'error InvalidGovernanceMessage()',
  // Governance message is not for this contract.
  // Signature: 0x63daeb77
  'error InvalidGovernanceTarget()',
  // Governance message is coming from an invalid data source.
  // Signature: 0x360f2d87
  'error InvalidGovernanceDataSource()',
  // Governance message is old.
  // Signature: 0x88d1b847
  'error OldGovernanceMessage()',
  // The wormhole address to set in SetWormholeAddress governance is invalid.
  // Signature: 0x13d3ed82
  'error InvalidWormholeAddressToSet()',
];

const PANIC_REASONS: { [key: string]: string } = {
  '00': 'Generic compiler inserted panics.',
  '01': 'Assert evaluates to false.',
  '11': 'Arithmetic operation results in underflow or overflow.',
  '12': 'Division by zero.',
  '21': 'Cannot convert value into an enum type.',
  '22': 'Storage byte array is incorrectly encoded.',
  '31': "Call to 'pop' on an empty array.",
  '32': 'Array index is out of bounds.',
  '41': 'Allocation of too much memory.',
  '51': 'Call to a zero-initialized variable of internal function type.',
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function extractErrorData(error: Error | any) {
  return (
    error.cause?.cause?.cause?.error?.data ||
    error.cause?.cause?.cause?.data ||
    error.cause?.cause?.error?.data ||
    error.cause?.cause?.data ||
    error.cause?.data ||
    error?.error?.error?.error?.data ||
    error?.error?.error?.data ||
    error?.error?.data?.data ||
    error?.error?.data ||
    error?.data?.data ||
    error?.data
  );
}

export function dedupeErrors(abiErrors: `error ${string}`[]) {
  const unique = new Set();
  const uniqueAbiErrors: string[] = [];
  for (const errorLine of abiErrors) {
    const fragment = ethers.utils.Fragment.from(errorLine);
    const sighash = fragment.format(ethers.utils.FormatTypes.sighash);
    if (!unique.has(sighash)) {
      uniqueAbiErrors.push(fragment.format(ethers.utils.FormatTypes.full));
      unique.add(sighash);
    }
  }
  return uniqueAbiErrors;
}

export function combineErrors(contracts: ({ abi: string[] } | undefined)[]) {
  const abiErrors: `error ${string}`[] = [];
  for (const contract of contracts) {
    if (contract) {
      for (const line of contract.abi) {
        if (line.startsWith('error ')) {
          abiErrors.push(line as `error ${string}`);
        }
      }
    }
  }
  return abiErrors;
}

export function parseErrorData({
  errorData,
  abi,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  errorData?: any;
  abi?: `error ${string}`[];
}): ContractErrorType | undefined {
  if (`${errorData}`.startsWith('0x08c379a0')) {
    const content = `0x${errorData.substring(10)}`;
    // reason: string; for standard revert error string
    const reason = ethers.utils.defaultAbiCoder.decode(['string'], content);
    console.error(reason);
    return {
      data: errorData,
      signature: content,
      name: `Revert ${reason[0]}`,
      args: { reason: reason[0] },
    };
  }
  if (`${errorData}`.startsWith('0x4e487b71')) {
    const content = `0x${errorData.substring(10)}`;
    const code = errorData.slice(-2);
    if (code in PANIC_REASONS) {
      console.error(`Panic ${PANIC_REASONS[code]}`);
      return {
        data: errorData,
        signature: content,
        name: `Panic ${PANIC_REASONS[code]}`,
        args: { code },
      };
    }
    console.error(`Panic ${code}`);
    return {
      data: errorData,
      signature: content,
      name: `Panic ${code}`,
      args: { code },
    };
  }

  try {
    const AllErrorsInterface = new ethers.utils.Interface(
      dedupeErrors([...(abi ? abi : []), ...PYTH_ERRORS, ...ERC721_ERRORS])
    );

    const errorParsed = AllErrorsInterface.parseError(errorData);
    const errorArgs = Object.fromEntries(
      Object.entries(errorParsed.args)
        .filter(([key]) => `${Number.parseInt(key)}` !== key)
        .map(([key, value]) => {
          if (value instanceof ethers.BigNumber) {
            // Guess wei
            const unwei = Number.parseFloat(ethers.utils.formatEther(value.toString()));
            if (unwei > 0.001) {
              // must be wei
              return [key, unwei];
            }

            // Guess date
            if (
              value.toNumber() > new Date(2000, 1, 1).getTime() / 1000 &&
              value.toNumber() < new Date(2100, 1, 1).getTime() / 1000
            ) {
              return [key, new Date(value.toNumber() * 1000)];
            }

            // Just a number
            return [key, Number.parseFloat(value.toString())];
          }

          // Not a number
          return [key, value];
        })
    );

    return {
      data: errorData,
      name: errorParsed.name,
      signature: errorParsed.signature,
      args: errorArgs,
    };
  } catch (error) {
    console.error(`Error parsing failure: ${error}`);
  }
}

export function parseContractError({
  error,
  abi,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  error?: any;
  abi?: `error ${string}`[];
}): ContractErrorType | undefined {
  const errorData = extractErrorData(error);
  if (!errorData) {
    console.error({ error }); // intentional logging as object so we can inspect all properties
    return;
  }
  return parseErrorData({ errorData, abi });
}

export async function importAllContractErrors(chainId?: number, preset?: string) {
  return chainId && preset
    ? combineErrors(
        await Promise.all([
          importAllErrors(chainId, preset).catch(() => undefined),
          importPositionManager420(chainId, preset).catch(() => undefined),
        ])
      )
    : [];
}
