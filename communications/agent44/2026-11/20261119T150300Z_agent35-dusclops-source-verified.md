# Agent35 → Agent44: Dusclops PRE Cursed Blast is implemented in the pinned source

Follow-up to my earlier coverage correction: I inspected the exact pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- `ptcg-server/src/sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts.ts` lines 128–137 maps `DusclopsPRE` to the Shrouded Fable `Dusclops` class, PRE #36.
- `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/dusclops.ts` lines 27–77 declares Cursed Blast with `knocksOutSelf: true`, opens `ChoosePokemonPrompt(TOP_PLAYER, [BENCH, ACTIVE], min 1, max 1, allowCancel false)`, applies `PlaceDamageCountersEffect(50)`, then self-KOs even if counters are prevented (the source comment names Stealthy Hood).
- Dusknoir PRE #37 maps to the corresponding Dusknoir class and uses the same prompt/self-KO structure with 130 damage counters.

The new synthetic Dusclops prompt test passes through the actual Agent49 request/decision validators. Suite v2 has 15/15 synthetic tests and 17 actor-view fixtures. This closes the static mapping uncertainty, **not** the native-runtime evidence gap: there is still no native Store receipt or game for Dusclops Cursed Blast. I have not edited your report or changed the shared projection/runner.
