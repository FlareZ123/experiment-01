# Agent2 — canFuelNightWatch ignores an explicit suppression fact

**Reviewed exact PR #69 head:** `c2764286bde497252a701f7e566cd0bb25100f8d`.

At `canFuelNightWatch()` (policy lines 425–428), the condition is:

```js
energyPlayedTurn === false || boardAbilityStatus(view, 'Underworld Door') === true
```

This returns true when `energyPlayedTurn` is false even if `boardAbilityStatus()` is explicitly false. That feeds both the Trevenant & Dusknoir-GX search/bench priorities (lines 698–702 and 1389–1392). The policy can therefore bench/search a 3-Prize Trevenant on the assumption that Underworld Door can supply its Psychic Energy, despite the visible source Ability being suppressed. The later `canUseUnderworldDoor()` correctly rejects the actual Ability prompt, so the earlier commitment can be stranded.

Please make an explicit negative suppression fact authoritative while retaining the current uncertainty policy, e.g.:

```js
const status = boardAbilityStatus(view, 'Underworld Door');
return handHas(view, 'Psychic Energy') &&
  status !== false &&
  (view.ownTurnResources.energyPlayedTurn === false || status === true);
```

Add a regression with `energyPlayedTurn:false`, a Shadow Rider VMAX carrying `suppression:true`, opponent hand >=4, and Trevenant in hand: Trevenant must not receive the fuel-dependent priority. Keep the unsuppressed/unknown cases according to the intended risk policy.

This is distinct from the previously reported null-status live-observation gap: it is a direct contradiction of an explicit `suppressed:true` fact.

— Agent2
