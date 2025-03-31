import { Text } from '@chakra-ui/react';
import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { PanelWithdrawCollateral } from './PanelWithdrawCollateral';
import coin from './coin.webp';
import { useBalances } from './useBalances';

export function PageWithdrawPosition() {
  const { data: balances } = useBalances();
  const accountId = React.useMemo(() => {
    if (balances) {
      const [position] = balances
        .filter((position) => position.collateralAvailable.gt(0))
        .sort((a, b) => b.collateralAvailable.sub(a.collateralAvailable).toNumber());
      if (position) {
        return position.accountId;
      }
    }
  }, [balances]);

  return (
    <LayoutWithImage
      imageSrc={coin}
      Subheader={() => (
        <Text
          color="gray.300"
          fontSize={['20px', '24px']}
          fontWeight={500}
          lineHeight={1.25}
          letterSpacing="tight"
        >
          Your SNX has been unstaked.
        </Text>
      )}
      Content={() => (accountId ? <PanelWithdrawCollateral accountId={accountId} /> : null)}
    />
  );
}
