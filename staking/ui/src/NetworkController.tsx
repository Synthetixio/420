import { Tooltip } from '@_/Tooltip';
import { prettyString, renderAccountId } from '@_/format';
import { WalletIcon } from '@_/icons';
import {
  MAINNET,
  NetworkIcon,
  OPTIMISM,
  UNSUPPORTED_NETWORK,
  useNetwork,
  useWallet,
} from '@_/useBlockchain';
import { makeSearch, useParams } from '@_/useParams';
import { CopyIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { useBalances } from './Staking/useBalances';

const mainnets = [MAINNET, OPTIMISM];

export function NetworkController() {
  const [, setParams] = useParams();

  const [toolTipLabel, setTooltipLabel] = React.useState('Copy');
  const { activeWallet, walletsInfo, connect, disconnect } = useWallet();
  const { network: currentNetwork, setNetwork } = useNetwork();

  const { data: balances, isPending: isPendingBalances } = useBalances();

  const notConnected = !activeWallet;
  const notSupported = activeWallet && !currentNetwork;

  React.useEffect(() => {
    if (window.$magicWallet) {
      connect({ autoSelect: { disableModals: true, label: 'MetaMask' } });
    }
  }, [connect]);

  if (!activeWallet) {
    return (
      <Button
        data-cy="connect wallet button"
        onClick={() => connect()}
        type="button"
        size="sm"
        ml={2}
        py={5}
      >
        Connect Wallet
      </Button>
    );
  }
  return (
    <Flex>
      <Menu>
        <MenuButton
          as={Button}
          variant="outline"
          colorScheme="gray"
          sx={{ '> span': { display: 'flex', alignItems: 'center' } }}
          mr={1}
          px={3}
        >
          <NetworkIcon
            filter={currentNetwork?.isTestnet ? 'grayscale(1)' : ''}
            networkId={
              notConnected ? 8453 : notSupported ? UNSUPPORTED_NETWORK.id : currentNetwork?.id
            }
          />
          <Text variant="nav" ml={2} display={{ base: 'none', md: 'inline-block' }}>
            {notSupported ? UNSUPPORTED_NETWORK.label : currentNetwork?.label}
          </Text>
        </MenuButton>
        <MenuList border="1px" borderColor="gray.900">
          {mainnets.map(({ id, preset, label }) => (
            <MenuItem
              key={`${id}-${preset}`}
              onClick={() => setNetwork(id)}
              isDisabled={window.$chainId ? window.$chainId !== id : false}
            >
              <NetworkIcon networkId={id} size="20px" />
              <Text variant="nav" ml={2}>
                {label}
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          variant="outline"
          colorScheme="gray"
          ml={2}
          height={10}
          py="6px"
          px="9.5px"
          whiteSpace="nowrap"
          data-cy="wallet button"
        >
          <Flex alignItems="center" gap={1}>
            {balances ? (
              <Text
                color="cyan.500"
                fontSize="xs"
                lineHeight="1em"
                px={1}
                py={0.5}
                backgroundColor="whiteAlpha.100"
                borderWidth="1px"
                borderColor="cyan.500"
                borderStyle="solid"
                borderRadius="base"
              >
                {balances.length}
              </Text>
            ) : null}
            <WalletIcon color="white" />
            <Text
              as="span"
              color="white"
              fontWeight={700}
              fontSize="xs"
              userSelect="none"
              data-cy="short wallet address"
            >
              {activeWallet.ens?.name || prettyString(activeWallet.address)}
            </Text>
          </Flex>
        </MenuButton>
        <MenuList>
          <Flex
            border="1px solid"
            rounded="base"
            borderColor="gray.900"
            w="370px"
            _hover={{ bg: 'navy.700' }}
            backgroundColor="navy.700"
            opacity={1}
            p="4"
          >
            <Flex direction="column" w="100%" gap="3">
              <Flex justifyContent="space-between">
                <Text fontSize="14px" color="gray.500">
                  Connected with {walletsInfo?.label}
                </Text>
                <Button
                  onClick={() => {
                    if (walletsInfo) {
                      disconnect(walletsInfo);
                    }
                  }}
                  size="xs"
                  variant="outline"
                  colorScheme="gray"
                  color="white"
                >
                  Disconnect
                </Button>
              </Flex>
              <Flex
                fontWeight={700}
                color="white"
                fontSize="16px"
                alignItems="center"
                rounded="base"
                backgroundColor="whiteAlpha.50"
                p={3}
                justifyContent="center"
              >
                <Tooltip label={activeWallet.address} fontFamily="monospace" fontSize="0.9em">
                  <Text>{prettyString(activeWallet.address)}</Text>
                </Tooltip>
                <Tooltip label={toolTipLabel} closeOnClick={false}>
                  <CopyIcon
                    ml="2"
                    onClick={() => {
                      navigator.clipboard.writeText(activeWallet.address);
                      setTooltipLabel('Copied');
                      setTimeout(() => {
                        setTooltipLabel('Copy');
                      }, 10000);
                    }}
                  />
                </Tooltip>
              </Flex>
              <Flex direction="column" backgroundColor="whiteAlpha.50" rounded="base" gap={3} p={3}>
                <Flex w="100%" justifyContent="space-between">
                  <Flex gap={2} alignItems="center">
                    {isPendingBalances ? (
                      <Text fontSize="sm" color="grey.500">
                        Accounts loading...
                      </Text>
                    ) : balances && balances.length === 1 ? (
                      <Text fontSize="sm" color="grey.500">
                        Account
                      </Text>
                    ) : balances ? (
                      <>
                        <Text fontSize="sm" color="grey.500">
                          Accounts
                        </Text>
                        <Text
                          color="cyan.500"
                          fontSize="xs"
                          lineHeight="1em"
                          px={1}
                          py={0.5}
                          backgroundColor="whiteAlpha.100"
                          borderWidth="1px"
                          borderColor="cyan.500"
                          borderStyle="solid"
                          borderRadius="base"
                        >
                          {balances.length}
                        </Text>
                      </>
                    ) : null}
                  </Flex>
                  <Link
                    href={`?${makeSearch({ page: 'settings' })}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setParams({ page: 'settings' });
                    }}
                  >
                    <IconButton
                      variant="outline"
                      colorScheme="gray"
                      size="xs"
                      icon={<SettingsIcon />}
                      aria-label="account settings"
                    />
                  </Link>
                </Flex>
                <Flex data-cy="accounts list" direction="column" gap={3}>
                  {isPendingBalances ? (
                    <Text
                      display="flex"
                      alignItems="center"
                      color="grey.500"
                      fontWeight={700}
                      fontSize="16px"
                      cursor="pointer"
                    >
                      ~
                    </Text>
                  ) : balances && !balances.length ? (
                    <Text
                      display="flex"
                      alignItems="center"
                      color="grey.500"
                      fontWeight={700}
                      fontSize="16px"
                      cursor="pointer"
                    >
                      No accounts
                    </Text>
                  ) : (
                    balances?.map(({ accountId, collateralDeposited }) => (
                      <Flex
                        key={accountId.toString()}
                        alignItems="center"
                        cursor="pointer"
                        data-cy="account id"
                        data-account-id={accountId}
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Text color="grey.50" fontWeight={700} fontSize="md">
                          {renderAccountId(accountId)}
                        </Text>
                        <Text color="grey.500" fontSize="sm">{`${numbro(
                          wei(collateralDeposited).toNumber()
                        ).format({
                          trimMantissa: true,
                          thousandSeparated: true,
                          average: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })} SNX`}</Text>
                      </Flex>
                    ))
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
