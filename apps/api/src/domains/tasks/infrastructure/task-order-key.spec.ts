import {
  nextOrderKey,
  orderKeyBetween,
  orderKeyForIndex,
} from './task-order-key';

describe('task order keys', () => {
  it('generates keys that sort between their neighbors', () => {
    const first = orderKeyForIndex(0);
    const second = orderKeyForIndex(1);
    const middle = orderKeyBetween(first, second);

    expect(middle).not.toBeNull();
    expect(first < middle!).toBe(true);
    expect(middle! < second).toBe(true);
  });

  it('generates a key after the last task', () => {
    const last = orderKeyForIndex(10);
    const next = nextOrderKey(last);

    expect(next).not.toBeNull();
    expect(last < next!).toBe(true);
  });

  it('returns null when adjacent keys need rebalancing', () => {
    expect(orderKeyBetween('0000000000000001', '0000000000000002')).toBeNull();
  });
});
