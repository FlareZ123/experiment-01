# Shared-policy corpus actor-view resolver

**Agent 25 · 19 November 2026 · source-data adapter, not a policy or game result**

## Problem

The shared-policy corpus indexes source cases without copying their actor-view payloads. The existing `resolveCase()` returns the original source case, but the actor view is not always stored inline:

- Rank 2 stores payloads in the suite-level `actorViews` object and uses `actorViewRef` keys.
- Rank 10 stores the payload inline as `actorView`.
- Other layouts remain unsupported until inspected and explicitly added.

Without a resolver, a consumer has the case reference and digest but cannot retrieve the exact actor-view object from the pinned source suite.

## Implementation

Added:

- `simulation/evaluation/2026-11/agent25-shared-corpus-actor-view-resolver.cjs`
- `tests/2026-11/agent25-shared-corpus-actor-view-resolver.test.cjs`

`resolveActorView(rootDir, corpusRecord)` reuses the shared corpus's pinned `SOURCE_SUITES`, `readPinnedJson()`, and `resolveCase()` functions. It supports only:

1. An inline object in `case.actorView`.
2. A string `case.actorViewRef` that exactly keys an object in `suite.actorViews`.

It returns the source case and a separately frozen actor-view payload, retaining the source suite path/blob, actor-view digest, physical seat, and resolution kind. It fails closed on missing/unsupported references, missing digests, inconsistent seat identities, conflicting inline/reference payloads, and obvious engine/RNG or concealed-opponent-zone fields.

## Source coverage inspected

| Source suite | Resolvable actor views | Layout | Physical seat |
|---|---:|---|---:|
| Rank 2 Vileplume control | 19 | suite `actorViews` map | 0 |
| Rank 10 Phantom Dive | 6 | inline `actorView` objects | 0 |
| **Total** | **25** | Two supported layouts | 0 |

The 25 payloads were inspected against the resolver's structural forbidden-key screen; none triggered it. The rank-10 `rank10-pd-07-native-putdamage-prompt` blocked case has no actor view and remains unresolved. This helper does not fill that gap.

## Evidence and limitations

- Node v22.16.0 local focused unit tests: **9/9 passed**. These ran against injected source fixtures/stubbed corpus API; they are not a test of the repository's actual pinned-file integration.
- Two pinned-source integration tests are included in the repository test file for the real rank-2/rank-10 layouts, but were **not executed** in this invocation.
- No GitHub Actions pass is claimed; no new workflow was added.
- The helper does not recompute actor-view SHA-256. It preserves the source-declared digest and checks it against the corpus record; the pinned suite Git blob binds the payload when the default corpus reader is used.
- The forbidden-key scan is only a structural screen, not a privacy proof. A human/consumer must still review the exact actor-view projection.
- It does not create a V3 request, legal action frontier, policy decision, native Store receipt, game, matchup result, or competence attestation.
- All 25 resolved examples are seat 0 opponent-policy cases. They do not establish two-seat symmetry.

## Intended use

After the registered first trace is accepted and reviewed, a shared-policy consumer can resolve these raw source actor views, then separately validate/project the actor-visible observation, permitted public history, and legal action frontier. Do not feed the raw case record or unreviewed source metadata directly to a policy.

No source suite, corpus index, rank-specific policy, V3 runner, PR #58 gate, workflow, or first-trace lane was changed.

— Agent 25
