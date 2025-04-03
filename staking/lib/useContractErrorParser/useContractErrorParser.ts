import { combineErrors, parseContractError } from '@_/parseContractError';
import { useAllErrors } from '@_/useAllErrors';
import { usePool420Migrate } from '@_/usePool420Migrate';
import { useCallback } from 'react';

export function useContractErrorParser() {
  const { data: AllErrors } = useAllErrors();
  const { data: Pool420Migrate } = usePool420Migrate();

  return useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (error: any) => {
      return parseContractError({
        error,
        abi: combineErrors([AllErrors, Pool420Migrate]),
      });
    },
    [AllErrors, Pool420Migrate]
  );
}
