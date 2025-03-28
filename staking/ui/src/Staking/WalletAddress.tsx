import { renderWalletAddress } from '@_/format';
import { Text, Tooltip } from '@chakra-ui/react';
import React from 'react';

export function WalletAddress({ address, ens }: { address: string; ens?: string }) {
  const [walletTooltip, setWalletTooltip] = React.useState(address ? `${address}` : 'Copy');
  return (
    <Tooltip
      hasArrow
      label={walletTooltip}
      fontFamily="monospace"
      fontSize="xs"
      placement="top-end"
      closeOnClick={false}
    >
      <Text
        cursor="pointer"
        onClick={() => {
          navigator.clipboard.writeText(address);
          setWalletTooltip('Copied');
          setTimeout(() => {
            setWalletTooltip(address);
          }, 3_000);
        }}
      >
        {ens || renderWalletAddress(address)}
      </Text>
    </Tooltip>
  );
}
