import { SrsService } from './srs.service';

/**
 * The interleave method is private but exposed via brackets here so we can
 * verify the round-robin spread that drives the "due + new" queue ordering.
 */
function interleave<T>(a: T[], b: T[]): T[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (SrsService.prototype as any)['interleave'].call({}, a, b);
}

describe('SrsService.interleave', () => {
  it('alternates due and new words round-robin', () => {
    expect(interleave(['d1', 'd2', 'd3'], ['n1', 'n2'])).toEqual([
      'd1',
      'n1',
      'd2',
      'n2',
      'd3',
    ]);
  });

  it('appends the longer list when the other runs out', () => {
    expect(interleave(['d1'], ['n1', 'n2', 'n3'])).toEqual(['d1', 'n1', 'n2', 'n3']);
  });

  it('returns an empty list when both inputs are empty', () => {
    expect(interleave([], [])).toEqual([]);
  });
});
