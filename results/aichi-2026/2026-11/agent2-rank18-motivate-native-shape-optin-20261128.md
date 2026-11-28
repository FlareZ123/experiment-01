# Original Aichi rank18 — Motivate exact pinned-native discard-to-Bench projection

**Agent 2, 2026-11-28, 13:54 UTC.** New source-specific headless adapter and policy opt-in; **no pinned Store witness, CI, authorized game, matchup, or qualified performance**.

## Source and the previous executable gap

The authentic rank18 source 60 contains **Squawkabilly ex PAL169** with *Motivate*: a one-Colorless attack dealing 20 and attaching **up to two Basic Energy from the owner's discard to one of their Benched Pokémon**. Rank18 does not contain Crispin or Battle Compressor, so attack-mediated acceleration is potentially relevant. The previous rank18 worker knew Squawk's first-turn discard/draw Ability but rejected the Motivate attack and had no host projector for its continuation.

Read the *actual pinned engine source* at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, path `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/squawkabilly-ex.ts`. The PAL169 `reduceEffect` on *Motivate* creates `AttachEnergyPrompt` **only if** actor has a Bench Pokémon and Basic Energy in discard, with:

- `cardList === player.discard`, `playerType=BOTTOM_PLAYER`, slots `[BENCH]`, filter `{superType:ENERGY, energyType:BASIC}`;
- `{allowCancel:false, min:0, max:2, sameTarget:true}`; selection **zero** is allowed because it is an attack and the effect says up to two;
- raw `AttachEnergyPrompt` transfer is `{to:{player,slot,index},index:<discard index>}`. Pinned `AttachEnergyPrompt.decode` resolves those indices to cards; `validate` checks min/max and same-target.

The repo's shared `agent36-prompt-projection.cjs` intentionally allows `AttachEnergyPrompt` only from **Shadow Rider Underworld Door**, which is an actor-hand to Psychic-Bench prompt and **cannot** safely be generalized to discard-to-any-Bench. We leave that trusted shared projector unchanged.

## Implementation

Added `simulation/evaluation/2026-11/agent2-rank18-motivate-projection.cjs`, commit [8cf9826](https://github.com/FlareZ123/experiment-01/commit/8cf982600f48819b94a51398af948f07d6b1009c). It is **opt-in** and never changes the default host routing. `projectMotivatePrompt` delegates non-Squawk `AttachEnergyPrompt` to the shared projector. For this exact source it verifies:

- unresolved prompt belongs to the real physical actor seat, prompt perspective and source card instance is their **Active** original PAL169, source is an authenticated `card-effect` with *Motivate*;
- actor-owned **discard** CardList reference, exact pinned prompt class/message/filter and all option flags, Basic Energy source names and actual EnergyCard subtype, owner-visible occupied Regidrago SIT135/SIT136 Bench target;
- no opponent discard, no foreign card or Basic/Special energy confusion, no invalid source collector number, no target beyond actual occupied Bench.

It enumerates at most two **distinct source-owned Basic Grass/Fire** cards, scores their marginal **Grass/Grass/Fire funding** on an actual Benched Regidrago V or VSTAR, respecting Temple of Sinnoh's removal of Double Dragon's colored effects. It favors immediately ready VSTAR states, never splits energy among multiple Bench targets, and returns `[]` when no useful legal Regidrago allocation exists. The one chosen exact native transfer list is validated via the existing `validateRawPromptResult` decode/validate boundary and exposed to the policy as **one opaque `energy-attachment` token**. Worker never sees discard indices or raw recipient objects.

Added explicit `motivateProjection:'complete-choice-token-v1'` opt-in (default `disabled`) to original rank18 worker `simulation/evaluation/2026-11/agent2-rank18-regidrago-opponent-policy.cjs`, [3518bf1](https://github.com/FlareZ123/experiment-01/commit/3518bf1d6d166546cd168034822d04228e676ec6). Only then may a genuinely offered root *Motivate* action score positive. The corresponding `AttachEnergyPrompt` handling requires the exact source, owner, zone, count, Bench recipient and single composite token; disabled/forged paths abstain. All other cards continue their prior bounded paths. The hook uses a narrow source-specific code path and **does not modify Twinleaf/vendor**.

## Regression/evidence boundary

Added `tests/2026-11/agent2-rank18-motivate-projection.test.cjs`, [a0b580c](https://github.com/FlareZ123/experiment-01/commit/a0b580c5c1db5ab10de42743b44e4b49191aab36) and [6dcafcf](https://github.com/FlareZ123/experiment-01/commit/6dcafcfd387462d50a598745fdbee7bf3a4d9225). Direct V8 in-process test imports the actual adapter/worker and strict protocol with a fake pinned-shape `AttachEnergyPrompt`, EnergyCard class, owner physical seats and `decode/validate` contract. **11/11 groups, 136 assertions, both seats pass**. Tests demonstrate source identity, exact min0/max2, native-form raw transfer of two complementary Basic energy to one occupied Bench VSTAR, one-energy and zero-energy transfers, target selection, Temple under same DDE case, forged foreign owner/source/filters/options/phase negative paths, default-off root Motivate and full strict prompt/decision validation. Test injection supplies `makeSource` and `validateRawPromptResult`; it does **not** compile actual pinned Store or execute its real `ResolvePromptAction`.

Important gaps: the shared host does not call the new opt-in projector until a human-approved source-specific dispatch explicitly wires it; no native `Store` event or Clone-of-Store continuation has been demonstrated; native Basic Energy `fullName`, active source provenance and all prompt object shapes still need a first real owner-authorized no-game receipt; no field games or matchup outcomes qualify. Keep `motivateProjection` disabled by default and reject promotion to admitted opponent-policy competence before this has been observed. If the pinned source shape differs at runtime, fail closed rather than silently relaxing checks.

## Addendum — authoritative attached Energy zone (14:10 UTC)

The pinned `PokemonCardList` source has a dedicated `slot.energies.cards` CardList for attached Energy; its `slot.cards` can also hold the evolution stack and auxiliary references. The first Motivate source-specific scorer enumerated `slot.cards` instead of the canonical `slot.energies.cards`. Corrected [a00efaa](https://github.com/FlareZ123/experiment-01/commit/a00efaa59e1fbddd7cf03e0ebd5a03d7dfc6b3d9), asserting the canonical zone is present and using only it to calculate G/G/F after attachment. Regression [6e83751](https://github.com/FlareZ123/experiment-01/commit/6e83751f0a38a1f46674902d733dca15d07b6e1f) specifically creates a native-shaped board where its composite card stack is temporarily missing the two already attached Grass energy but its canonical `energies.cards` is correct; the scorer chooses one Fire instead of double-attaching. Latest **12/12 V8 synthetic groups, 148 assertions**, still no real Store witness.
