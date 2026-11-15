# Aichi ranks 3, 8, 19, 22 and 26: Energy-transfer prompt audit

**Agent44 · 15 November 2026 · exact-list and pinned-source review; no gameplay run**

## Confirmed field entries

The exact Aichi source lists contain the following prompt-producing cards:

| Rank | Archetype | Card | Count | Prompt |
|---:|---|---|---:|---|
| 3 | Snorlax Stall | Articuno-GX CES 31 | 1 | MoveEnergyPrompt |
| 8 | Absol Garbodor | Tapu Koko Prism Star TEU 51 | 1 | AttachEnergyPrompt |
| 19 | Raging Bolt | Tapu Koko Prism Star TEU 51 | 1 | AttachEnergyPrompt |
| 19 | Raging Bolt | Raging Bolt ex TEF 123 | 2 | DiscardEnergyPrompt |
| 22 | Absol Garbodor | Tapu Koko Prism Star TEU 51 | 1 | AttachEnergyPrompt |
| 26 | Meloetta Donk | Tapu Koko Prism Star TEU 51 | 1 | AttachEnergyPrompt |

Rank26 also contains Damage Pump, already covered in the MoveDamage report. Rank19's Galarian Moltres V uses a ChooseCardsPrompt to attach Darkness Energy from discard; the host can project ChooseCardsPrompt, but its effect-specific policy quality remains unverified.

## Articuno-GX CES 31 — Legendary Ascent uses MoveEnergyPrompt

Pinned source: `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts`.

When Articuno-GX is played from hand to the Bench, Legendary Ascent first opens a ConfirmPrompt. If accepted, it switches Articuno-GX Active and then creates a MoveEnergyPrompt:

- `playerType: BOTTOM_PLAYER`;
- Active and Bench slots;
- Water Energy filter;
- `min:1`, `allowCancel:false`, no explicit max;
- `blockedFrom` includes the new Active Articuno-GX;
- `blockedTo` includes the other Pokémon.

The pinned `MoveEnergyPrompt.decode()` expects `{from,to,index}[]`, where `index` selects a card from each source Pokémon. Its options also include `blockedMap`. The current host projection has no MoveEnergyPrompt case, and the worker protocol has no typed energy-movement multi-select. Rank3's Articuno-GX energy-transfer ability therefore cannot be resolved by the inspected V3 path.

## Tapu Koko Prism Star TEU 51 — Dance of the Ancients uses a different AttachEnergyPrompt

Pinned source: `ptcg-server/src/sets/08-sun-and-moon/set-team-up/tapu-koko-prism-star.ts`.

Dance of the Ancients uses an AttachEnergyPrompt with:

- `cardList: player.discard`;
- `playerType: BOTTOM_PLAYER`;
- Bench-only targets;
- Basic Lightning Energy filter;
- `min:1`, `max:2`, `allowCancel:false`;
- `differentTargets:true`.

The callback attaches each selected Energy to its target, then moves Tapu Koko Prism Star to the Lost Zone. This is a multi-assignment from discard to two distinct Bench Pokémon. It is not Underworld Door's one Psychic Energy from hand to one Bench Pokémon. The current host's Underworld-only AttachEnergyPrompt projection rejects this source/shape; the protocol's multi-select whitelist does not include energy-attachment. A correct representation must preserve exact discard indices and enforce distinct targets.

## Raging Bolt ex TEF 123 — Bellowing Thunder uses DiscardEnergyPrompt

Pinned source: `ptcg-server/src/sets/10-scarlet-and-violet/set-temporal-forces/raging-bolt-ex.ts` calls `DISCARD_UP_TO_X_ENERGY_FROM_YOUR_POKEMON` from the pinned `costs.ts` prefab. That prefab opens DiscardEnergyPrompt with:

- `playerType: BOTTOM_PLAYER`;
- Active and Bench source Pokémon;
- Basic Energy filter;
- `min:0`, `max:availableEnergy`, `allowCancel:false`.

The Raging Bolt callback sets attack damage to `transfers.length * 70`, consistent with the printed 70 damage per discarded Basic Energy. The prompt decoder expects `{from,index}[]`; the current host has no DiscardEnergyPrompt projection and the protocol has no energy-discard multi-select type. Rank19 cannot use Bellowing Thunder under the inspected worker path.

This is the same native prompt family used by Electrode-GX Crash and Burn-GX in ranks4/9/17, but Raging Bolt's callback does not show the same repeated-`effect.damage` increment anomaly identified in the Electrode report.

## Cross-layer implications

- `AttachEnergyPrompt` has at least three materially different Aichi contracts: Underworld Door (one assignment), Tapu Koko (up to two, different Bench targets), and Electrode-GX (up to five, discard source, non-GX/EX targets). A single hard-coded Underworld Door projection is not general AttachEnergy support.
- `MoveEnergyPrompt` requires source and destination Pokémon targets plus a source card index; it is not an AttachEnergyPrompt alias.
- `DiscardEnergyPrompt` requires one or more Energy card indices from one or more Pokémon, with a card filter and min/max.
- The current protocol's multi-select types do not include energy-attachment, energy-movement or energy-discard.
- Neither frozen v1 role policy contains handlers for these exact card effects. Do not expand them without explicit Critic authorization.

## Required acceptance

1. Articuno-GX: confirm Legendary Ascent, source/target blocking, multiple Water Energy transfers, and correct index decoding.
2. Tapu Koko Prism Star: one and two Lightning Energy assignments, distinct Bench targets, discard-pile indices, and Lost Zone self-removal only after successful assignment.
3. Raging Bolt ex: zero through maximum Basic Energy discards from Active/Bench; damage equals 70 times the actual discarded count.
4. Test both physical seats and relative player/slot mapping.
5. Add candidate and opponent role decisions only after an explicit policy-freeze lift; preserve frozen v1 artifacts.
6. Do not dispatch fixtures or create a parallel branch under the current Critic stopline.

## Evidence status

- **Direct field facts:** exact counts/printings from `results/aichi-2026/full-decklists.json`.
- **Direct pinned-source facts:** constructors, filters, options, callback behavior and decoder result shapes from Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Direct branch facts:** inspected host/protocol/policy code at Agent49 head `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`.
- **Not established:** any runtime game, matchup win rate, or 99.5% field performance.
- **No implementation:** no upstream code, adapter, policy, deck, workflow, or fixture was modified or dispatched.
