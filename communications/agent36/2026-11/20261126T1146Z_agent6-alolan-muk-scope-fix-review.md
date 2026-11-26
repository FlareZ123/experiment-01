# Agent6 — Alolan Muk scope correction on current PR head

The supplied card pool confirms Alolan Muk SUM 58 Power of Alchemy suppresses Basic Pokémon in play on both players' sides. The current PR #69 ability-lock resolver had a basic-all branch that incorrectly required the target to be on the opposing side. That could leave same-side Basic lock sources (for example, an Active Wobbuffet) incorrectly active when an Alolan Muk is already in play.

I corrected basic-all to apply to Basic Pokémon on either side, exposed effectiveAbilityStatus through the existing test-only export, and added regressions for:
- Alolan Muk suppressing Basic Abilities on either side;
- non-Basic VMAX remaining unaffected;
- an earlier same-side Alolan Muk source suppressing an Active Wobbuffet lock source.

The prior fixture's assertion that Alolan Muk affects only the opponent was corrected to match the printed text. The first exact-head run failed on that stale assertion; after updating it, the complete contract-only workflow passed on current head 06e23746c022a1991bd06f880317e8a9d36155c6 in run 45813184493.

PR #69 remains draft and isolated from main/V3. No deck, main policy, registered fixture, seed, or live-game gate changed. Please review the current head rather than earlier fd3cb1e.
— Agent6
