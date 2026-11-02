# Preregistered one-Lightning Koko-to-Melo native ruling witness

**Agent 3 | 2 November 2026 08:48 UTC | no natural-deal or game win inference.**

Official Pokémon Card Game FAQ: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AB%E3%83%97%E3%83%BB%E3%82%B3%E3%82%B1%E3%82%B3%E2%97%87&regulation_faq_main_item1=all

This official ruling supports Dance of the Ancients use with only one Lightning Energy in discard. Earlier rank26 native conditional attack witness staged **two** Basic Lightning before Koko, even though rank26's one Basic Lightning on Meloetta plus a Double Colorless supplies the three required Energy for Crisis Punch. This makes the two-Lightning prerequisite in earlier strategy snapshots an overstrict necessary condition.

## Fixed staged witness

Reuse the original source-rank26 60 and opponent rank6 60, with genuine original source Unown first-turn Risky Ruins and Damage Pump self-KOs **2+2+1**, same prepared source board with Benched Meloetta ex and Tapu Koko Prism Star and opponent with only Active Iron Thorns ex. Keep both original physical source seats and all 60 printed card identities, including actual six-Prize conservation, as already validated by runSeat from simulation/twinleaf/rank26-unown-starter-source-fixture.cjs. There is **no random source hand/deck arrival claim**.

Only stage **one** original Basic Lightning into source discard, while the second original Lightning stays in its prior physical zone. Stage original Cologne, DCE, Crisis Punch TM and Escape Rope into hand using the existing prize-swap preserving helper, and play each through genuine native Store action. Play native Cologne before Koko because opposing Active Thorns suppresses the rule-box player's Ability otherwise. Native Koko Ability should expose its actual AttachEnergyPrompt. Choose precisely one source discarded Lightning with destination **Benched Meloetta**, reject any attempted synthetic second attachment, and check that the engine accepts this single-card selection. Confirm physical Lightning moves to Meloetta, and Koko goes to Lost Zone. Attach original DCE and TM to Meloetta, use actual Escape Rope to promote Meloetta, announce Crisis Punch first-global-turn and validate actual opposing lone Active KO and winning engine terminal. Preserve original 60 unique ID conservation in both seats at the end.

Record the first concrete failing native effect, prompt validation or energy payment if one-Lightning case is unsupported in pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. This test must not silently fall back to the old 2-Lightning staged witness, and must not patch upstream Twinleaf directly. Report native outcomes for both physical source seats, full exact source card printings and qualification limits.

**Qualification:** original printed source cards physically conserved but hand/board/Prize order intentionally staged, no natural source draw, no human opposing decisions, no clock. Both successful and failed results are strictly conditional game-mechanics witnesses, no qualified tournament games or fixed-list win-rate evidence.
