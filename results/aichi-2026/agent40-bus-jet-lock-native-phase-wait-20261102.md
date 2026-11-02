# Original rank-15 BUS/AOR Vileplume Active-position contract: resolved native turn boundary

**Agent 40 | 2 November 2026 | actual pinned native Store, staged original-printed lock board.** This report concerns one mechanics and action-root regression only. It establishes **zero competitively qualified games** and makes no opponent-field win-rate claim.

## Problem and controlled correction

[Agent49's 2 November CI](https://github.com/FlareZ123/experiment-01/actions/runs/41376985348) exposed four FAIL cases in the existing `tests/agent40-native-bus-lock-position-root.test.cjs`: both physical source seats, both routes to Active Vileplume BUS, at checks immediately after `PassTurnAction`. Earlier roots had already attached the physical Energy or switched into BUS, while `state.activePlayer` was still the source seat.

Inspection of the **pinned upstream Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, specifically `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` and `effect-reducers/game-phase-effect.ts`, explains this state: PassTurn dispatches an EndTurnEffect, which enters `GamePhase.BETWEEN_TURNS` and emits a mandatory `WaitPrompt`. `initNextTurn` flips `activePlayer` only after the mandatory between-turn sequence; it then emits a draw-phase `WaitPrompt` before opening `PLAYER_TURN`. A direct post-Pass check therefore produced a fixture false negative.

Commit [`b82e516`](https://github.com/FlareZ123/experiment-01/commit/b82e516ee18ea01fdc9dc672f69086d032410dc7) adds `reachOpponentTurn` that resolves only **actually pending `WaitPrompt`** objects via `ResolvePromptAction(prompt.id,null)`, refuses discretionary prompts, bounds processing to twelve acknowledgements and returns only at the actual opponent's `GamePhase.PLAYER_TURN`. The four staged root/effect assertions and their source-card identities remain unchanged. A separate existing [manual-only workflow change `b559f6d`](https://github.com/FlareZ123/experiment-01/commit/b559f6d31fe0125c6b340cc8b4d85ffd682b9741) makes the BUS test step run even if an earlier independent staged test fails, without changing the overall job's fail-hard result.

The intervening [compiled run 41377660418](https://github.com/FlareZ123/experiment-01/actions/runs/41377660418) failed *before reaching BUS* at Agent49's distinct Mysterious Treasure prompt bridge. This is an upstream job dependency, not a BUS regression outcome.

## Completed positive native receipts

[**Manual compiled Actions run 41378093486: whole workflow SUCCESS**](https://github.com/FlareZ123/experiment-01/actions/runs/41378093486), head `b559f6d31fe0125c6b340cc8b4d85ffd682b9741`, pinned vendor as above. Node 22 executed all four BUS tests with **4 pass, 0 fail, 0 skipped**. All test actions used real pinned Store dispatch; both benches contained the printed `Vileplume AOR`, while the opponent had `Mewtwo & Mew-GX UNM` Active:

| Source route | Physical source seat 0 | Physical source seat 1 | Source and recipient witness |
| --- | --- | --- | --- |
| One held Grass to Bunnelby, then ordinary paid retreat | PASS | PASS | Two Grass attached to Bunnelby; RetreatAction pays and discards both; BUS becomes Active; Bunnelby moves to Bench; AOR remains Benched |
| Held Jet to Benched BUS, mandatory switch | PASS | PASS | BUS promoted to Active holding Jet; Bunnelby remains Benched with its previous Grass; ordinary Retreat quota remains unused |

Every case advanced through actual native phase transition to the opponent `PLAYER_TURN`, then attempted `Miraculous Duo-GX` from opposing Basic `Mewtwo & Mew-GX UNM`. **All four native attack attempts were rejected `BLOCKED_BY_ABILITY`**, with no opponent Active damage change. The research `rootPhysicalWitness` produced `confirmed-public-effect` for the paid and Jet roots. Their published native stdout records `AGENT40_NATIVE_BUS_POSITION` (2) and `AGENT40_NATIVE_BUS_JET` (2).

This closes a narrow *mechanical position and turn-advance witness* for original rank-15's actual card printings and two owner-visible root choices, including both physical seats. It corroborates the earlier [Agent30 original-deal rank15 paid retreat report](agent30-rank15-paid-bus-lock-temporal-audit-20261020.md) without replacing its natural-deal chronology.

## Important remaining boundaries

- The board is deliberately staged, with exact original rank15 attack/lock pieces and a conditioned held Energy and Bench. No natural original-60 opening, Prize configuration, source-policy selection frequency or meaningful resistant opponent play was sampled.
- The test checks one opposing Basic's specific printed attack under BUS and AOR board conditions. This does not certify all Pokémon Abilities, alternate attack sources, immunity, Tool/Ability counter-locks, post-attack effect expiration, or game-rule fidelity.
- Both transition lines are tactical choices. The actor must still select them against competing Supporters, Bunnelby attacks, attacker-attack opportunities and counter-lock risks on natural source deals.
- The full paper-fidelity release gate remains independently open across **root, prompt, payment, effect and randomness** for both players. Opponent source 60s are still authenticated for 29 of 32 placements, and the 25-minute tournament clock is absent from this staged fixture.

**Decision impact:** keep the existing `busLockPositionRoot` branch opt-in and use this passing four-arm Store contract as a regression when comparing source control versus fixed challengers. Do not promote it to competitive-qualified win evidence.
