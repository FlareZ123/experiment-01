# Correction: rank1 Underworld Door per-card marker is correctly scoped; recipient filtering requires investigation

**Agent8 | 31 October 2026 | corrected source audit.**

## Explicit retraction of the initial hypothesis

An earlier version of this file claimed that the pinned Shadow Rider Calyrex VMAX CRE75 `Underworld Door` Ability used a player-wide marker. **That claim was incorrect.** Inspection of the complete pinned `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts` shows the actual gate is:

`player.marker.hasMarker(this.UNDERWORLD_DOOR_MARKER, this)`

The `this` source card is present, and `card-marker.ts::hasMarker(name,source)` correctly restricts the check to the particular VMAX instance. `addMarker(name,this)` and `removeMarker(name,this)` likewise preserve per-copy use. The official Advanced Rulebook E-12 allows separate once-per-turn uses for different Pokémon, and **this pinned marker implementation complies**. Do not construct, promote, or implement a “multicopy marker repair” based on the retracted interpretation.

The new test `tests/agent8-underworld-door-second-vmax-pinned-native.test.cjs` was committed **before this correction**, with a **wrong expectation** that the second VMAX should be rejected. That test must be corrected to expect two distinct, fully resolved native successful actions and should not be treated as a valid gate until amended and executed. Its initial purpose was diagnostic, and it has not run in CI.

## Remaining plausible recipient-filter issue, separate from marker scope

In the **same complete pinned source**, the `Underworld Door` code constructs a list of blocked Bench indices using:

```ts
player.bench.forEach((card, index) => {
  if (card instanceof PokemonCard && pokemonHasCardType(card, CardType.PSYCHIC)) {
    blocked.push(index);
  }
});
```

The `player.bench` entries are `PokemonCardList` objects, so the `instanceof PokemonCard` guard is false. The resulting `blocked` array is empty. Furthermore, the positive type check as written would block Psychic recipients if it were applied to a Pokémon card, the opposite of the printed restriction. Pinned `AttachEnergyPrompt.validate` checks energy selection and target repetition but does **not** inspect the target's Pokémon type. Thus the source strongly suggests a player may erroneously attach a Basic Psychic Energy via Underworld Door to a **non-Psychic Benched Pokémon**, contrary to the source CRE75 printed Ability.

This is a **source-derived suspicion, not yet native-reproduced**; the actual native Store dispatch/attachment reducer must be tested before claiming observed illegal game behavior. A genuine two-seat test with a Psychic VMAX source, Colorless Bunnelby recipient, Psychic hand Energy and prompt validation is the next gate. Fixes belong in research-owned adapter compatibility hooks, with no in-place vendor changes.

## Research significance

Rank1 original Aichi deck has four Shadow Rider Calyrex VMAX and uses energy acceleration. Accurate Underworld Door recipient filtering matters in lock matchups and off-type support lines; a false positive can distort tactical access and tournament simulated outcomes. The earlier report did not measure any completed game, and this correction makes no performance claim.

**Benchmark:** 29/32 exact original opponent 60s, 0 competitively qualified games, 99.5% unproven.
