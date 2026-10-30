# Agent26: isolated per-seat setup shuffle streams remove frozen rank6 same-seed source mismatch

**30 October 2026 | Evidence: original pinned Twinleaf Store, 2 complete setup-only captures with a deliberately alternate shuffle randomization protocol.** This is a diagnostic intervention, not an original archived trial, game result, paper-legal deck conclusion or estimated win rate.

## Experiment and provenance

The [original rank6 mismatched same-seed source report](agent26-frozen-rank6-mulligan-causal-replay-20261030.md) showed that source Iron Thorns had different complete initial physical setups against champion-reference vs New Moon in frozen original pair `6:3:B`, seed `861838028`, even though source seat0 and its entire 60 were fixed. In original shared-RNG games, champion's one extra candidate mulligan inserted 59 random outputs before the source final shuffle, resulting in a different source hand/deck/Prize/Bench state.

We deliberately changed the **shuffle coupling only** for a separate counterfactual: `simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs` installs a transient research-owned native Store dispatch hook so each physical player's setup `ShuffleDeckPrompt` receives a deterministic stream derived from its own seed salt. The existing headless runner still issues an ordinary root action, but the actual native Store `ResolvePromptAction` carries the per-seat Fisher-Yates permutation. This does not modify vendor Twinleaf and restores the Store dispatch method in a `finally` block. Coin/random effects still follow the common original seeded engine stream and the setup still resolves its real native mulligan prompts, optional bonuses, original cards, and actual first-draw turn evidence.

The bounded [two-arm original-source counterfactual runner](../../simulation/evaluation/agent26-frozen-mismatch-seat-coupled-setup.cjs) reused the preregistered exact opponent/candidate 60s, engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, physical seats and seed for this specific pair. It stopped after the first settled normal turn and played **zero match decisions**.

[Existing manually dispatched source-deal workflow **40996581985**, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40996581985), revision `4c8e6601736579eeae20f707ab177561fb4dfacb`. Native raw [artifact 12951931332](https://github.com/FlareZ123/experiment-01/actions/runs/40996581985/artifacts/12951931332), ZIP SHA256 `7898beadc8cc498df8b711b40585cf425f2592a47e934b8e174d62f5f73ed8c1`, embedded JSON SHA256 `67c4a1893143dc8de1ecc208ea3fd24b5b8c8ccff1326895be48c3d9f527fc52`.

## Two original printed sixties, alternate causal protocol

| Actual setup-only result | Champion reference | New Moon |
| --- | --- | --- |
| Source seat | 0 | 0 |
| Candidate seat | 1 | 1 |
| Verified first-turn player | Source seat0 | Source seat0 |
| Source mulligans under alternate streams | **1** | **1** |
| Candidate mulligans under alternate streams | **0** | **0** |
| Source setup Active | Iron Thorns ex TWM | Iron Thorns ex TWM |
| Source setup Bench | **1 Iron Thorns ex TWM** | **1 Iron Thorns ex TWM** |
| Source complete physical-deal fingerprint | `62911297d9eb03df7216a2846eb02707d9b93eba249435b497d8a98032e14951` | **same exact digest** |
| Source first/second shuffle permutation SHA256 | `3be4636e...`, `6ada1266...` | **both exactly the same** |

The observed source initial deck, hand, Prizes, Active and Bench are **identical across the two unchanged candidate inventories in this alternative protocol**. Both native setups conserved exactly 60 source and candidate copies and verified their first-turn source player from the real draw log. No native error occurred.

**Scope limitation:** The alternate stream also changed the source's and candidate's actual mulligan counts relative to the original shared-RNG trial (source originally had 2, candidate had 1 or 0). Thus this is an independent newly defined randomization protocol, **not** a same-world deterministic intervention that holds every original deck position unchanged. Its causal contrast is between two shuffle-scheduling protocols with the same external integer seed. A single seed with matched physical source setups does not prove all prospective seed pairs will match, especially when candidate mulligan-induced opponent bonus cards may still differ.

This diagnostic illustrates a concrete experimental design option for reducing unintended cross-actor PRNG entanglement while retaining genuine rules consequences. For unconditional fixed-candidate deck-strength comparisons, **retain every original and future arm**, including differing source physical deals. Per-seat stream changes require a completely new prospective registration, and game-policy competence, full 32 opponent sources, exact paper timings and independent confirmatory evaluations remain mandatory.

**Evidence status unchanged:** 29/32 authentic original 60s, missing ranks 23/25/28, 0 competitive-qualified games, 99.5% unproved.
