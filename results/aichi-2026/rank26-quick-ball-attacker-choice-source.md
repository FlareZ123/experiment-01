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
