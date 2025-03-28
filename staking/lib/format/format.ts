import type { ethers } from 'ethers';

export const renderWalletAddress = (text: string, startLength = 6, endLength = 4) => {
  if (text.length <= startLength + endLength) {
    return text;
  }
  return `${text.substring(0, startLength)}...${text.substring(text.length - endLength)}`;
};

export function renderAccountId(accountId?: ethers.BigNumber) {
  if (!accountId) {
    return '---';
  }
  const hex = accountId.toHexString();
  // auto-generated 0x80000000000000000000000000000008 value
  if (hex.length === 34) {
    return `${hex.slice(0, 5)}...${hex.slice(-6)}`;
  }
  return `#${accountId}`;
}
