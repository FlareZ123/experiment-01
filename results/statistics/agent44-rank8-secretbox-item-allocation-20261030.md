# Rank-8 original Secret Box searches Boost Shake: prize-aware first-draw opportunity union

**Agent 44 | 30 October 2026 | Evidence: exact finite-deck combinatorics, independently exhaustively checked on a smaller physical deck. This is a resource-access calculation, not a native play, lock rate or matchup result.**

## New opening line and why the earlier hand requirement was too restrictive

The authenticated original **rank-8 Yusuke Kobayashi Absol/Garbodor 60** contains **one Secret Box, one Boost Shake, two Trubbish, two Garbodor, four Quick Ball, four Float Stone, one Muscle Band, and ten Basic Pokémon**. Secret Box discards three hand cards and searches an **Item**, **Tool**, **Supporter** and **Stadium**. Boost Shake is an **Item** that searches an Evolution Pokémon, evolves it even during the first turn or turn the Basic was put into play, and then ends that turn. These printed effects create three different resource-access patterns:

1. **Direct:** hold Boost Shake, Trubbish and a compatible Tool; keep a Garbodor outside the six Prizes, in the deck.
2. **Both Items held:** hold Secret Box and Boost Shake. Secret Box can find the Tool. If Trubbish has not been seen, its **Item** category can find Quick Ball, provided Trubbish remains in the deck and a Quick Ball is accessible in hand or deck.
3. **New route, Box fetches Shake:** hold Secret Box while Boost Shake is still in the deck; use Box's **Item** search to obtain Boost Shake and **Tool** search for Float Stone or Muscle Band if necessary. Trubbish must already be seen, **or Quick Ball must already be held** with an unprized searchable Trubbish in the deck. The Box's sole Item search cannot find both Boost Shake and Quick Ball.

A Garbodor must remain in the deck for all three routes. Compatible Tools here are **Float Stone (four) or Muscle Band (one)**. Forest Seal Stone is deliberately excluded because it is a uniquely valuable Tool with serious attachment and resource trade-offs. Its exclusion makes the opportunity count narrower than every conceivable Tool attachment.

## Exact model

Source and script: [authenticated original Top32 cards](../aichi-2026/full-decklists.json), [exact first-draw enumerator](../../scripts/rank8_secretbox_item_allocation.py), [independent physical-deal regression](../../tests/test_rank8_secretbox_item_allocation.py).

The disjoint deck categories are:

`(Secret Box 1, Boost Shake 1, Trubbish 2, Quick Ball 4, compatible Tool 5, Garbodor 2, other Basic 8, other 37)`.

Count every eight-card hand composition from an initial seven plus one normal draw. When exactly one Basic is among the eight, its physical position must be in the initial seven, giving the correct 7/8 opener-validity factor. Enumerate all six-Prize category compositions drawn from the other 52 cards; each possible deck search requires the relevant unprized target. This explicitly accounts for **multi-Prized collapse** among Shake, Trubbish, Quick Ball, Tool and Garbodor. The denominator conditions on having at least one Basic in the original seven. Six random Prizes are marginally independent of the next ordinary draw's identity after the opener, but do affect search availability.

| Necessary opening resource event, Basic-valid seven | Exact conditional probability |
| --- | ---: |
| Direct held Shake + Trubbish + Tool + Garbodor in deck | **1.6128976096%** |
| Both singleton Items held; Box searches Tool and potentially Quick Ball | **1.3134065538%** |
| **Box fetches unprized Shake** (Item search), with direct Trubbish or held Quick Ball | **5.4870582141%** |
| Within Box-fetch-Shake: Trubbish already seen | 2.9367456497% |
| Within Box-fetch-Shake: Quick Ball held, no Trubbish seen | 2.5503125644% |
| Direct ∩ Both-Items route overlap | **0.1468556783%** |
| **Union of all three route conditions** | **8.2665066992%** |

The Box-fetch-Shake and Both-Items events are disjoint because they require Shake absent versus present from the eight observed cards. The Box-fetch-Shake and Direct events are likewise disjoint. The Direct and Both-Items events overlap, so the union correctly subtracts that overlap once.

Exact rational union: `8929632158717/108021834175920`. Conditional start probability: `216911/292581 = 74.13707657%`. The union's unconditional first-seven probability is **6.1285464012%**. The new **5.487%** route exceeds the previous [1.374% both-singletons-held hand-only event](agent44-rank8-secretbox-flexible-core-ceiling-20261020.md), even while adding specific Tool, Trubbish/Quick Ball, Garbodor and Prize requirements. It is a structurally different search allocation: the Box supplies the otherwise-required singleton Shake.

### Checks and limits

The exact enumerator was run locally, and all **three regression tests passed**, including a separate exhaustive physical deal in a 12-card toy deck with an opening three, two Prizes and one next draw. A separate 350,000-shuffle labeled-card Monte Carlo, of which 259,433 openings were Basic-valid, estimated the combined event at approximately **8.31%**, consistent with the exact 8.2665% result. Monte Carlo is an independent sanity check, while the exact rational count is the reported estimate.

The event is only a **necessary-card availability super-event** for the intended first-turn Garbotoxin route. Secret Box requires three actual discards, and Quick Ball may require another. A player may need to retain strategically protected cards or decide that another search category use is stronger. The model assumes a free Bench position or an appropriate Active Trubbish, and no opponent interference before the relevant turn. It omits the effects of opponent mulligan bonus cards, all other search/draw, Item lock, turn order, attachment timing, remaining hand usefulness, K0/K1 deck information, native Store acceptance, subsequent opponent response, and full competitive play. Resource availability does **not** prove the engine executes the sequence legally or that the choice is strategically correct.

The previous sixteen-seed source policy had **zero triggers of its rigid original predicate**. This expanded exact model neither contradicts that observation nor converts it to winning games. It identifies why a conditional search policy that insists on simultaneously holding Shake, Box and Float Stone can miss a much larger class of plausible lines.

## Recommended next discriminating test

Under an unchanged original source 60 in the common **both-seat** original-Store runner, add an owner-information-safe candidate Item-search proposal: when Box is held, Shake is not held and is available in a legally opened owner deck search, choose Boost Shake as Box's Item if a Trubbish/Quick Ball/Tool line and discard-payment capacity are actually feasible. The owner must inspect the real prompted deck, apply three-card DCI costs, preserve Tool and Item search contention, observe native acceptance, actual first-turn Garbodor with Tool, subsequent opponent reply and all aborted/no-trigger deals. Compare against the existing branch on a preregistered cohort; retain all failures. Do not silently promote this route to competitive match success.

**Benchmark remains 29/32 authenticated Top32 original 60s, ranks 23/25/28 missing, zero competitively qualified games, and no demonstrated 99.5% win rate.**

## Repository CI confirmation

The existing manual-only Aichi opening-audit workflow [run 41145722496](https://github.com/FlareZ123/experiment-01/actions/runs/41145722496) **completed successfully** at head `fbe155ffbebf043c1eddb261f1d0ae8c52ca1068` (30 October 2026, 23:39 UTC). Both newly added workflow steps, **"Rank-8 Secret Box Item-to-Boost-Shake Prize-aware exact tests"** and **"Preserve ranked Secret Box Item allocation access fractions"**, were actually executed and marked **success**. They run the source-locked Python unittest and produce an exact-fraction text artifact. This is compilation-independent mathematical verification, with no native Store transitions or competitive outcomes.
