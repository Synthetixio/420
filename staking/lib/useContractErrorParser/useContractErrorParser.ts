import { combineErrors, parseContractError } from '@_/parseContractError';
import { useAllErrors } from '@_/useAllErrors';
import { useClosePosition } from '@_/useClosePosition';
import { usePositionManager } from '@_/usePositionManager';
import { usePositionManagerAndromedaStataUSDC } from '@_/usePositionManagerAndromedaStataUSDC';
import { usePositionManagerAndromedaUSDC } from '@_/usePositionManagerAndromedaUSDC';
import { useStaticAaveUSDC } from '@_/useStaticAaveUSDC';
import { useCallback } from 'react';

export function useContractErrorParser() {
  const { data: AllErrors } = useAllErrors();
  const { data: ClosePosition } = useClosePosition();
  const { data: StaticAaveUSDC } = useStaticAaveUSDC();
  const { data: PositionManager } = usePositionManager();
  const { data: PositionManagerAndromedaStataUSDC } = usePositionManagerAndromedaStataUSDC();
  const { data: PositionManagerAndromedaUSDC } = usePositionManagerAndromedaUSDC();

  return useCallback(
    (error: any) => {
      return parseContractError({
        error,
        abi: combineErrors([
          AllErrors,
          ClosePosition,
          StaticAaveUSDC,
          PositionManager,
          PositionManagerAndromedaStataUSDC,
          PositionManagerAndromedaUSDC,
        ]),
      });
    },
    [
      AllErrors,
      ClosePosition,
      PositionManager,
      PositionManagerAndromedaStataUSDC,
      PositionManagerAndromedaUSDC,
      StaticAaveUSDC,
    ]
  );
}
