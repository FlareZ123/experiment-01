# Stage-A deferred UseAbilityAction source matrix

**Author:** Agent12  
**Date:** 2026-11-23  
**Status:** source-level diagnostic; no run-367 source attribution  
**Twinleaf pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Reviewed research adapter head:** `a10855bdd25b261373f38588fba4b9fd6422abad`

## Question

Which activated Pokémon/Tool powers can produce the Stage-A fixture's deferred `UseAbilityAction → WaitPrompt` failure, and what native conditions distinguish them?

## Inputs and method

The Stage-A registration is `agent6-v3-rank1-baseline-20261117-a` (candidate policy `agent46-hood-candidate-v1`, opponent policy `agent6-rank1-shadow-rider-opponent-v1`, Twinleaf pin above). I compared the candidate inventory in `results/aichi-2026/candidate-hood-shadow-rider.json` with rank 1 in `results/aichi-2026/full-decklists.json`, then inspected the corresponding card reducers at the pinned Twinleaf commit.

The reviewed research adapter `simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs` adds attached Tool powers to the native ActionEnumerator and enumerates every in-play Pokémon power with `useWhenInPlay`. It does not perform card-specific precondition checks before proposing these actions. The adapter is invoked by `agent36-v3-runner.cjs` and the resulting actions are dispatched/validated through the cloned native Store.

The pinned `usePower` generator in `ptcg-server/src/game/store/effect-reducers/game-effect.ts:477-499` first yields an Ability-animation `WaitPrompt` and invokes the actual `PowerEffect` only in the WaitPrompt continuation. Therefore a root `UseAbilityAction` dispatch can succeed while its first WaitPrompt later throws a native `GameError`.

## Activated sources in the registered fixture decks

Both fixed lists contain Shadow Rider Calyrex VMAX, Forest Seal Stone, and Marshadow UNB 81. These provide three real activated UseAbilityAction sources:

| Source | Pinned reducer and deferred condition | Expected native outcome |
|---|---|---|
| Forest Seal Stone — Star Alchemy | `set-silver-tempest/forest-seal-stone.ts:82-86`: if `player.usedVSTAR` is already true, throw; otherwise set it true before opening ChooseCards/ShuffleDeck prompts. | A second VSTAR use reaches the deferred PowerEffect and throws `LABEL_VSTAR_USED` (16 chars). |
| Shadow Rider Calyrex VMAX — Underworld Door | `set-chilling-reign/shadow-rider-calyrex-vmax.ts:71-86,108-126`: requires an occupied Bench and Basic Psychic Energy in hand before checking the source-specific player marker; the marker is added after a successful AttachEnergyPrompt continuation and removed at EndTurn. The research-owned hook additionally requires an eligible Psychic Bench (`simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs:64-72`). | Missing early resources / eligible Psychic Bench throws `CANNOT_USE_POWER` (16 chars); a repeated same-source use that reaches the marker guard throws `POWER_ALREADY_USED` (18 chars). |
| Marshadow — Resetting Hole | `set-unbroken-bonds/marshadow.ts:23-28,56-76`: `useWhenInPlay=true`; the PowerEffect throws if no Stadium is in play, if Marshadow is Active, or if it is not on the Bench. | Invalid active/Bench/Stadium state throws `CANNOT_USE_POWER` (16 chars) in the same deferred WaitPrompt continuation. |

The Marshadow source is important: it is present in **both** fixture decks and is an actual activated power, not a passive/on-play trigger. Thus the earlier Forest Seal Stone / Underworld Door pair is not an exhaustive source set unless the sanitized trace establishes that Marshadow was not the selected source.

Other Pokémon abilities in these lists do not add another active UseAbilityAction source in the inspected reducers: Lillie's Clefairy ex Fairy Zone and Latias ex Skyliner are passive; Tapu Lele-GX Wonder Tag and Radiant Eternatus Climactic Gate are on-play triggers. The remaining listed Pokémon do not contribute another `useWhenInPlay` power.

## Error-length interpretation

- `CANNOT_USE_POWER` = 16 characters.
- `LABEL_VSTAR_USED` = 16 characters.
- `POWER_ALREADY_USED` = 18 characters.

Consequently the sanitized 16-character run-367 error is consistent with a deferred `CANNOT_USE_POWER` (which could come from Underworld Door **or** Marshadow) or `LABEL_VSTAR_USED` from Forest Seal Stone. It cannot itself be the Underworld source-marker error `POWER_ALREADY_USED`, assuming the reported length is exact. The two-VMAX marker regression remains necessary to prove cloned source-marker identity and prevent repeated Door actions from being offered, but it is a separate legality invariant rather than a direct match for the observed 16-character error.

## Discriminating tests

The common one-WaitPrompt cloned-Store probe should be used for every `USE_ABILITY_ACTION`:

1. Create a detached native Simulator/Store from the current state.
2. Dispatch the candidate `UseAbilityAction` on the clone.
3. If it produces the pinned Ability-animation WaitPrompt, dispatch exactly one `ResolvePromptAction(waitPrompt.id, null)` on that cloned Store.
4. Catch only allowlisted native `GameError` values using the existing action-family classifier.
5. Stop immediately at the first subsequent effect prompt; never auto-resolve ChooseCardsPrompt, AttachEnergyPrompt, or a real card choice.
6. Run both frontier construction and selected-action revalidation inside the existing deterministic validation RNG scope; assert the full live Store graph, prompt-group IDs, continuation queue, and live callback count are unchanged.

The runner already loads `WaitPrompt` and `ResolvePromptAction`, and wraps frontier construction and selected-action clone validation in `withValidationRandom`; no new workflow, host binding, or vendor patch is required. Pinned Store handles `ResolvePromptAction` before the generic ACTION_IN_PROGRESS guard (`store.ts:95-119`).

Required real pinned-Store coverage:

- **Forest Seal Stone:** one legal use resolves its animation WaitPrompt into the real ChooseCards/ShuffleDeck sequence; fully settle it, then prove a second use is filtered or the deferred `LABEL_VSTAR_USED` is caught. Include an unspent positive control.
- **Underworld Door:** use and settle Door from two distinct real Shadow Rider VMAX sources. For each source, test a repeated action on an independent clone. Preserve at least one eligible Psychic Bench and a third Basic Psychic Energy in hand after the two initial attachments, so the marker guard—not resource exhaustion or the hook's no-Psychic-Bench guard—is decisive. Assert each cloned marker's `source` is identical to the corresponding cloned VMAX object. The repeated source must be excluded or reject with `POWER_ALREADY_USED`.
- **Marshadow Resetting Hole:** positive control with Marshadow on Bench and a Stadium in play; deferred-negative with Marshadow on Bench and no Stadium; deferred-negative with Marshadow Active and a Stadium. Resolve exactly one animation WaitPrompt and assert the negative `CANNOT_USE_POWER` is caught without mutating the live Store.

These tests are diagnostic requirements, not claims that any of the three sources caused run 367.

## Limitations and current status

The sanitized run-367 artifact redacts the selected ability/source. This matrix does not attribute the failure. No fixture, test, workflow, policy, deck, seed, seat, registration, or Twinleaf revision was changed by this investigation. No game or matchup result was added; there is no selected final fixed 60 or demonstrated 99.5% win rate.

The implementation owner remains Agent6 and the focused reviewer remains Agent4. See the [third-source broadcast](../../../communications/broadcast/2026-11/20261123T2337Z_agent12-third-active-ability-marshadow.md) and the direct handoff messages in their mailboxes.
