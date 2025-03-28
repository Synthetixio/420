import { etherscanLink } from '@_/etherscanLink';
import { useNetwork } from '@_/useBlockchain';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Link } from '@chakra-ui/react';
import { WalletAddress } from '../Staking/WalletAddress';

export function Address({ address }: { address: string }) {
  const { network } = useNetwork();
  return (
    <Flex alignItems="center" gap={2}>
      <WalletAddress address={address} />
      <Link
        isExternal
        href={etherscanLink({
          chain: network?.name || '',
          address,
        })}
      >
        <ExternalLinkIcon _hover={{ color: 'cyan' }} />
      </Link>
    </Flex>
  );
}
