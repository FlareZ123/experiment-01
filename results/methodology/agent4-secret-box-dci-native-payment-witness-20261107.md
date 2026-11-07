# Agent4: native Secret Box DCI payment prompt witness

**7 November 2026 | Agent4**

## Question

Can Agent21's owner-visible discard-cost selector choose a paper-valid three-card Secret Box payment from a genuine pinned Twinleaf Store prompt, in both physical seats, while preserving the physical cards the heuristic intends to keep?

This is a staged Store mechanics test. It does not run a complete game or establish that the selected payment is strategically optimal.

## Implementation

Added:

- `simulation/twinleaf/agent4-secret-box-dci-payment-native.cjs`
- `tests/agent4-secret-box-dci-payment-native.test.cjs`

The probe reuses the actual staged Store fixture from `agent4-rank31-alakazam-movesource-native.cjs`, creates the Store inside the reversible Agent4 paper-payment guard, stages the root93-shaped ten-card hand, and adds an owner-visible Unown AOR plus two Psychic Energy MEE to the discard. It sets the staged state to turn 14 with the Supporter allowance unused.

The ten-card hand is:

- Battle VIP Pass FST ×2
- Rescue Carrier EVS ×2
- Secret Box TWM ×1
- Lillie's Determination M1L ×2
- Powerglass SFA ×1
- Forest Seal Stone SIT ×1
- Mysterious Treasure FLI ×1

The probe plays the physical Secret Box, locates the live `ChooseCardsPrompt`, calls Agent21's `chooseSecretBoxPaymentByDci(prompt, owner, state)`, checks the real native validator, then dispatches the selected physical objects through Store. The Agent4 mandatory-three-card guard remains installed for the complete probe.

## Pinned execution

- Repository: `FlareZ123/experiment-01`
- Submodule path: `vendor/twinleaf`
- Submodule remote: `https://github.com/twinleafgg/twinleafgg.git`
- Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Runtime: Node.js `20.19.0`
- Isolated successful CI: [42357190204](https://github.com/FlareZ123/experiment-01/actions/runs/42357190204)
- Combined smoke CI: [42356946150](https://github.com/FlareZ123/experiment-01/actions/runs/42356946150)

The existing manual-only Agent4 workflow now exposes `secretbox_dci_only`, which compiles the pinned submodule and runs only this native DCI test. No per-commit workflow was added.

## Result

**Both physical seats passed.** The genuine native prompt had source `Secret Box TWM`, message `CHOOSE_CARD_TO_DISCARD`, min/max 3, and nine offered physical owner-hand cards.

Agent21's selector chose:

| Physical printing | DCI cost |
| --- | ---: |
| Battle VIP Pass FST | 0 |
| Battle VIP Pass FST | 0 |
| Lillie's Determination M1L | 4 |
| **Total** | **4** |

For each seat:

- native `prompt.validate(selection, state)` returned true;
- native Store accepted the payment with no error;
- all three selected physical objects left the hand and entered the discard;
- two Battle VIP Pass and one Lillie's Determination were discarded;
- both Rescue Carrier copies and one Lillie's Determination remained in hand;
- Powerglass SFA, Forest Seal Stone SIT and Mysterious Treasure FLI remained in hand;
- the genuine Secret Box owner-deck search prompt was pending after payment;
- the Agent4 guard recorded one inspected Secret Box root, one inspected payment, zero root vetoes and zero payment vetoes.

The staged public discard contained Unown AOR (60 HP) and two Psychic Energy MEE. Under the current heuristic, Rescue Carrier scored 9 (8 base, minus 2 for a duplicate, plus 3 for a recovery target) and Powerglass scored 12 (10 base plus 2 for Basic Psychic Energy in the discard). The output explicitly retained `qualifiedGame:false`; the Agent4 guard's `qualifiedGames` count remained zero.

## CI failure context

The first combined run, 42356946150, compiled Twinleaf and ran 59 tests. The new DCI test was subtest 59 and passed for both seats. The command ended with 58 passes and one unrelated existing failure:

- `tests/agent4-owner-modal-acknowledgements-native.test.cjs`
- physical source seat 1
- assertion: `assert.ok(modal)` at line 83

The isolated manual run 42357190204 then compiled the same pinned revision, syntax-checked the new probe, ran the DCI test alone, and completed successfully. The combined-suite failure is preserved rather than hidden or attributed to the DCI code.

## Limits and follow-up

1. **No full game:** the test stops after Secret Box payment. It does not resolve the four-category search, play Lillie's Determination, observe the eight-card draw, use Fog Crystal, attach Energy, attack, or observe the source's next response.
2. **No same-deal A/B:** the test stages a Store fixture using the root93-shaped hand. It does not reproduce the original physical source deal or compare VIP/VIP/Carrier against VIP/VIP/Lillie through a full native continuation.
3. **Heuristic, not optimality:** the DCI values are ordinal human-authored weights. The observed score of 4 does not measure card value or expected win rate.
4. **Set-level duplicate discount:** the current DCI scorer discounts each selected card from the original hand multiplicity. If a payment discards every copy of a printing, each selected copy can still receive a duplicate discount as if another copy remained. Agent21 has been notified with a three-Lillie counterexample; Agent16 independently raised the same modeling caveat. The exact root93 VIP/VIP/Lillie choice is unaffected by this example because one Lillie remains and the spent VIP base cost is already zero.
5. **Printing correction:** Agent49 identified `Ace Trainer XY7` in the DCI cost table as the wrong native fullName; the repository uses `Ace Trainer AOR`. This does not affect the tested payment because Ace Trainer is not in the staged hand.
6. **Turn boundary:** `state.turn > 2` marks VIP Pass as spent. This is harmless for the turn-14 staged test, but the physical-seat first-turn boundary should be verified before using the model for early-game payments.

Agent21 and Agent16 received the native witness and the relevant limitations through their mailboxes. The next useful experiment is a separately registered same-deal A/B that compares the current VIP/VIP/Carrier treatment with the VIP/VIP/Lillie treatment, records the actual Lillie draw and all subsequent source actions, and preserves the distinct v5/v1 ledger boundaries. Agent43's frozen v1 receipt must not be overwritten.

**Benchmark status is unchanged:** 29/32 original Aichi opponent inventories authenticated, zero competitively qualified games, no selected final fixed 60, and no demonstrated 99.5% win rate.


## Physical-copy tie-break cross-check

The DCI probe now records the exact native prompt indices and physical IDs. Isolated run [42358684385](https://github.com/FlareZ123/experiment-01/actions/runs/42358684385) passed the added assertions in both physical seats:

- selected prompt indices: `[0, 2, 4]`;
- selected physical IDs: `[80030, 80033, 80035]`;
- the selected Lillie is the first Lillie's Determination object in the staged hand.

Agent44's existing `agent44-root93-secretbox-paid-store-retro.cjs` instead pays `supporters[1]`, which is physical id80036, leaving id80035. Agent21's DCI tie-break pays id80035 and leaves id80036. Both paths leave one Lillie printing, so no gameplay difference has been demonstrated. The distinction is relevant only to the current physical-copy reserve marker: Agent16's adapter marks id80035 as soft-protected, so the DCI selection appears to spend that marker.

This reinforces the identity-invariance caveat in the companion report `agent4-secret-box-copy-reserve-native-prompt-bridge-20261107.md`. The DCI selector's first-copy tie-break and Agent44's second-copy tie-break should not be treated as different strategic outcomes while the remaining printing counts are identical.
