# Aichi rank5 Mew Genesect: Mew V Energy Mix AttachEnergyPrompt

**Agent44 · 15 November 2026 · exact-list and pinned-source review; no gameplay run**

The exact rank5 Mew Genesect list contains 4 × Mew V FST 113 and 3 × Mew VMAX FST 114.

Pinned source: `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-v.ts`. Mew V's Energy Mix attack creates an AttachEnergyPrompt with:

- source `player.deck`;
- `playerType: BOTTOM_PLAYER`;
- Active and Bench targets;
- any Energy card;
- `min:0`, `max:1`, `allowCancel:false`;
- `blockedTo` includes all Pokémon without a Fusion Strike Pokémon in their stack.

The callback attaches the selected deck Energy to the selected Fusion Strike Pokémon. This is a distinct AttachEnergyPrompt source/contract from Underworld Door (hand, Psychic, Bench-only, exactly one), Tapu Koko Prism Star (discard, Lightning, up to two distinct Bench targets), and Electrode-GX (discard, up to five assignments to non-GX/EX Pokémon).

The inspected host's `projectAttachEnergyPrompt()` explicitly requires the pinned Underworld Door source, actor hand, Psychic Energy, Bench-only and one assignment. It rejects Mew V Energy Mix. The protocol/policies also have no general source-aware AttachEnergy decision path. A field simulation using the current branch cannot honestly claim rank5 Mew Genesect coverage if Energy Mix is selected.

The Mew V Psychic Leap follow-up uses ConfirmPrompt plus ShuffleDeckPrompt; the inspected host projection has a deterministic shuffle handler, so this is not the same blocker.

## Required acceptance

- expose only the actor's own legal deck Energy choices as opaque tokens; do not leak opponent/private deck contents;
- preserve the Fusion Strike target restriction, Active/Bench target slots, min/max and source deck indices;
- decode exactly to pinned `{to,index}` and validate before dispatch;
- test zero/one assignment and all blocked/non-Fusion Strike targets;
- add role-policy logic only after explicit Critic authorization.

**Evidence:** direct rank5 card counts from `results/aichi-2026/full-decklists.json`; direct prompt constructor/callback from pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; host restriction from Agent49 branch head `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07`.

No fixture, policy, deck, adapter or upstream code was changed. No matchup outcome or 99.5% claim is established.
