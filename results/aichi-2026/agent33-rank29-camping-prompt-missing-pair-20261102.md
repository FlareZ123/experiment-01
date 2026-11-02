# Rank29 Camping Gear: fixed Guzma & Hala target versus direct missing-Thunder search

**Agent33, 2 November 2026.** Extends the [exact rank29 Camping-versus-Beach resource model](agent33-rank29-camping-beach-singleton-access-20261102.md). This is a bounded decision-policy result, not a native-game observation.

## Deterministic native-neutral target-choice divergence

The [existing Agent12 Camping Gear native hook](../../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs) ranks **Double Colorless Energy SUM**, then **Guzma & Hala CEC**, then **Speed Lightning Energy RCL**, followed by lexical fallback. This fixed target order ignores whether DCE is already in the owner's hand or attached to Active.

At an authorized own-deck Camping Gear prompt, suppose owner Active is **Iron Thorns ex**, owner hand includes **DCE SUM**, no Thunder Mountain is in play, and own search deck includes **Thunder Mountain Prism Star LOT**, **Guzma & Hala CEC** and **Speed Lightning Energy RCL**. All three deck targets are native-valid unrestricted one-card selections. The existing fixed-order routine returns **Guzma & Hala**, while a missing-piece priority immediately returns **Thunder Mountain**. These are different legal targets. The relative strategic value has not been established.

## Critical strategic qualification: Guzma & Hala is a bridge to Thunder

The original printed **Guzma & Hala CEC 193** Supporter can search for a Stadium with no discard cost; paying an additional **two cards from hand** also permits searching a Pokémon Tool and a Special Energy. Thus choosing G&H from Camping Gear can obtain **Thunder Mountain on a later turn**, or both Thunder Mountain and DCE when its discard cost is payable. This is a credible deliberate multi-axis plan and the older fixed priority may be strategically correct. Its cost is the next-turn Supporter allocation, two discardable cards for the expanded mode, and timing/lock exposure.

Directly searching Thunder when DCE is already held gains immediate Stadium possession and preserves the following turn's Supporter for something else. It can lose G&H's Tool/Special Energy flexibility and future recovery channels. The pure selector establishes a legal *alternative*, and every improvement assertion requires native state-specific follow-through against these competing lines. The earlier characterization of the legacy choice as an avoidable policy error is **withdrawn**.

Source card text: the supplied English SM12 database, Guzma & Hala 193, plus [printed 60](full-decklists.json).
## New separate owner-only helper

[Source helper](../../simulation/twinleaf/agent33-rank29-camping-attackpair-target.cjs) requires the **owner-prompt** observation, owner hand, face-up public board, and physically legal own-deck search candidates. Only a genuinely authorized own-deck prompt may provide the candidate cards. It never reaches into hidden opposing zones or assumes K0 deck membership. Held or Active-attached DCE counts as satisfied; held or currently in-play Thunder counts as satisfied. It chooses missing DCE first or missing Thunder second; when no missing target is available it abstains for a separate native-valid fallback. The real prompt validator must accept every proposed card.

Real board conditions can make this preference strategically inferior, including opponent lock, alternate Energy or Stadium solutions, replacement problems, future search and Supporter contention. The helper is **default-off**, unintegrated with the shared game policy, and not a deck ranking.

## Original-source frequency envelope for this exact target divergence

Using all six original fallbacks (2 Guzma & Hala + 4 Speed Lightning), [the exact seven-card, first-turn-draw and six-Prize enumeration](../../simulation/evaluation/agent33-rank29-gear-fixed-fallback-incidence.cjs) quantifies when the legacy search can prefer a fallback over the missing Thunder:

| Restricted paper resource-location event | Exact probability |
| --- | ---: |
| Legal-Basic opening seven also has Camping, Beach and DCE; Thunder remains undrawn on T1 and is in deck rather than Prizes | **0.20522550% of legal-Basic openings** |
| At least one G&H or Speed remains in the own deck, conditional on the above | **99.99921678%** |
| Joint event and fallback present, conditional on legal-Basic opening | **0.20522389%** |

All three numbers use a uniform physical 60, random six Prizes, and exactly one mandatory first-turn draw. This is **only the location envelope** for alternative card selection. It does not show that Camping Gear was played, that the opponent allowed that line, or that choosing Thunder increases wins. Higher-turn draws/search can change the encounter frequency. Other target-divergence states may occur at later turns.

The calculation treats the one Thunder as already established *if it was in hand or played*; the tabulated branch deliberately conditions it being absent and deck-resident. The two absent/prized cases are disjoint. Among the 51 non-Thunder unknown cards after the first-turn draw, the six Prizes must contain **all** remaining G&H/Speed copies for the fixed order to have no fallback; the exact numerator uses that rare combinatorial event. [Independent count tests](../../tests/agent33-rank29-gear-fixed-fallback-incidence.test.cjs) constrain the original source counts and exact numerical probabilities.

## Tests and next native proof

[Eight tests](../../tests/agent33-rank29-camping-attackpair-target.test.cjs) cover the fixed-order G&H counterexample, held and attached DCE, in-play Thunder, no pieces, DCE unavailable, native validator rejection, wrong Active and ordinary-root rejection. A local Node22 run passed **8/8** using a copy of the exact inspected fixed-order Agent12 function; the committed repo test imports the full actual Agent12 module. **Native two-seat confirmation (manual compiled CI run [41420339475](https://github.com/FlareZ123/experiment-01/actions/runs/41420339475), passed 2/2).** The [source-original rank29 physical Store fixture](../../tests/agent33-rank29-camping-prompt-pinned-native.test.cjs) built **two exact 60-card physical sixties** in each branch and staged a seven-card owner hand containing DCE SUM, Camping Gear BST, and source-exact Tropical Beach BWP 50, one Iron Thorns Active, six real Prizes and forty-six own-deck cards for each player. It played actual Camping Gear from hand, observed the genuine owner-deck ChooseCardsPrompt, and native-validated a physical **Guzma & Hala CEC** selection in the fixed arm versus **Thunder Mountain Prism Star LOT** in the default-off missing-piece arm. Both printed cards moved to the owner hand and out of deck, both physical card counts stayed 60, and opponent hand was unchanged. The actual ShuffleDeckPrompt and WaitPrompt were settled and native turn termination observed in **both seats**, with no engine exceptions.

The native pinned ShuffleDeckPrompt itself rejects valid 11-plus-card shuffles due to lexicographic sorting; the test used a **reversible, default-off numeric permutation validator** ([source and issue report](../twinleaf/agent33-shuffle-native-numeric-validation-20261102.md)) rather than changing Twinleaf. The test remains a *staged search-target divergence* under two exact original ranks 29; it does not include opponent reply, the later G&H Stadium/Special Energy Supporter search, or actual winner and is **zero competitive-qualified games**.

Next: recover a physically co-held original-rank29 native owner prompt, preserve source/candidate printed sixties and common deal, then compare exact native selection, prompt settlement, post-search owner hand, turn-end, opponent reply, subsequent two-piece readiness, errors and censor outcomes. No competitive-qualified games or win-rate claims.
