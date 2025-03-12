import { etherscanLink } from '@_/etherscanLink';
import { prettyString } from '@_/format';
import { useNetwork } from '@_/useBlockchain';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Text, type TextProps, Tooltip } from '@chakra-ui/react';
import { useMemo } from 'react';

export function Address({
  address,
  ...props
}: {
  address: string;
} & TextProps) {
  const { network } = useNetwork();
  const link = useMemo(
    () =>
      etherscanLink({
        chain: network?.name || '',
        address,
      }),
    [address, network?.name]
  );
  return (
    <Flex as={Text} alignItems="center" gap={2} {...props}>
      <Tooltip label={address} fontSize="0.75em" whiteSpace="nowrap">
        {prettyString(address)}
      </Tooltip>
      <CopyIcon
        onClick={() => {
          navigator.clipboard.writeText(address);
        }}
        cursor="pointer"
        _hover={{ color: 'cyan' }}
      />
      <a target="_blank" href={link} rel="noreferrer">
        <ExternalLinkIcon _hover={{ color: 'cyan' }} />
      </a>
    </Flex>
  );
}
