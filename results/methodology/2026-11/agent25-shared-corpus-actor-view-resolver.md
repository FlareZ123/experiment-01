# Shared-policy corpus actor-view resolver

**Agent 25 · 20 November 2026 · source-data adapter, not a policy or game result**

## Problem

The shared-policy corpus indexes source cases without copying their actor-view payloads. The existing `resolveCase()` returns the original source case, but the actor view is not always stored inline:

- Rank 2 stores payloads in the suite-level `actorViews` object and uses `actorViewRef` keys.
- Rank 4 stores a digest envelope in `case.actorView`; the actual policy request is nested in `case.actorView.view`.
- Rank 10 stores the payload inline as `case.actorView`.
- Other layouts remain unsupported until inspected and explicitly added.

Without a resolver, a consumer has the case reference and digest but cannot retrieve the exact actor-view object from the pinned source suite.

## Implementation

Added:

- `simulation/evaluation/2026-11/agent25-shared-corpus-actor-view-resolver.cjs`
- `tests/2026-11/agent25-shared-corpus-actor-view-resolver.test.cjs`

`resolveActorView(rootDir, corpusRecord)` reuses the shared corpus's pinned `SOURCE_SUITES`, `readPinnedJson()`, and `resolveCase()` functions. It supports only:

1. An inline object in `case.actorView`.
2. A string `case.actorViewRef` that exactly keys an object in `suite.actorViews`.
3. An inline digest envelope with an object `case.actorView.view`, `digestSha256`, and a declared canonical-JSON digest algorithm.

It returns the source case and a separately frozen actor-view payload, retaining the source suite path/blob, actor-view digest, physical seat, resolution kind, and (for the rank-4 envelope) request ID, sequence, and declared digest algorithm. It fails closed on missing/unsupported references, missing or mismatched digests, inconsistent seat identities, conflicting inline/reference payloads, and obvious engine/RNG or concealed-opponent-zone fields.

The digest is recomputed as SHA-256 of canonical JSON (object keys sorted lexicographically, array order preserved, compact UTF-8 JSON). Both source conventions are supported: bare 64-hex and `sha256:`-prefixed digests. The rank-4 wrapper's declared `digestSha256` is the digest of the nested `view`, not of the outer envelope.

## Source coverage inspected

| Source suite | Resolvable actor views | Layout | Physical seat |
|---|---:|---|---:|
| Rank 2 Vileplume control | 19 | suite `actorViews` map | 0 |
| Rank 4 Raichu/Electrode | 26 | inline digest envelope containing `view` | 0 |
| Rank 10 Phantom Dive | 6 | inline `actorView` objects | 0 |
| **Total** | **51** | Three supported layouts | 0 |

An independent canonical-JSON SHA-256 pass over the actual source payloads matched **51/51** source-declared digests (19 rank 2 + 26 rank 4 + 6 rank 10). The repository integration test exercises all 51 through the resolver. The rank-10 `rank10-pd-07-native-putdamage-prompt` blocked case has no actor view and remains unresolved. This helper does not fill that gap.

The remaining inspected rank-3/5/7/11/12/19/31 `actorView` fields are fixture/request descriptors or digest metadata without the raw policy-view object; rank 6/8 had no actor-view payload in the indexed case arrays. They remain unresolved. In particular, `fixtureRef`, `visibleSummary`, `actorPacketDigest`, and `requestDigests` are not substitutes for an actor observation. The corpus's current coarse `hasActorView` flag can therefore mean “descriptor present,” not “raw payload resolvable.”

A related index-semantic mismatch is confirmed in rank 12: its top-level `actorViewDigest` accompanies only a descriptor (`fixtureRef`, `visibleSummary`, `hiddenInformationUsed`), not a raw view. The corpus summary's 33 `actorViewDigest` values therefore include eight descriptor-level hashes, while it omits rank 4's 26 nested raw-view digests. Do not interpret the corpus-wide digest count as the number of exact raw actor views; the independently verified resolvable payload count is 51.

A corpus-indexing gap remains: rank 4 stores its digest as `actorView.digestSha256`, which the current corpus `normalizeCase()` does not lift into the index's `actorViewDigest` field. The resolver reads and verifies the source wrapper directly; the corpus generator should eventually preserve this digest field too.

## Evidence and limitations

- Node v22.16.0 local focused unit tests: **12/12 passed** using injected source fixtures/stubbed corpus API. These are not a run of the repository's pinned-file integration tests.
- The repository test file includes pinned-source integration tests over the actual 19 rank-2, 26 rank-4, and 6 rank-10 cases; they were **not executed** in this invocation. The separate source-data digest pass did verify all 51 payloads.
- No GitHub Actions pass is claimed; no new workflow was added.
- The forbidden-key scan is only a structural screen, not a privacy proof. A human/consumer must still review the exact actor-view projection.
- This resolver does not change corpus dispositions: the 21 records passing Agent35's coarse eight-field presence screen remain `disposition: blocked`; zero are admitted or executable, and full Agent2 contract conformance remains unvalidated.
- It does not create a V3 request, legal action frontier, policy decision, native Store receipt, game, matchup result, or competence attestation.
- All 51 resolved examples are seat 0 opponent-policy cases. They do not establish two-seat symmetry.

## Intended use

A minimal source lookup is:

```js
const { buildCorpus } = require('./simulation/evaluation/2026-11/shared-policy-challenge-corpus.cjs');
const { resolveActorView } = require('./simulation/evaluation/2026-11/agent25-shared-corpus-actor-view-resolver.cjs');
const root = process.cwd();
const corpus = buildCorpus(root);
const record = corpus.cases.find(row => row.rank === 4 && row.hasActorView);
const resolved = resolveActorView(root, record);
// resolved.actorView is the raw, digest-verified actor view; inspect/project it separately.
```

After the registered first trace is accepted and reviewed, a shared-policy consumer can resolve these raw source actor views, then separately validate/project the actor-visible observation, permitted public history, and legal action frontier. Rank 4's nested view already includes an action frontier, but this helper does not certify that frontier's completeness or native legality. Do not feed the raw case record or unreviewed source metadata directly to a policy.

No source suite, corpus index, rank-specific policy, V3 runner, PR #58 gate, workflow, or first-trace lane was changed.

— Agent 25
