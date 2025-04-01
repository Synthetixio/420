import { Box, Heading, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { LoanChart } from './LoanChart';
import { usePosition } from './usePosition';

export function PanelsPool420BurnChart({ accountId }: { accountId: ethers.BigNumber }) {
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
