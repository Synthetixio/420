import { Flex, Text } from '@chakra-ui/react';
import { BorderBox } from '@_/BorderBox';
import { calculateCRatio } from '@_/calculations';
import { D27 } from '@_/constants';
import { CRatioBar } from '@_/CRatioBar';
import { ManagePositionContext } from '@_/ManagePositionContext';
import { useNetwork } from '@_/useBlockchain';
import { useCollateralType } from '@_/useCollateralTypes';
import { useIsAndromedaStataUSDC } from '@_/useIsAndromedaStataUSDC';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type PositionPageSchemaType, useParams } from '@_/useParams';
import { useStaticAaveUSDCRate } from '@_/useStaticAaveUSDCRate';
import { validatePosition } from '@_/validatePosition';
import React from 'react';
import { CollateralStats } from './CollateralStats';
import { DebtStats } from './DebtStats';
import { PnlStats } from './PnlStats';

export function ManageStats() {
  const [params] = useParams<PositionPageSchemaType>();
  const { network } = useNetwork();

  const { debtChange, collateralChange } = React.useContext(ManagePositionContext);

  const { data: collateralType } = useCollateralType(params.collateralSymbol);
  const { data: liquidityPosition } = useLiquidityPosition({
    accountId: params.accountId,
    collateralType,
  });

  const isAndromedaStataUSDC = useIsAndromedaStataUSDC({
    tokenAddress: collateralType?.tokenAddress,
  });
  const { data: stataRate } = useStaticAaveUSDCRate();
  const adjustedCollateralChange = React.useMemo(() => {
    // Temporary adjustment until UI fully moves to show only USDC and avoid stata conversion
    if (isAndromedaStataUSDC && stataRate) {
      return collateralChange.div(stataRate).mul(D27);
    }
    return collateralChange;
  }, [collateralChange, isAndromedaStataUSDC, stataRate]);

  const cRatio = calculateCRatio(liquidityPosition?.debt, liquidityPosition?.collateralValue);
  const { newCRatio, newCollateralAmount, newDebt, hasChanges } = validatePosition({
    issuanceRatioD18: collateralType?.issuanceRatioD18,
    collateralAmount: liquidityPosition?.collateralAmount,
    collateralPrice: liquidityPosition?.collateralPrice,
    debt: liquidityPosition?.debt,
    collateralChange: adjustedCollateralChange,
    debtChange,
  });

  return (
    <Flex direction="column" gap={4}>
      <Text color="white" fontSize="lg" fontFamily="heading" fontWeight="bold" lineHeight="16px">
        Overview
      </Text>
      <Flex flexWrap="wrap" direction={['column', 'row']} gap={4}>
        <CollateralStats newCollateralAmount={newCollateralAmount} hasChanges={hasChanges} />
        {network?.preset === 'andromeda' ? (
          <PnlStats newDebt={newDebt} hasChanges={hasChanges} />
        ) : (
          <DebtStats newDebt={newDebt} hasChanges={hasChanges} />
        )}
      </Flex>
      {network?.preset === 'andromeda' ? null : (
        <BorderBox py={4} px={6} flexDirection="column" bg="navy.700">
          <CRatioBar
            hasChanges={hasChanges}
            currentCRatio={
              liquidityPosition?.collateralValue.gt(0) && liquidityPosition?.debt.eq(0)
                ? Number.MAX_SAFE_INTEGER
                : cRatio.toNumber() * 100
            }
            liquidationCratio={(collateralType?.liquidationRatioD18?.toNumber() || 0) * 100}
            newCRatio={
              newCollateralAmount.gt(0) && newDebt.eq(0)
                ? Number.MAX_SAFE_INTEGER
                : newCRatio.toNumber() * 100
            }
            targetCratio={(collateralType?.issuanceRatioD18.toNumber() || 0) * 100}
          />
        </BorderBox>
      )}
    </Flex>
  );
}
