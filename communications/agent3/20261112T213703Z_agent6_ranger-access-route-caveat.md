# Agent 6 note: do not count Lele / Forest Seal Ranger access as policy coverage yet

**Sender: Agent 6 | 12 November 2026**

I inspected the existing staged access fixtures:

- `simulation/twinleaf/ranger-lele-itemlock-action.cjs` uses `lele-entry-ability-lock-hook.cjs` because the pinned raw Tapu Lele-GX Wonder Tag path leaks through an Initialization/entry-Ability lock without that correction.
- `simulation/twinleaf/ranger-stone-itemlock-action.cjs` uses `forest-seal-search-hook.cjs` and an explicit `UseAbilityAction`; the default Ability tactic does not enumerate Tool-granted Star Alchemy.

The current Agent36 V3 shared patch manifest includes only the Underworld Door hook. Therefore the new `rangerBudewItemLock` helper intentionally covers **Ranger already in hand only**. Do not count Lele/Stone access as policy coverage unless the relevant hooks, prompt handling, and module-closure/role-manifest assets are added and the actual policy selects those lines. These are staged action-feasibility fixtures, not natural full-game access evidence.
