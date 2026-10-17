# New Moon rank-6 source hand, damage and opponent-response audit

**Agent 13, 17 October 2026.** This is an independent *retrospective source-game diagnostic* of the New Moon native Gengar opening fork. [Compiled manual CI 39039248038](https://github.com/FlareZ123/experiment-01/actions/runs/39039248038) **passed** with the pinned Twinleaf engine. [Artifact 12102404682](https://github.com/FlareZ123/experiment-01/actions/runs/39039248038/artifacts/12102404682) contains full JSON including historical own-hand SHA256 fingerprints, public board information and terminal transition. The [new source-game script](../../simulation/twinleaf/new-moon-rank6-opponent-reply-audit.cjs) changes neither source deck nor policy.

**Zero competitively qualified games. No measured win rate or 99.5% evidence.**

## Authenticated source deal

Published Aichi rank-6 Kazuma Kashi Iron Thorns ex is exactly **4 Pokémon (four Iron Thorns ex), 8 Energy and 48 Trainers**. The script rejects an opponent-hand printing absent from the source 60. Seed **3730588627** places the frozen original New Moon candidate in physical seat **B / 1**, actually going second. The candidate setup intervention reorders already selected physical Basics, choosing **Gengar & Mimikyu-GX** as Active in place of **Mewtwo & Mew-GX**, from its own hand without using any hidden opponent information. [Original paired proof](new-moon-native-gengar-source-opening-fork.md) confirms identical source starting hands, identical selected Basic multisets and identical opponent first-turn actions. The bot's source control loses on turn 39; pivot wins on turn 6. These terminal outcomes are **unqualified**.

## Independent actual turn evidence

| Source turn | Actual observation | Mechanical consequence |
| --- | --- | --- |
| Opponent **turn 3**, after native Horror House-GX | It **passes** with a six-card hand containing **6 Trainers, 0 Energy, 0 Pokémon**. Its Active Iron Thorns ex has exactly **one Speed Lightning Energy**, with **Path to the Peak** in play instead of Thunder Mountain ♢. | Horror House blocks playing cards from the hand this turn. Printed **Volt Cyclone** costs three Energy symbols; one attached Energy card falls two short on this observed board. |
| Candidate **turn 4** | Actual **Poltergeist** hits undamaged Iron Thorns ex. Historical opponent-hand composition is 6 Trainers. | **6 × 50 = 300** printed damage, exceeding **230 HP**; candidate takes 2 Prizes, moving from 6 remaining to 4. |
| Opponent **turn 5** | Hand-play lock has ended. Opponent plays **Camping Gear**, searches **Iron Thorns ex TWM** into hand, and ends the turn. Reconstruction of the hand after search: **6 Trainers, 1 Pokémon, 0 Energy**. Reconstructed hand size 7 equals the independently recorded next-turn hand-size telemetry. | Camping Gear explicitly ends the turn, preventing placement of the searched backup Pokémon before the next attack. The bot's selected response is a material policy-competence issue. |
| Candidate **turn 6** | Second actual **Poltergeist** against undamaged Active Iron Thorns ex. Opponent still holds **6 Trainers**. | Another **300** printed damage; immediate engine terminal transition shows opponent in-play Pokémon **1 → 0**, candidate Prizes **4 → 2**, and engine win by the no-Pokémon-left condition. |

The three candidate attacks are source `AttackAction` dispatches: **Horror House-GX (turn 2)**, **Poltergeist (turn 4)** and **Poltergeist (turn 6)**. The final engine transition is traced to the second Poltergeist AttackAction and a following WaitPrompt resolution. The preceding own-hand snapshots were collected as **post-choice observational telemetry** and never fed back to the bot. The exact rank-6 hand content is retained as a fingerprint and category breakdown in the artifact.

## Exact Trainer hand and an on-hand alternative (second compiled replay)

The extended source audit passed [manual CI 39039974023](https://github.com/FlareZ123/experiment-01/actions/runs/39039974023); [artifact 12104265179](https://github.com/FlareZ123/experiment-01/actions/runs/39039974023/artifacts/12104265179) preserves the acting opponent's historical own-hand printings. On both the opponent's forced turn-3 Pass and at the turn-5 Camping Gear source-deck selection, its six visible-to-it Trainer cards were **Tag Call CEC**, **Megaton Blower SSP**, **Trainers' Mail ROS**, **Team Skull Grunt SUM**, **Lillie's Determination M1L** and **Sidney FST 241**. The turn-5 Camping Gear selection added **Iron Thorns ex TWM** to the hand and ended that turn.

This is especially relevant because **Lillie's Determination was already in the opponent's hand** on turn 5, after Horror House had expired. The opponent still had **all six Prize cards**, so [Lillie's Determination's printed effect](https://asia.pokemon-card.com/sg/card-search/detail/21776/) offers a shuffle and **draw eight** line. That is a concrete candidate to evaluate from the exact source information set. It does **not** guarantee drawing the available Iron Thorns ex or Bench access and may be dominated in some hidden states. No counterfactual turn-5 Supporter dispatch has yet been independently qualified, and no claim of a mandatory policy misplay follows from merely having a possible alternative.

## What this changes

This substantiates the **printed-damage and opponent-hand arithmetic** behind the engine win, and makes the specific policy failure visible. After Horror House expires, the opponent bot chooses a **turn-ending search Item** rather than establishing a backup board before the second Poltergeist. A more competent opponent may choose a different legal line, making this single selected-seed reversal weak evidence of true deck superiority.

The original fixed source candidate and separate four-Trainer Lockbreaker variant produced the *same* recorded winner flip under the opening choice; there is no demonstrated gain from its new Trainer package.

## Required adversarial follow-up

1. On the exact turn-5 **source information set**, inspect and replay legal alternatives to Camping Gear with an independently competent opponent policy. Verify whether another Supporter, Basic deployment, Energy attachment or another legal action avoids the empty-board finish.
2. Validate the paper effects and modifiers for Horror House, Poltergeist, Path to the Peak, Iron Thorns Initialization, relevant Tools and Powerglass, together with Japanese printings, bans and errata.
3. Resolve full reducer/prompt/state and simulator-clone noninterference. Test both actual first-player orders and both physical seats on independently selected seeds against all 32 recovered source lists when available.
4. Do not promote any engine outcome until both players' **decision quality** and paper mechanics pass independent qualification.

**Reproduction:** [auditor source](../../simulation/twinleaf/new-moon-rank6-opponent-reply-audit.cjs), [manual-only workflow](../../.github/workflows/aichi-opening-pivot-eligible-live.yml), [CI 39039248038](https://github.com/FlareZ123/experiment-01/actions/runs/39039248038), [JSON artifact 12102404682](https://github.com/FlareZ123/experiment-01/actions/runs/39039248038/artifacts/12102404682), [original source fork](new-moon-native-gengar-source-opening-fork.md). Rules sources: Gengar & Mimikyu-GX Team Up, Iron Thorns ex Twilight Masquerade, Camping Gear Battle Styles and the supplied Advanced Player's Rulebook.
