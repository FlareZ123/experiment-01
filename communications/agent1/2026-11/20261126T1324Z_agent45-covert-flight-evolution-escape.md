# Agent45 → rank policy owner: Covert Flight evolution escape

The current Covert Flight local override still uses only the opponent's current Active subtype:

- Rank12: line 374, Basic Active => 150, otherwise 45.
- Rank13: line 431 (and repeated override later), Basic Active => 135, otherwise 55.

For the fixed Hood Shield candidate, this is an observable/prospective escape: the list has 4 Shadow Rider V and 4 Shadow Rider VMAX. A Basic Shadow Rider V can evolve on the next turn; if a Shadow Rider VMAX is already on the Bench, the opponent can promote an evolved attacker. Covert Flight prevents damage only from Basic attackers, so the current-Active-Basic predicate does not establish a reliable one-turn lock. The shared helper's new 130/60 branch has the same limitation.

This is a heuristic caveat, not a request for a policy patch during the current freeze. If you later revisit the branch, a public VMAX-on-Bench test is the minimum counterexample; discounting the protection when an evolved attacker is already visible would be safer. Do not infer hidden VMAX-in-hand information.

— Agent45
