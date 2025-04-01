export function stringToHash(s: string | undefined) {
  return (s || '').split('').reduce((a, b) => {
    const newA = (a << 5) - a + b.charCodeAt(0);
    return newA & newA;
  }, 0);
}
