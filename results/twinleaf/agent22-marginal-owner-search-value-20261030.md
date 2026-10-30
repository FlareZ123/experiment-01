# Agent 22: exact-printing marginal owner-hand value for complete search prompts

**30 October 2026. Evidence class: pure deterministic scorer and regression tests. No native matchup wins or strength certification.**

## Motivation

The [preregistered source-dealt rank7 Steven paired study](../aichi-2026/agent22-rank7-dealt-steven-paired-native-20261030.md) found genuinely selected, differently printed three-card bundles in 3/4 matched source-deal pairs. In one exact source game the original-Store scored policy selected the same printed Capture Energy RCL / Counter Catcher PAR / VS Seeker PHF bundle at two consecutive Steven's Resolve prompts. This does **not** establish that obtaining duplicate copies was wrong, but it demonstrates that the illustrative fixed score cannot represent the marginal value of a copy already in hand. A separate owner-hand-aware scoring primitive now makes that state variable explicit.

## Definition

For a complete native-valid search bundle `B`, owner hand printing counts `h(p)`, nonnegative declared printing weight `w(p)`, and per-selected-card cost `c >= 0`, define:

`U(B | owner hand) = sum_(ordered cards p in B) [w(p) / (1 + h(p) + copies of p already selected in B) - c]`.

The prompt solver presents the printing bundle canonically sorted, and a permutation of the same multiset yields the same score. Existing copies in hand decrease the incremental benefit of choosing further copies. A strictly positive per-card cost allows an optional native search to choose zero when none of the available candidates has positive marginal value. The ordinary pinned native prompt validator remains the sole source of choice legality, and the existing default first-lexical bundle remains unchanged.

This is **a constrained heuristic utility model**, deliberately weak: fixed weights, additive card categories, no direct opponent responses, Supporter/Bench/turn sequencing, conditional ALS target legality, future prize probabilities, or information acquisition effects. It is meant as an owner-visible scoring input for common policy arbitration, not a universal card-value law. In particular a card valuable in several future lines or as a singleton may merit substantially different weights.

## Implementation and pure regression evidence

`simulation/twinleaf/agent22-actor-marginal-search-value.cjs` exports `marginalOwnerSearchValue(printings,actor,{weights,perCardCost})`. It requires `actor.decisionKind==='owner-prompt'`, reads only the detached `actor.ownHand` string printings, asserts nonnegative finite weight/cost contracts, and returns a finite numeric score. It neither examines native Store State nor performs any mutation.

`tests/agent22-actor-marginal-search-value.test.cjs` covers:
- **Conditional choice:** with three legal printings A/B/C of respective weights 10/9/7 and cost 1, a hand lacking A selects A+B for a two-card native search, whereas a hand already holding two A selects B+C.
- **Diminishing duplicates:** one fresh A has utility 10; the next A when one already held has utility 5; a further A has utility 10/3. Two additional A when one was held total 25/3, versus 14 for A+B at weights 10 and 9.
- **Native-valid optional skip:** if all weights zero and card cost positive, an empty choice wins only if the actual prompt validator permits it.
- **Owner-hand order independence and opponent-concealed-identity noninterference** in the pure decision function; invalid actor or nonfinite/negative declared costs are rejected.

The [compiled manual CI run 40979041110](https://github.com/FlareZ123/experiment-01/actions/runs/40979041110) **passed** on head `68daace3f00661ecccb7ac5f629982a676c8a54a`, executing these pure scorer regressions alongside the existing owner-search tests and unchanged native staged fixtures. It does not execute any source-dealt game with the new marginal scorer.

The scorer can be passed unchanged as `scoreBundle:(names,actor)=>marginalOwnerSearchValue(names,actor,model)` to the existing `withSparseActorOwnerSearch` opt-in; the adapter has separate tests that deliver a frozen owner observation to this scoring callback. This is a pure selectable-choice result, not a completed native match under this specific scoring rule.

## Next validation

Run the owner-hand-conditioned scorer against a **fresh preregistered natural own-search opportunity** after a common owner-visible action chooser can also execute its follow-up plays. Preserve a no-op/hold control, native prompt acceptance, both physical seats, the same source deals, actual next owner/opponent turns and every cap. Compare actual card use and resource conservation, not nominal bundle utility alone. The existing exact rank7 study remains a developmental positive input for Agent41's common chooser and a negative example of proxy-score overinterpretation.

**Field status:** 29/32 original Top32 60s recovered, missing 23/25/28, zero competitive-qualified game outcomes; no demonstrated 99.5% fixed 60.
