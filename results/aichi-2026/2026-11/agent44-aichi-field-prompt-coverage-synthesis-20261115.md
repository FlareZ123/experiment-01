# Confirmed Aichi field prompt-coverage blockers: cross-rank synthesis

**Agent44 · 15 November 2026 · static inventory, not a complete 32-deck audit**

## Executive finding

The current V3 host/worker path is not yet capable of playing several distinct Aichi opponents. The problem is broader than one missing prompt class: the field includes native prompt families requiring multi-assignment, energy-discard, damage-transfer, and numeric damage-allocation decisions, while the inspected host projection and frozen role policies cover only a narrower subset.

This synthesis consolidates three detailed source audits:

- [Ranks 4/9/17 — Electrode-GX and Alolan Raichu](agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md)
- [Rank31 — Dusknoir Chimecho, Field Blower, and Hood counterline](agent44-rank31-dusknoir-field-prompt-and-hood-counterline-20261115.md)
- [Ranks 26/31 — MoveDamagePrompt cross-layer protocol/policy gate](../twinleaf/2026-11/agent44-v3-move-damage-cross-layer-protocol-policy-gate-20261115.md)

## Confirmed field-to-prompt map

| Aichi rank(s) | Exact field source(s) | Native prompt(s) | Current failure mode |
|---|---|---|---|
| 1 / candidate Shadow Rider | Shadow Rider Calyrex VMAX — Underworld Door | AttachEnergyPrompt, one assignment | Host has a source-specific projection but its raw `{to,card}` result conflicts with pinned `{to,index}` decoder; frozen policies lack the action/prompt handler |
| 4, 9, 17 | Electrode-GX CES 48 — Extra Energy Bomb | AttachEnergyPrompt, 0–5 assignments from discard | Host rejects non-Underworld source/shape; protocol lacks multi-assignment energy-attachment |
| 4, 9, 17 | Electrode-GX CES 48 — Crash and Burn-GX | DiscardEnergyPrompt, `{from,index}[]` | No host projection, protocol type or role-policy handler; pinned callback appears to overcount damage as `30+50n²` |
| 4, 17 | Alolan Raichu UNM 57 — Electro Rain | ChooseCardsPrompt then PutDamagePrompt, numeric allocation | ChooseCards is projected; PutDamage is unsupported; protocol has no damage-allocation decision |
| 26 | Damage Pump LOR 156 | MoveDamagePrompt | No host projection, protocol type or role-policy handler |
| 31 | Dusknoir BCR 63 — Sinister Hand | MoveDamagePrompt | No host projection, protocol type or role-policy handler |
| 31 | Radiant Alakazam SIT 59 — Painful Spoons | MoveDamagePrompt, max 2, single destination | Same hard gap; pinned source also has a TOP_PLAYER/BOTTOM_PLAYER maxAllowedDamage mismatch |
| 31 | Dusknoir PRE 37 — Cursed Blast | ChoosePokemonPrompt, min 1/max 1 | Host can project; frozen opponent policy returns `UNCLASSIFIED_POKEMON_PROMPT` |
| 31 | Field Blower GRI 125 | SelectOptionPrompt and ChoosePokemonPrompt | Host can project; frozen policy rejects Stadium/tool mode or chooses an empty selection in tools-only mode |

Ranks 4, 9, 17, 26 and 31 are five separate matchup rows. Ranks 4 and 17 share an archetype label but are not interchangeable evidence.

## Cross-layer schema requirements

The missing prompt families are not interchangeable generic lists:

- **Energy attachment:** one item in Underworld Door can be represented by a single complete assignment; Electrode-GX Extra Energy Bomb can return up to five `{to,index}` assignments from discard and needs a bounded assignment-list decision.
- **Energy discard:** DiscardEnergyPrompt returns unique `{from,index}` selections from attached Energy on specific Pokémon. It needs source/slot/index-aware multi-selection.
- **Damage transfer:** MoveDamagePrompt returns `DamageTransfer[]`; repeated identical source/destination pairs are valid native UI output. A one-token-per-distinct-pair representation loses valid results.
- **Damage allocation:** PutDamagePrompt returns `DamageMap[]` with a numeric amount per target. The policy must allocate a fixed total budget in damageMultiple increments and respect per-target caps. Token-only selection is insufficient.
- **Generic Pokémon/option choices:** host projection exists for ChoosePokemonPrompt and SelectOptionPrompt, but policy handling must be effect-aware. The current Field Blower empty-selection path is a silent strategic no-op.

The existing v1 policy freeze means these are not implementation authorizations. A future lift should be explicit, versioned, and cover both candidate and opponent roles. Agent10's proposed Underworld Door-only lift does not authorize Electrode-GX, MoveDamage, PutDamage, DiscardEnergy, Cursed Blast, or Field Blower policy work.

## Engine-semantic discrepancies requiring research-owned tests/hooks

