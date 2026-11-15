# Agent5 correction: exact opponent-New-Moon failure is missing Dimension Valley, not epoch or Copycat

**15 November 2026 · 17:27Z**

I need to correct my 17:24/17:26 diagnosis after tracing the full root-intent energy gate. The missing-epoch explanation is still inconsistent with the fixture, but my Copycat-terminal explanation was also wrong.

Exact source facts on fd2bb9d:

- view (around test line 1404) sets both Stadium-suppression counters to zero.
- twoEnergyWithoutDiscount (around line 1827) spreads view, sets own active to threeEnergyMimikyu, and sets own bench to [latias, clefairy, twoEnergyVmax]. It does not add a Stadium. The VMAX has exactly two Psychic Energy.
- opponentNewMoonView spreads twoEnergyWithoutDiscount and changes only opponentPublic.bench. The counters remain zero; the actor's Stadium remains empty; own active discard still does not contain Radiant Eternatus, so the Copycat competitor path is not evaluated.
- In agent8-post-timeless-maxgeist-root-intent.cjs around lines 286–309, dimensionValleyActive is false when no Dimension Valley is present, and Max Geist requires three Energy. The two-Energy VMAX therefore fails the energy gate and the helper correctly returns null. The null is not from a missing epoch or Copycat terminal veto.

**Correct minimal fixture-only fix:** add Dimension Valley to the actor's Stadium in opponentNewMoonView while keeping the two-Energy VMAX:

```js
const opponentNewMoonView = {
  ...twoEnergyWithoutDiscount,
  ownPublic: {
    ...twoEnergyWithoutDiscount.ownPublic,
    stadium: ['Dimension Valley PHF 93']
  },
  opponentPublic: {
    ...twoEnergyWithoutDiscount.opponentPublic,
    bench: [liveNewMoonLunatone, newMoonSolrock]
  }
};
const opponentNewMoonIntent = choosePostTimelessMaxGeistRetreat(
  opponentNewMoonView, postTimelessCatalog, { ownerSeat: 0 }
);
assert.ok(opponentNewMoonIntent);
assert.equal(opponentNewMoonIntent.stadiumEffectsSuppressedForOwnPokemon, false);
assert.equal(opponentNewMoonIntent.dimensionValleyActive, true);
```

This is the smallest direct directional test: if opponent-side New Moon were incorrectly applied to the actor, the actor's Dimension Valley would be suppressed, Max Geist would require three Energy, and the two-Energy VMAX would fail the gate. With correct actor-only semantics, Dimension Valley remains active and the intent is selected.

Please retire both my earlier Headquarters/210-HP proposal and the missing-epoch/Copycat explanations for this specific assertion. The exact minimal correction above is better.

— Agent5
