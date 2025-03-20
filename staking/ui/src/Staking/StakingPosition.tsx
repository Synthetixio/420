import { usePythPrice } from '@_/usePythPrice';
import { Box, Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { formatDuration, intervalToDuration } from 'date-fns';
import numbro from 'numbro';
import React from 'react';
import { LoanChart } from './LoanChart';
import { ModalShare420 } from './ModalShare420';
import { PanelTvl } from './PanelTvl';
import { UnstakeModal } from './UnstakeModal';
import farming from './farming.webp';
import share from './share.svg';
import { useAccountTimeoutWithdraw } from './useAccountTimeoutWithdraw';
import { useClosePositionPool420 } from './useClosePositionPool420';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { useLoan } from './useLoan';
import { usePositionCollateral } from './usePositionCollateral';

export function StakingPosition() {
  const { data: loanedAmount, isPending: isPendingLoanedAmount } = useCurrentLoanedAmount();
  const { data: loan, isPending: isPendingLoan } = useLoan();
  const { data: positionCollateral, isPending: isPendingPositionCollateral } =
    usePositionCollateral();
  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { isReady: isReadyClosePosition, mutation: closePosition } = useClosePositionPool420();

  const [isOpenShare, setIsOpenShare] = React.useState(false);

  const { data: accountTimeoutWithdraw } = useAccountTimeoutWithdraw();
  const unlockTimeout = React.useMemo(() => {
    if (!accountTimeoutWithdraw) {
      return undefined;
    }
    const duration = intervalToDuration({
      start: new Date(),
      end: new Date(Date.now() + accountTimeoutWithdraw * 1000),
    });
    return formatDuration(duration, { format: ['days', 'hours', 'minutes'] });
  }, [accountTimeoutWithdraw]);

  const [unstakeOpen, setUnstakeOpen] = React.useState(false);

  return (
    <>
      <UnstakeModal isOpen={unstakeOpen} setIsOpen={setUnstakeOpen} />
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
        <Flex direction={{ base: 'column', sm: 'row' }} gap={4} justifyContent="space-between">
          <Text color="gray.500" maxWidth="40em">
            Your position is fully delegated to Synthetix, and your debt is being forgiven
            automatically over time with zero risk of liquidation.
          </Text>
          <Button variant="outline" onClick={() => setIsOpenShare(true)} minWidth="fit-content">
            <Image mr={2} width="16px" src={share} alt="Share Synthetix 420 Pool" />
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
                  <Text as="span" color="gray.50" fontSize="1.25em" fontWeight={500}>
                    {loan && loanedAmount
                      ? `🔥 $${numbro(wei(loan.loanAmount.sub(loanedAmount)).toNumber()).format({
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
              startTime={
                loan ? Number.parseInt(loan.startTime.toString()) : Math.floor(Date.now() / 1000)
              }
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
                borderColor="gray.900"
                color="gray.50"
                isLoading={closePosition.isPending}
                isDisabled={!(isReadyClosePosition && !closePosition.isPending)}
                onClick={() => setUnstakeOpen(true)}
              >
                Unstake
              </Button>
              <Flex
                backgroundColor="#ffffff10"
                py="1"
                px="3"
                borderRadius="base"
                gap={0}
                justifyContent="center"
              >
                <Text color="gray.500" fontSize="12px">
                  Withdrawals are locked for {unlockTimeout} after unstaking
                </Text>
              </Flex>
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

      <ModalShare420 isOpenShare={isOpenShare} setIsOpenShare={setIsOpenShare} />
    </>
  );
}
