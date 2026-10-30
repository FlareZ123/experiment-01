# Agent 50: exact Aichi original-field Eri Item exposure bounds

**30 October 2026 | 29 authenticated original sixty-card lists | 0 competitively qualified games**

## Research question

Eri's current optional preattack owner action requires an opponent hand of at least five **publicly known card counts**. This arbitrary hand-size heuristic ignores opponent Item density. The printed Item count varies across different strategies, and Expanded Pokémon Tools are **not Item cards**, even older ones tagged with both `Item` and `Pokémon Tool` in the English database.

## Executable method

`simulation/evaluation/agent50-eri-item-hand-priors.cjs` joins actual `results/aichi-2026/full-decklists.json` entries against English printed set code/number/name in `resources/sets/en.json` and `resources/cards/en/*.json`. Strict exact matches are distinguished from name-uniform-across-printings fallback classifications. Contradictory or absent subtype records remain unclassified, contributing to **upper and lower** Item-copy counts rather than guessed values. Dual-tagged old Sword and Shield Pokémon Tools are counted as **Pokémon Tools**, never Items.

For each authenticated opponent original 60, define `K` as confirmed printed Item copies, `U` as unclassified Trainer copies. Given a *hypothetical uniformly random untouched five-card sample* from that original deck, the number `I` of Items has:

`p0 = C(60-K,5)/C(60,5)`

`p1 = K*C(60-K,4)/C(60,5)`

`P(at least one Item) = 1-p0`

`P(at least two Items) = 1-p0-p1`

`E[max eligible discards capped at 2] = 2-2*p0-p1`.

Repeat at `K+U` to bound the unresolved card-subtype uncertainty. The program prints one machine-readable `ERI_FIELD_ITEM_PRIOR` record for all 29 ranks, including fallback counts and unresolved cards.

## Caveats

This is a **printed-card-density baseline**. Actual hands during gameplay are not five uniform cards from an untouched deck: the player sets Prize cards, starts with seven, draws, searches, benches, plays Items, evolves and responds to locks. A 5-card prior cannot establish actual conditional Item exposure, whether a given Item is strategically harmful, or whether using Eri is better than attacking or another Supporter. The common Eri model still needs native complete-game same-deal OFF/ON comparisons with owner information safety, real source replies and strict engine-failure accounting.

## Reproducibility

- Executable: `simulation/evaluation/agent50-eri-item-hand-priors.cjs`
- Pure tests: `tests/agent50-eri-item-hand-priors.test.cjs`
- [Manual canonical analysis run 41147301525](https://github.com/FlareZ123/experiment-01/actions/runs/41147301525) passed its classification step and pure tests on a prior checkout. That checkout predates the explicit dual-tag Forest Seal Stone correction. A new head-inclusive confirmation is required before treating the 29 numerical rows as final.
- Genuine pinned Store test: `tests/agent50-eri-revealed-item-prompt.native.test.cjs` includes a separate two-seat case demanding that the old Item-header Forest Seal Stone SIT Tool remain in the opponent's physical hand after Eri.

The missing original Top32 ranks **23, 25, 28** remain missing and are not imputed.
