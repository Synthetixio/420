import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { EscrowedSNX } from './EscrowedSNX';
import clock from './clock.svg';
import { useAccountCollateralUnlockDate } from './useAccountCollateralUnlockDate';
import { useBalance } from './useBalance';
import { useCountdown } from './useCountdown';
import { useWithdrawCollateral } from './useWithdrawCollateral';

export function PanelWithdrawCollateral({ accountId }: { accountId: ethers.BigNumber }) {
  const { data: balance, isPending: isPendingBalance } = useBalance({ accountId });
  const { data: accountCollateralUnlockDate, isLoading: isLoadingAccountCollateralUnlockDate } =
    useAccountCollateralUnlockDate({ accountId });
  const timeToWithdraw = useCountdown({
    date: accountCollateralUnlockDate,
    isLoading: isLoadingAccountCollateralUnlockDate,
  });

  const { isReady: isReadyWithdrawCollateral, mutation: withdrawCollateral } =
    useWithdrawCollateral({ accountId });

  return (
    <Flex direction="column" gap={3} textAlign="center" alignItems="center">
      <Text color="gray.500">Available to Withdraw</Text>
      <Box>
        <Text color="gray.50" fontSize="1.25em" fontWeight={500}>
          {isPendingBalance
            ? '~'
            : balance
              ? `${numbro(wei(balance.collateralAvailable).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })} SNX`
              : null}
        </Text>
        <Text color="gray.500" fontSize="1.0em">
          {isPendingBalance
            ? '~'
            : balance
              ? `$${numbro(
                  wei(balance.collateralAvailable).mul(balance.collateralPrice).toNumber()
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
        isLoading={withdrawCollateral.isPending}
        isDisabled={!(isReadyWithdrawCollateral && !withdrawCollateral.isPending)}
        onClick={() => withdrawCollateral.mutateAsync()}
      >
        Withdraw
      </Button>

      {timeToWithdraw ? (
        <Flex
          backgroundColor="whiteAlpha.200"
          py="1"
          px="3"
          borderRadius="md"
          gap={0}
          justifyContent="center"
          width="100%"
        >
          <Image mr={2} width="12px" src={clock} alt="Clock" />
          <Text color="gray.500" fontSize="12px">{`${timeToWithdraw} until you can withdraw`}</Text>
        </Flex>
      ) : null}
    </Flex>
  );
}
