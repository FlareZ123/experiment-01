# Agent 5: opening Basic choice changes the ADP first-turn physical resource envelope

**4 November 2026 | independently verified exact physical-card combinatorics | paper Expanded | zero competitively qualified games**

## Decision-relevant finding

The common Issue #25 v0/v1 development opening adapter `simulation/twinleaf/agent50-owner-starting-basic-choice.cjs` takes **every eligible Basic in actual owner-hand order**, up to the six setup slots. The first selected Basic becomes Active under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/reducers/setup-reducer.ts`: `putStartingPokemonsAndPrizes` places `cards[0]` into Active and later selected cards onto Bench. The same order occurs in the alternative setup reducer. Its owner-hand order is uniform under the original physical seven-card shuffle, conditional on an eligible Basic opener.

For [the unchanged Agent5 ADP–Thorton–Regidrago v2 candidate](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), only **two of seven** Basic Pokémon are Arceus & Dialga & Palkia-GX. This creates an exact measurable gap between a *first-Basic-in-hand* setup rule and a policy that deliberately chooses ADP Active when physically held. The latter is a **candidate-specific analysis benchmark**, not a suggested hardcoded rank/candidate policy for the selected symmetric runner.

| Initial-seven/setup choice | Conditional on valid Basic opener |
| --- | ---: |
| Initial seven contains at least one ADP; an ADP-prioritizing actor may start it | **36.857458%** |
| Random first eligible Basic from owner hand is ADP | **28.571429%** |
| Gap in ADP starting-Active access | **8.286029 percentage points** |

The exact second result is **2/7**, by physical exchangeability of the first Basic encountered in a shuffled seven. It remains exact after conditioning on at least one Basic, with no owner-mulligan bonus draws in this model.

## Subsequent first-eight Energy and Switch access

The prior exact [Agent1 ADP Active resource bound](agent1-adp-firstturn-active-line-prize-bonus-20261104.md) and [Agent5 expanded Switch/Tag/Quick/Ultra bridge](agent5-adp-alternate-switch-first8-exact-20261104.md) provide the source cards. The expanded calculation adds the random first-Basic-order decision and a first-eight **Switch** rescue when the greedy choice started another Basic even though ADP was in the original seven.

An opening must contain any of seven Basics; six actual Prizes are placed; one normal turn draw follows. Require Double Dragon Energy already in the first eight, or held Guzma & Hala with deck DDE, or held Tag Call with deck Guzma & Hala plus DDE. In the maximal pivot envelope, a non-ADP Active may move into an available ADP using Switch; an ADP in first eight is accessible directly, and an unprized ADP is searchable through first-eight Tag Call, Quick Ball or Ultra Ball. These **optimistically ignore discard costs, lock, chosen sequencing and opponent responses**.

| Named first-eight physical opportunity | Deliberate ADP-first setup | First-eligible greedy setup | Access lost under greedy |
| --- | ---: | ---: | ---: |
| ADP already Active and DDE/G&H/Tag resource line | 28.993653% | 22.817498% | **6.176155 pp** |
| Above plus Switch, Tag Call, Quick Ball and Ultra Ball access | 37.981531% | 32.961644% | **5.019887 pp** |

Within the greedy maximal access screen, **1.156269%** of Basic-valid sevens provide a Switch rescue after the first Basic was **not** ADP even though the original seven already held ADP. Another **8.987878%** comes from original sevens containing no ADP, with Switch and first-draw/search access. Thus a common opening choice can change the measurable opportunity of an unchanged printed 60 before an Item or Supporter is played.

The probability calculation weights each unordered initial hand by its physical multiplicity and **exact rational fraction** of ADP among the Basic cards in hand. With `a` ADP and `b` other Basics in the original seven, the first eligible Basic is ADP with probability `a/(a+b)`. A common denominator of 420, divisible by every possible `a+b` from one through seven, makes the resulting BigInt numerators exact. Six-Prize allocations and first draws use the same denominator `250397245379590400` as Agent1. Complete raw scaled denominator: **105166843059427968000**. The exact code emits all favorable scaled integer numerators.

## A second setup collision: Tapu Lele-GX's turn-time Wonder Tag

The same unchanged v2 contains one **Tapu Lele-GX GRI60** with printed Wonder Tag, which searches a Supporter **when played from the hand onto the Bench during the player's turn**. The supplied Advanced Player's Rulebook E-06 confirms that a pregame Bench placement does not invoke this event. The all-eligible-Basic setup adapter can place an originally held Lele on the Bench before the game, exhausting that simple opportunity for later Wonder Tag activation.

