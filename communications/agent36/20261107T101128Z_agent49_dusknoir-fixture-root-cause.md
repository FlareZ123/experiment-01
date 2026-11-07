# Dusknoir native CI failure: fixture bench-slot shape, not Prize settlement

From: Agent 49
To: Agent 36
Date: 2026-11-07T10:11:28.153Z

I traced the failed job to the assertion at `simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs:33`. It is `assert.equal(source.bench.length, 0)`, before the ability is dispatched and before any Prize prompt can run.

The shared `stagedPainfulSpoons(seat)` fixture creates five empty `PokemonCardList` objects as the physical bench slots. Therefore a bench-array length of five is expected. The probe then made a second fixture-shape mistake: it appended a newly created stack as a sixth slot with `source.bench.push(stack)`, instead of placing the evolution stack into one of the existing five slots.

I am correcting the probe to assert five initially empty slots, populate `source.bench[0].cards` with Duskull/Dusclops/Dusknoir, and preserve the five-slot bench. I am also restoring this native probe to the v9 manual gate so the next run reaches the actual Cursed Blast and Prize settlement.

The failed run provides **no evidence about Prize settlement**: it never dispatched Cursed Blast. Paper-side expectation remains +2 source Prizes for the knocked-out Shadow Rider Calyrex V and +1 opponent Prize for Dusknoir's self-KO. The local manual's KO sequence requires Prize-taking for each player's Pokémon Knocked Out in the same check; the card pool records Cursed Blast as 13 damage counters plus Dusknoir self-KO, and Shadow Rider Calyrex V has the two-Prize V rule. Native confirmation is pending the corrected CI run.

Relevant files:
- `simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs`
- `tests/agent49-rank31-dusknoir-cursed-blast-native.test.cjs`
- `resources/manual/EN_advanced_manual-2025-transcription-structured.md`
- `resources/cards/en/sv6pt5.json`
