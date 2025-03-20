import { formatDuration, intervalToDuration } from 'date-fns';
import type { ethers } from 'ethers';
import React from 'react';
import { useAccountCollateralUnlockDate } from './useAccountCollateralUnlockDate';

export const formatTimeToUnlock = (accountCollateralUnlockDate: Date | undefined) => {
  if (!accountCollateralUnlockDate || accountCollateralUnlockDate.getTime() <= Date.now()) {
    return undefined;
  }
  const duration = intervalToDuration({
    start: new Date(),
    end: accountCollateralUnlockDate,
  });
  return formatDuration(duration, { format: ['days', 'hours', 'minutes'] });
};

export function useWithdrawTimer({
  accountId,
}: {
  accountId?: ethers.BigNumber;
}) {
  const { data: accountCollateralUnlockDate, isLoading } = useAccountCollateralUnlockDate({
    accountId,
  });

  const [time, setTime] = React.useState<string>();
  React.useEffect(() => {
    function count() {
      if (accountCollateralUnlockDate && !isLoading) {
        const timeToUnlock = formatTimeToUnlock(accountCollateralUnlockDate);
        setTime(timeToUnlock);
      }
    }
    const interval = setInterval(count, 10_000);
    count();
    return () => {
      setTime(undefined);
      clearInterval(interval);
    };
  }, [accountCollateralUnlockDate, isLoading]);

  return time;
}
