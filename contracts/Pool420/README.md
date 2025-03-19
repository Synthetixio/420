# Pool420 contract

View methods for frontend

## Running tests

```sh
forge test -vvvvv --watch src test
```

Install `genhtml`:

```sh
brew install lcov
```

Coverage report

```sh
./cov.sh
```

## Deploy Mainnet

```sh
export ETHERSCAN_API_KEY=
export ETHERSCAN_API_URL=https://api.etherscan.io/api

export _root=$(yarn workspace root exec pwd)
export _meta="$_root/node_modules/@synthetixio/v3-contracts/1-main/meta.json"

export _CoreProxy=$(cat $_meta | jq -r '.contracts.CoreProxy')
export _AccountProxy=$(cat $_meta | jq -r '.contracts.AccountProxy')
export _TreasuryMarketProxy=$(cat $_meta | jq -r '.contracts.TreasuryMarketProxy')
export _LegacyMarketProxy=$(cat $_meta | jq -r '.contracts.LegacyMarketProxy')

echo _CoreProxy $_CoreProxy
echo _AccountProxy $_AccountProxy
echo _TreasuryMarketProxy $_TreasuryMarketProxy
echo _LegacyMarketProxy $_LegacyMarketProxy

forge create \
  --broadcast \
  --no-cache \
  --rpc-url https://mainnet.infura.io/v3/$INFURA_API_KEY \
  --chain 1 \
  --private-key $MAINNET_DEPLOYER_PRIVATE_KEY \
  --verifier-url $ETHERSCAN_API_URL \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --verify \
  src/Pool420.sol:Pool420 \
  --constructor-args \
      $_CoreProxy \
      $_AccountProxy \
      $_TreasuryMarketProxy \
      $_LegacyMarketProxy

# Get the readable abi and update importPool420.ts
node ../../readableAbi.js "$(cat ./out/Pool420.sol/Pool420.json | jq -c '.metadata.output.abi')"
```

## Deploy Optimism

```sh
export OPTIMISTIC_ETHERSCAN_API_KEY=
export OPTIMISTIC_ETHERSCAN_API_URL=https://api-optimistic.etherscan.io/api

export _root=$(yarn workspace root exec pwd)
export _meta="$_root/node_modules/@synthetixio/v3-contracts/10-main/meta.json"

export _CoreProxy=$(cat $_meta | jq -r '.contracts.CoreProxy')
export _AccountProxy=$(cat $_meta | jq -r '.contracts.AccountProxy')
export _TreasuryMarketProxy=$(cat $_meta | jq -r '.contracts.TreasuryMarketProxy')
export _LegacyMarketProxy=$(cat $_meta | jq -r '.contracts.LegacyMarketProxy')

echo _CoreProxy $_CoreProxy
echo _AccountProxy $_AccountProxy
echo _TreasuryMarketProxy $_TreasuryMarketProxy
echo _LegacyMarketProxy $_LegacyMarketProxy

forge create \
  --broadcast \
  --no-cache \
  --rpc-url https://optimism-mainnet.infura.io/v3/$INFURA_API_KEY \
  --chain 10 \
  --private-key $MAINNET_DEPLOYER_PRIVATE_KEY \
  --verifier-url $OPTIMISTIC_ETHERSCAN_API_URL \
  --etherscan-api-key $OPTIMISTIC_ETHERSCAN_API_KEY \
  --verify \
  src/Pool420.sol:Pool420 \
  --constructor-args \
      $_CoreProxy \
      $_AccountProxy \
      $_TreasuryMarketProxy \
      $_LegacyMarketProxy

# Get the readable abi and update importPool420.ts
node ../../readableAbi.js "$(cat ./out/Pool420.sol/Pool420.json | jq -c '.metadata.output.abi')"
```

## Deploy Local

```sh
export _root=$(yarn workspace root exec pwd)
export _meta="$_root/node_modules/@synthetixio/v3-contracts/1-main/meta.json"

export _CoreProxy=$(cat $_meta | jq -r '.contracts.CoreProxy')
export _AccountProxy=$(cat $_meta | jq -r '.contracts.AccountProxy')
export _TreasuryMarketProxy=$(cat $_meta | jq -r '.contracts.TreasuryMarketProxy')
export _LegacyMarketProxy=$(cat $_meta | jq -r '.contracts.LegacyMarketProxy')

export TEST_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

forge create \
  --broadcast \
  --no-cache \
  --private-key $TEST_PK \
  src/Pool420.sol:Pool420 \
  --constructor-args \
      $_CoreProxy \
      $_AccountProxy \
      $_TreasuryMarketProxy \
      $_LegacyMarketProxy

# Get the readable abi and update importPool420.ts
node ../../readableAbi.js "$(cat ./out/Pool420.sol/Pool420.json | jq -c '.metadata.output.abi')"
```
