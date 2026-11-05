# Agent 4: full-lifecycle per-seat physical RNG A/B/A does not transport historical rank6 Mail opportunity

**5 November 2026, 20:38 UTC. Native Store developmental evidence, not a competitive game.** Original eight fixed source rank6/rank11 arms, both candidate 60s, physical seat variants, 48 accepted-root limit. [Frozen prospective registration](../aichi-2026/registrations/agent4-bilateral-mail-seat-shuffle-aba-v1-20261105.json), [successful CI execution 42104839436](https://github.com/FlareZ123/experiment-01/actions/runs/42104839436), [native JSON + SHA artifact 13452420504](https://github.com/FlareZ123/experiment-01/actions/runs/42104839436/artifacts/13452420504). The job succeeded in running and archiving the study; the study's own validity gates are distinct from CI pass status.

## Question and observed native outcome

Can a source-independent, real physically paid Trainers' Mail top-four response alter opponent choices when each physical seat receives its own deterministic deck-shuffle randomness? The previously recorded historical shared-stream original rank6 seed100 New Moon A/B/A showed a turn4 candidate Klefki Play in control versus Pass in treatment, but source-owned Mail shuffles could perturb the shared physical RNG stream.

This initial full-lifecycle isolation experiment deliberately set `isolatePhysicalShuffleRandomness:true` on **all 24** A/B/A native requests, preserving original v5 policy isolation and printed 60s. The initial physical deal was identical across A/B/A **within** this new physical-RNG protocol. Every repeated A control public action tape matched its first A. Those two valid matched-design controls do **not** establish parity with historical shared-RNG openings.

[CI logs](https://github.com/FlareZ123/experiment-01/actions/runs/42104839436) report:

| Registered native gate or count | Actual result |
| --- | --- |
| All 24 requests received explicit per-seat physical-shuffle flag | **True** |
| All 24 identities and A/B/A order matched registration | **True** |
| Same full initial physical deals across all new A/B/A comparisons | **True** |
| Repeated A control root tapes equal | **True** |
| Expected native RNG protocol string gate | **False**, due diagnostic registration/code mismatch explained below |
| Source-owned native Mail actions by physical seat | **[2,0]** |
| Prior rank6 6:100:A Mail source-root opportunity recovered | **No**; both rank6 candidate arms showed no A/B root divergence |
| Treatment original eight native dispositions | Four `engine-error` (rank6 seed100 both candidate arms, rank11 seed102 New Moon, rank11 seed103 New Moon); remaining four capped/nonterminal, no qualified completion |
| Paper-qualified matches or demonstrated win rate | **0; none** |

**Protocol reporting bug, not hidden result:** The frozen v5 selected policy's `agent41-crossrank-r6-r11-v1-20261019.json` has `frozenFlags.isolatePolicyRandomness:true`. Under actual headless code, enabling additional physical-shuffle RNG produces protocol `per-seat-policy-and-physical-shuffle-prng-v1`. This study's registration and `allReturnedNativeConfirmsProtocol` checker wrongly expected `per-seat-physical-shuffle-only-prng-v1`. Thus the gate is false on a mismatched string; the native request-level flag, A/A tape parity, and A/B/A initial deal parity remain separate passed observations. No retroactive rewrite of the registered protocol or archived artifact is appropriate.

This differs materially from the historical shared-stream [owner Mail A/B/A](agent4-bilateral-mail-original-eight-aba-20261105.md), which observed four native Mail top-four owner searches on physical seat1, including both original rank6 seed100 arms, and one rank11 engine error. Here source Mail actions migrated to seat0, with four native errors and no observed rank6 Mail contrast. Changing how physical decks are shuffled **during setup** changes the actual opening card identities, the owner action frontier and subsequent game. With absent source Mail intervention in those registered rank6 comparisons, it is impossible to conclude whether the previous Klefki/Pass discrepancy was caused by the old shared RNG stream.

## Improvement, preregistered before the follow-up

The [postsetup experiment registration](../aichi-2026/registrations/agent4-mail-postsetup-seat-shuffle-aba-v2-20261105.json) preserves the historical shared turn-zero setup shuffle randomness, and switches only later per-owner physical deck shuffles to independent deterministic streams. The research adapter `simulation/twinleaf/headless.cjs` now has a separate default-OFF `isolatePhysicalShuffleRandomnessAfterSetup` protocol and mutually-exclusive flag validation, leaving historical default and full-lifecycle-isolation experiments unchanged. The new experiment includes a fourth, unchanged legacy v5 reference of the same eight original seeded physical deals, then new A/B/A native attempts, with explicit **all-eight legacy initial-deal parity**, owner Mail Store acceptance, original failures, and A/A accepted-root equality gates.

Critical limitations remain: the coin flip stream is still shared, the candidate and source can alter later public actions, 48 Store roots do not ensure equal number of turns, and all bots remain development-only. No comparison is valid for 99.5% deck strength or full Top32 paper legality.

## Reproduction

- Preserved original registered identity: `results/aichi-2026/registrations/agent4-bilateral-mail-original-eight-aba-v1-20261105.json`.
- Full-lifecycle control: `simulation/evaluation/agent4-bilateral-mail-seat-shuffle-aba-v1.cjs`; pure test `tests/agent4-bilateral-mail-seat-shuffle-aba.test.cjs`; native archive linked above.
- New after-setup method: `simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs`, pure test `tests/agent4-mail-postsetup-seat-shuffle-aba-v2.test.cjs`.
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream submodule edits.
