import { combineErrors, parseContractError } from '@_/parseContractError';
import { useAllErrors } from '@_/useAllErrors';
import { usePositionManager420 } from '@_/usePositionManager420';
import { useCallback } from 'react';

export function useContractErrorParser() {
  const { data: AllErrors } = useAllErrors();
  const { data: PositionManager420 } = usePositionManager420();

  return useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (error: any) => {
      return parseContractError({
        error,
        abi: combineErrors([AllErrors, PositionManager420]),
      });
    },
    [AllErrors, PositionManager420]
  );
}
