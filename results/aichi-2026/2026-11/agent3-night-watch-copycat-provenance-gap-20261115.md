# Mimikyu Copycat → Night Watch: V3 host-randomization provenance gap

**15 November 2026 · pinned Twinleaf source review · no game evidence**

## Finding

Night Watch is a non-GX attack and is semantically eligible for Mimikyu GRI 58's `COPY_OPPONENTS_LAST_ATTACK`. Its two-card hand shuffle is random under the paper card text. The V3 prompt projector already contains a host-only Night Watch path that uniformly samples the exact prompt bounds with the host's `physicalRandom`, but the current typed-provenance hook does not carry the original source through the delegated Copycat reducer.

## Source path

1. Pinned `Trevenant & Dusknoir-GX SMP 206` implements Night Watch with a secret `ChooseCardsPrompt` over the opponent's hand, `min=max=min(2, hand size)`. The pinned code's ordinary prompt asks the attacking player to choose; `isSecret` hides card identities but does not itself make the selection random.
2. Pinned Mimikyu GRI 58 delegates the opponent's previous non-GX attack through `COPY_OPPONENTS_LAST_ATTACK`.
3. Pinned `copy-attack-delegation.ts` resolves `CopyAttackSession` after normal reducer fan-out and directly invokes `sourceCard.reduceEffect.call(copycatCard, store, state, effect)`.
4. V3 `agent36-prompt-provenance.cjs` records provenance by wrapping `Store.callReduceEffect`; its stack is not active for the direct delegated source-reducer call. The prompt created by copied Night Watch therefore lacks the required typed Trevenant/Night Watch provenance.
5. V3 `agent36-prompt-projection.cjs` classifies Night Watch as host-only only when the provenance identifies the exact Trevenant & Dusknoir-GX SMP 206 source and effect name. Its `resolveHostOnlyPrompt` uses the runner-supplied physical RNG. Without delegated provenance, the copied prompt cannot reach that branch and fails closed at `PROMPT_SOURCE_PROVENANCE_MISSING` rather than being safely host-randomized.
6. `agent36-v3-runner.cjs` installs the provenance hook and passes a physical RNG distinct from worker policy RNG. It does not install the standalone `night-watch-random-hook.cjs` or `night-watch-uniform-hand-hook.cjs`. The latter's SimpleTacticsAi wrapper is not the V3 worker resolver.

## Existing reusable work

- `simulation/twinleaf/night-watch-random-hook.cjs` patches the Trevenant reducer and Store prompt boundary to select a uniform physical subset before prompt resolution.
- `tests/night-watch-random-hook.test.cjs` covers a delegated copied Night Watch through Mewtwo & Mew-GX Perfection, exercising the shared delegated-source reducer route, but not Mimikyu's `COPY_OPPONENTS_LAST_ATTACK` path specifically.
- `simulation/twinleaf/night-watch-uniform-hand-hook.cjs` separates physical randomness from policy randomness for the legacy SimpleTacticsAi path; it is not automatically active in the V3 custom worker path.

## Required correction

Keep Night Watch excluded from the V3 Copycat target policy until the host can preserve the original source card and copied attack identity across delegated source reduction. The adapter can extend prompt provenance around the delegated reducer (or integrate the existing Night Watch hook with V3's host-only prompt path). It must:

- bind provenance to the actual public Trevenant source instance and exact Night Watch attack;
- resolve exactly the native `min=max=min(2, opponent hand size)` subset uniformly using `physicalRandom`, not worker policy RNG;
- avoid exposing opponent hand identities or allowing the worker to select the random cards;
- record a host-only prompt receipt and cause no worker prompt decision;
- add a Mimikyu-specific native regression in addition to the existing Mewtwo & Mew delegated-copy test.

This is an adapter-side fidelity correction; do not modify upstream Twinleaf. It is not a deck change or a matchup result.

## Evidence boundary

This finding is source-level. No compiled Mimikyu/Night Watch game or matchup was run. The attack is rules-eligible, but the current V3 copied-prompt path is not yet safe or accepted.
