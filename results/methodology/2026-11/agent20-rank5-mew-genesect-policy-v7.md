# Rank-5 Mew / Genesect opponent policy — v7

**Author:** Agent20  
**Frozen:** 2026-11-19T14:21:09.854Z  
**Status:** diagnostic-only; tests not executed; no native validation or production registration

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

## Tests and suite

Test file: `tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

- 30 Node tests authored, importing Agent49 V3 validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **30/30 passed** in an isolated V8 CommonJS compatibility harness using the exact current policy and Agent49 V3 validator sources. This is supplemental and does not replace Node's `node --test` runner. The exact command remains unrun because this runtime has no repository checkout and outbound network is unavailable; no CI workflow was added or dispatched.

## Test-fixture corrections and supplemental validation

Two fixture defects were corrected without changing policy behavior:

- `checkedDecision` now supplies an empty `init.config` to `protocol.validateInit`; policy-specific rank/source/candidate fingerprints remain in the separate `createPolicy` configuration. The V3 worker protocol rejects non-empty initialization config by design.
- The Secret Box missing-category case now presents four selectable cards (two Supporters, one Item, one Stadium) with the required four-selection bounds, but still omits a Tool. This keeps the synthetic prompt structurally valid while exercising the intended fail-closed category check.

The exact policy and protocol modules plus all 30 test callbacks passed in the isolated V8 compatibility harness. Node `node --test` remains pending, so this is not a native or Node-runner attestation.

Frozen suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json`
- 25 development cases and 5 held-out cases (30 total).
- Every scenario is blocked. All fixtures are synthetic; no exact runtime actor-view digests, native acceptance receipts, native traces, games, or seeds exist.

## Hash closure

| Artifact | SHA-256 |
|---|---|
| Policy module | `87cc1716e7a8c0db9d56514d91b0bb8327fc955ed0725ad8dde113cb9eed0213` |
| Test file | `9ed9b0e2e4cc9927d9e74a38b79369ed97e582100ba36716aa83ba399c789f70` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v7 | `94af8564d2de9029633983d214d34ff8ba9c86194e9eadb38123d873e51a3190` |
| Dependency manifest v7 | `e3b2e3f4aa9953be5a0f821da3ae81ff7861dab66739cacc00888d1a88f61e74` |
| Challenge suite v7 | `6488226b9bf220d080b2359f5e1cf87e25e4ea7ef06a2b7984b2d6cde1ae539d` |
| Producer binding v7 | `122c87f924b070bcf3a93c18170eed4ee2d5ce0009c58c8ac687c649055d579b` |

The dependency/suite/binding digests are SHA-256-bound to current GitHub file contents. The producer binding is diagnostic only: candidate-policy and bundle producer IDs remain null, the producer set is incomplete, and canonical Agent36 V3 registration is absent.

## Admission

No strategic-competence, native-reachability, matchup, or win-rate claim is made. Independent reviewer remains unassigned; reviewer registry is empty; owner hold remains active. Before native evaluation, run the authored tests in an approved checkout, materialize exact actor-view fixtures, obtain independent review, request canonical producer registration, and obtain Critic authorization. No games, seeds, CI, candidate changes, or Twinleaf changes are authorized by this artifact.

This is rank-5-only opponent policy work, not full Aichi Top 32 coverage and not evidence for the 99.5% target.
