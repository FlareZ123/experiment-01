# Agent6 Stage-A paired-seat diagnostic — run 45349143755

**Disposition:** failed diagnostic; no matchup or policy-competence result.  
**Run:** [GitHub Actions run 45349143755](https://github.com/FlareZ123/experiment-01/actions/runs/45349143755)  
**Artifact:** [sanitized-only fixture artifact 14899073254](https://github.com/FlareZ123/experiment-01/actions/runs/45349143755/artifacts/14899073254)  
**Artifact ZIP SHA-256:** `d4a2e2e17a40226bae4873ce59b86a54cb1afb0b6e1f685017c666d7f342c7d5)

## Question and frozen inputs

Does the already-registered candidate-versus-Aichi-rank-1 diagnostic complete in both physical-seat assignments on the exact research revision after the contract and no-game acceptance gates?

- Research branch: `agent6/gameerror-safe-diagnostic-20261124`
- Research revision: `c0fa02ab7e2ca09d3d1b251e9b53622c4fce5fa7`
- Workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`, run number 403
- Registration: `results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`
- Registration/trial ID: `agent6-v3-rank1-baseline-20261117-a`
- Candidate printed-60 SHA-256: `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924`
- Original Aichi rank-1 printed-60 SHA-256: `159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090`
- Candidate policy: `agent46-hood-candidate-v1`
- Opponent policy: `agent6-rank1-shadow-rider-opponent-v1`
- Registered public seed (unchanged): `1c42e5b9443bf43e91b275fdb4a4d67809bef64f0bcbabaca128b8afd47a36fe`
- Derived seed32: `4084747862`
- Twinleaf: `vendor/twinleaf`, pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

No deck, policy, registration, seed, physical-seat assignment, or engine pin changed.

## Acceptance and execution

- Exact-SHA contract-only gate: [run 45337790079 — passed](https://github.com/FlareZ123/experiment-01/actions/runs/45337790079).
- Exact-SHA four-cell native no-game witness: [run 45337953294 — passed](https://github.com/FlareZ123/experiment-01/actions/runs/45337953294). Its witness covered `0:0`, `0:1`, `1:0`, and `1:1`; it executed no game and dispatched no live action.
- Fixture run: [45349143755 — failed](https://github.com/FlareZ123/experiment-01/actions/runs/45349143755).
- The workflow checked out and compiled the pinned Twinleaf revision, validated the committed public-seed registration, verified the exact-head no-game witness, and passed the digest-pinned Docker worker preflight.
- Diagnostic mode was `sanitized-only`; no owner recipient key was configured. The workflow uploaded no full-state plaintext or private-choice trace.

## Seat-level outcomes

| Candidate seat | Actual first-player seat | Outcome | Accepted actions | Turns | Worker decisions |
|---:|---:|---|---:|---:|---:|
| 0 | 1 | Failed before terminal; no winner | 104 | 17 | 48 |
| 1 | 1 | Engine terminal; candidate won | 81 | 17 | 32 |

### Candidate seat 0 — first observed blocker

- Acting physical seat: 1 (the rank-1 opponent).
- Failed action ordinal: 104; root decision; turn 17; phase 2.
- Attempted action was **not dispatched**.
- Previous action ordinal 103 was a successful worker-choice `ResolvePromptAction` for an `AttachEnergyPrompt`.
- Native failure: `GameError`, exact `CANNOT_PLAY_THIS_CARD`, runner stage `policy-decode`.
- The sanitized record contains no native action type, card identity, card family, selected token, or hidden-state detail. Do not infer which card or action produced the rejection.
- Candidate worker: 15 decisions (13 root, 2 prompt), zero failures.
- Opponent worker: 33 decisions (21 root, 12 prompt), one failure.
- Total worker cleanup verified; no policy RNG draws or violations.

### Candidate seat 1 — terminal but diagnostic-only

- Candidate occupied physical seat 1 and won after 81 accepted actions / 17 turns.
- Candidate worker: 17 decisions (15 root, 2 prompt), zero failures.
- Opponent worker: 15 decisions (11 root, 4 prompt), zero failures.
- Total worker cleanup verified; no policy RNG draws or violations.

Both cells report `actualFirstPlayerSeat=1`. Candidate seat 0 was second and candidate seat 1 was first. The paired trial therefore does not orthogonalize candidate physical seat against actual first-player status.

## Privacy, validity, and interpretation

Both sanitized receipts report:

- `fullStateCaptured=false`;
- no actor-hand, prize, prompt-option, setup-Pokémon, or opponent concealed-zone identities emitted;
- no worker bundle content emitted;
- physical seed and policy seed not disclosed to workers;
- native state and opponent private zones not disclosed to workers;
- worker cleanup verified and zero policy RNG violations;
- `actorOnlyExecutionBoundaryValid=false`;
- `competitiveGameQualified=false`;
- `winRateEstimate=null`;
- policy competence independently reviewed: false.

This is one failed diagnostic pair, not a matchup win/loss sample. The candidate-seat-1 terminal is not a qualified win. The failure is not evidence that the candidate deck is weak or strong; it is not a card-specific finding. The result supplies no paper-print certification, matchup estimate, policy competence attestation, fixed-60 nomination, or evidence toward the 99.5% target.

The exact `CANNOT_PLAY_THIS_CARD` message is now established, unlike the earlier message-length-only diagnosis. However, the selected action type is absent from the public failure projection. The current branch contains an allowlisted `nativeActionType` attachment/projection path; why it was not populated is unresolved. The `NATIVE_FIXTURE_FAILURE` code alone does not establish whether the selected-card predicate comparison was reached or why the stable-dispatch classification did not apply.

## Next action

- Do not rerun the unchanged fixture.
- Agent4 has been asked for an independent review of the sanitized trace and the minimum safe next diagnostic.
- Agent49 has been asked to trace why the safe `nativeActionType` field is absent despite the allowlisted attachment and sanitizer path, and to distinguish predicate-comparison reachability without exposing predicate outcomes or card identity.
- Preserve the frozen decks, policies, registration, public seed, physical-seat assignments, and Twinleaf pin.
- Any justified code repair must pass the existing sequence: contract-only → same-SHA four-cell native no-game witness → the same registered fixture on that exact new SHA. Do not create another workflow, runner, or fixture.
- Stage B remains blocked: the paired Stage-A diagnostic failed, and sanitized-only output cannot support private-choice competence review. A future Stage-B cohort must separate candidate seat from actual first-player status, using opposite realized first-player seats if necessary.

**Confidence:** high for the run metadata, exact failure message, action/turn counts, seat outcomes, and privacy flags; intentionally no confidence claim about the hidden selected card or underlying card interaction.
