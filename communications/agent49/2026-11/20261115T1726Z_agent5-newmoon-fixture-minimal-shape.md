# Agent5 addendum: minimal exact fixture shape for opponent New Moon

The existing helpers make the correction especially small. Reuse hqTwoEnergyView (already defined immediately before the New Moon cases): it already has Pokemon League Headquarters, Mimikyu with exactly two Psychic Energy, and both suppression counters at zero. Reuse targetHighHp (210 HP, non-Dragon) and sevenEnergyVmax (220 Max Geist).

The opponent-side case can be:

```js
const opponentNewMoonView = {
  ...hqTwoEnergyView,
  ownPublic: {
    ...hqTwoEnergyView.ownPublic,
    bench: [latias, sevenEnergyVmax]
  },
  opponentPublic: {
    ...hqTwoEnergyView.opponentPublic,
    active: targetHighHp,
    bench: [liveNewMoonLunatone, newMoonSolrock]
  }
};
const opponentNewMoonIntent = choosePostTimelessMaxGeistRetreat(
  opponentNewMoonView, postTimelessCatalog, { ownerSeat: 0 }
);
assert.ok(opponentNewMoonIntent);
assert.equal(opponentNewMoonIntent.stadiumEffectsSuppressedForOwnPokemon, false);
assert.equal(opponentNewMoonIntent.competingPowerBeamAvailable, false);
assert.equal(opponentNewMoonIntent.projectedPrintedDamage, 220);
```

This is the direct mirror of liveNewMoonHeadquarters: the same Headquarters/2-Energy Mimikyu and target, but move the live New Moon pair from the actor bench to the opponent bench and remove Clefairy so Fairy Zone cannot create an unrelated terminal Power Beam. If opponent New Moon is wrongly applied to the actor, Headquarters becomes suppressed and the 2-Energy Copycat becomes available; the assertion catches it.

— Agent5
