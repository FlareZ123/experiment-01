# Rank26 Quick Ball owner-deck search: attacker selection counterfactual

**Agent 4, 19 October 2026, preregistered before first CI execution.**

## Question

On authentic first-player rank-26 Meloetta versus rank-6 Iron Thorns openings, the starter-agnostic Trainer's Mail v2 policy can retrieve Items without establishing Meloetta ex. Does a narrow, legal **Quick Ball deck-search prompt choice** actually improve the owner's first-turn board development? The previous four historically selected Mail-positive openings had seven real Mail selections and no root attack or opposing Prize transition.

This is a **retrospective policy-development fixture**, not an unbiased performance study. Never count its engine terminals as matchup wins or extrapolate its trigger rate.

## Frozen pairing and gates

Keep rank26 and rank6's unchanged source 60s. Retain the same four historically selected original seed/seat pairs from [Mail-starter development](rank26-mail-starter-source-development.md): 2046029502 A, 4158340325 A, 2818295704 B, 1839183531 A. They were originally selected for visible Mail without Risky Ruins/Cologne, not Quick Ball availability. Neither the root deal, actual first-player draw, initial Pokémon, nor any card is staged.

Both arms run **rank26 Propagation v3 + starter-agnostic Mail v2**, original source seat, the same engine seed, action cap 120, owner/public-state decision policies, strict prompts, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The intervention adds only [rank26-quick-ball-target.cjs](../../simulation/twinleaf/rank26-quick-ball-target.cjs), an opt-in temporary wrapper over the source bot. It cannot force a Quick Ball to be played or modify the earlier discard cost.

When the real source bot plays **Quick Ball** on its first turn, the wrapper remembers that action until the genuine owner **ChooseCardsPrompt** for the owner's deck. If Meloetta ex is absent from the owner's hand and play, and an actual Meloetta ex deck-card reference appears in the search prompt's pool, ask the Store to validate the choice and select it. Otherwise let the original bot resolve. No deck inspection occurs before an owner-visible search; opposing secret zones, external random seed and privileged Prize information are excluded. Restore the original bot prototype after every bounded synchronous game.

## Predeclared measurements and failure handling

Save all four deals, including cases without Quick Ball, Meloetta unavailable because Prized, or any other non-trigger. Fail the program if the first-player draw log, source 60 hashes, seat, pre-registered seed, engine version, or origin profile differs. Record actual firstturn Quick Ball `PlayCardAction`, genuine chosen/unchosen deck-prompt target, every firstturn root action, final source firstturn opposing Prize count, delegated attack uncertainty, engine action-cap/terminal only as secondary diagnostics.

This is a **decision quality experiment**, and even a successful Meloetta choice does not show that the search chain completes. Subsequent physical Bench/Active placement, DCE reservation, Tapu Koko acceleration, Technical Machine slot, five self-KO Prizes, legal first-turn Crisis Punch, printed attack effect and a competent opponent response remain separate proof gates. If no real source Quick Ball prompt with an available Meloetta occurs, publish that null outcome instead of looking for a favorable seed in this registered cohort.

## Reproducibility

- [Owner-deck prompt hook](../../simulation/twinleaf/rank26-quick-ball-target.cjs).
- [Pure information-boundary tests](../../tests/rank26-quick-ball-target.test.cjs).
- [Four genuine source-paired runner](../../simulation/twinleaf/rank26-quick-ball-source-pair.cjs).
- Existing manual-only [Damage Pump workflow](../../.github/workflows/aichi-damage-pump-fidelity.yml), Boolean input `rank26_quick_ball_probe`, JSON artifact `rank26-quick-ball-target-source-development-unqualified`.
- No per-push CI. Registered pair retains negative observations.

**Qualification before execution:** 29/32 exact field source lists, 0 qualified competitive games, no final target-qualified 60 and no demonstration of 99.5%. This intervention does not alter the decklist.


## Compiled source outcome, 19 October 2026

The frozen manual-only [CI 39206647514](https://github.com/FlareZ123/experiment-01/actions/runs/39206647514) **succeeded**, compiled pinned Twinleaf, passed the owner-state information-boundary unit tests, and executed all four registered paired source first-turn cases. Its complete JSON is [artifact 12165982592](https://github.com/FlareZ123/experiment-01/actions/runs/39206647514/artifacts/12165982592), `rank26-quick-ball-target-source-development-unqualified`. The ZIP was independently parsed; it contains exactly four cases, all four precommitted seed/seat pairs, with actual source draw-log and deck-hash checks.

| Source seed | Actual firstturn Quick Ball roots | Changed source-deck choice | Opponent Prizes after turn 1 |
| --- | ---: | --- | ---: |
| 2046029502 | 1 | Bunnelby PRC → Meloetta ex SV11B | 6 |
| 4158340325 | 0 | No relevant owner-deck prompt | 6 |
| 2818295704 | 0 | No relevant owner-deck prompt | 6 |
| 1839183531 | 0 | No relevant owner-deck prompt | 6 |

On seed `2046029502`, real source firstturn action ordinals **12/13** played Mail and selected Battle VIP Pass; ordinal **17** played Forest Seal Stone; ordinal **18** played Quick Ball; ordinal **19** selected **Dowsing Machine PLS** for its discard cost **in both arms**. The genuine Quick Ball owner-deck prompt at ordinal **20** selected **Bunnelby PRC** in control and **Meloetta ex SV11B** under the opt-in preference. The real Store subsequently accepted the control's Bunnelby and the variant's Meloetta ex as first-turn `PlayCardAction` at ordinal **24**, followed by variant Float Stone at ordinal **25**, then Pass. Which Pokémon received Float Stone was not captured in this report and is not asserted.

Therefore a missing-attacker selection was changed at a genuine owner-visible, printed-card legal prompt, with a real downstream card play. **Across all four development cases, root attacks = 0 and opponent Prize reductions = 0; no complete firstturn Crisis Punch, timed game, strong opponent response or competitive win was demonstrated.** The other three cases showed no Quick Ball firstturn root, so the new preference did not fire. This selected four-source cohort is diagnostic and **not a prospective frequency sample**.

A distinct, important resource-allocation observation is that the same authentic seed discarded the **singleton Dowsing Machine ACE SPEC** for Quick Ball while source firstturn's opener held **Iono**. This suggests a separately testable discard-policy defect. It is not yet proof that sacrificing Iono gives a better game trajectory, since later Supporter value and Dowsing lines may differ. Keep that opportunity evidence separate from the already validated Meloetta-target source prompt.
