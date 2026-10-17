# Rank-6 Iron Thorns versus New Moon: opponent Lillie + Capture Energy source counterfork

**Agent 13, 17 October 2026.** [Compiled manual GitHub Actions run 39040972032](https://github.com/FlareZ123/experiment-01/actions/runs/39040972032) **succeeded** against the pinned Twinleaf server; [archived artifact 12103099951](https://github.com/FlareZ123/experiment-01/actions/runs/39040972032/artifacts/12103099951) preserves all three full result summaries. Reproduction is [research-side CJS policy fork](../../simulation/twinleaf/new-moon-rank6-lillie-turn5-fork.cjs), wired into the existing **manual-only** [opening-pivot CI workflow](../../.github/workflows/aichi-opening-pivot-eligible-live.yml). Nothing in the upstream Twinleaf submodule, source card inventories or candidate policy was modified.

**Headline:** A two-decision intervention using only cards visible in the rank-6 opponent's own hand **breaks the immediate turn-6 no-Pokémon-left loss**. The candidate still wins eventually in the generic-bot engine, by **opponent empty-deck loss at turn 59**. **Zero games qualify for competitive win-rate inference.**

## Physical source and common history

The underlying source game is the previously screened **seed 3730588627**, authentic rank-6 published Iron Thorns 60 against the fixed original New Moon 60; candidate occupies physical seat **B / 1** and actually **goes second**. The existing own-hand-only native Gengar opening puts **Gengar & Mimikyu-GX** Active rather than **Mewtwo & Mew-GX**, enabling native **Horror House-GX** on turn 2 and **Poltergeist** on turn 4.

Each fork uses the same source seed, unchanged 60-card printings, same starting multiset and exact same **entire decision trace for global turns 0–4** (asserted `deepStrictEqual` on all retained historical decision records). The opponent's original turn-5 source first action, at action ordinal **39**, was **Camping Gear**, selected from a hand which *also* held **Lillie's Determination M1L**. The control Camping Gear chose **Iron Thorns ex TWM** from the opponent's own deck and ended the turn with that Basic stranded in hand.

The patched `SimpleTacticsAi.prototype.decodeNextAction` is scoped to opponent seat A, the exact source global turn 5 and a publicly visible Iron Thorns/Gengar board; it reads the opponent's **own hand** at each intervention and changes only the stated action. It is unconditionally restored in a `finally` block. An actual third replay after restoration was **deeply equal to the untouched full-game baseline**, establishing deterministic restoration. Strict prompt validation remained enabled.

## Three actual source lines

| Counterfactual | Turn-5 source actions, all real Store dispatches | State immediately before candidate turn 6 | Engine outcome |
| --- | --- | --- | --- |
| **Untouched generic opponent bot** | **Camping Gear**; `ChooseCardsPrompt` takes **Iron Thorns ex TWM** into hand; effect ends turn | Opponent has **one** Iron Thorns Active, **zero** on Bench, hand size **7** | Native Gengar Poltergeist KOs the only Active, candidate wins turn **6**, **54 actions**, by opponent having zero Pokémon in play |
| **Forced Lillie's Determination only** | On-hand **Lillie's Determination** shuffles and draws 8; bot then attaches **Speed Lightning Energy**, plays **Tool Jammer**, **Crushing Hammer**, **Player's Ceremony**, and passes | Opponent still has **zero** Benched Pokémon, hand size **6** | Same no-Pokémon-left candidate win on turn **6**, **61 actions** |
| **Forced Lillie's Determination, then forced Capture Energy** | Same legitimate Lillie first action; the eight-card draw contains **Capture Energy RCL** and **Speed Lightning Energy RCL**. Force the opponent to attach **Capture Energy** to Active instead of Speed Lightning. A **real deck-source ChooseCardsPrompt** selects **Iron Thorns ex TWM** and **puts it onto Bench**. Bot then plays Crushing Hammer, Player's Ceremony and passes | Opponent has **one Active Iron Thorns and one Benched Iron Thorns**, hand size **5** | The candidate's turn-6 Poltergeist **does not immediately end the game**. The extended generic-bot game terminates at turn **59**, **341 actions**, with candidate still recorded as engine winner by opponent having **zero cards to draw at the start of its turn** |

The first counterfactual uses **one** explicit action change. The third arm makes **exactly two** supported choices, each based on an acting-player own-hand card that is available at that moment. Both draw Supporter and Capture Energy are actual source `PlayCardAction` dispatches. The Capture Energy Basic-selection prompt explicitly selected **Iron Thorns ex TWM** from the **opponent's own deck**, and the next candidate-turn public snapshot independently showed the second Iron Thorns on Bench. No new cards or rearranged starting hands were introduced.

## Printed card and formal terminal checks

- [Official Lillie's Determination](https://asia.pokemon-card.com/sg/card-search/detail/21776/) states shuffle own hand and draw **eight** while six Prize cards remain. The opponent had all **six** remaining when its own-hand Lillie was forced.
- [Official Capture Energy, Rebel Clash 171](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh2/171/) provides Colorless and, when attached from hand, searches a Basic Pokémon **directly onto the Bench**. This same effect was observed as a live source search-and-placement, rather than a hypothetical graph route. `StrictPromptValidation` was enabled during the match.
- In the untouched arm, terminal transition follows actual **Poltergeist** at turn 6: opponent in-play Pokémon **1→0**, candidate Prize cards **4→2**.
- In the forced Lillie+Capture arm, the final terminal transition follows a **candidate PassTurnAction on global turn 58**, through a WaitPrompt resolution to **global turn 59**, when the opponent's next turn begins. The opponent has **0 cards in deck**, **2 Pokémon in play**, **5 Prize cards remaining**; candidate has **12 cards in deck**, **6 Pokémon in play**, **2 Prizes remaining**. This supports **deck exhaustion** as the engine terminal cause, not an immediate KO, full-Prize win, or empty-board win. Exact observed winner is candidate seat B. The long tail of unproductive bot turns is unqualified.
- In that third arm, all recorded candidate attacks are still **Horror House-GX (turn 2), Poltergeist (turn 4), Poltergeist (turn 6)**. The generic candidate bot did **not** subsequently demonstrate competent prize-taking play, underscoring that the 59-turn engine winner is not a competitive-strength result.

## Causal implication and scope

**The alleged forced turn-6 victory of the native-Gengar line is falsified for this actual source configuration once the opponent makes two legal, information-set-clean turn-5 choices.** The source opponent's heavy Trainer hand makes Poltergeist damage strong, while the ability to change hand composition and immediately Bench a searched Basic changes the loss condition. Simply forcing Lillie is insufficient because the generic bot then attaches Speed Lightning instead of its newly drawn Capture Energy.

This is a narrow **decision-policy sensitivity** test on one preselected seed, one opponent, one turn, and one candidate opening Active policy. It does not show an opponent victory, prove that Lillie+Capture is the best policy at all information sets, establish Clone/Simulator paper fidelity, determine real win rates, improve the fixed 60, or validate a 99.5% win-rate claim. No random-seed frequency estimate follows from the hand-screened selection of this source game.

## Next decisions with real research value

1. Implement an **information-set-legal opponent safety policy** that systematically prefers rescuing at least one Bench Basic when facing a demonstrated terminal knockout, then qualify it on independent seeds and both actual starting orders. This must correctly account for the opponent's own deck search and unavailable Prized Basics, Supporter use and manual attachment contention.
2. Independently verify live Capture Energy card-effect timing, full search prompt selection and later-game opponent deck-out, as well as all relevant Japanese paper printings/bans/errata.
3. Reassess New Moon versus rank-6/rank-24/rank-29 Iron Thorns with both competent policies. Preserve the fixed original source-60 and alternate candidates as distinct arms.
4. Keep **zero qualified games** in any aggregate benchmark until the policy and mechanics gates are met.

**Provenance:** [source counterfork script](../../simulation/twinleaf/new-moon-rank6-lillie-turn5-fork.cjs), [compilation and execution CI](https://github.com/FlareZ123/experiment-01/actions/runs/39040972032), [artifact JSON](https://github.com/FlareZ123/experiment-01/actions/runs/39040972032/artifacts/12103099951), [preceding actual opponent-hand audit](new-moon-rank6-opponent-hand-and-damage.md), [native Gengar original source game](new-moon-native-gengar-source-opening-fork.md).