Three independent source discrepancies are already visible in the pinned Twinleaf revision:

1. **Electrode-GX Crash and Burn-GX:** the callback adds `50 * transfers.length` once per transfer, apparently producing `30+50n²` instead of `30+50n`.
2. **Electrode-GX Extra Energy Bomb:** the zero-transfer branch shuffles the deck and self-KOs; the post-loop code self-KOs again. This needs an exact printed-text/rules test.
3. **Radiant Alakazam Painful Spoons:** the prompt targets TOP_PLAYER but its maxAllowedDamage map is built from BOTTOM_PLAYER. The pinned UI treats missing entries as no cap; the pinned SimpleBot resolver filters out targets with no matching entry.

Do not patch the upstream submodule. Validate these with targeted pinned regressions and use research-owned adapter hooks if confirmed.

## Minimum gate before field games

1. Build a prompt-source inventory from each exact opponent deck, not just a prompt-class allowlist.
2. Require every encountered prompt to have an exact pinned decoder shape, public metadata contract, native validation path, and actor-only policy decision.
3. Test for silent legal no-ops as well as thrown unsupported-prompt errors.
4. Test both seats, relative player mapping, blocked targets, repeated selections, numeric budgets, and source/target visibility.
5. Keep every opponent list separate and require a competent opponent policy. The current rank1 Shadow Rider policy is not a field-general opponent policy.
6. Resolve engine discrepancies through tests/hooks before using affected games as strength evidence.
7. Respect the existing Critic stopline: no new policy branches, protocol/runner/workflow changes, or fixture dispatch without explicit authorization.

## Evidence status

- **Direct field facts:** exact list counts/printings from `results/aichi-2026/full-decklists.json`.
- **Direct source facts:** prompt constructors, options, decoder contracts and callbacks from pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Direct branch facts:** inspected host projection and frozen policy code at Agent49 branch head `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`.
- **Static conclusions:** confirmed prompt coverage failures and source-code discrepancies.
- **Not established:** runtime matchup outcomes, frequency of the effects, candidate win rates, or any 99.5% performance.
- **No implementation:** no upstream code, adapter, policy, deck, workflow, or fixture was modified or dispatched.


### Additional confirmed ranks 3, 8, 19 and 22

A further pinned-source scan expands the confirmed subset:

- **Rank 3 — Articuno-GX CES 31:** Legendary Ascent uses MoveEnergyPrompt with source/destination Pokémon and source Energy indices; the host/protocol have no energy-movement handler.
- **Ranks 8, 19, 22 and 26 — Tapu Koko Prism Star TEU 51:** Dance of the Ancients uses AttachEnergyPrompt from discard, min 1/max 2, Bench-only, with `differentTargets:true`. The Underworld Door-only host path rejects it; the protocol lacks multi-assignment energy-attachment.
- **Rank 19 — Raging Bolt ex TEF 123:** Bellowing Thunder uses DiscardEnergyPrompt through the pinned `DISCARD_UP_TO_X_ENERGY_FROM_YOUR_POKEMON` prefab, filtered to Basic Energy. The host/protocol have no energy-discard handler.

Detailed evidence: `agent44-ranks3-8-19-22-26-energy-prompt-audit-20261115.md`.

The confirmed field subset now includes ranks **3, 4, 8, 9, 17, 19, 22, 26 and 31**. This remains a partial audit, not a claim that every prompt in all 29 exact source lists has been inventoried.


### Additional confirmed rank5 source

- **Rank 5 — Mew Genesect:** Mew V FST113 Energy Mix uses AttachEnergyPrompt from the player's deck, Active/Bench, any Energy, min0/max1, with all non-Fusion Strike Pokémon blocked. This is a fourth distinct AttachEnergyPrompt contract and is rejected by the Underworld Door-only host projection.

Detailed evidence: `agent44-rank5-mew-v-energy-mix-prompt-audit-20261115.md`.

The confirmed subset now includes ranks **3, 4, 5, 8, 9, 17, 19, 22, 26 and 31**; this is still not an exhaustive 29-list/32-rank audit.


### Recheck on Agent49's rebased worker branch

Agent49 rebased at `f9792b7a95cfdeb50d9711193edbc3b3831d0bd6` around 04:00 UTC. The relevant host projection and protocol were rechecked on that head: AttachEnergyPrompt remains Underworld Door-only; MoveEnergyPrompt, DiscardEnergyPrompt, PutDamagePrompt and MoveDamagePrompt remain unprojected/unrepresented. The rank1 opponent policy still lacks Cursed Blast handling; Field Blower's tools-only min-0 ChoosePokemon path still selects empty, and its Stadium/tool SelectOption remains unsupported. The policy does have a later Field Blower ChooseCards/card-combination scorer; the failure is specifically the initial target and mode decisions.

The rebased branch is 11 commits ahead / 12 behind current main at this recheck; do not use the earlier 119-behind figure from Agent35's 03:46 snapshot.
