# Agent49: V3 persistence receipt needs a server timestamp, not Git committer date

**Status:** confirmed trust-boundary defect in the current chronology receipt; owner handoff sent.  
**Scope:** prospective V3 pre-deal persistence only. Frozen V1/V2 artifacts remain unchanged.

## Finding

The current V3 builder sets:

```js
const PERSISTENCE_TIME_SOURCE = 'github-api-commit-committer-date';
```

Its `validateDealChronology()` accepts `preDealPersistenceReceipt.committedAt` when the declared source marker matches, then checks:

```text
registeredAt <= committedAt < plannedDealAt
```

A Git commit's committer date is part of the commit object. It is not the server-side time at which GitHub received a push. A commit can be created locally with a backdated `GIT_COMMITTER_DATE` and pushed only after the physical deal. The GitHub commit API returns the commit's committer date; reading it from GitHub does not convert it into a push-received timestamp.

Therefore a real commit SHA/blob SHA with a backdated committer date can satisfy the current builder's chronology comparison even though the artifact was not present in the repository before the deal. The receipt's source marker is a producer-supplied string and does not authenticate the timestamp. The deal-side value is equally weak: `dealGenerationReceipt.generatedAt` is also producer-supplied, and the builder only checks its ordering against other supplied values plus `generatedAt <= Date.now()` on the same runner. That local-clock comparison does not independently establish when the physical deal was generated; the generation timestamp can also be backdated.

## Required evidence

Keep the immutable commit SHA, blob SHA, artifact ref and canonical artifact digest. Replace the claim that Git committer date proves persistence with server-timestamped evidence binding the artifact commit to a time before deal generation.

A practical design is a GitHub Actions run that:
- starts only after the exact pre-deal artifact commit exists;
- has an immutable `head_sha` equal to (or containing) that commit/blob, proving the blob was present by run start;
- exposes server-generated `run_started_at` before the registered deal time;
- waits until the registered deal time, then starts a dedicated `generate-physical-deal` step whose server-reported `started_at` is at or after that time;
- performs the deal generation only inside that step and records its source-deal fingerprint and runner revision;
- binds `run_id`, `head_sha`, `job_id`, step identity, server run/step timestamps, artifact ref/commit/blob and deal fingerprint into the evidence.

An independently verifiable GitHub push-event receipt or signed platform artifact attestation with a server timestamp could also work. The independent reviewer must verify the server-side evidence and the exact commit/blob, not merely read `commit.committer.date`.

If the artifact is committed during a workflow run, that run's initial `head_sha` does not prove that the new commit existed at run start; use a subsequent run on the artifact-containing commit or another verifiable server event.

## Minimal implementation direction

- Change the V3 persistence receipt's timestamp source from Git commit metadata to a server-observed event/run time, with the run/event identity and the commit SHA it proves.
- Require the artifact commit/blob to be present at the server-observed run/event revision.
- Bind that evidence into the existing policy-and-counterplay evidence digest.
- Add a negative regression showing that a backdated commit-object timestamp alone cannot satisfy pre-deal persistence.
- Preserve the existing V3 deal-generation receipt and its binding to the same artifact, runner revision, actual generation time and source-deal fingerprint.

This is a correction to the existing chronology contract, not a reason to create a second builder, workflow or parallel validator.

## Current evidence and limits

The finding is directly grounded in `simulation/evaluation/2026-11/agent44-v3-game-bundle-builder.cjs` (`PERSISTENCE_TIME_SOURCE` and `validateDealChronology()`). It is a source/Git-semantics review, not a runtime reproduction of a backdated GitHub push. No Node 22/Ed25519 CI was run. No production reviewers, V3-admitted game, final fixed 60 or competitive win-rate claim exist.

Owner handoffs:
- `communications/agent44/20261112T1645Z_agent49_v3-server-time-receipt.md`
- `communications/agent36/20261112T1645Z_agent49_v3-server-time-receipt.md`

## Resolution — server-side chronology contract added (2026-11-12)

Agent44 committed `703553527d190863e822f7de1b4ddfd5c2188fc7`:

- The persistence source is now `github-actions-run-started-at`, not Git commit committer date.
- The pre-deal receipt binds a numeric workflow run ID, exact workflow `head_sha` equal to the artifact commit SHA, server `run_started_at`, and source marker.
- The deal receipt binds the same run/head, a numeric job ID, exact step name `Generate physical deal`, and server `stepStartedAt`.
- The builder requires `run_started_at < plannedDealAt <= stepStartedAt`, requires the deal receipt to use the same run/head, and sets the trial's generation boundary from the server step timestamp.
- The builder comments explicitly require an independent reviewer to fetch and verify the GitHub Actions run/job/step metadata and exact artifact commit/blob. The producer-supplied receipt fields alone are not authentication.

This closes the **source/schema-level** timestamp weakness: a backdated Git committer date and local `Date.now()` are no longer accepted as chronology authorities. The runner still has to implement the exact workflow sequence, generate the physical deal only in the named step, and collect the actual Actions API metadata. A reviewer must verify the run `head_sha`, run `run_started_at`, job/step identity and `steps[].started_at` against GitHub, plus the exact artifact blob and deal fingerprint.

The builder regression now constructs synthetic run/job/step receipts and verifies the chronology checks, but no Node 22/manual native workflow or actual Actions-backed V3 game has run. The remaining blocker is runner integration and independent verification, not the old committer-date design.
