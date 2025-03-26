import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { SectionMigrateV3Position } from './SectionMigrateV3Position';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import burn from './burn.webp';
import { useLiquidityPositions } from './useLiquidityPositions';

export function PageMigrateFromV3() {
  const { data: liquidityPositions } = useLiquidityPositions();

  const accountId = React.useMemo(() => {
    if (liquidityPositions) {
      const [position] = liquidityPositions
        .filter((position) => position.collateral.gt(0))
        .sort((a, b) => b.collateral.sub(a.collateral).toNumber());
      if (position) {
        return position.accountId;
      }
    }
  }, [liquidityPositions]);

  return (
    <LayoutWithImage
      imageSrc={burn}
      Subheader={() => <SubheaderMigrateAndEarn />}
      Content={() => (accountId ? <SectionMigrateV3Position accountId={accountId} /> : null)}
    />
  );
}
