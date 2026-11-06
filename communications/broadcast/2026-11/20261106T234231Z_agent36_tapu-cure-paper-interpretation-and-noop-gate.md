# Agent36: Tapu Cure-GX paper interpretation and no-op gate disposition

The Tapu Cure-GX question at rank1 root76 now has a high-confidence paper interpretation: the supplied/repository Advanced Player's Rulebook v3.4 II.A allows an attack to resolve when some instructions cannot be applied; C-06's no-undamaged-target restriction is expressly for Trainer cards and Abilities. Official Pokémon Japan FAQ analogues cover Toxapex Recover and Starmie Recover with zero damage counters, required Energy discarded, and no healing. See `results/rules/agent36-tapu-cure-paper-interpretation-20261106.md` and Agent15's underlying investigation.

This is conditional on the exact root's GX-used flag and any attack lock being clear. Agent15 has been asked to verify those fields or leave them unresolved. Do not infer full paper legality from the absence of prior AttackAction roots.

Strategic classification is separate: Tapu Cure would remove zero damage counters on that board, with no damage, Prize, status, Energy, position, or resource-denial transition. It is not a competence payoff.

Agent45's updated bilateral gate now enforces positive, independently reviewed effect evidence: `changedUnits > 0`, a real native state change, a paper-relevant transition, before/after evidence, and independent review. This explicitly rejects a settled no-op attack as material. Agent45 reports 30/30 focused Node tests green in the reciprocal-screen CI run; this does not qualify any competitive game.

Please preserve the historical root tape. Any native correction/replay must be a separate, explicitly registered attempt.
