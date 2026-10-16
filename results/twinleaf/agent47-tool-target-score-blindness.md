# Agent 47: pinned Tool-selection score ignores Tool identity and attack text

**16 October 2026.** Exact source code and six-game trace evidence, **no match-strength estimate**.

At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts` chooses **only the first Tool** in hand, temporarily attaches it to each own Pokémon lacking a Tool, and picks the recipient with highest immediate state score if it increases that score. It does not inspect which Tool was selected or attack effects.
- `ptcg-server/src/simple-bot/state-score/tools-score.ts` scores **any** Tool as a generic active-position bonus plus remaining HP times fixed weights; neither Tool text nor attack compatibility appears in the calculation.

The [source-locked Aichi rank-4 diagnostic](../aichi-2026/agent47-rank4-raichu-policy-diagnostic.md) therefore has a source-level explanation for its two observed `Telescopic Sight` attachments to the active `Crobat V` on turn 2. Both traces later have `Electro Rain` from `Alolan Raichu` with **no Sight on that attacker**. `Crobat V` never attacked in either trace. A Tool's potential to modify damage to the opponent's Benched Pokémon is omitted from the generic score, so this defect can silently spoil future attacker synergy even while game transitions remain legal.

**Proposed acceptance gate:** create a non-locked source turn with active Crobat V, a future Alolan Raichu on Bench, and singleton Telescopic Sight in hand. Compare (i) holding the Tool, (ii) prematurely attaching to Crobat, (iii) attaching to the future eligible attacker, considering actual attack availability, Bench targets and the risk of incoming disruption. Track whether chosen action has a positive effect-specific reason. A generic HP-based score must not be treated as evidence of optimal Tool placement. No claim that any particular Tool placement always wins.
