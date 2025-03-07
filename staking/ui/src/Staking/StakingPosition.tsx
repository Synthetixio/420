import { usePythPrice } from '@_/usePythPrice';
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { LoanChart } from './LoanChart';
import { ModalShare420 } from './ModalShare420';
import { TvlChart } from './TvlChart';
import farming from './farming.webp';
import share from './share.svg';
import { useClosePositionNewPool } from './useClosePositionNewPool';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { useLoan } from './useLoan';
import { usePositionCollateral } from './usePositionCollateral';
import { useTvl420 } from './useTvl420';

export function StakingPosition() {
  const { data: loanedAmount, isPending: isPendingLoanedAmount } = useCurrentLoanedAmount();
  const { data: loan, isPending: isPendingLoan } = useLoan();
  const { data: positionCollateral, isPending: isPendingPositionCollateral } =
    usePositionCollateral();
  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { isReady: isReadyClosePosition, mutation: closePosition } = useClosePositionNewPool();

  const { data: tvl420 } = useTvl420({ networkName: 'cross', span: 'daily' });

  const [isOpenShare, setIsOpenShare] = React.useState(false);

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
      >
        <Flex direction="row" gap={4} justifyContent="space-between">
          <Text color="gray.500" maxWidth="40em">
            Your position is fully delegated to Synthetix, and your debt is being forgiven
            automatically over time with zero risk of liquidation.
          </Text>
          <Button
            variant="outline"
            borderColor="gray.900"
            color="gray.50"
            onClick={() => setIsOpenShare(true)}
          >
            <Image mr={2} width="17px" src={share} alt="Share Synthatix 420 Pool" />
            Share
          </Button>
        </Flex>
        <Flex
          direction={{ base: 'column', sm: 'row', lg: 'row', xl: 'row' }}
          flexWrap="wrap"
          gap={6}
        >
          <Flex
            order={{ base: 2, sm: 1, lg: 1, xl: 1 }}
            flex={{ base: 1, sm: 2, lg: 2, xl: 2 }}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            bg="navy.900"
            direction="column"
            p={{ base: 4, sm: 6 }}
            gap={3}
          >
            <Flex minWidth="120px" direction="column" gap={3}>
              <Heading fontSize="20px" lineHeight="1.75rem" color="gray.50" fontWeight={700}>
                Debt Burned
              </Heading>

              {isPendingLoanedAmount || isPendingLoan || isPendingSnxPrice ? (
                <Text as="span" color="gray.50" fontSize="1.25em">
                  ~
                </Text>
              ) : (
                <Box>
                  <Text as="span" color="gray.50" fontSize="1.25em">
                    {loan && loanedAmount
                      ? `$${numbro(wei(loan.loanAmount.sub(loanedAmount)).toNumber()).format({
                          trimMantissa: true,
                          thousandSeparated: true,
                          average: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })}`
                      : null}
                  </Text>
                  <Text as="span" color="gray.500" fontSize="1.25em">
                    {loan
                      ? ` / $${numbro(wei(loan.loanAmount).toNumber()).format({
                          trimMantissa: true,
                          thousandSeparated: true,
                          average: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })}`
                      : null}
                  </Text>
                </Box>
              )}
            </Flex>
            <LoanChart
              loan={loan ? wei(loan.loanAmount).toNumber() : 100}
              startTime={loan ? Number.parseInt(loan.startTime.toString()) : 0}
              duration={365 * 24 * 60 * 60}
              pointsCount={50}
            />
          </Flex>
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
            <Flex minWidth="120px" direction="column" gap={3} textAlign="center">
              <Text color="gray.500">Account Balance</Text>
              <Box>
                <Text color="gray.50" fontSize="1.25em" fontWeight={500}>
                  {isPendingPositionCollateral || isPendingSnxPrice ? '~' : null}
                  {!(isPendingPositionCollateral || isPendingSnxPrice) &&
                  positionCollateral &&
                  snxPrice
                    ? `${numbro(wei(positionCollateral).toNumber()).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })} SNX`
                    : null}
                </Text>
                <Text color="gray.500" fontSize="1.0em">
                  {isPendingPositionCollateral || isPendingSnxPrice ? '~' : null}
                  {!(isPendingPositionCollateral || isPendingSnxPrice) &&
                  positionCollateral &&
                  snxPrice
                    ? `$${numbro(wei(positionCollateral).mul(snxPrice).toNumber()).format({
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
                isLoading={closePosition.isPending}
                isDisabled={!(isReadyClosePosition && !closePosition.isPending)}
                onClick={() => closePosition.mutateAsync()}
              >
                Withdraw
              </Button>
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
            pt={{ base: 6, sm: 10 }}
          >
            <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
              SNX Powered Yield Farming
            </Text>
            <Text fontSize="16px" lineHeight="24px" color="gray.500">
              The 420 pool starts generating yield for you from Ethena and other yield sources
              immediately.
            </Text>
            <Box>
              <Image
                mt={2}
                rounded="6px"
                src={farming}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
          </Flex>
          <Flex
            direction="column"
            flex={1}
            gap={4}
            justifyContent="flex-end"
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            bg="navy.700"
            p={{ base: 4, sm: 10 }}
            pb={{ base: 2, sm: 4 }}
          >
            <Text
              fontSize="24px"
              fontWeight={500}
              lineHeight="32px"
              display={{ base: 'block', sm: 'none' }}
              color="gray.50"
            >
              SNX Powered Yield Farming
            </Text>
            <Text
              fontSize="16px"
              lineHeight="24px"
              display={{ base: 'block', sm: 'none' }}
              color="gray.500"
            >
              The 420 pool starts generating yield for you from Ethena and other yield sources
              immediately.
            </Text>
            <Flex
              textAlign="right"
              gap={4}
              justifyContent="flex-end"
              alignItems="center"
              flexWrap="nowrap"
              mt={{ base: '4', sm: '0' }}
            >
              <Text fontSize="14px" color="gray.500">
                420 Pool TVL
              </Text>
              <Text fontSize="18px" fontWeight={500} color="gray.50">
                {tvl420 && tvl420.length > 0
                  ? `${numbro(tvl420[tvl420.length - 1].value).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      mantissa: 0,
                      spaceSeparated: false,
                    })} SNX`
                  : null}
              </Text>
            </Flex>
            <TvlChart data={tvl420} />
          </Flex>
        </Flex>
      </Flex>

      <ModalShare420 isOpenShare={isOpenShare} setIsOpenShare={setIsOpenShare} />
    </>
  );
}
