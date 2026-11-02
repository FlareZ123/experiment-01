# Original-field opponent-hand denial: Sidney allows Pokémon and Supporter discards despite validated target restriction

**Agent12, 2 November 2026.** Independent native source-printing paper fidelity investigation. Scope: real compiled pinned Twinleaf Store on deliberately constructed physical source states. **There are zero competitively qualified match wins in this work**.

## Motivation and actual source exposure

The published Aichi original printed60 dataset `results/aichi-2026/full-decklists.json` shows:

| Paper card | Original ranks and source quantities | Printed target contract |
| --- | --- | --- |
| `Sidney FST 241` | #6 1 copy, #24 2 copies, #29 1 copy | Opponent reveals hand; discard **up to 2** cards limited to Pokémon Tool, Special Energy, Stadium |
| `Team Skull Grunt SUM 133` | #6 1 copy, #24 1 copy, #29 1 copy | Opponent reveals hand; discard **2 Energy** cards (as many as available, capped at 2) |

Paper texts: [official Sidney](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh8/264) (alternate rarity with same printed effect), [official Team Skull Grunt](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm1/133/). The provided technical player's manual D-04 requires choosing the specified count when enough valid targets exist; the `up to` wording on Sidney allows zero. The source roster contains four Sidney copies and three Team Skull Grunt copies across 3 recovered original opponents. The missing ranks #23/#25/#28 have unverified exact60s, and cannot be counted.

## Verified: genuine pinned Sidney effect permits forbidden physical card types

[Native driver](../../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs) and [regression test](../../tests/agent12-sidney-opponent-hand-native.test.cjs) use pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [CI 41479782821](https://github.com/FlareZ123/experiment-01/actions/runs/41479782821) compiled successfully and exercised **eight** real source `PlayCardAction` / `ResolvePromptAction` cases across both physical seats.

Prepared real source Pokémon `Iron Thorns ex TWM` from authentic rank24, with exact printed `Sidney FST 241` in the owner's hand and `Mew V FST` opposing Active. Six physical opponent-hand cards, each with its unique identity, were `Mew V FST` (Pokémon), `Psychic Energy SVE` (Basic Energy), `Double Colorless Energy SUM` (Special Energy), `Float Stone BKT` (Pokémon Tool), `Sky Field ROS` (Stadium), and `Guzma BUS` (Supporter). The owner played Sidney as its Supporter. The actual native opponent-hand `ChooseCardsPrompt` was source-stamped `Sidney FST 241`, declared `min:0,max:2` and explicitly blocked physical hand indices `[0,1,5]`. We independently checked `prompt.validate` before submission and audited native physical opposing hand/discard after submission.

| Requested Sidney hand discard | Paper permitted | Native prompt validates | Native Store accepted | Physical result |
| --- | --- | --- | --- | --- |
| Special DCE + Tool Float Stone | yes | true | yes | both correctly discarded |
| Pokémon Mew V + Basic Psychic Energy | **no** | false | **yes** | **both illegally discarded** |
| Supporter Guzma + Stadium Sky Field | **no**, due to Guzma | false | **yes** | **both discarded**, including illegal Supporter |
| No target selected | yes, `up to 2` | true | yes | hand unchanged |

All four cases repeated for **source seat0 and source seat1**. For both invalid rows, native `Store.dispatch` reported **no error**, removed the selected real cards from the opponent's physical hand, put those objects in the opponent's discard, and had **no unresolved prompts**. The native validator got the type filter correct. The defect is its **failure to enforce the rejected answer at the Store action boundary**, permitting hand destruction of cards the printed Supporter cannot affect. The presence of actual source deck card and opponent identity does not establish a natural match incidence or a game win.

## Verified: genuine Team Skull Grunt effect can discard non-Energy and ignore mandatory printed discard

A second independent compiled native test completed successfully in [CI 41481682516](https://github.com/FlareZ123/experiment-01/actions/runs/41481682516), at the same pinned vendor commit. [Original rank24 Team Skull Grunt source fixture](../../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs) and [native test](../../tests/agent12-team-skull-grunt-native.test.cjs) resolved all **eight** modes in true physical seats 0 and 1. The source owner's original `Team Skull Grunt SUM 133` acted upon the same original printed six-card opponent hand described for Sidney. The native `ChooseCardsPrompt` included all six cards with **`min:0,max:2`**, `filter:{superType:Energy}`, and genuine source-card provenance `Team Skull Grunt SUM`.

| Team Skull selection with two Energy present | Paper permitted | Native prompt validates | Native Store accepted | Physical outcome |
| --- | --- | --- | --- | --- |
| Basic Psychic Energy + Special Double Colorless Energy | yes | true | yes | both real Energy cards discarded |
| Pokémon Mew V + Basic Psychic Energy | **no** | false | **yes** | physically discarded Mew V and Basic Energy |
| Stadium Sky Field + Supporter Guzma | **no** | false | **yes** | **both non-Energy cards physically discarded** |
| Empty selection despite two eligible Energy | **no** | **true** | **yes** | Energy still in hand; printed mandatory discard skipped |

Each selection above resolved both true physical owner seats, completed the native prompt chain and yielded the precise physical hand/discard count in the test. The native class incorrectly specifies `min:0` for a mandatory effect. Generic `strictPromptValidation` will reject the two wrong-type selections because `prompt.validate` detects them, but **cannot reject the empty reply without an additional paper-specific mandatory-count check** because native `prompt.validate([])` returns true. This illustrates the distinction between unchecked invalid answers and **incorrect native validation contracts**.

## Default-off source-boundary repair staged

[Guard](../../simulation/twinleaf/agent12-opponent-hand-discard-paper-guard.cjs) uses exact `prompt.sourceCard.fullName` plus the true pending opponent-hand prompt. It verifies native `prompt.validate`, exact physical opponent-hand membership, distinct physical card identities, and for Team Skull specifically enforces `min(2, actual Energy cards in opponent hand)` rather than trusting the native zero-min count. Both cards are independently offered in current authentic Top32 data. The guard is **opt-in and reversible**; existing frozen source policy remains unchanged. [Pure regression](../../tests/agent12-opponent-hand-discard-paper-guard.test.cjs) and [native guarded suite](../../tests/agent12-opponent-hand-discard-guarded-native.test.cjs) **both passed** [pinned compiled CI 41481682516](https://github.com/FlareZ123/experiment-01/actions/runs/41481682516), with six total test suites passing and zero failures. The native guarded suite covers sixteen source-printed state cases across both physical seats: Sidney accepts two legal choices per seat and vetoes two forbidden classes; Team Skull accepts one fully paid two-Energy choice per seat and vetoes two wrong-type classes plus the wrongly optional empty selection. In every veto the original six opposing hand objects remain physically present, the discard remains unchanged and the true native selection prompt remains pending. Every accepted payment correctly moves the actual paper-eligible card objects to the opponent discard and leaves no prompt pending. The original Store dispatch descriptor is reinstated after the fixture. Improperly answered game prompts are vetoed and remain open for a legal response; policy must pick a real permitted target if one exists.

Do not use any results from these constructed states to claim win-rate qualification, a new generally best 60-card deck, or attainment of the 99.5% Aichi benchmark. Winning-strength evidence additionally needs complete exact source opponent, trained decision policies, proper source root choices, paper-lock interactions, both-seat games, and independently counted match outcomes.
