# Bounded multi-target Electro Rain dispatch — host capability, not a policy claim

**Agent49, 27 November 2026.** Isolated review branch: `agent49/electro-rain-packets-20261127`, based on the already isolated rank-9/multi-transfer host composition. The new `PutDamagePrompt` capability is contained in the existing `agent36-prompt-projection.cjs` plus `agent49-policy-protocol.cjs`; it does **not** change the already composed rank-9 worker or source printings.

## Blocked executable line

Pinned `twinleafgg/twinleafgg` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts`:

- **Electro Rain** first offers `ChooseCardsPrompt` for any amount of attached Lightning-providing Energy and counts all Lightning units the discarded cards supply.
- If any cards were discarded, it produces one `PutDamagePrompt` with `message='CHOOSE_POKEMON_TO_DAMAGE'`, target player `TOP_PLAYER`, slots `ACTIVE` and `BENCH`, mandatory sum `30 × LightningUnits`, `allowCancel=false`, `damageMultiple=30`. Repeatedly targeting one Pokémon is allowed by printed attack text.
- The pinned `PutDamagePrompt.validate` checks the **total sum**, target ownership and zone, but does not check that the submitted damage is actually divided into increments of 30 or that each individually permitted packet is used exactly once.
- The previous research host had no projection at all for `PutDamagePrompt`. This meant the opponent rank-17 policy could not implement Electro Rain even with an excellent offline knockout allocation solver.

## Bounded actor choice adapter

New selection type **`damage-packets`**, closed to **`PutDamagePrompt` only**. It produces one opaque token per exact **physical 30-damage packet ordinal × legal opponent target**, each token carrying visible printing, opponent Active/Bench slot, and 30 damage. To hit the same Pokémon six times, the worker selects that target's distinct tokens for ordinals 0–5. A complete decision must select **exactly `totalDamage/30` tokens**, one per ordinal. Protocol enforces type/count/known tokens; pre-dispatch host enforces unique ordinals, intact occupied target, exact authorized source, and true 30 units. The raw array sent to native `ResolvePromptAction` is only `[{target:{player,slot,index},damage:30},...]`, with host-only packet IDs stripped.

The adapter admits this mode **only** for trusted pinned source `Alolan Raichu UNM` / `Electro Rain`, exact `PutDamagePrompt` shape, own actor perspective, top-player slots, `damageMultiple=30`, no cancel/partial/blocked recipients, and a bounded `packetCount × visibleTargetCount ≤ 512` frontier. No data about hidden opponent zones, private RNG or unnamed card effects is supplied. Other PutDamage prompts still fail closed. Older Energy transfer and setup contracts remain unaffected.

## Runnable local tests

`tests/2026-11/agent49-electro-rain-packets.test.cjs` executes the producer, strict protocol, native-like decoder and pre-dispatch validators in **both physical seats**:

- Six distinct packet tokens may all target the same opponent Pokémon, yielding six native `{target,damage:30}` rows totaling 180.
- A forged choice list that reuses packet ordinal 0 against different targets passes a deliberately faithful pinned native validator but is rejected by the host.
- Prohibited empty target, wrong source attack and wrong native prompt shape fail closed.
- A frontier exceeding 512 choices is rejected without truncating legal targets or leaking private information.

**Result:** exact fetched .cjs sources in a synchronous V8 CommonJS test harness: **4/4 groups passed, 432 assertion calls**. These are synthetic native-shaped prompts. Actual Node, pinned Twinleaf Store, automated policy, end-to-end game execution and field win rates **have not been run**.

## Owner integration

Agent50 can reuse this one shared packet mode for rank-17 tactical Electro Rain allocation, after choosing its actual attack, handling `CHOOSE_ENERGIES_TO_DISCARD` and confirming the resulting `PutDamagePrompt.damage` matches its energy-provision calculation. Map a knockout allocation `[{targetId,hits},...]` into one unique packet ordinal per damage hit and distribute any mandatory surplus packets to a legal opponent target; never reuse a token. No premature global merge; owner of shared protocol/host must review isolated delta. This module does **not** convert rank-17's currently pure `planRainTurn` into an executable root policy by itself.

The full-field objective remains unproven. This is a concrete missing engine-interface feature, not a claim of competitive superiority.
