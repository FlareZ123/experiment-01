# Agent 46: Alolan Raichu Telescopic Sight preservation policy (unverified regression)

**17 October 2026. Evidence levels:** pinned upstream source inspection; published Aichi ranks 4 and 17; a previously archived six-game generic-bot diagnostic; new **untested** opt-in tactic and staged regression. **No game win-rate claims.**

## Source-backed reason to investigate

The source-locked [Aichi Top-32 manifest](full-decklists.json) shows one Telescopic Sight VIV 160 and two Alolan Raichu UNM 57 in each published rank-4 and rank-17 list. Rank 4 also includes U-Turn Board and Forest Seal Stone; rank 17 includes U-Turn Board. The source rank-4 [six-game diagnostic](agent47-rank4-raichu-policy-diagnostic.md) recorded the only sight being attached to Crobat V on turn 2 in two games, while the later Electro Rain attacker lacked it. That diagnostic is a limited bot observation, **not a paired counterfactual** demonstrating lost Prizes.

In pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts` filters the hand for Tools, picks **only the first Tool**, then tries free Pokémon targets and compares immediate state scores. The tactic has no explicit long-horizon reservation of a Tool for an evolving attacker. Separately, `telescopic-sight.ts` modifies attack damage when the attacker itself holds the Tool and a legal Benched V/GX target receives damage. Agent 46's [corrected Electro Rain reducer](../twinleaf/raichu-electro-rain-damage-semantics.md) is required for that damage interaction to be faithfully modeled.

## New research-owned counterfactual

[`raichu-sight-tool-tactic.cjs`](../../simulation/twinleaf/raichu-sight-tool-tactic.cjs) supplies an opt-in `RaichuSightAttachToolTactic` which replaces only the `AttachToolTactic` constructor **in copied policy options**. No vendor source or global shared tactic registry is modified.

- When Telescopic Sight is absent from the hand, it delegates to upstream.
- When Sight is present, an untooled Alolan Raichu UNM is established, **and the opponent currently has a Benched Pokémon V/GX eligible for the Tool's printed effect**, it selects that Raichu, prioritizing attached Energy-card count and then Active position.
- Before Raichu is established, or while no printed-eligible opponent Benched target exists, it reserves Sight rather than placing it on Crobat V or another support Pokémon.
- While Sight is reserved, it still evaluates a different Tool from the same hand using the upstream immediate state-scoring approach, preserving original hand order and card indices.
- Under an explicit `cannotPlayToolCards` player flag, it proposes no Tool play.

Inventory-only inspection of the 29 published Aichi lists identifies 25 lists containing at least one named Pokémon V-family or Pokémon-GX card; ranks **6, 7, 24 and 29** have no printed-name member of those target families. This only identifies **potential matchup applicability**. It neither establishes those Pokémon enter play nor that they occupy the Bench during an Electro Rain turn. Ranks 23, 25 and 28 lack source-complete lists.

The decision reads public board, the owner's hand and attached Energy-card counts. It does **not** inspect hidden deck/Prize partitions. It does not forecast future evolution, missing ACE SPEC access, expected Prize exchange, opposing gusts, Tools locks or all tactical uses of sight. Two attached Energy cards may supply different amounts of Lightning, so ranking **card count** is intentionally a simple preliminary policy.

## Verification status

[`raichu-sight-tool-policy-regression.cjs`](../../simulation/twinleaf/raichu-sight-tool-policy-regression.cjs) was added to the existing **manual-only** [Raichu regression workflow](../../.github/workflows/aichi-raichu-electro-rain.yml). Its intended assertions include: published singleton counts, no premature Crobat attachment, an Active Raichu dispatch, a Benched Raichu dispatch, explicit reservation without any eligible Benched opponent and the independent playability of U-Turn Board while Sight remains in hand. The code has **not** passed pinned-engine CI at the time of this report. A manual GitHub workflow dispatch was blocked by the connected tool's safety checks; it was not retried through another route.

Future work should run the already-committed manual regression through a permitted maintainer, repair any fixture/API mismatches, and run small paired source-deck trace comparisons under fixed seeds. For attribution, compare (a) pinned baseline, (b) corrected damage rules without Sight tactic and (c) corrected damage rules with Sight tactic, keeping Electrode corrections fixed. Measure Tool target, timing, actual Electro Rain targets, damage, legal alternative actions and any denied setup resources. Do not promote generic-bot outcomes to competitive win-rate evidence.

**Current disposition:** implementation hypothesis and reproducible test scaffold; not validated, not promoted to the benchmark recommendation.
