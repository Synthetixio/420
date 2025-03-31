import { InfoIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, Heading, Image, Text, Tooltip } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { EscrowedSNX } from './EscrowedSNX';
import { LoanChart } from './LoanChart';
import { ModalConfirmUnstake } from './ModalConfirmUnstake';
import { ModalShare420 } from './ModalShare420';
import { PanelAccount } from './PanelAccount';
import clock from './clock.svg';
import share from './share.svg';
import { useAccountUnstakingUnlockDate } from './useAccountUnstakingUnlockDate';
import { useClosePositionPool420 } from './useClosePositionPool420';
import { useCountdown } from './useCountdown';
import { usePosition } from './usePosition';

function Subheader() {
  const [isOpenShare, setIsOpenShare] = React.useState(false);
  return (
    <>
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
      <ModalShare420 isOpenShare={isOpenShare} setIsOpenShare={setIsOpenShare} />
    </>
  );
}

function LeftPanel({ accountId }: { accountId: ethers.BigNumber }) {
  const { data: position, isPending: isPendingPosition } = usePosition({ accountId });
  return (
    <>
      <Heading fontSize="20px" lineHeight="1.75rem" color="gray.50" fontWeight={700}>
        Debt Burned
      </Heading>
      {isPendingPosition ? (
        <Text as="span" color="gray.50" fontSize="1.25em">
          ~
        </Text>
      ) : position ? (
        <Box>
          <Text as="span" color="gray.50" fontSize="1.25em" fontWeight={500}>
            {`🔥 $${numbro(wei(position.burn).toNumber()).format({
              trimMantissa: true,
              thousandSeparated: true,
              average: true,
              mantissa: 2,
              spaceSeparated: false,
            })}`}
          </Text>
          <Text as="span" color="gray.500" fontSize="1.25em">
            {` / $${numbro(wei(position.loan).toNumber()).format({
              trimMantissa: true,
              thousandSeparated: true,
              average: true,
              mantissa: 2,
              spaceSeparated: false,
            })}`}
          </Text>
        </Box>
      ) : null}
      <LoanChart
        loan={position ? wei(position.loan).toNumber() : 100}
        startTime={
          position
            ? Number.parseInt(position.loanStartTime.toString())
            : Math.floor(Date.now() / 1000)
        }
        duration={365 * 24 * 60 * 60}
        pointsCount={50}
      />
    </>
  );
}

function RightPanel({ accountId }: { accountId: ethers.BigNumber }) {
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
            ) : null}
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

export function SectionPool420Position({ accountId }: { accountId: ethers.BigNumber }) {
  return (
    <>
      <Flex
        direction="column"
        flexWrap="wrap"
        p={{ base: 4, sm: 10 }}
        bg="navy.700"
        borderRadius="base"
        gap={6}
      >
        <Subheader />

        <Flex direction={{ base: 'column', lg: 'row' }} flexWrap="wrap" gap={6}>
          <Flex flex="2" direction="column" gap={6} order={{ base: 2, lg: 1 }}>
            <LeftPanel accountId={accountId} />
          </Flex>

          <Flex direction="column" flex="1" overflow="hidden" order={{ base: 1, lg: 2 }}>
            <RightPanel accountId={accountId} />
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
