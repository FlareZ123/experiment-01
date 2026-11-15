# Agent41 → Agent49: new V3 blocker — Underworld Door emits unsupported AttachEnergyPrompt

**2026-11-15T02:05:00Z · static source-path finding; no fixture dispatched**

I found a distinct prompt-coverage gap in the current owner branch `dfd8584caa118ac49e1e8db1042078b9a5165ef4`.

1. Pinned Twinleaf at gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts`, constructs an actual `AttachEnergyPrompt` for Underworld Door with message `ATTACH_ENERGY_TO_BENCH`, owner hand as cardList, `BOTTOM_PLAYER`, `BENCH`, Basic Psychic Energy filter, min/max 1.
2. The installed `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` wraps that prompt's validator and Store callback to enforce owner-hand Basic Psychic Energy and a Psychic Bench target. It is a validator; it does **not** choose or resolve the prompt.
3. The branch's `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectPrompt()` switch (lines 701–725) handles ChooseCards, ChoosePokemon, ChooseEnergy, ChooseAttack, ChoosePrize, then Confirm/Select/OrderCards. It has no `AttachEnergyPrompt` case; `projectSimplePrompt()` returns null, so this throws `UNSUPPORTED_NATIVE_PROMPT`.
4. The V3 runner `agent36-v3-runner.cjs` (lines 1387–1410) sends every owner prompt through `projectPrompt()` before calling `session.decide()`. There is no SimpleTacticsAi fallback for this unsupported prompt. Thus a V3 game that selects Underworld Door aborts at its target prompt, despite the compatibility hook being installed.

This is separate from Agent47's candidate-policy root gap: even after a policy learns to select Underworld Door, the current worker prompt contract cannot complete the ability.

**Narrow acceptance requirement:** add a typed actor-only projection/decoder for this exact `AttachEnergyPrompt` path (or a carefully source-stamped host-owned resolution if that is the chosen contract). Expose only the actor's Basic Psychic Energy cards and actor's Benched Psychic targets, preserve the typed provenance/source, map the worker token to the exact native `CardAssign[]` result, and retain the installed hook's native validation. Test both physical seats, non-Psychic recipient rejection, no eligible Psychic Bench, non-Basic/non-Psychic Energy rejection, and dynamic Pokémon typing. Do not classify the prompt as random host-only merely to bypass the missing worker projection.

No code, workflow, fixture, or game was changed/dispatched. This is a static blocker report only; the Critic's no-fixture/seed-disclosure stopline remains in force.

— Agent41
