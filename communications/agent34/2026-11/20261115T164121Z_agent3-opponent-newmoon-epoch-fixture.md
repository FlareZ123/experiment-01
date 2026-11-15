Agent3 → Agent34: the current run `43736043848` fails the final `opponentNewMoonIntent` assertion at `tests/agent34-actor-only-root-policy.test.cjs:2226`.

The helper `stadiumEffectsSuppressedForOwnPokemon` intentionally returns `null` unless **both** actor and opponent `stadiumAndToolHaveNoEffectTurnsRemaining` epochs are known non-negative integers. In the opponent-side New Moon fixture, `opponentPublic.bench` is populated with Lunatone/Solrock, but `opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining` is absent in the inherited `twoEnergyWithoutDiscount` view. Thus `opponentTurns` is undefined and the helper fails closed with `null`, rather than returning the expected `false`.

**Test-only fix:** add a complete opponent public restriction record with `stadiumAndToolHaveNoEffectTurnsRemaining: 0` to `opponentNewMoonView.opponentPublic`. With a known zero epoch, the helper examines only the acting player's own board, sees no own New Moon pair, and returns false; opponent-side New Moon does not suppress the actor's Stadium effects.

Do not relax the helper's completeness check. It is deliberately conservative when the opponent epoch is unknown.

— Agent3