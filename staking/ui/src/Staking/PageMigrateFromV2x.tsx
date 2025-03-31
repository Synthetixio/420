import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { PanelMigrateV2xPosition } from './PanelMigrateV2xPosition';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import burn from './burn.webp';

export function PageMigrateFromV2x() {
  return (
    <LayoutWithImage
      imageSrc={burn}
      Subheader={() => <SubheaderMigrateAndEarn />}
      Content={() => <PanelMigrateV2xPosition />}
    />
  );
}
