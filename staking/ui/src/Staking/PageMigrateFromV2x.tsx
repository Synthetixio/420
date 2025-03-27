import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { SectionMigrateV2xPosition } from './SectionMigrateV2xPosition';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import burn from './burn.webp';

export function PageMigrateFromV2x() {
  return (
    <LayoutWithImage
      imageSrc={burn}
      Subheader={() => <SubheaderMigrateAndEarn />}
      Content={() => <SectionMigrateV2xPosition />}
    />
  );
}
