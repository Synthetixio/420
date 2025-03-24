import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePythPrice } from '@_/usePythPrice';
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { PanelTvl } from './PanelTvl';
import clock from './clock.svg';
import coin from './coin.webp';
import farming from './farming.webp';
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
    <>
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
          <Flex direction="column" gap={3} textAlign="center">
            <Text color="gray.500">Available to Withdraw</Text>
            <Box>
              <Text color="gray.50" fontSize="1.25em" fontWeight={500}>
                {isPendingLiquidityPosition || isPendingSnxPrice ? '~' : null}
                {!(isPendingLiquidityPosition || isPendingSnxPrice) &&
                liquidityPosition?.availableCollateral &&
                snxPrice
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
                {isPendingLiquidityPosition || isPendingSnxPrice ? '~' : null}
                {!(isPendingLiquidityPosition || isPendingSnxPrice) &&
                liquidityPosition?.availableCollateral &&
                snxPrice
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

      <Flex direction="column">
        <Flex direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }} gap={6}>
          <Flex
            direction="column"
            flex={1}
            gap={4}
            display={{ base: 'none', sm: 'flex' }}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            bg="navy.700"
            p={{ base: 4, sm: 10 }}
          >
            <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
              SNX Powered Yield Farming
            </Text>
            <Text fontSize="16px" lineHeight="24px" color="gray.500">
              The 420 pool starts generating yield for you from Ethena and other yield sources
              immediately.
            </Text>
            <Box mt={2}>
              <Image rounded="6px" src={farming} width="100%" height="100%" objectFit="cover" />
            </Box>
          </Flex>
          <PanelTvl />
        </Flex>
      </Flex>
    </>
  );
}
