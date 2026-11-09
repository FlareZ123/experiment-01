# Owner-Supporter contention: realistic Held-Handiwork survives, low-hand refill does not activate

**Agent1 · 9 November 2026.** Four already-registered original rank-3 Snorlax Stall vs rank-1 Shadow Rider pairs, both seats, 260 native roots per arm. Fixed 60-card source decks, no eligible-deal reselection, preserved control. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. These are bounded native policy tests, not paper-competitive matches.

## First test: refill policy absent

The registered owner-held low-hand shuffle/draw Supporter policy, a default-off source Pass-root fallback, was compared against the selected developmental owner Ability-confirm + Mail-after-Pass control on all four original trials. [Native run 42540415197](https://github.com/FlareZ123/experiment-01/actions/runs/42540415197) passed all seven new pure tests and completed. **0 actual eligible owner refill offers, 0 paid plays, 0 changes to game endpoints or Prizes.** Each treatment physically reproduced its control outcome: three capped at 260 roots, one native engine game end with both players holding six Prizes. This does not establish that refilling hands is weak. The combination of actual hands and the conservative owner selection policy simply did not satisfy its conditions in these fixed games.

The policy is `simulation/twinleaf/agent1-owner-held-refill-supporter-choice.cjs`. It considers Lillie's Determination, Cynthia, N, or a sole remaining Professor's Research only for a hand of 1–4 cards with at least three expected gained cards, unused Supporter and no lock. It reads the owner's hand and public counts, with final native `canPlay`. The experiment registration is `results/methodology/registrations/agent1-v8-low-hand-refill-supporter-four-arm-20261109.md`. The owner hand threshold is a deliberate trade-off and requires evidence before broadening.

## Second test: pre-registered 2×2 Supporter competition

[Native run 42540972372](https://github.com/FlareZ123/experiment-01/actions/runs/42540972372) executed 16 games, four original deals under four fixed policy modes: B (baseline), H (held Handiwork), R (held low-hand refill), HR (both). The preregistration is `results/methodology/registrations/agent1-v8-owner-supporter-contention-factorial-20261109.md`. Pure contract tests passed. Exact native action receipts are in [artifact 13641316566](https://github.com/FlareZ123/experiment-01/actions/runs/42540972372/artifacts/13641316566), ZIP SHA256 `757388ddc1bcbbeee936f42258f4f7fbea77a56cd486d92043ab924df3862841`.

| Native outcome across four original deals | B | H | R | HR |
| --- | ---: | ---: | ---: | ---: |
| Paid owner-held Handiwork | 0 | **2** | 0 | **2** |
| Fully settled coin effects | 0 | **2** | 0 | **2** |
| Physical opponent deck cards milled | 0 | **4** | 0 | **4** |
| Paid low-hand refill Supporters | 0 | 0 | 0 | 0 |
| Later opponent / source-own-turn continuations | 0 | **2** | 0 | **2** |
| 260-root action caps | 3 | 3 | 3 | 3 |
| Native engine terminals | 1 | 1 | 1 | 1 |
| Native errors | 0 | 0 | 0 | 0 |

All four modes had identical native endpoint types and final remaining Prize counts for each original trial: 3:312:B 6/3 cap; 3:312:A 6/6 native terminal; 3:213:A 6/6 cap; 3:213:B 6/5 cap. The two Handiwork payments in H and HR were real prior Pass roots with deferred coin and public opponent deck/discard changes. **The factorial reveals no observed competition between these two Supporters because the refill branch never activates.** This does not establish that the two policies are universally compatible. On the tested owner states, H and HR are functionally identical.

Source code `simulation/evaluation/agent1-v8-owner-supporter-factorial-four-arm.cjs`, pure tests `tests/2026-11/agent1-v8-owner-supporter-factorial.test.cjs` and existing manual workflow flag `supporter_factorial`. No new workflow was created.

## Decision

Promote only the **held-Handiwork route** as a candidate for next shared opt-in developmental release, including its natural originally-held, non-Mail source case. Do not broaden refill thresholds without actor-root opportunity evidence. Keep all game strength and win-rate qualification closed: the experiment has zero independently qualified competitive paper games, no verified win rate, no selected final fixed 60.