The exact independent category enumeration uses `[ADP 2, Tapu Lele-GX 1, other Basic 4, DDE 4, Guzma & Hala 3, Tag Call 4, other 42]`.

| Physical opening event, conditional Basic-valid initial seven | Exact probability |
| --- | ---: |
| ADP and Tapu Lele-GX both held in original seven | **3.778797%** |
| ADP held; Lele held from seven; no DDE, GH or Tag Call in first eight; at least one GH and DDE unprized | **0.990944%** |
| Same missing-resource conditions, but Lele first obtained on normal turn draw | **0.163302%** |
| Combined disjoint Lele-powered missing-resource opportunity | **1.154245%** |

The **0.990944%** line is the exact subset that a careful setup could preserve by choosing ADP Active and keeping Lele in hand for a later Wonder Tag, instead of immediately Benching Lele during setup. If Wonder Tag fetches Guzma & Hala and a paid Guzma & Hala fetches Double Dragon Energy, the named physical route can attempt the enhanced Altered Creation-GX. The GH discard-two payment is **not** assumed economically free, and the line can still lose to Item lock, Ability lock, turn sequence errors or source counterplay. If original rank6 Iron Thorns ex's Initialization is effective, Lele's Rule-Box Ability is disabled, so the mathematical Lele opportunity has no payoff in that matchup until the lock is addressed.

The normal turn-drawn Lele portion can be played from hand later under either opening setup choice, if the selected in-turn actor chooses to do so. These values quantify **potentially lost action access** only. They do not prove that the common greedy policy loses that fraction of games, nor do they account for alternate searches such as Pokégear 3.0 or support resources introduced by the draw. They also do not prove that retaining Lele in hand dominates an early Bench in every matchup.

## Independently checked implementation and exact failure controls

- [Exact ordered-Basic setup model](../../simulation/evaluation/agent5-adp-setup-active-priority.cjs) and [physical ordered-card brute-force tests](../../tests/agent5-adp-setup-active-priority.test.cjs): three local Node 22 tests PASS, including three independent small physical decks with explicit ordered initial hands, six-Prize analogue and normal draw, comparing exact scaled numerators. Results agree with Agent1's original 28.993653% and the registered v2 37.981531% expanded access denominator. A zero-ADP source produces zero ADP access.
- [Exact Wonder Tag missing-resource census](../../simulation/evaluation/agent5-adp-lele-setup-collision.cjs) and [independent physical checks](../../tests/agent5-adp-lele-setup-collision.test.cjs): two local Node 22 tests PASS. Independent inclusion-exclusion gives **8,769,222** legal opening sevens co-holding ADP and Lele out of **232,063,840** Basic-valid sevens. Three physical toy decks reproduce exact first-seven, six-Prize analogue and first-draw event counts.
- The actual pinned native setup source `setup-reducer.ts` confirms the first submitted card is Active. The selected Agent50 adapter's `chooseOwnedStartingBasics` loop follows owner hand order and greedily accepts all candidates through native `prompt.validate`. These are source-level premises. A fresh same-deal real Store first-Basic-order A/B/A remains to be dispatched.
**Compiled manual verification:** existing [benchmark statistical workflow run 41871877739](https://github.com/FlareZ123/experiment-01/actions/runs/41871877739) completed **SUCCESS** on exact code commit `e8b7821425f3129dd7c27158b056c9fa193fe667`, executing all five new Node 22 exact arithmetic and toy physical-enumeration tests. This is independent from Twinleaf match completion and cannot count as a qualified game.
- All models ignore optional opponent-mulligan bonus cards, disruption, the official event match clock and any information leakage or cost bugs in the inherited generic bot. The all-seven-Basic seven-card hand is a rare Bench-cap edge in the full v2 source, with probability only **1 / 232,063,840** conditional on a valid opener; the optimistic rescue estimate may overcount its Bench outcome.

## Recommended Issue #25 gate

Register the **same source v2 initial seven**, actual candidate physical seat, native PRNG seed and opponent deck before comparing the selected first-eligible adapter to a **source-independent, owner-hand/public-information based tactical opening scorer**. Test both seats, confirm first selected card becomes Active in actual Store, report any Lele or Crobat V trigger preserved for real turn-time Bench placement, and settle the resulting Switch + paid DDE + Altered Creation GX with opponent response. The common policy must use the same rule for every contender and original opponent; the present ADP-focused conditional metric is only a targeted falsifier. Avoid changing the current fixed 60 or promoting any resource-access percentages into a 99.5% game-win claim.

**Project status:** Original Aichi field inventories 29/32 authenticated (ranks 23/25/28 missing), no selected best final 60, and zero competitively qualified games.
