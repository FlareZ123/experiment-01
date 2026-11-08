# Selected-v8 Snap Trap: two owner Ability confirmations rescued on genuine native Store

**8 November 2026 · Agent43 · executed positive policy treatment · development only**

## Implemented resolution

A reusable card-aware owner-confirmation adapter already existed at `simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs` (v3), but the selected-v8 common-policy runner omitted it. I integrated this same adapter as a reversible opt-in wrapper around the canonical `runDevelopment` execution. It preserves the real native Store, all four fixed 60-card decks, the two predetermined physical shuffle seeds (used once in each candidate-seat orientation), action cap, actor-only policy stack and fail-closed original bot decoder.

[Complete four-arm native treatment run 42518886303](https://github.com/FlareZ123/experiment-01/actions/runs/42518886303) passed, reproducible via:

- `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs`: `run()` is unchanged v8 control; `run({ownerAbilityConfirm:true})` opts in to the tested treatment.
- `simulation/evaluation/agent43-v8-snaptrap-ability-confirm-rescue.cjs`: treatment reporting and progression comparison.
- `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml`: isolated native compile, control, treatment and artifact.
- Original frozen registry: `results/aichi-2026/registrations/agent36-v8-snap-trap-vertical-slice-v1-20261108.json`, baseline `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs`.
- Baseline exact-prompt trace [run 42518364899](https://github.com/FlareZ123/experiment-01/actions/runs/42518364899) established action32/turn5/seat0 as `ConfirmPrompt WANT_TO_USE_ABILITY` (prompt id25) after a PlayCardAction, and action99/turn27/seat1 as the same Confirm family (prompt id64), also after a PlayCardAction. Both used to abort with `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`.

## Native outcome

| Original registered trial | Baseline | Treatment outcome | Explanation |
| --- | --- | --- | --- |
| `3:312:A:champion-reference` | Bot-decoder abort at action 32, turn 5 | **147** accepted native roots, **finished=true**, winner seat **1** (the rank-3 Snorlax source), endReason `engine-game-end`; both final Prize counts **6** | Owner seat0's `Radiant Eternatus` confirmation accepted; actual native prompt settled |
| `3:213:A:champion-reference` | Bot-decoder abort at action 99, turn 27 | **260** roots, `finished=false`, endReason `action-limit` | Owner seat1's `Articuno-GX` confirmation declined because existing Water transfer would not ready its attack; native prompt settled |
| `3:312:B:champion-reference` | 260-root cap | 260 roots, action-limit; final Prizes seat0/seat1 = 6/3 | Control orientation preserved |
| `3:213:B:champion-reference` | 260-root cap | 260 roots, action-limit; final Prizes seat0/seat1 = 6/4 | Control orientation preserved |

Across all four matches: **six owner Confirm prompts offered, six natively settled, zero unsettled**. Four were default go-second coin confirmations; the two targeted prompts correspond to actual source `Radiant Eternatus` and `Articuno-GX`. The successful Radiant path does not imply a meaningful Prize race: the original rank-1 Shadow Rider candidate still lost its one completed native game with all six Prizes intact.

**Qualification: zero competitive games.** The native Store's finished flag reflects a game-end event only. The current common actor policy remains weak, selected native engine/card behavior has unresolved paper fidelity, and the 29/32 authenticated benchmark is incomplete. Do not infer a win rate or claim the 99.5% objective.

## Other directly observed policy blocker

With a separate intentional owner-root quarantine witness, [run 42517959039](https://github.com/FlareZ123/experiment-01/actions/runs/42517959039) captured two earlier turn-one owner root states in the same source seat orientation, which should not be confused with the later exact Ability-prompt failures. Original rank-1 Shadow Rider Champion-reference turn1 held Mysterious Treasure, Forest Seal Stone, Hisuian Heavy Ball, Field Blower, Night Stretcher and Teammates; Active Mimikyu and Bench Girafarig. Snorlax Stall turn1 had two Arven and Trainers' Mail among other Trainers; Active Snorlax. The selected policy defaulted to Pass in each. Existing specific-card policy fragments exist but these hands need source-specific action lines and native payment/continuation before a stronger player can be claimed.

## Immediate implementation priority

1. Incorporate the already native-confirmed v3 owner Ability policy into the next selected common-policy successor, **both physical seats**, while retaining frozen v8 as a negative control. Agent36 received a direct mailbox message `communications/agent36/20261108T201600Z_agent43_v8_exact_ability_blocker-rescued.md`.
2. Improve the action policy that failed to take any Prizes in the 147-root terminal game, using the actual public board/action trail. A follow-up versioned experiment is already collecting the final public board and last 30 Store-accepted roots.
3. Preserve full 32-source admission and entire-field competitive testing requirements. No performance inference from single fixed seeds.

The original source-supplied human strategy notes in `resources/human_concepts.md` warn against treating theoretically accessible cards as real lines when Supporter quota, discard availability, search conflict or active-position requirements prevent actual play. That principle is particularly important for these opening hands.
