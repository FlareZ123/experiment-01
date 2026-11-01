# Independent precommitted native rank15 Item-lock treatment: zero effective AOR lock exposure

**Agent 8 | 1 November 2026 | prospective seed registration, developmental Store outcomes only**

## Prespecified experiment

Before any game under this new seed tranche, Agent 8 drew **eight independent distinct 32-bit CSPRNG seeds**, excluded all eight previous rank15 seeds, and committed [the immutable preregistration](registrations/agent8-rank15-effective-aor-item-fresh-native-20261101.json), Git blob `ab05d764508c03273bf30184a37b61b7ced0abd5`, commit `1d25f2863c6fa8bed96866675193605ac6e75949`, at 19:36 UTC.

The tested original source deck remains the authenticated rank15 Ryotaro Nozawa Lopunny/Vileplume exact original physical 60. Both candidate 60s remain the same `champion-reference` and `new-moon-lockbreaker-v1`. Each control and treatment runs both physical seats. Public movement-receipt and canonical actor policy are identical. The sole policy difference is `actorNativeAorItemLock`: false in control, true in treatment. Every registered native attempt is preserved, including nonterminals, with no rejected seed or setup replacement.

## Full outcome

[Manual CI 41342749533](https://github.com/FlareZ123/experiment-01/actions/runs/41342749533) succeeded, artifact **13098580231** (`agent8-rank15-aor-effective-item-veto-native`), head SHA `2f71c82ec8a108da4d8bc03ff2c9140945ea57d9`. This newly registered tranche yielded:

| Metric | Control | Native-effective AOR Item treatment |
| --- | ---: | ---: |
| Total original-source native attempts | 16 | 16 |
| Native terminal games | 9 | 9 |
| Root-cap censored games at 260 | 7 | 7 |
| Native Store errors | 0 | 0 |
| Vileplume AOR effective Item-lock preflight checks | 0 | 0 |
| Fog Crystal root proposals skipped as Item-locked | 0 | 0 |
| Generic Item tactic proposals skipped as Item-locked | 0 | 0 |
| Competitively qualified games | **0** | **0** |

All **16/16** control/treatment original source physical-deal fingerprints match. All **16/16** have consistent accepted coin, chooser and verified first-draw certificates. The per-cell native terminal status, winner label, actions used and root cap agree **exactly** across each pair.

**Conclusion:** this independent tranche is a strict **non-regression result on states that did not trigger the new effective-AOR Item veto**. It is *not* independent confirmation that the filter increases match win rate or avoids failed Items under an active lock in unseen games. The original retrospective historical cohort contains actual exposed states and eliminated four native aborts, but the first independent cohort provides no additional exposed pair.

## Paired original native statuses

| Candidate slot | Seed repeat | Champion reference control/treatment | New Moon control/treatment |
| --- | --- | --- | --- |
| A | 0 | terminal, candidate seat 0 wins / same | terminal, source seat 1 wins / same |
| A | 1 | terminal, candidate seat 0 wins / same | terminal, candidate seat 0 wins / same |
| A | 2 | terminal, candidate seat 0 wins / same | censored at 260 roots / same |
| A | 3 | censored at 260 roots / same | censored at 260 roots / same |
| B | 0 | censored at 260 roots / same | censored at 260 roots / same |
| B | 1 | terminal, candidate seat 1 wins / same | terminal, candidate seat 1 wins / same |
| B | 2 | terminal, candidate seat 1 wins / same | censored at 260 roots / same |
| B | 3 | terminal, source seat 0 wins / same | censored at 260 roots / same |

*Each table cell is the outcome of two separate native policy runs sharing the same source physical deal; winner labels have no competitive qualification. A terminal observed at the action budget does not prove the general bot's optimality.*

The treatment audit's `nativeAorItemLockOptIn` is true in **16/16** games and the count of `aorGateChecks` is zero in **all** of them. Fog Crystal was successfully played in a number of original deals before any relevant lock. A string occurrence of Vileplume in raw metadata or deck provenance does not establish that an effective lock was active for a held Item action.

## Native preflight depth

The same run executed **12/12 staged native Store tests** (both physical seats × no Vileplume, own Vileplume, opposing Vileplume, active Wobbuffet suppressing opponent Vileplume, opponent's Vileplume protected by its owner's Stealthy Hood against Wobbuffet, and own Hooded Vileplume suppressed by friendly Wobbuffet). In every fixture, the detached native preflight correctly predicted Fog Crystal's actual Store acceptance or rejection. The tests establish a narrow pinned-native predicate in these constructed states, not complete paper-rules fidelity or an independent strategy win rate.

## Implications

1. **Legality robustness is conditional on exposure.** The zero-abort treatment in the historical cohort is a real native-reducer improvement; the new independent 16-game cohort contains zero treated lock exposures.
2. **More random trials alone will be sample-inefficient** for testing this narrow state interaction while native source Vileplume may remain unestablished. A predeclared native lock-exposure stress frame with matched, publicly fixed on-board Vileplume and suppression controls can test the legality transition, but must be labeled as a conditional rules/policy fixture rather than a tournament game.
3. **Attack Item locks remain a separate category.** The native `Budew PRE` `Itchy Pollen` implementation routes through `OPPONENT_CANNOT_PLAY_ITEM_CARDS` player-scoped attack lock. Whether the authenticated `Budew ASC` printing aliases to this native implementation and whether the public restriction persists through the correct Pokémon Checkup/turn window require direct confirmation.

## Limitations

Original field is still 29/32 authenticated complete opposing sixties, missing ranks 23, 25, 28. The simulation lacks established skilled source/candidate decision policies and official 25-minute clock compliance. The 260-root cap censors nearly half this tranche, and **zero games are competitively qualified**. No demonstrated 99.5% fixed-list result follows.

See [retrospective 4-abort resolution](agent8-rank15-effective-aor-item-native-retrospective-20261101.md), [source Item-lock failure forensic report](agent8-rank15-fogcrystal-aor-itemlock-diagnostic-20261101.md), and [paper-uncertified printed Item-lock taxonomy](../strategy/item-lock-printed-effect-taxonomy-agent8-20261101.md).
