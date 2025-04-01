import { renderAccountId } from '@_/format';
import { Text, Tooltip } from '@chakra-ui/react';
import type { ethers } from 'ethers';
import React from 'react';

export function AccountId({ accountId }: { accountId: ethers.BigNumber }) {
  const [accountTooltip, setAccountTooltip] = React.useState(`${accountId.toString()}`);
  return (
    <Tooltip
      hasArrow
      label={accountTooltip}
      fontFamily="monospace"
      fontSize="xs"
      placement="top-end"
      closeOnClick={false}
    >
      <Text
        cursor="pointer"
        onClick={() => {
          navigator.clipboard.writeText(`${accountId.toString()}`);
          setAccountTooltip('Copied');
          setTimeout(() => {
            setAccountTooltip(`${accountId.toString()}`);
          }, 3_000);
        }}
      >
        {renderAccountId(accountId)}
      </Text>
    </Tooltip>
  );
}
