import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePythPrice } from '@_/usePythPrice';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { EscrowedSNX } from './EscrowedSNX';
import { LayoutWithImage } from './LayoutWithImage';
import clock from './clock.svg';
import coin from './coin.webp';
import { useAccountCollateralUnlockDate } from './useAccountCollateralUnlockDate';
import { useCountdown } from './useCountdown';
import { useWithdrawCollateral } from './useWithdrawCollateral';

export function WithdrawPosition() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType } = useCollateralType('SNX');

  const accountId = params.accountId ? ethers.BigNumber.from(params.accountId) : undefined;

  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId,
    collateralType,
  });

  const { data: accountCollateralUnlockDate, isLoading: isLoadingAccountCollateralUnlockDate } =
    useAccountCollateralUnlockDate({ accountId });
  const timeToWithdraw = useCountdown({
    date: accountCollateralUnlockDate,
    isLoading: isLoadingAccountCollateralUnlockDate,
  });

  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { isReady: isReadyWithdrawCollateral, mutation: withdrawCollateral } =
    useWithdrawCollateral({ accountId, collateralType });

  return (
    <LayoutWithImage
      imageSrc={coin}
      Subheader={() => (
        <Text
          color="gray.300"
          fontSize={['20px', '24px']}
          fontWeight={500}
          lineHeight={1.25}
          letterSpacing="tight"
        >
          Your SNX has been unstaked.
        </Text>
      )}
      Content={() => (
        <Flex direction="column" gap={3} textAlign="center" alignItems="center">
          <Text color="gray.500">Available to Withdraw</Text>
          <Box>
            <Text color="gray.50" fontSize="1.25em" fontWeight={500}>
              {isPendingLiquidityPosition || isPendingSnxPrice
                ? '~'
                : liquidityPosition?.availableCollateral && snxPrice
                  ? `${numbro(wei(liquidityPosition?.availableCollateral).toNumber()).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })} SNX`
                  : null}
            </Text>
            <Text color="gray.500" fontSize="1.0em">
              {isPendingLiquidityPosition || isPendingSnxPrice
                ? '~'
                : liquidityPosition?.availableCollateral && snxPrice
                  ? `$${numbro(
                      wei(liquidityPosition?.availableCollateral).mul(snxPrice).toNumber()
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

          <EscrowedSNX />

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
              borderRadius="base"
              gap={0}
              justifyContent="center"
              width="100%"
            >
              <Image mr={2} width="12px" src={clock} alt="Clock" />
              <Text
                color="gray.500"
                fontSize="12px"
              >{`${timeToWithdraw} until you can withdraw`}</Text>
            </Flex>
          ) : null}
        </Flex>
      )}
    />
  );
}
