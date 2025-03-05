import { combineErrors, parseContractError } from '@_/parseContractError';
import { useAllErrors } from '@_/useAllErrors';
import { usePositionManagerNewPool } from '@_/usePositionManagerNewPool';
import { useCallback } from 'react';

export function useContractErrorParser() {
  const { data: AllErrors } = useAllErrors();
  const { data: PositionManager } = usePositionManagerNewPool();

  return useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (error: any) => {
      return parseContractError({
        error,
        abi: combineErrors([AllErrors, PositionManager]),
      });
    },
    [AllErrors, PositionManager]
  );
}
