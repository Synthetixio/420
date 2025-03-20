import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePythPrice } from '@_/usePythPrice';
import { InfoIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  Grid,
  GridItem,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { formatDuration, intervalToDuration, intlFormat } from 'date-fns';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { useAccountTimeoutWithdraw } from './useAccountTimeoutWithdraw';
import { useClosePositionPool420 } from './useClosePositionPool420';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { useLoan } from './useLoan';
import { useLocks } from './useLocks';
import { usePositionCollateral } from './usePositionCollateral';
import { useRepaymentPenalty } from './useRepaymentPenalty';

export function ModalConfirmUnstake({
  isOpenUnstake,
  setIsOpenUnstake,
}: {
  isOpenUnstake: boolean;
  setIsOpenUnstake: (isOpen: boolean) => void;
}) {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType } = useCollateralType('SNX');

  const [disclaimerChecked, setDisclaimerChecked] = React.useState(false);
  const { isReady: isReadyClosePosition, mutation: closePosition } = useClosePositionPool420();
  const { data: positionCollateral, isPending: isPendingPositionCollateral } =
    usePositionCollateral();
  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { data: loanedAmount, isPending: isPendingLoanedAmount } = useCurrentLoanedAmount();
  const { data: loan, isPending: isPendingLoan } = useLoan();
  const { data: repaymentPenalty, isPending: isPendingRepaymentPenalty } = useRepaymentPenalty();
  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId: params.accountId ? ethers.BigNumber.from(params.accountId) : undefined,
    collateralType,
  });
  const { data: locks } = useLocks(params.accountId, collateralType?.address);

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

  const onClose = React.useCallback(() => {
    setDisclaimerChecked(false);
    setIsOpenUnstake(false);
  }, [setIsOpenUnstake]);

  return (
    <Modal size="lg" isOpen={isOpenUnstake} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent
        mt="100px"
        borderWidth="1px"
        borderColor="gray.900"
        bg="navy.900"
        color="gray.50"
      >
        <Flex justifyContent="space-between" p={6} alignItems="center">
          <Heading fontSize="18px" lineHeight="28px">
            Unstake
          </Heading>
          <CloseButton onClick={onClose} color="gray.500" />
        </Flex>
        <ModalBody pt={0} pb={6}>
          <Flex direction="column" gap={6}>
            <Grid
              backgroundColor="whiteAlpha.200"
              p="3"
              borderRadius="base"
              gap={3}
              templateColumns="repeat(2, 1fr)"
              fontWeight={700}
              fontSize="12px"
            >
              <GridItem>Account Balance</GridItem>
              <GridItem textAlign="right">
                <Flex gap={1} direction="column">
                  <span>
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
                  </span>
                  <Text fontWeight="normal" color="gray.500">
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
                </Flex>
              </GridItem>

              <GridItem>
                Available to Unstake
                {locks && locks.length > 0 && (
                  <Tooltip
                    closeDelay={500}
                    openDelay={300}
                    hasArrow={true}
                    offset={[0, 10]}
                    label={
                      <Flex py={2} direction="column" gap={2.5}>
                        <Text color="gray.500" fontWeight={400} textAlign="left">
                          A portion of your SNX is still in escrow, and will be available to
                          withdraw on the vesting date
                        </Text>
                        {locks?.map((lock) => (
                          <Flex
                            key={lock.timestamp.toString()}
                            gap={8}
                            justifyContent="space-between"
                          >
                            <Text>
                              {`Vesting date: ${intlFormat(lock.expirationDate, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}`}
                            </Text>
                            <Text fontWeight={700}>{`${numbro(wei(lock.amount).toNumber()).format({
                              trimMantissa: true,
                              thousandSeparated: true,
                              average: true,
                              mantissa: 2,
                              spaceSeparated: false,
                            })} SNX`}</Text>
                          </Flex>
                        ))}
                      </Flex>
                    }
                  >
                    <InfoIcon ml={1.5} w="10px" h="10px" />
                  </Tooltip>
                )}
              </GridItem>
              <GridItem textAlign="right">
                <Flex gap={1} direction="column">
                  <span>
                    {}
                    {`${numbro(
                      liquidityPosition?.totalDeposited
                        .sub(liquidityPosition?.totalLocked)
                        .toNumber()
                    ).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })} SNX`}
                  </span>
                  <Text fontWeight="normal" color="gray.500">
                    {isPendingLiquidityPosition || isPendingSnxPrice
                      ? '~'
                      : liquidityPosition && snxPrice
                      ? `$${numbro(
                          liquidityPosition?.totalDeposited
                            .sub(liquidityPosition?.totalLocked)
                            .mul(snxPrice)
                            .toNumber()
                        ).format({
                          trimMantissa: true,
                          thousandSeparated: true,
                          average: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })}`
                      : null}
                  </Text>
                </Flex>
              </GridItem>
            </Grid>

            <Grid
              backgroundColor="whiteAlpha.200"
              p="3"
              borderRadius="base"
              gap={3}
              templateColumns="repeat(2, 1fr)"
              fontSize="12px"
            >
              <GridItem color="gray.500">Current Debt</GridItem>
              <GridItem color="gray.500" textAlign="right">
                {isPendingLoanedAmount
                  ? '~'
                  : loanedAmount
                  ? `$${numbro(wei(loanedAmount).toNumber()).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })}`
                  : null}
              </GridItem>
              <GridItem color="gray.500">Debt Burned</GridItem>
              <GridItem color="gray.500" textAlign="right">
                {isPendingLoanedAmount || isPendingLoan || isPendingSnxPrice
                  ? '~'
                  : loan && loanedAmount
                  ? `$${numbro(wei(loan.loanAmount.sub(loanedAmount)).toNumber()).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })}`
                  : null}
              </GridItem>
              <GridItem color="gray.500">Early Withdrawal Penalty</GridItem>
              <GridItem color={repaymentPenalty?.gt(0) ? 'red.300' : 'gray.500'} textAlign="right">
                {isPendingRepaymentPenalty
                  ? '~'
                  : repaymentPenalty
                  ? `$${numbro(wei(repaymentPenalty).toNumber()).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })}`
                  : null}
              </GridItem>
              <GridItem color="gray.50" fontWeight={700}>
                Total Debt
              </GridItem>
              <GridItem textAlign="right" color="gray.50" fontWeight={700}>
                {isPendingLoanedAmount || isPendingRepaymentPenalty
                  ? '~'
                  : loanedAmount && repaymentPenalty
                  ? `$${numbro(wei(loanedAmount).add(repaymentPenalty).toNumber()).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })}`
                  : null}
              </GridItem>
            </Grid>

            <Alert status="info" colorScheme="cyan" backgroundColor="blue.900" borderRadius="6px">
              <AlertIcon />
              <Text fontSize="14px">
                Withdrawals are locked for {unlockTimeout} after unstaking
              </Text>
            </Alert>

            <Checkbox
              fontSize="14px"
              my={2}
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
            >
              <Text fontSize="14px">I understand that this action cannot be undone</Text>
            </Checkbox>

            <Button
              mb={-2}
              width="100%"
              isLoading={closePosition.isPending}
              isDisabled={!(isReadyClosePosition && !closePosition.isPending && disclaimerChecked)}
              onClick={() => closePosition.mutateAsync()}
            >
              Repay & Unstake
            </Button>

            <Button
              width="100%"
              variant="outline"
              borderColor="gray.900"
              color="gray.50"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
