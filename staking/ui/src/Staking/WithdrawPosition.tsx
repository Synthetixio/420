import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePythPrice } from '@_/usePythPrice';
import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { PanelTvl } from './PanelTvl';
import clock from './clock.svg';
import farming from './farming.webp';
import { useWithdrawCollateral } from './useWithdrawCollateral';
import { useWithdrawTimer } from './useWithdrawTimer';

export function WithdrawPosition() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType } = useCollateralType('SNX');

  const accountId = params.accountId ? ethers.BigNumber.from(params.accountId) : undefined;

  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId,
    collateralType,
  });

  const timeToWithdraw = useWithdrawTimer({ accountId });

  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { isReady: isReadyWithdrawCollateral, mutation: withdrawCollateral } =
    useWithdrawCollateral({ accountId, collateralType });

  return (
    <>
      <Flex
        direction="column"
        borderColor="gray.900"
        borderWidth="1px"
        borderRadius="6px"
        bg="navy.900"
        p={{ base: 4, sm: 10 }}
        pt={{ base: 6, sm: 10 }}
        gap={6}
        alignItems="center"
      >
        <Flex direction="column" gap={2} maxWidth="40em" textAlign="center">
          <Text color="gray.500">Your SNX has been unstaked</Text>
          {timeToWithdraw ? (
            <Text color="gray.500" maxWidth="40em">
              Check back later to withdraw it
            </Text>
          ) : (
            <Text color="gray.500" maxWidth="40em">
              You can now withdraw it
            </Text>
          )}
        </Flex>

        <Flex
          direction={{ base: 'column', sm: 'row', lg: 'row', xl: 'row' }}
          flexWrap="wrap"
          gap={6}
          width="100%"
          maxWidth="36em"
        >
          <Flex
            order={{ base: 1, sm: 1, lg: 1, xl: 1 }}
            flex={{ base: 1, sm: 1, lg: 1, xl: 1 }}
            direction="column"
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            p={{ base: 4, sm: 6 }}
            gap={6}
            justifyContent="space-between"
            h="fit-content"
          >
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
          </Flex>
        </Flex>
      </Flex>

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
