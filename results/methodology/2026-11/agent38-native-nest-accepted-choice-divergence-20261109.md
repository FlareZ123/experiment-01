# Agent 38: first real Nest choice divergence is at its accepted prompt, not its later action-class fallout

**9 November 2026. Native decision-trace correction; no new deck, opponent roster, game sample, or competitive qualification.**

## Fixed defect and execution

The prior original rank-3 Snorlax Stall versus rank-1 champion frozen four-trial Nest Ball experiment correctly measured a physically different Basic choice (Articuno-GX CES versus Bunnelby PRC) but its per-root `firstDivergence` reported zero-based tape index **84**. That comparator only compared `ResolvePromptAction` class, prompt ID, and result type (`array`); it did not compare the card contained in an accepted selection. Therefore the actual choice at the earlier same-class `ResolvePromptAction` was invisible, and index 84 reflected secondary action changes.

The correction is default-off and owner-scoped:

1. `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs` emits a read-only callback only after the **actual match Store** has accepted an owned `Nest Ball SVI` prompt, the selected Basic reference has physically moved from its owner's deck to Bench, and the prompt result has settled. The receipt contains the now-public printed Basic, actor seat/turn, trial and Mail/Arven origin. No unrevealed deck contents or opponent hand are released.
2. `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs` attaches that receipt to the exact accepted root `ResolvePromptAction` through the action object's identity in a `WeakMap`. The registered native `onRootActionDispatched` callback occurs after successful dispatch, which allows the receipt to be joined to that root rather than a proposal or speculative action.
3. `simulation/evaluation/agent38-v8-owner-mail-pass-four-arm.cjs` includes the settled `ownerNestBasicSelection.selectedPokemonPrinting` in its root signature. The regression in `tests/2026-11/agent38-mail-nest-prize-aware-four-arm.test.cjs` shows same-class, same-turn, same-prompt resolutions with two printed Basics now produce an immediate first divergence. Unchanged or absent annotations remain identical.

## Real native acceptance and result

[Compiled existing manual GitHub Actions run **42599317137**](https://github.com/FlareZ123/experiment-01/actions/runs/42599317137), head `05037886dac977cd82f2685f549174ca8ae24ff3`, **SUCCESS** on 9 November, including the updated pure tests and original unchanged four-trial native case. Artifact **13664583496** (ZIP SHA-256 `4e7429b70b182297b3d60851fa5d4aa5fba542d68de178d425ade05777a68b28`). No vendor submodule was modified.

| Registered original trial | Source seat | Native Basic choice before → after | New first root divergence | Both native dispositions |
| --- | ---: | --- | ---: | --- |
| `3:312:B:champion-reference` | 0 | Galarian Stunfisk SSH → unchanged | none | 260-root caps |
| `3:312:A:champion-reference` | 1 | no selected Nest Basic | none | both native-game-end |
| `3:213:A:champion-reference` | 1 | no selected Nest Basic | none | 260-root caps |
| **`3:213:B:champion-reference`** | **0** | **Articuno-GX CES → Bunnelby PRC** | **18** | **260-root caps** |

The last row's previously reported first action-class divergence index **84** is now replaced by accepted action identity index **18**. It is the same previously registered real source owner decision, now correctly located. The actual Mail-selected Nest action was accepted at root ordinal 17, followed by an opponent nonmechanical action at ordinal 30 and a later source own-turn action at ordinal 43. Prize vector on both paired capped arms remained **[6,5]**; no win reversal is demonstrated.

The choice was originally engineered to preserve a potentially important hand-entry Articuno-GX route while selecting the lower-Prize Bunnelby. The existing full source-state review independently found that, in this particular replay, both Basics ultimately reached the Bench, neither received Energy, and the rank-3 bot remained unable to convert its board to an attack. This diagnostic repair therefore **does not revive the Basic-choice rule as an optimized source strategy**. The next useful action is a paid, owner-visible and opponent-contested funding/positioning/attack sequence, preferably using existing rank-3 paid-retreat/Bunnelby lines rather than another unfunded Bench-search panel.

**Limits:** The four replayed native attempts are a single frozen developmental comparison, not independent additional games. Prompt receipt fidelity confirms the chosen card's movement under the pinned engine. It does not certify full paper legality, adversarial opponent play, the official tournament clock, a completed 32-rank field, or a 99.5% win rate. **Zero competitively qualified games and no selected final fixed 60.**
