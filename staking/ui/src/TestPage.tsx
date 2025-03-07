import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { ModalShare420 } from './Staking/ModalShare420';
import { TvlChart } from './Staking/TvlChart';
import { useTvl420 } from './Staking/useTvl420';

export function TestPage() {
  const { data: tvl420 } = useTvl420({ networkName: 'cross', span: 'daily' });
  const [isOpenShare, setIsOpenShare] = React.useState(false);
  return (
    <>
      <Helmet>
        <title>Synthetix 420 Pool</title>
        <meta name="description" content="Synthetix 420 Pool" />
      </Helmet>
      <Flex pt={8} direction="column" mb={16} width="100%">
        <Flex direction="column" gap={3}>
          <Heading color="gray.50" maxWidth="40rem" fontSize={['2rem', '3rem']} lineHeight="120%">
            Deposit
          </Heading>

          <Flex justifyContent="space-between" alignItems="center" gap={6} flexWrap="wrap">
            <Text color="gray.500" fontSize="1rem" lineHeight={6}>
              Deposit into the 420 Pool to start earning yield
            </Text>
            <Button onClick={() => setIsOpenShare(true)}>Share</Button>
          </Flex>
        </Flex>
        <Flex
          direction="column"
          mt={6}
          borderColor="gray.900"
          borderWidth="1px"
          borderRadius="6px"
          bg="navy.700"
          p={6}
        >
          <TvlChart data={tvl420} />
        </Flex>
      </Flex>

      <ModalShare420 isOpenShare={isOpenShare} setIsOpenShare={setIsOpenShare} />
    </>
  );
}
