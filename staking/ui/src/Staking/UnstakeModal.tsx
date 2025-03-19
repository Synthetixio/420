import {
  CloseButton,
  Flex,
  Heading,
  Modal,
  Text,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Grid,
  GridItem,
  Tooltip,
  AlertIcon,
  Alert,
  Checkbox,
  Button,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useClosePositionPool420 } from './useClosePositionPool420';
import { InfoIcon } from '@chakra-ui/icons';
import { useLocks } from '../../../lib/useLocks';
import { useCollateralType } from '@_/useCollateralTypes';
import { HomePageSchemaType, useParams } from '@_/useParams';
import { formatDuration, intervalToDuration, intlFormat } from 'date-fns';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import { usePositionCollateral } from './usePositionCollateral';
import { usePythPrice } from '@_/usePythPrice';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { ethers } from 'ethers';
import { useRepaymentPenalty } from './useRepaymentPenalty';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { useLoan } from './useLoan';
import { useAccountTimeoutWithdraw } from './useAccountTimeoutWithdraw';

export function UnstakeModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType } = useCollateralType('SNX');

  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const { isReady: isReadyClosePosition, mutation: closePosition } = useClosePositionPool420();
  const { data: positionCollateral, isPending: isPendingPositionCollateral } =
    usePositionCollateral();
  const { data: snxPrice, isPending: isPendingSnxPrice } = usePythPrice('SNX');
  const { data: loanedAmount } = useCurrentLoanedAmount();
  const { data: loan, isPending: isPendingLoan } = useLoan();
  const { data: repaymentPenalty } = useRepaymentPenalty();
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

  return (
    <Modal size="lg" isOpen={isOpen} onClose={() => setIsOpen(false)} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent mt="100px" borderWidth="1px" borderColor="gray.900" bg="navy.900" color="white">
        <Flex justifyContent="space-between" p={6} alignItems="center">
          <Heading fontSize="18px" lineHeight="28px">
            Unstake
          </Heading>
          <CloseButton onClick={() => setIsOpen(false)} color="gray" />
        </Flex>
        <ModalBody pt={0} pb={6}>
          <Flex direction="column" gap={6}>
            <Grid
              backgroundColor="#ffffff10"
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
                    label={
                      <Flex py={2} direction="column" gap={2.5}>
                        <Text color="gray.500" fontWeight={400} textAlign="center">
                          A portion of your SNX is still in escrow
                        </Text>
                        {locks?.map((lock) => (
                          <Flex gap={8} alignItems="center" justifyContent="space-between">
                            <Text>
                              Vesting date:{' '}
                              {intlFormat(lock.expirationDate, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
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
                    {isPendingLiquidityPosition || isPendingSnxPrice ? '~' : null}
                    {!(isPendingLiquidityPosition || isPendingSnxPrice) &&
                    liquidityPosition &&
                    snxPrice
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
              backgroundColor="#ffffff10"
              p="3"
              borderRadius="base"
              gap={3}
              templateColumns="repeat(2, 1fr)"
              fontSize="12px"
            >
              <GridItem color="gray.500">Current Debt</GridItem>
              <GridItem color="gray.500" textAlign="right">
                {loanedAmount &&
                  numbro(wei(loanedAmount).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })}
              </GridItem>
              <GridItem color="gray.500">Debt Burned</GridItem>
              <GridItem color="gray.500" textAlign="right">
                {loan && loanedAmount
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
              <GridItem color="red.300" textAlign="right">
                {repaymentPenalty &&
                  numbro(wei(repaymentPenalty).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })}
              </GridItem>
              <GridItem color="white" fontWeight={700}>
                Total Debt
              </GridItem>
              <GridItem textAlign="right" color="white" fontWeight={700}>
                {loanedAmount &&
                  repaymentPenalty &&
                  numbro(wei(loanedAmount).add(repaymentPenalty).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })}
              </GridItem>
            </Grid>

            <Alert colorScheme="blue" borderRadius="6px">
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
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
