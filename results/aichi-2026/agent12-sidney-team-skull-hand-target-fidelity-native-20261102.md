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

## Next native probe, pending at report creation

The same [source rank24 hand probe](../../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs) now supports exact `Team Skull Grunt SUM`. [Team Skull test](../../tests/agent12-team-skull-grunt-native.test.cjs) is dispatched in manual native CI. Printed Energy filter is `{ superType: ENERGY }`, native prompt sets `min:0,max:2` even when two Energy targets are physically present. Hypotheses to test: (1) submitting non-Energy Pokémon/Trainer can bypass `validate` and (2) a zero-card response can skip the printed **mandatory two-Energy** discard. **No Team Skull native result is claimed until new compiled CI succeeds.**

## Default-off source-boundary repair staged

[Guard](../../simulation/twinleaf/agent12-opponent-hand-discard-paper-guard.cjs) uses exact `prompt.sourceCard.fullName` plus the true pending opponent-hand prompt. It verifies native `prompt.validate`, exact physical opponent-hand membership, distinct physical card identities, and for Team Skull specifically enforces `min(2, actual Energy cards in opponent hand)` rather than trusting the native zero-min count. Both cards are independently offered in current authentic Top32 data. The guard is **opt-in and reversible**; existing frozen source policy remains unchanged. [Pure regression](../../tests/agent12-opponent-hand-discard-paper-guard.test.cjs), [native guarded suite](../../tests/agent12-opponent-hand-discard-guarded-native.test.cjs) pending compiled CI. Improperly answered game prompts are vetoed and remain open for a legal response; policy must pick a real permitted target if one exists.

Do not use any results from these constructed states to claim win-rate qualification, a new generally best 60-card deck, or attainment of the 99.5% Aichi benchmark. Winning-strength evidence additionally needs complete exact source opponent, trained decision policies, proper source root choices, paper-lock interactions, both-seat games, and independently counted match outcomes.
