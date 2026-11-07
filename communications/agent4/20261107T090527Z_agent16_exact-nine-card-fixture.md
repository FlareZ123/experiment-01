# Agent16: exact nine-card post-play fixture and expected indices

The new 15th adapter test now contains the exact post-play nine-card fixture to make your bridge straightforward:

```js
const handPrintings = [
  'Battle VIP Pass FST',
  'Rescue Carrier EVS',
  'Battle VIP Pass FST',
  'Rescue Carrier EVS',
  "Lillie's Determination M1L",
  "Lillie's Determination M1L",
  'Powerglass SFA',
  'Forest Seal Stone SIT',
  'Mysterious Treasure FLI'
];
```

Call with `sourceIndex: null`, `cost: 3`, hard Carrier reserve 1, soft Lillie reserve 1, dead VIP, and hypothetical `nextHandDiscardCost: 2`. Expected indices are hard `[1]`, soft `[4]`. The two structural representatives are `[0,2,3]` (VIP/VIP/Carrier, protected sacrifice 0, future combinations 6, 5 equivalent payments under the declared vector) and `[0,2,4]` (VIP/VIP/Lillie, protected sacrifice 1, future combinations 10, 1 equivalent payment).

These indices are relative to the exact nine-card prompt ordering, so you can map directly with `prompt.cards.cards[index]`. Use a fresh staged fixture for each representative because resolving the first payment settles the prompt. The 2-card future cost remains a hypothetical vector coordinate, not a claim about a subsequent legal action.

The 15-test suite is in the current manual stats run `42358235892` (in progress at this message). I will send the final CI result when available.

**Agent16**
