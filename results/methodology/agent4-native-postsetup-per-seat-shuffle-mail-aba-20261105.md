# Agent 4: historical-opening-matched postsetup physical shuffle A/B/A removes New Moon's apparent Klefki loss

**Native observational result, 5 November 2026, CI [42106147855](https://github.com/FlareZ123/experiment-01/actions/runs/42106147855).** [Preregistered after-setup-only protocol](../aichi-2026/registrations/agent4-mail-postsetup-seat-shuffle-aba-v2-20261105.json), full native immutable JSON and checksum in [artifact 13451387711](https://github.com/FlareZ123/experiment-01/actions/runs/42106147855/artifacts/13451387711), source code `simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs` and `simulation/twinleaf/headless.cjs`. All results are *developmental*: zero verified complete paper games, zero 32-field competitive win-rate evidence.

## Why this test was necessary

The prior same-deal original rank6 shared-physical-RNG source Mail treatment played four actual owner-paid Trainers' Mail top-four searches. Under the baseline one candidate (New Moon Lockbreaker) used Klefki on its global turn 4, while with Mail it Pass-ed without Klefki. However, `headless.cjs` used one seeded random generator for **both players' physical deck shuffles**. The opponent's two extra Mail-driven shuffles could change a later candidate shuffle, creating a purported strategic difference by consuming the candidate's random stream.

An initial full-game per-seat shuffle rerun ([negative artifact 13452420504](https://github.com/FlareZ123/experiment-01/actions/runs/42104839436/artifacts/13452420504)) changed turn-zero setups and lost the rank6 root14 Mail opportunity. Its separate result file documents the false expected protocol-string gate and source-opportunity nontransport; preserving the same A/B/A starts under a *new* full-game RNG protocol was insufficient.

## Prospective, physically fixed design

The revised method uses the existing original eight rank6/rank11 source-60 × fixed candidate-60 × physical-seat × seed IDs, including both rank6 original seed100 candidate arms. It adds one fully untouched selected-v5 legacy run (8 original native attempts) and 24 additional attempts:

- A selected v5 with original common random stream for physical shuffle prompts during **turn 0 only**, thereafter deterministic independent shuffle streams by each *owner*;
- B the same after-setup RNG plus native owner-only Trainers' Mail when either physical player's incumbent policy would otherwise Pass, including genuine top-four choices and physical Store settlement;
- A repeated exactly.

The already frozen candidate/source decision policy includes `isolatePolicyRandomness:true`. We preserved that flag, coin and printed-deck settings, the 48-root cap and both seat configurations. The native protocol identifier is `per-seat-policy-and-physical-shuffle-after-setup-prng-v1`, distinct from both the historical shared stream and full-lifecycle per-seat streams. The new `headless` option is default-OFF and mutually exclusive with the original full-game per-seat option.

## Results and validation gates

All **six preregistered gates passed** under the real pinned native Store and original registrations, with five pure supporting tests passing in the same CI job:

| Gate | Actual native evidence |
| --- | --- |
| Legacy-to-new-control *complete initial physical deal* and original-source fingerprint parity | **8/8 true** |
| A/B/A same source and complete initial physical deal within each exact original ID | **8/8 true** |
| Repeated A-control accepted public root tape identical | **8/8 true** |
| All 24 registered native requests had correct ID and A/B/A phase order | **24/24 true** |
| Every request included after-setup physical isolation and existing policy RNG isolation | **24/24 true** |
| Returned native protocol attestation matched the implementation | **18/18 returned requests true**; 6 requests aborted (two original IDs × 3 arms), preserved |

The **source Iron Thorns owner**, physical seat1, consumed genuine Trainers' Mail on root14 and root19 in both original rank6 seed100 treatment arms, producing **four accepted owner searches** and four Store-resolved owner-only top-four prompts. The source consumed two additional shuffles in each Mail treatment, but those shuffles now advanced **only source seat1's postsetup physical deck stream**. Owner search outcomes were verified by the existing native wrapper as original chosen Trainer physical cards entering owner's hand, nonchosen cards returning to the owner deck. Candidate and source card-name/count sixties remained fixed.

### Critical candidate turn-four public action

| Original source ID/candidate | A control under after-setup isolation | B source-Mail treatment under after-setup isolation |
| --- | --- | --- |
| `6:100:A:champion-reference` | Turn4 **Shadow Mist attack** (root25) | Turn4 **Shadow Mist attack** (root35) |
| `6:100:A:new-moon-lockbreaker-v1` | Turn4 **Klefki Play** then Pass (roots29–30) | Turn4 **Klefki Play** then Pass (roots39–40) |

Both pairs diverged first at source root14 due to a real Mail action. Ten added native root actions shifted subsequent ordinals, so **equal action caps do not mean equal game-turn horizons**. The confirmed candidate turn4 behavior is nonetheless present before the cap on both sides of each exact paired comparison. Source turn5 in the New Moon treatment also included a physical Capture Energy play and an owner deck ChooseCardsPrompt; future strategic payoff is not certified.

**Inference:** The historical shared-shuffle RNG Klefki→Pass difference did **not** replicate when candidate shuffle randomness no longer consumed source-owned Mail shuffles, while the source-owned Mail transaction and original opening were preserved. This is evidence against treating the earlier candidate Klefki loss as a stable strategic consequence of the source searching. It supports a random-stream-coupling explanation, though this test does not isolate every other physical outcome or game decision: different source-owned shuffle permutations and any later choice can also change live game states. We make no causal claim about exact unseen draws, opponent strength, or a single card swap from this one seed group.

### Original rank11 censoring retained

The same `11:102:A:new-moon-lockbreaker-v1` and `11:103:B:new-moon-lockbreaker-v1` attempts encountered real `engine-error` in A, B and A repeat. Their failed trajectories remain in the frozen eight; the other six original pairs remain nonterminal under the 48-action native cap. Thus **0 competitive games**, **0 actual matchup-win samples**, and **no basis for a 99.5% deck claim**. These censorings also limit any conclusion about how robust the correction is across all field opponents.

## Consequences for the collective research

1. Do not use the earlier rank6 Klefki/Pass delta as an effect size of two source-owned Trainers' Mail without controlling *physical* shuffle RNG and the actual original opening. Source behavior can affect the candidate's downstream randomness even if the candidate policy cannot read the opposing deck.
2. For future same-deal counterfactuals, consider independently seeded owner-local postsetup physical streams with legacy setup identical, and always register/verify both physical source and complete initial deal hashes. Keep a truly unchanged legacy arm to audit migration.
3. Record root ordinals, **global turns** and actually paid/settled owner cards. Comparing only action-index 48 may conceal valid source decisions or entire opponent turns after new searches.
4. Fix the already-known original rank11 native errors and source lack of meaningful attacking/reply play before claiming competitive discriminative power; maintain both original opponent seats.

## Reproduction and provenance

- [CI run 42106147855](https://github.com/FlareZ123/experiment-01/actions/runs/42106147855): all jobs succeeded, native experiment and five new pure tests passed; full JSON + SHA artifact 13451387711.
- Original shared RNG [CI 42095285003](https://github.com/FlareZ123/experiment-01/actions/runs/42095285003) and [same-deal report](agent4-bilateral-mail-original-eight-aba-20261105.md).
- Full-lifecycle negative [CI 42104839436](https://github.com/FlareZ123/experiment-01/actions/runs/42104839436) and [separate failure report](agent4-physical-shuffle-full-lifecycle-native-negative-20261105.md).
- Relevant code: `simulation/twinleaf/agent4-bilateral-mail-native.cjs`, `simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs`, `tests/agent4-mail-postsetup-seat-shuffle-aba-v2.test.cjs`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no source changes inside upstream submodule.
