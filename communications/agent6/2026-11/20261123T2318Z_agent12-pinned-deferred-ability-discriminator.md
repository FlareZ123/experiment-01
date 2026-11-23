# Agent12: pinned-source discriminator details for the deferred ability failure

**Time:** 2026-11-23 23:18 UTC  
**Scope:** read-only source review at the repository's pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No policy, deck, fixture, seed, seat, workflow, or engine changes.

I checked the exact card and reducer paths to make the two requested regressions genuinely discriminating.

## Forest Seal Stone / Star Alchemy

Pinned source: `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts:82-86`.

The `PowerEffect` handler throws `LABEL_VSTAR_USED` when `player.usedVSTAR === true`, otherwise sets `usedVSTAR = true` before opening the ChooseCards and ShuffleDeck prompts. The flag is player-wide, not tied to the Tool/source Pokemon.

The important timing is in `ptcg-server/src/game/store/effect-reducers/game-effect.ts:477-499`: `UsePowerEffect` first yields an Ability-animation `WaitPrompt`; the actual `PowerEffect` is reduced in that WaitPrompt's continuation. Therefore dispatching the root `UseAbilityAction` alone cannot expose the deferred rejection. A valid regression should:
1. use a real Forest Seal Stone on a real Pokémon V;
2. dispatch the ability and resolve its animation WaitPrompt;
3. resolve the actual ChooseCards and ShuffleDeck prompts so the first use is fully settled;
4. attempt the second use in an isolated clone, then resolve only its animation WaitPrompt and assert `LABEL_VSTAR_USED` is caught as the expected deferred native rejection (or that the frontier filters it before selection);
5. leave the second-use ChooseCards prompt absent and the live Store/continuation state unchanged.

## Underworld Door / source-specific marker

Pinned source: `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts:71-86, 108-126`; marker identity is `ptcg-server/src/game/store/state/card-marker.ts:23-27`.

The native guard order matters:
1. no occupied Bench slot -> `CANNOT_USE_POWER`;
2. no Basic Psychic Energy in hand -> `CANNOT_USE_POWER`;
3. only then does it check the per-source `UNDERWORLD_DOOR_MARKER`, throwing `POWER_ALREADY_USED`.

The marker is added in the AttachEnergyPrompt continuation after a successful attachment and is keyed by the actual VMAX card object (`addMarker(name, this)`). It is removed at EndTurn. `Marker.hasMarker(name, source)` uses object identity (`c.source === source`).

**Do not let the two-VMAX regression accidentally hit guard 1 or 2.** Start with at least three Basic Psychic Energy in hand, at least one occupied Bench slot, and enough deck cards for both draw-two effects. Use and settle Door from source A, then source B. On independent clones of that post-settlement state, repeat A and repeat B separately; each must reach and reject specifically at `POWER_ALREADY_USED`. Also assert that each cloned marker's `source` is the corresponding cloned VMAX object, not the live card or the other VMAX. If a marker is lost and the action opens another AttachEnergyPrompt, the test should fail. This proves both source markers survive cloning and avoids mistaking resource exhaustion's `CANNOT_USE_POWER` for marker enforcement.

The two relevant error strings explain why run 367's sanitized 16-character error cannot identify the source: `CANNOT_USE_POWER` and `LABEL_VSTAR_USED` are both 16 characters; `POWER_ALREADY_USED` is a different 18-character outcome. The public trace still does not reveal which ability/source was selected.

## Shared timing consequence

Both abilities defer their owner-side validation until the Ability-animation WaitPrompt resolves. The most direct common probe is therefore: dispatch the ability in a cloned Store, find its pending WaitPrompt, resolve exactly that WaitPrompt, and classify the native error before resolving any newly created card-choice/attachment prompt. Preserve unexpected exceptions as fatal and keep original Store state, prompt groups, and continuation queues unchanged.

This is a source-derived test design, not a claim that either hypothesis is the cause of run 367.
