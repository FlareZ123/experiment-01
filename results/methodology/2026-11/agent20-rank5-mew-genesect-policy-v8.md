# Rank-5 Mew / Genesect opponent policy — v8

**Author:** Agent20  
**Frozen:** 2026-11-19T18:33:12.402Z  
**Status:** diagnostic-only; worker-init contract corrected; zero-key regression authored; Node runner pending; no native validation or production registration

## Scope

Deterministic actor-view-only opponent policy for the exact Aichi Open League 2026 rank-5 Yamato Nakano Mew / Genesect 60. Source-list SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. The Hood Shield v1 candidate remains unchanged (fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`). The policy's 30-printing, 60-card source inventory was compared card-by-card with the rank-5 roster entry and matches exactly. Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream or submodule files were changed.

## Policy

Entrypoint: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`  
Version: `agent20-rank5-mew-genesect-opponent-v8`

The policy is deterministic, actor-seat-relative, and uses the Agent49 V3 request/decision protocol. It emits only validated frontier tokens and abstains on unsupported or ambiguous prompts.

Implemented lines:
- Mew V / Mew VMAX development, Wally same-turn evolution, Genesect Fusion Strike System.
- DCE-backed Cross Fusion Strike, Genesect Techno Blast / Energy Mix donor selection, and no inference that DCE pays standalone Psychic or Metal costs.
- Forest Seal Stone / Star Alchemy from whichever actor-owned Pokémon V carries the Tool; once per game and after useful draw abilities. Search Mew VMAX, DCE for any unpowered Mew VMAX including the Bench, or other contextual setup.
- Special Charge recovery, discard protection for the last Mew VMAX and scarce DCE, and Path to the Peak sequencing.
- Guzma target scoring at 210 damage plus 20 only for visibly attached Muscle Band.
- Secret Box distinct supporter/item/tool/stadium categories; abstain if category metadata is missing.
- Public target disambiguation: when identical Pokémon printings are on the board, use `targetZone` and `benchIndex`; if the target remains ambiguous, abstain rather than scoring the first matching printing.

## Paper-rule resolution: Cross Fusion Strike donor Energy

The repository's Advanced Player’s Rulebook Ver. 3.4 resolves the donor-cost question:

- Section C-18, “Use it as this attack,” says the chosen attack's effects and damage apply even if the attacking Pokémon does not have the Energy for the chosen attack's cost, unless otherwise specified.
- Section D-09 gives Ditto's Copy Anything as the explicit exception: its text specifically requires the necessary Energy for the chosen attack.
- The exact repository card text in `resources/cards/en/swsh8.json` for Mew VMAX SWSH8 114 is “Choose 1 of your Benched Fusion Strike Pokémon's attacks and use it as this attack.” It has no additional donor-Energy condition. Mew V SWSH8 113's Energy Mix costs Psychic; Genesect V SWSH8 185's Techno Blast costs Metal, Metal, Colorless.

Therefore Mew VMAX pays its own two-Colorless Cross Fusion Strike cost; it does not separately pay the copied Energy Mix or Techno Blast cost. This is a paper-rulebook conclusion, not a simulation result. Twinleaf's implementation of this interaction remains untested and must be checked separately before relying on native results.

## Actor-only information boundary (source audit)

A direct source scan of the committed policy finds only these `observation` roots: `globalTurn`, `ownHand`, `ownPublic`, `opponentPublic`, and `ownTurnResources`. Its opponent-side reads are limited to public `handCount` and `prizeCount`; it does not read opponent hand contents, opponent deck contents, private opponent zones, seed/RNG inputs, or a global game-state object. Own-hand reads are actor-authorized. This is a source-level audit of the policy module, not a runtime isolation proof; the V3 worker protocol and native actor-view gate remain independently required.

## Tests and suite

Test file: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 32 Node tests authored, importing Agent49 V3 validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- The v8 zero-key worker-init regression has been authored but not executed. The prior v7 31/31 isolated V8 compatibility result applies only to v7 and is not a v8 pass. The exact Node command remains pending in an approved checkout; no CI workflow was added or dispatched.

## Test-fixture corrections and supplemental validation

Two fixture defects were corrected without changing policy behavior:

- The test helper supplies `config: {}` to `protocol.validateInit` and to `createPolicy`; the module now rejects any non-empty runtime config. Rank/source/candidate identity remains fixed in module constants and v8 manifests.
- The Secret Box missing-category case now presents four selectable cards (two Supporters, one Item, one Stadium) with the required four-selection bounds, but still omits a Tool. This keeps the synthetic prompt structurally valid while exercising the intended fail-closed category check.

The v8 policy and test changes have not been executed in the Node runner or any compatibility harness. The new worker-init regression is authored only; Node `node --test` remains pending.

Frozen suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v8.json`
- 25 development cases and 5 held-out cases (30 total).
- Every scenario is blocked. All fixtures are synthetic; no exact runtime actor-view digests, native acceptance receipts, native traces, games, or seeds exist.

## Hash closure

| Artifact | SHA-256 |
|---|---|
| Policy module | `807e194830fde3db282399f4db7043d813e453c9d6ba2b2f95965c2a8fe3c928` |
| Test file | `5f03c81204ce0b2c8b90d3e778886022484f3cfc69ec65dcc57ed07e710ff6d8` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v8 | `9f801c9e37758815bbd72bb138e6ec0cef45022837d016500943444069766626` |
| Dependency manifest v8 | `ef31af5bcbb90aeb3dc616ca0b0dbf4cad0fcdf0d6a92dde48d31e6fd1b44b62` |
| Challenge suite v8 | `e63d7cb46df062fb9eddbca4d1aa967239194d9419c7bf12ae391516b6aa7bd6` |
| Producer binding v8 | `671349563435ee421c7bec715aa12c24e27d829d7ccdf068919b8cc79f525a77` |

The dependency/suite/binding digests are SHA-256-bound to current GitHub file contents. The producer binding is diagnostic only: candidate-policy and bundle producer IDs remain null, the producer set is incomplete, and canonical Agent36 V3 registration is absent.

## Admission

No strategic-competence, native-reachability, matchup, or win-rate claim is made. Independent reviewer remains unassigned; reviewer registry is empty; owner hold remains active. Before native evaluation, run the authored tests in an approved checkout, materialize exact actor-view fixtures, obtain independent review, request canonical producer registration, and obtain Critic authorization. No games, seeds, CI, candidate changes, or Twinleaf changes are authorized by this artifact.

This is rank-5-only opponent policy work, not full Aichi Top 32 coverage and not evidence for the 99.5% target.


## Worker-init contract correction — v8

The shared Agent49 V3 worker calls `validateInit()` and requires `config: {}`; policy-specific settings are frozen in the role-only bundle. V7 incorrectly required rank, source fingerprint and candidate fingerprint in `createPolicy(config)`, making the policy uninitializable through the real worker despite the earlier test helper validating an empty init envelope.

V8 removes that runtime config dialect. `createPolicy` now accepts only an empty config object, while rank 5, the exact source fingerprint, the candidate fingerprint, engine pin and policy version remain immutable module constants and are bound by the v8 dependency/challenge/producer manifests. The focused regression passes an empty init payload through the actual exported `validateInit`, then instantiates the module with the accepted fields and worker-supplied RNG property; it also asserts that non-empty config is rejected by both boundaries.

The v8 regression has not been executed under Node in this invocation. No worker-initialization pass, native reachability, independent competence, matchup result, game count, or win-rate claim is made. The policy remains diagnostic-only and is not inserted into the canonical Agent36 bundle.
