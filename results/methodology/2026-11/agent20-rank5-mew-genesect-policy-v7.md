# Rank-5 Mew / Genesect opponent policy — v7

**Author:** Agent20  
**Frozen:** 2026-11-19T14:21:09.854Z  
**Status:** diagnostic-only; 31/31 supplemental V8 harness pass; Node runner pending; no native validation or production registration

## Scope

Deterministic actor-view-only opponent policy for the exact Aichi Open League 2026 rank-5 Yamato Nakano Mew / Genesect 60. Source-list SHA-256: `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. The Hood Shield v1 candidate remains unchanged (fingerprint `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`). The policy's 30-printing, 60-card source inventory was compared card-by-card with the rank-5 roster entry and matches exactly. Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream or submodule files were changed.

## Policy

Entrypoint: `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`  
Version: `agent20-rank5-mew-genesect-opponent-v7`

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

- 31 Node tests authored, importing Agent49 V3 validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **31/31 passed** in an isolated V8 CommonJS compatibility harness using the exact current policy and Agent49 V3 validator sources. This is supplemental and does not replace Node's `node --test` runner. The exact command remains unrun because this runtime has no repository checkout and outbound network is unavailable; no CI workflow was added or dispatched.

## Test-fixture corrections and supplemental validation

Two fixture defects were corrected without changing policy behavior:

- `checkedDecision` now supplies an empty `init.config` to `protocol.validateInit`; policy-specific rank/source/candidate fingerprints remain in the separate `createPolicy` configuration. The V3 worker protocol rejects non-empty initialization config by design.
- The Secret Box missing-category case now presents four selectable cards (two Supporters, one Item, one Stadium) with the required four-selection bounds, but still omits a Tool. This keeps the synthetic prompt structurally valid while exercising the intended fail-closed category check.

The exact policy and protocol modules plus all 31 test callbacks passed in the isolated V8 compatibility harness. Node `node --test` remains pending, so this is not a native or Node-runner attestation.

Frozen suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json`
- 25 development cases and 5 held-out cases (30 total).
- Every scenario is blocked. All fixtures are synthetic; no exact runtime actor-view digests, native acceptance receipts, native traces, games, or seeds exist.

## Hash closure

| Artifact | SHA-256 |
|---|---|
| Policy module | `87cc1716e7a8c0db9d56514d91b0bb8327fc955ed0725ad8dde113cb9eed0213` |
| Test file | `c6287017f65d91c3539b727836817b8112a4d244d44a2b2589b73b484a30c535` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v7 | `71323a96a6e088fe5ad0271b873eae3fd369c7e911a913ba75a4b9d0f3f5f588` |
| Dependency manifest v7 | `58093aef935829030fc00dd47be7c4a7c27a1f2cf178ac9e8b02e26ba555abd3` |
| Challenge suite v7 | `b99d12068109284e5a8198d70b42773ae97c568b1f3aa7ab3a65924f87461045` |
| Producer binding v7 | `a10d137261967ac15d25acc05b6665ac0ff200088f9b7d4974b8bbbce1a769d6` |

The dependency/suite/binding digests are SHA-256-bound to current GitHub file contents. The producer binding is diagnostic only: candidate-policy and bundle producer IDs remain null, the producer set is incomplete, and canonical Agent36 V3 registration is absent.

## Admission

No strategic-competence, native-reachability, matchup, or win-rate claim is made. Independent reviewer remains unassigned; reviewer registry is empty; owner hold remains active. Before native evaluation, run the authored tests in an approved checkout, materialize exact actor-view fixtures, obtain independent review, request canonical producer registration, and obtain Critic authorization. No games, seeds, CI, candidate changes, or Twinleaf changes are authorized by this artifact.

This is rank-5-only opponent policy work, not full Aichi Top 32 coverage and not evidence for the 99.5% target.
