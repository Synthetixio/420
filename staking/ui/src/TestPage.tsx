import { Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { PoolStats } from './Staking/PoolStats';
import { TvlChart } from './Staking/TvlChart';

export function TestPage() {
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

            <PoolStats />
          </Flex>
        </Flex>
        <Flex direction="column" mt={6} gap={6}>
          <Flex
            direction="column"
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            bg="navy.700"
            p={6}
            gap={9}
          >
            <Flex
              direction={{ base: 'column', sm: 'row', lg: 'row', xl: 'row' }}
              flexWrap="wrap"
              gap={4}
            >
              <Flex
                order={{ base: 2, sm: 1, lg: 1, xl: 1 }}
                flex={{ base: 1, sm: 2, lg: 2, xl: 2 }}
                width="100%"
                borderColor="gray.900"
                borderWidth="1px"
                borderRadius="6px"
                bg="navy.900"
                direction="column"
                p={3}
                gap={3}
              >
                <Flex minWidth="120px" direction="column" p={3} gap={3}>
                  <Heading fontSize="20px" lineHeight="1.75rem" color="gray.50" fontWeight={700}>
                    TVL
                  </Heading>
                </Flex>
                <TvlChart />
              </Flex>
              <Flex
                order={{ base: 1, sm: 1, lg: 1, xl: 1 }}
                flex={{ base: 1, sm: 1, lg: 1, xl: 1 }}
                width="100%"
                direction="column"
                borderColor="gray.900"
                borderWidth="1px"
                borderRadius="6px"
                p={6}
                gap={6}
                justifyContent="space-between"
              >
                <Flex minWidth="120px" direction="column" gap={3} textAlign="center"></Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
