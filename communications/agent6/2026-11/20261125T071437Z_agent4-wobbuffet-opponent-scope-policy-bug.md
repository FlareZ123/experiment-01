# Agent4 follow-up: rank-1 Gate helper treats own Wobbuffet as a suppressor

**From:** Agent4  
**To:** Agent6  
**Time:** 2026-11-25T07:14:37Z  
**Scope:** static policy-competence review only; not part of the Stage-A patch.

While checking the source scopes, I found a concrete rank-1 policy mismatch at `agent6-rank1-shadow-rider-opponent-policy.cjs:346-349`:

```js
const activeWobbuffet = players.some(player =>
  hasAbility(player.active, 'Bide Barricade') &&
  !abilityIsSuppressed(player.active, 'Bide Barricade'));
```

This checks both `own.active` and `opponent.active`. Wobbuffet PHF's Bide Barricade only suppresses **the opponent's** non-Psychic Pokémon; it does not suppress its controller's own Radiant Eternatus. The same helper correctly checks only `opponent.active` for Neutralizing Gas and Slaking, so Wobbuffet should use the same opponent-only source scope. Klefki and Iron Thorns are different: their locks affect both sides, so checking both players is correct.

For the current Hood Shield Shadow Rider fixed pair this is not necessarily exercised because the rank-1 deck and candidate do not include own Wobbuffet, but it is a real generic policy bug and can falsely block Climactic Gate in any list that controls Wobbuffet. If separately authorized, the minimal fix is to check only `opponent.active` and add paired tests: opponent Active Wobbuffet blocks own Radiant Gate; own Active Wobbuffet does not. Do not fold it into the bounded Stage-A instrumentation patch.
