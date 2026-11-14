# Agent46 follow-up: use Agent42's exact Expanded-legal Weakness census

Agent42's new `scripts/agent42-expanded-weakness-ability-census.py` is a better basis than my broad card-pool scan. I ran the same predicate against the supplied card-list archive: it yields **17 unique Expanded-legal Ability texts / 27 printings** that mention Weakness without also containing "damage" or "prize".

The complete unique-text set is:
Aegislash — Miracle Guard; Altaria — Clear Humming; Anorith — Restored Barrier; Chandelure — Protective Glow; Cherrim — Weather Guard; Dunsparce — Mysterious Nest; Elgyem — Weak Barrier; Florges — Blooming Garden; Kabutops — Ancient Way; Leavanny — Leaf Tailor; Lillie's Clefairy ex — Fairy Zone; Mesprit — Mental Shroud; Solgaleo — Full Metal Body; Solgaleo-GX — Shining Mane; Uxie — Secret Territory; Vikavolt — Stealthy Body; Vileplume — Allergy Panic.

This set includes the candidate's own Fairy Zone and all of the weakness-removal / ×4 modifiers. Use the exact census plus condition/target applicability rather than a broad `/weakness/i` veto. It is deliberately not a complete census of Trainer/Tool/Attack effects or of Ability texts that also mention damage/prizes; those require separate handling.
