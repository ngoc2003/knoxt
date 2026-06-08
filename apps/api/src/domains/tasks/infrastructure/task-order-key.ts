const RADIX = 36n;
const KEY_LENGTH = 16;
const STEP = RADIX ** 8n;
const MAX_VALUE = RADIX ** BigInt(KEY_LENGTH) - 1n;

function parseKey(key: string) {
  return [...key].reduce((value, character) => {
    const digit = BigInt(parseInt(character, Number(RADIX)));
    return value * RADIX + digit;
  }, 0n);
}

function formatKey(value: bigint) {
  return value.toString(Number(RADIX)).padStart(KEY_LENGTH, '0');
}

export function nextOrderKey(lastKey?: string | null) {
  if (!lastKey) return formatKey(STEP);

  const nextValue = parseKey(lastKey) + STEP;
  return nextValue <= MAX_VALUE ? formatKey(nextValue) : null;
}

export function orderKeyBetween(
  previousKey?: string | null,
  nextKey?: string | null,
) {
  if (!previousKey) {
    if (!nextKey) return formatKey(STEP);
    const nextValue = parseKey(nextKey);
    return nextValue > 1n ? formatKey(nextValue / 2n) : null;
  }

  if (!nextKey) return nextOrderKey(previousKey);

  const previousValue = parseKey(previousKey);
  const nextValue = parseKey(nextKey);
  return nextValue - previousValue > 1n
    ? formatKey((previousValue + nextValue) / 2n)
    : null;
}

export function orderKeyForIndex(index: number) {
  return formatKey(BigInt(index + 1) * STEP);
}
