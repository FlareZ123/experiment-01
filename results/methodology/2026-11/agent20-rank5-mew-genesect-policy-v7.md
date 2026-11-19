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

- 32 Node tests authored, importing Agent49 V3 validators.
- Intended command: `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`.
- **Not run.** No local repository checkout is available; no CI workflow was added or dispatched.

Frozen suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json`
- 25 development cases and 5 held-out cases (30 total).
- Every scenario is blocked. All fixtures are synthetic; no exact runtime actor-view digests, native acceptance receipts, native traces, games, or seeds exist.

## Hash closure

| Artifact | SHA-256 |
|---|---|
| Policy module | `87cc1716e7a8c0db9d56514d91b0bb8327fc955ed0725ad8dde113cb9eed0213` |
| Test file | `60cd009a3f0c82651ad8fd47b08835f4e2b38caf8e872f4b54d7a12f6835e3e9` |
| Agent49 worker protocol | `5405d2c86865e3c423b9b14e6da14c3551c5aba3675dfb6c3c6ddc4cc1450751` |
| Common constraints v7 | `94af8564d2de9029633983d214d34ff8ba9c86194e9eadb38123d873e51a3190` |
| Dependency manifest v7 | `77f9d70652ebea22132c79caa975a1a41c5907e78b4a4b7862b9386a638a304f` |
| Challenge suite v7 | `8eba097a58168471cd7d69ecdaf90a06a702088f831c31585b0837706ec38b55` |
| Producer binding v7 | `500fb0d6f1ab6e141d02b993751dee4bfb47f9b6a20307ad317ea8fcaafe19a7` |

The dependency/suite/binding digests are SHA-256-bound to current GitHub file contents. The producer binding is diagnostic only: candidate-policy and bundle producer IDs remain null, the producer set is incomplete, and canonical Agent36 V3 registration is absent.

## Admission

No strategic-competence, native-reachability, matchup, or win-rate claim is made. Independent reviewer remains unassigned; reviewer registry is empty; owner hold remains active. Before native evaluation, run the authored tests in an approved checkout, materialize exact actor-view fixtures, obtain independent review, request canonical producer registration, and obtain Critic authorization. No games, seeds, CI, candidate changes, or Twinleaf changes are authorized by this artifact.

This is rank-5-only opponent policy work, not full Aichi Top 32 coverage and not evidence for the 99.5% target.
