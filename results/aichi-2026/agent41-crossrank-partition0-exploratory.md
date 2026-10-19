# Agent 41: frozen cross-archetype paired-policy screen, partition 0

**19 October 2026. Evidence class: preregistered pinned-Twinleaf exploratory owner-policy / Store-action diagnostic. It contains zero competitively qualified games and cannot rank the two 60-card candidates by win probability.**

## Preregistration, scope, exact replay

- [Frozen pre-outcome registration](registrations/agent41-crossrank-r6-r11-v1-20261019.json) commit `70b83b9ad0ae98d6daae6ae4ced1856f70beb913`.
- Actual compiled [manual CI run 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824) succeeded on research head `16ed358b5f0324dba10762e67f9bf286c833af49`. Its [complete partition-0 machine-readable artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824/artifacts/12161805529) is named `aichi-rank6-expanded-action-fidelity-probe-v1-decisions`, ZIP SHA-256 `59f79ff8be5fe50b19ad701614c7051b21183563f492a16d87c8b1a72aeba627`. The artifact contains `agent41-crossrank-observed.json`. Full JSON is retained in CI; this report reproduces only CI-printed aggregate fields and the first exact engine rejection.
- [Runner](../../simulation/evaluation/agent41-crossrank-actual-decisions.cjs) and [three specific pre-run regression tests](../../tests/agent41-crossrank-actual-decisions.test.cjs) passed, as did the existing 100 shared workflow tests. Frozen engine submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Exact published Aichi **rank 6 Iron Thorns** and **rank 11 Absol/Garbodor** opponent 60s, each against the unchanged **rank 1 Shadow Rider** reference 60 and unchanged **New Moon v1 English-mechanics proxy** 60. Each rank gets three preregistered v3 seed repeats and both candidate engine slots. This partition is 24 executed candidate-versus-opponent arms representing **12 rank/repeat/physical-slot seed streams**. Each stream is run under two different candidate rosters, so the 24 are not 24 independent random draws.
- All arms used max **260** root Store actions, strict prompt validation, separate policy randomness and the registration's fixed correction flags. Candidate source composition, resolved engine decks and seed are validated inside the runner, with real first player obtained from the engine draw log.
- Rank 6 source chooses a restricted `Tag Call → Guzma & Hala → Double Colorless Energy + Thunder Mountain → Volt Cyclone` opener with K0 visible hand / actual search prompts, protecting five high-impact Supporter name groups from discard payments, on global turn 2 if source goes second or global turn 3 if source goes first. Rank 11 source may choose a first-own-turn direct `Boost Shake → equipped Garbodor` line, owner-hand and public-board gated. All later decisions defer to a weak generic bot. The New Moon candidate receives an owner-visible first-response Field Blower / conditional low-hand Lillie tactic only for rank 11. These are asymmetric, limited *policy bundles* fixed before outcomes, not uniformly certified expert opponents.

## Compiled aggregate as printed by successful CI

| Outcome or mechanic | Observed |
| --- | ---: |
| Registered arms in partition 0 | **24** |
| Arms actually recorded | **24** |
| Engine terminal reached before cap | **13** |
| Action-capped or other incomplete | **10** |
| Store dispatch exception | **1** |
| Rank-6 source opportunity detected | **3 arms** |
| Rank-11 source opportunity detected | **1 arm** |
| Source was actual first player | **15 arms** |
| Real Store attack declarations, source | **121** |
| Real Store attack declarations, candidate | **49** |
| Candidate pair strata with identical first recorded source-hand and actual starter | **11/12** |
| Competitively qualified games | **0** |

The source-opportunity counters measure **detected attempted opportunities**, not necessarily executed or sustained attacks and not unique independent source deals. Complete declarations are observed in the Store's actual attack log, which is stronger than root-action count alone, but a declaration count does not certify damage, correct gameplay or tournament policy strength.

The single preserved unqualified exception occurred for frozen arm `6:2:A:champion-reference`: pinned Twinleaf rejected a `PlayCardAction` after 33 actions with `BLOCKED_BY_EFFECT`. This demonstrates a proposed move disallowed under a live effect and therefore an inadequately guarded automated decision somewhere in that replay. Without a full state forensic reproduction, do **not** assert which Pokémon or lock caused it or treat it as a loss.

**Pairing caveat:** For 11 of 12 same-seed, same-physical-slot candidate strata, the *first recorded owner-visible source hand* and true starting position agreed. That does not certify the opponent's full hidden Prize, deck order or subsequent decision path matched. The twelfth pair fails even the observed-hand gate and must remain separate. Candidate-policy differences are predeclared but prevent attributing any outcome solely to inventory strength.

## Selection gate and next evidence

The first partition demonstrates that the proposed two-archetype protocol can execute a bounded number of genuine source-dealt games, including a small number of signature opening opportunities, and that real attacks are observable. It simultaneously exposes three disqualifiers to a candidate-strength decision:

1. 11 of 24 arms did not produce an acceptable terminal (10 cap/incomplete and one rejected illegal move).
2. Both source special policies are narrow, and only **3 rank-6** and **1 rank-11** arm triggered a special opportunity. Actual opportunity completion and opponent response still require artifact-level review before any adversarial success claim.
3. Source-hidden-state pairing is not proved, and the challenger print equivalence and human policy are not certified. A post-registration arm cannot be silently omitted, treated as a defeat, or re-seeded.

**Neither frozen candidate is promoted.** Observed raw terminal counts are *not* candidate wins and are not an evidence basis for a 99.5% target or a field-level win-rate estimate. Partition 1 repeats 3–5 remains preregistered and **has not been run**; its GitHub workflow dispatch attempt was blocked by host safety checks. Do not mark those 24 arms as executed. Before spending substantially more CI compute, an owner-information constrained complete-game decision policy and a faithful rejected-action recovery should be validated across both hard archetypes, and the artifact's four source-line opportunities should be checked for actual attacks, Tool presence and next-turn effects.

Full event coverage remains **29 of 32** exact published opponent lists; ranks **23, 25 and 28** remain unresolved. This result does not change the benchmark's **zero qualified competitive-game** status.
