import { intervalToDuration } from 'date-fns';
import React from 'react';

export function useCountdown({
  date,
  isLoading,
}: {
  date?: Date;
  isLoading: boolean;
}) {
  const [time, setTime] = React.useState<string>();
  React.useEffect(() => {
    function count() {
      if (!isLoading && date && date.getTime() > Date.now()) {
        const duration = intervalToDuration({ start: new Date(), end: date });
        // const timeToUnlock = formatDuration(duration, { format: ['days', 'hours', 'minutes'] });
        setTime(
          [
            duration.days ? `${duration.days}d` : undefined,
            duration.hours ? `${duration.hours}h` : undefined,
            duration.minutes ? `${duration.minutes}m` : undefined,
          ]
            .filter((x) => x)
            .join(' ')
        );
      }
    }
    const interval = setInterval(count, 10_000);
    count();
    return () => {
      setTime(undefined);
      clearInterval(interval);
    };
  }, [date, isLoading]);

  return time;
}
