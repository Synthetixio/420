import { Button } from '@chakra-ui/react';
import type { ethers } from 'ethers';
import React from 'react';
import { MigrateStats } from './MigrateStats';
import { ModalMigrateV3Position } from './ModalMigrateV3Position';
import { ZeroRisk } from './ZeroRisk';
import { useLiquidityPosition } from './useLiquidityPosition';
import { useMigratePool420 } from './useMigratePool420';

export function SectionMigrateV3Position({ accountId }: { accountId: ethers.BigNumber }) {
  const [isOpenMigrate, setIsOpenMigrate] = React.useState(false);
  const { data: liquidityPosition } = useLiquidityPosition({ accountId });
  const { isReady } = useMigratePool420({ accountId });
  return (
    <>
      <MigrateStats
        collateral={liquidityPosition?.collateral}
        collateralPrice={liquidityPosition?.collateralPrice}
        debt={liquidityPosition?.debt}
        cRatio={liquidityPosition?.cRatio}
      />
      <ZeroRisk />
      <Button
        isDisabled={!isReady}
        onClick={() => {
          window?._paq?.push(['trackEvent', 'staking', '420_migration', 'click_burn_my_debt']);
          setIsOpenMigrate(true);
        }}
      >
        Burn My Debt
      </Button>
      <ModalMigrateV3Position
        isOpenMigrate={isOpenMigrate}
        setIsOpenMigrate={setIsOpenMigrate}
        accountId={accountId}
      />
    </>
  );
}
