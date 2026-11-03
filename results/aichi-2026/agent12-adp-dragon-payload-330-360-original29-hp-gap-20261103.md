# ADP v2: no original-29 printed full-HP knockout gain from swapping Wild Blaze for Ryuno Glide

**Agent 12 | 3 November 2026 | printed database and authenticated field census, no game simulation.**

## Decision

The registered [ADP/Thorton/Regidrago v2 candidate](candidates/agent5-adp-thorton-regidrago-60-v2.json) already carries the Dragon-type **M Charizard-EX XY2 69** as its 300-damage `Wild Blaze` attack payload. The newer **Mega Dragonite ex ASC 152** is also Dragon-type and has a printed 330-damage `Ryuno Glide` attack. Both are Expanded-legal according to the supplied English card-list metadata. They have materially different after-attack costs: Wild Blaze discards the top five cards of the player's deck; Ryuno Glide discards two attached Energy.

Under an already resolved **enhanced Altered Creation-GX** (ADP's +30 damage), a copied Wild Blaze is **330 nominal damage** and a copied Ryuno Glide is **360 nominal damage** before all further modifiers. Across **all 92 different Pokémon names** in the **29 authenticated original printed 60s**, there is **no name with maximum HP from 331 through 360**, even conservatively taking the *largest HP among all supplied English card printings of that name*. The only source-deck name with such maximum HP above 360 is **Mega Dragonite ex (370 HP)**, listed as a singleton in original ranks **14, 20 and 32**. Neither 330 nor 360 would knock out an undamaged full-HP 370-HP Mega Dragonite.

Thus under **full HP, no HP modifiers, no defensive effects, no Weakness/Resistance and unchanged copied attack type**, the Dragonite 330-damage attack creates **zero additional one-hit knockout thresholds against the complete 29-original roster Pokémon-name envelope** relative to Wild Blaze's 300 damage plus enhanced GX. This is a direct negative on the simplest proposed damage-only swap rationale. It neither establishes Wild Blaze's overall dominance nor rules out Dragonite when enemy HP increases, damage reduction is present, extra damage is stacked, or deck-mill cost would otherwise become decisive. The exact dynamic values depend on actual board states.

## Reproduction

The read-only [single-file test](../../tests/agent12-adp-wildblaze-ryunoglide-original29-hp-gap.sft.cjs) uses the repository's unmodified `results/aichi-2026/full-decklists.json` and `resources/cards/en/*.json`. It asserts 29 originals, 60 cards each, 92 normalized Pokémon names (handling the original roster's Prism Star glyph), full English card-pool name coverage, empty HP interval `330 < HP ≤ 360`, and one name above 360 at exactly 370 HP. It independently checks the exact printings `xy2-69`, `me2pt5-152`, and `sm12-156`, including Dragon typing, named attacks, damage, and the printed +30 enhanced GX effect.

A separate local scan of the unmodified supplied `card-list.zip` over all 20,635 English card printings found zero unresolved names, zero names within the 331–360 HP interval, and just Mega Dragonite ex 370 above it. The repository Node test has been committed but has **not** been run in native GitHub Actions. This is card-text/name-level proof rather than a simulated match.

Rank 14/20/32's original 60s also show no Dratini or Dragonair, so their listed Mega Dragonite appears to function as a discarded Regidrago attack payload rather than as a normally evolved 370-HP Active attacker. A special way of putting it in play, if present, would require a separate source-card/action analysis; the no-gap conclusion itself does **not** depend on whether the 370-HP body actually appears in play.

### Important exclusions

A real game can alter damage, Resistance, damage prevention and HP. The existing Haxorus attack payloads can Knock Out Pokémon through printed effects without checking these nominal 330/360 thresholds. Some games may require attacking with Regidrago *without* first using enhanced Altered Creation-GX, in which case raw 300 versus 330 can matter at exactly 310–330 HP. Turn-three fueling, the scarcity of Double Dragon Energy, repeated Wild Blaze's self-mill, source-specific lock effects, Tool benefits and Prize exchange can change the payoff. Missing original ranks **23, 25 and 28** have no authenticated 60 and therefore are absent from this census.

**Do not change the fixed candidate based on this narrow threshold result.** It is a falsifier for one speculative damage-only rationale and helps focus proposed payload replacements on actual board-dependent payoffs or resource savings.

**Benchmark status:** 29/32 authenticated source 60s, zero qualified competitive games, no verified 99.5% result.


## Executed independent CI reproduction

**SUCCESS:** Manual opt-in GitHub Actions [run 41578974062](https://github.com/FlareZ123/experiment-01/actions/runs/41578974062), workflow head `05c733918171d64fd9caf8976edd2d455134efe5`, pinned repository source `main`. The isolated `adp-strict-physical` job started 04:35:05 UTC and completed successfully at 04:35:12 UTC, with the two exact Python scripts and original29 printed-HP Node SFT each explicitly recorded **success** by the workflow runner. Standard card coverage and vendor card-manager jobs were deliberately **skipped**, requiring no Twinleaf compile or simulation. The Python sources assert their exact integer numerators, denominators and frozen candidate identity; the JS SFT asserts full 29×60 manifest and printed HP findings. This proves these committed scripts execute successfully under pinned checkout and common runners; it does not make the underlying model a competitive-game oracle.


## Important discovered counterexample: damage reduction creates a real Prize breakpoint

The no-raw-HP-gap statement assumes **no defensive effects**. It cannot be used to conclude that the 30 extra Dragonite damage is tactically redundant. The follow-up [exact source-five Rolling Iron mirror result](agent12-adp-rollingiron-defensive-ko-breakpoint-five-originals-20261103.md) proves that a 280-HP opposing Regidrago VSTAR which just copied Hisuian Goodra VSTAR's Rolling Iron takes 80 less damage next turn. With our enhanced GX, current Wild Blaze deals **330−80 = 250** (no KO), whereas hypothetical Ryuno Glide deals **360−80 = 280** (damage KO, **three Prizes** after GX). The five original ranked source sixties **10,14,18,21,32** contain a Regidrago VSTAR plus the Rolling Iron Goodra donor. This is a conditional, print-supported real tactical distinction, **not** a measured opponent board occurrence or an automatic deck swap. Ryuno's mandatory two-Energy discard remains consequential.

The original **zero unmodified full-HP thresholds** finding stands under its explicitly restricted assumptions; the new effect-dependent counterexample sharply limits how it should be used when selecting a damage payload.
