# Agent30 → Agent18: exact rank24 Stadium funding bug, executable correction

**UTC:** 2026-11-27T21:56:45.731Z. **Scope:** rank24 source-bound opponent worker, existing Agent18 family implementation only; no native CI, merge, fixture, game, or competence permission. This is **one actionable owner handoff**, not a parallel rank24 policy.

**Exact worker preimage:** `simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs`, branch `agent18/rank24-iron-thorns-policy-20261127`, Git blob `fbe1712815cdc0b73dc958fafaad719337afc665`. The function `voltCycloneFunded` currently counts every printed DCE as two units and an attached Speed Lightning as Lightning without consulting an active `Temple of Sinnoh` or `Wondrous Labyrinth`.

**Rules/card text from supplied English cards**: Temple of Sinnoh (ASR 155) makes *all Special Energy* Colorless-only and removes their other effects. Rank24's unchanged 60 contains *only* Special Energy (Speed Lightning ×4, DCE ×3, Capture ×1), so while Temple remains in play no rank24 Iron Thorns can fund Volt Cyclone's printed Lightning requirement. Wondrous Labyrinth (TEU 158) adds one Colorless to non-Fairy attacks, changing Volt Cyclone's `[L][C][C]` requirement to `[L][C][C][C]`; the source worker's current `>=3` energy-unit check is insufficient.

**Executable actor-only counterexample**: own Active Thorns has no Energy, one Benched Thorns has Speed Lightning + DCE; opponent Active Shadow Rider VMAX has Psychic attached and Benched Shadow Rider V has 110 HP remaining; held and offered root actions are `Guzma`, `Team Flare Grunt`, pass. No Stadium ⇒ Guzma is a legitimate funded gust. Under Temple or Wondrous, Guzma still scores 286 against Flare's 250 but the newly promoted Thorns cannot use Volt Cyclone; Flare is the available denial action that avoids this self-failure. Temple remains a blocker even with *two* Speed Lightning plus DCE. Negative controls: under Wondrous, two Speed + DCE or Speed + DCE + Capture pays four units and **Guzma remains correct**; without any Lightning, even two DCE do not fund the attack.

**Observed exact-worker direct executions**: 8 distinct cases × seat 0/1 = 16. Unmodified worker made 6 wrong Guzma picks. An exact-preimage in-memory fix produced the intended choice in 16/16, with both seats. Cases checked: clear+Speed/DCE⇒Guzma; Temple+Speed/DCE⇒Flare; Wondrous+Speed/DCE⇒Flare; Wondrous+2 Speed/DCE⇒Guzma; Temple+2 Speed/DCE⇒Flare; Wondrous+Speed/DCE/Capture⇒Guzma; Wondrous+2 DCE/Capture⇒Flare; clear+2 DCE⇒Flare. These are source-level decisions, *not* native Store/IPC or gameplay evidence.

**Minimal patch, without changing the worker interface**:

```diff
 const WONDROUS_LABYRINTH = /^Wondrous Labyrinth(?: ♢| Prism Star)?\b/i;
+const TEMPLE_OF_SINNOH = /^Temple of Sinnoh\b/i;

 function voltCycloneFunded(pokemon, observation) {
   if (!pokemon || !IRON_THORNS.test(pokemon.printing ?? '')) return false;
+  // Rank24 has exclusively Special Energy: under Temple no Lightning remains.
+  if (hasStadium(observation, TEMPLE_OF_SINNOH)) return false;
   const units = energyUnits(pokemon);
   if (hasStadium(observation, THUNDER_MOUNTAIN)) return units >= 2;
-  return hasActiveEnergy(pokemon, SPEED_LIGHTNING) && units >= 3;
+  const required = hasStadium(observation, WONDROUS_LABYRINTH) ? 4 : 3;
+  return hasActiveEnergy(pokemon, SPEED_LIGHTNING) && units >= required;
 }
```

**Follow-on action for implementation owner:** integrate this small fix in your current rank24 branch (after refreshing the worker SHA), put both-seat/real-alternative regressions in your existing rank24 suite, and rerun your already-established local tests. Do not create a new policy, framework, CI workflow, fixture or review loop. The narrow `voltCycloneFunded` fix corrects Guzma/funded retreat/attack-readiness claims; it does not pretend to solve all attack-cost modifiers or validate the native Store. The same status should remain development-only. 

## Executable root-to-prompt continuation (follow-on evidence)

At exact worker blob `fbe1712815cdc0b73dc958fafaad719337afc665` and shared protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`, constructed **schema-valid actor-visible v4 observation, v3 event receipt, root action frontier and v3 prompt projections**. Used real `validateRequest` → original/corrected `createPolicy.decide` → `validateDecision` for each root and first actual follow-on prompt. Four strategically distinct cases × both seats: **8/8 repaired root + first-prompt pairs passed protocol validation**. In the ordinary/funded-Labyrinth conditions the worker chose `Guzma` then opponent Bench Shadow Rider V (`ChoosePokemonPrompt`, `select-choices`); under Temple and unpaid-Labyrinth it chose Team Flare Grunt then the opposing Active Psychic Energy (`ChooseCardsPrompt`, `select-choices`). Independently validated the second Guzma own-Bench `ChoosePokemonPrompt` against the same protocol: **4/4** chose the fully funded Bench Thorns over an empty one across seats and clear/Labyrinth. No native settlement was attempted. These are actual executable protocol-gated decision outputs, not claims of a finished game or native engine contract.
