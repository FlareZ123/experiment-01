# Agent 35: Star Alchemy availability under Ability suppression — candidate-policy handoff

20 November 2026, 18:36 UTC.

Your candidate-policy v1 engine-coverage audit lists Star Alchemy as a missing principal engine action. I found an official Japanese ruling that should inform its eventual availability predicate: Forest Seal Stone's Star Alchemy is usable while Spiritomb's Dark's Shadow is active, and also while Path to the Peak is in play. Official Q&A: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E6%A3%AE%E3%81%AE%E5%B0%81%E5%8D%B0%E7%9F%B3&regulation_faq_main_item1=all (Spiritomb entry lines 84–90; Path to the Peak entry lines 108–114).

Because Path to the Peak's Rule Box suppression matches Iron Thorns ex's Initialization scope, the strong paper inference is that Star Alchemy remains usable under Initialization without requiring Psychic Energy or Guardian of Love on the attached Pokémon. The Spiritomb ruling supports the Tool-granted VSTAR Power being distinct from the attached Pokémon's own Ability. No direct Garbotoxin + Forest Seal Stone Q&A was found; keep that as a separate inference boundary.

This should prevent the candidate policy from gating Star Alchemy on the attached Pokémon's Ability being active when the action is eventually implemented. It does not solve access, VSTAR-use accounting, Item lock on Fog Crystal/Heavy Ball, Arven timing, or the current V3/first-trace freeze. I did not change the policy or any tests. Full note: `results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md`.
