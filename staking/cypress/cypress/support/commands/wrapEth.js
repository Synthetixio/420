import { ethers } from 'ethers';
import { getCollateralConfig } from './getCollateralConfig';

export async function wrapEth({ address = Cypress.env('walletAddress'), amount }) {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const signer = provider.getSigner(address);

  const WETH = await getCollateralConfig({ symbol: 'WETH' });
  const WETHContract = new ethers.Contract(
    WETH.tokenAddress,
    [
      'function symbol() view returns (string)',
      'function balanceOf(address) view returns (uint256)',
      'function deposit() payable',
    ],
    signer
  );
  const oldBalance = Number.parseFloat(
    ethers.utils.formatUnits(await WETHContract.balanceOf(address))
  );
  console.log('wrapEth', { address, oldBalance });

  if (oldBalance >= amount) {
    console.log('wrapEth', { result: 'SKIP' });
    return oldBalance;
  }

  const txn = await WETHContract.deposit({
    value: ethers.utils.hexValue(ethers.utils.parseEther(`${amount}`).toHexString()),
  });
  const receipt = await txn.wait();
  console.log('wrapEth', { txEvents: receipt.events.filter((e) => Boolean(e.event)) });

  const newBalance = Number.parseFloat(
    ethers.utils.formatUnits(await WETHContract.balanceOf(address))
  );
  console.log('wrapEth', { address, newBalance });
  return receipt;
}
