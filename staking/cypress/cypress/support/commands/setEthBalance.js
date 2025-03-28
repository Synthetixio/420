import { ethers } from 'ethers';

export async function setEthBalance({ address = Cypress.env('walletAddress'), balance }) {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const oldBalance = Number.parseFloat(
    ethers.utils.formatUnits(await provider.getBalance(address))
  );
  console.log('setEthBalance', { address, oldBalance });

  await provider.send('anvil_setBalance', [
    address,
    ethers.utils.parseEther(`${balance}`).toHexString(),
  ]);
  const newBalance = Number.parseFloat(
    ethers.utils.formatUnits(await provider.getBalance(address))
  );
  console.log('setEthBalance', { address, newBalance });
  return newBalance;
}
