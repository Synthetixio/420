# Synthetix Liquidity UI

This repo uses Yarn workspaces to manage multiple packages in the same repo. To prepare the repository for use, run:

```sh
yarn install
```

This will install all dependencies, wire dependencies between packages in this repo, and allow for you to build projects.

Periodically we need to upgrade contacts:

```sh
yarn upgrade-contracts
yarn dedupe
```

and browserlists:

```sh
yarn upgrade-browsers
yarn dedupe
```

## Testing and local dev requirements

1. Install `foundry`

```sh
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Have `INFURA_KEY` env variable set

## Testing with Cypress

1.  Run Liquidity app locally

    ```sh
    yarn start
    ```

2.  Open Cypress to debug

    ```sh
    yarn e2e
    ```

3.  To run all the tests for all chains
    ```sh
    yarn e2e:run
    ```

## Local development with fork and Magic Wallet

All RPC calls in this mode will be made to `127.0.0.1:8585`
and all transactions will be automatically signed, without any popups

1.  Run Foundry Anvil fork

    ```sh
    # Mainnets
    anvil --auto-impersonate --chain-id 1 --fork-url https://mainnet.infura.io/v3/$INFURA_KEY --fork-block-number 22079028
    ```

2.  Run Liquidity app locally

    ```sh
    yarn start
    ```

3.  Open app in browser

    ```sh
    open http://localhost:3000
    ```

4.  Open devtools and set `localStorage` values

    ```js
    localStorage.DEBUG = 'true';
    localStorage.debug = 'snx:*';
    localStorage.MAGIC_WALLET = '0xWalletAddress';
    ```

5.  Reload page and proceed with connecting your wallet through UI choosing "Metamask" in popup
    (the only option)

6.  If wallet needs some ETH balance you can use foundry's `cast` to set balance

    ```sh
    cast rpc anvil_setBalance 0xWalletAddress 10000000000000000000

    # check your balance
    cast balance 0xWalletAddress -e
    ```

## Testing with a test wallet

```sh
anvil --auto-impersonate --chain-id 1 --fork-url $RPC_MAINNET --no-rate-limit
```

Enable debugging and set magic wallet to `0xc3Cf311e04c1f8C74eCF6a795Ae760dc6312F345`

```js
localStorage.DEBUG = 'true';
localStorage.debug = 'snx:*';
localStorage.MAGIC_WALLET = '0xc3Cf311e04c1f8C74eCF6a795Ae760dc6312F345';
```

Fund the account with `ETH`, `sUSD` and `snxUSD`

```sh
cast rpc anvil_setCode 0x1234123412341234123412341234123412341234 $(cast from-utf8 FORK)

export walletAddress=0xc3Cf311e04c1f8C74eCF6a795Ae760dc6312F345
cast rpc anvil_setBalance $walletAddress $(cast to-unit 1ether)

export curve=0x4b5E827F4C0a1042272a11857a355dA1F4Ceebae
cast rpc anvil_setBalance $curve $(cast to-unit 1ether)

export transfer='function transfer(address to, uint256 value) returns (bool)'
export balanceOf='function balanceOf(address account) view returns (uint256)'

export sUSD=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51
cast send --unlocked --from $curve $sUSD $transfer $walletAddress 50000ether
cast call $sUSD $balanceOf $walletAddress

export CoreProxy="0xffffffaEff0B96Ea8e4f94b2253f31abdD875847"
cast rpc anvil_setBalance $CoreProxy $(cast to-unit 1ether)

export snxUSD="0xb2F30A7C980f052f02563fb518dcc39e6bf38175"
cast send --unlocked --from $CoreProxy $snxUSD $transfer $walletAddress 1000ether
cast call $snxUSD $balanceOf $walletAddress
```

Optimism
```sh
export walletAddress=0xc3Cf311e04c1f8C74eCF6a795Ae760dc6312F345
cast rpc anvil_setBalance $walletAddress $(cast to-unit 1ether)

export whale=0x6d80113e533a2c0fe82eabd35f1875dcea89ea97
cast rpc anvil_setBalance $whale $(cast to-unit 1ether)

export transfer='function transfer(address to, uint256 value) returns (bool)'
export balanceOf='function balanceOf(address account) view returns (uint256)'

export sUSD=0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9
cast send --unlocked --from $whale $sUSD $transfer $walletAddress 50000ether
cast call $sUSD $balanceOf $walletAddress
```
