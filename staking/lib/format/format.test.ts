import { renderWalletAddress } from './';

describe('renderWalletAddress', () => {
  it('should create a pretty string', () => {
    const text = 'Hello, World!';
    expect(renderWalletAddress(text)).toBe('Hello,...rld!');
  });

  it('should create a pretty string with custom start and end lengths', () => {
    const text = 'This is a longer text';
    expect(renderWalletAddress(text, 5, 6)).toBe('This ...r text');
  });

  it('should handle short strings', () => {
    const text = 'Short';
    expect(renderWalletAddress(text)).toBe('Short');
  });
});
