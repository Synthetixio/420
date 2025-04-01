import { InfoIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Image, Text, Tooltip } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { formatDuration, intervalToDuration } from 'date-fns';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { EscrowedSNX } from './EscrowedSNX';
import { ModalConfirmUnstake } from './ModalConfirmUnstake';
import { PanelAccount } from './PanelAccount';
import clock from './clock.svg';
import { useAccountTimeoutWithdraw } from './useAccountTimeoutWithdraw';
import { useAccountUnstakingUnlockDate } from './useAccountUnstakingUnlockDate';
import { useClosePositionPool420 } from './useClosePositionPool420';
import { useCountdown } from './useCountdown';
import { usePosition } from './usePosition';

export function PanelPool420Position({ accountId }: { accountId: ethers.BigNumber }) {
  const { data: position, isPending: isPendingPosition } = usePosition({ accountId });
  const { isReady: isReadyClosePosition, mutation: closePosition } = useClosePositionPool420({
    accountId,
  });

  const { data: accountUnstakingUnlockDate, isLoading: isLoadingAccountUnstakingUnlockDate } =
    useAccountUnstakingUnlockDate({ accountId });

  const timeToUnstake = useCountdown({
    date: accountUnstakingUnlockDate,
    isLoading: isLoadingAccountUnstakingUnlockDate,
  });

  const [isOpenUnstake, setIsOpenUnstake] = React.useState(false);

  const { data: accountTimeoutWithdraw, isPending: isPendingAccountTimeoutWithdraw } =
    useAccountTimeoutWithdraw();
  const unlockTimeout = React.useMemo(() => {
    if (!accountTimeoutWithdraw) {
      return undefined;
    }
    const duration = intervalToDuration({
      start: new Date(),
      end: new Date(Date.now() + accountTimeoutWithdraw.toNumber() * 1000),
    });
    return formatDuration(duration, { format: ['days', 'hours', 'minutes'] });
  }, [accountTimeoutWithdraw]);

  return (
    <>
      <Flex
        direction="column"
        order={{ base: 1, sm: 1, md: 1, lg: 1, xl: 1 }}
        flex={{ base: 'auto', sm: 'auto', md: 'auto', lg: 1, xl: 1 }}
        gap={6}
      >
        <Flex
          direction="column"
          bg="whiteAlpha.50"
          borderRadius="base"
          p={{ base: 4, sm: 6 }}
          gap={6}
          justifyContent="space-between"
          h="fit-content"
        >
          <Flex direction="column" textAlign="center" alignItems="center" gap={6}>
            <Text color="gray.500">
              Account Balance
              <Tooltip
                closeDelay={500}
                openDelay={300}
                hasArrow={true}
                offset={[0, 10]}
                label={
                  <Flex py={2} direction="column" gap={2.5}>
                    <Text color="gray.500" fontWeight={400} textAlign="left">
                      Account Balance consists of staked SNX and escrowed SNX
                    </Text>
                  </Flex>
                }
              >
                <InfoIcon ml={1.5} h="14px" verticalAlign="baseline" />
              </Tooltip>
            </Text>
            <Box>
              <Text color="gray.50" fontSize="1.25em" fontWeight={500}>
                {isPendingPosition
                  ? '~'
                  : position
                    ? `${numbro(wei(position.collateral).toNumber()).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })} SNX`
                    : null}
              </Text>
              <Text color="gray.500" fontSize="1.0em">
                {isPendingPosition
                  ? '~'
                  : position
                    ? `$${numbro(
                        wei(position.collateral).mul(position.collateralPrice).toNumber()
                      ).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })}`
                    : null}
              </Text>
            </Box>

            <EscrowedSNX accountId={accountId} />

            <Button
              width="100%"
              variant="outline"
              borderColor="gray.900"
              color="gray.50"
              isLoading={closePosition.isPending}
              isDisabled={!(isReadyClosePosition && !closePosition.isPending && !timeToUnstake)}
              onClick={() => setIsOpenUnstake(true)}
            >
              Unstake
            </Button>

            {timeToUnstake ? (
              <Flex
                backgroundColor="whiteAlpha.200"
                py="1"
                px="3"
                borderRadius="base"
                gap={0}
                justifyContent="center"
              >
                <Image mr={2} width="12px" src={clock} alt="Clock" />
                <Text
                  color="gray.500"
                  fontSize="12px"
                >{`${timeToUnstake} until you can unstake`}</Text>
              </Flex>
            ) : (
              <Flex
                backgroundColor="whiteAlpha.200"
                py="1"
                px="3"
                borderRadius="base"
                gap={0}
                justifyContent="center"
                width="100%"
              >
                <Text
                  color="gray.500"
                  fontSize="12px"
                >{`Withdrawals are locked for ${isPendingAccountTimeoutWithdraw ? '~' : (unlockTimeout ?? '-')} after unstaking`}</Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        <PanelAccount accountId={accountId} />
      </Flex>

      <ModalConfirmUnstake
        accountId={accountId}
        isOpenUnstake={isOpenUnstake}
        setIsOpenUnstake={setIsOpenUnstake}
      />
    </>
  );
}
