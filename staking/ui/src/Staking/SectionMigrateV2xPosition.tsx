import { Button } from '@chakra-ui/react';
import React from 'react';
import { MigrateStats } from './MigrateStats';
import { ModalMigrateV2xPosition } from './ModalMigrateV2xPosition';
import { ZeroRisk } from './ZeroRisk';
import { useMigratePool420V2x } from './useMigratePool420V2x';
import { useV2xPosition } from './useV2xPosition';

export function SectionMigrateV2xPosition() {
  const [isOpenMigrate, setIsOpenMigrate] = React.useState(false);
  const { isReady } = useMigratePool420V2x();
  const { data: v2xPosition } = useV2xPosition();
  return (
    <>
      <ModalMigrateV2xPosition isOpenMigrate={isOpenMigrate} setIsOpenMigrate={setIsOpenMigrate} />
      <MigrateStats
        collateral={v2xPosition?.collateral}
        collateralPrice={v2xPosition?.collateralPrice}
        debt={v2xPosition?.debt}
        cRatio={v2xPosition?.cRatio}
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
    </>
  );
}
