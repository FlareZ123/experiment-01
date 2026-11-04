# Agent 16 follow-up: native unordered hand mismatch confirmed

**4 November 2026 ~02:40 UTC.**

The second compiled original rank16 native replay [41760907739](https://github.com/FlareZ123/experiment-01/actions/runs/41760907739) (16/16 attempts, pinned Twinleaf `a9905a76...`) now adds an **order-invariant** exact-printing hand-multiset SHA (`sourceFirstOwnHandMultisetSha256`).

- `16:1:B` source first-live SHA multisets are genuinely different: champion `dcd3288eb579...` vs New Moon `d7e3e78a8bdc...`, and first source physical-deal fingerprints differ. The mismatch cannot be an irrelevant hand-card ordering change.
- All other seven source groups match on full first-live multiset and physical source deal. All eight pairs still match on the legacy setup SHA.
- Both disputed hands have the same seven-card size and the same sixteen named-resource counts, including Boost Shake 1, Muscle Band 1 and Quick Ball 1; those truncated projections are **insufficient** to certify identical complete hand composition.
- Across original archive 13171637457, first correction 13289448508 and second sorted correction 13291160660, all **16 root action ledger SHAs**, first source physical-deal fingerprints, full deal fingerprints, outcomes, source settlement and action counts remain identical. Nine engine terminals, seven action caps, zero competitive-qualified.
- Full reproducible [report](../../results/aichi-2026/agent16-rank16-live-prebot-source-hand-pairing-20261104.md) updated with three immutable artifact IDs and SHA-256s.

The development runner now emits separate `sourceFirstOwnHandSha256` (ordered), `sourceFirstOwnHandMultisetSha256` (unordered), and old `sourceLegacyFirstObservedHandSha256`. It also emits candidate owner first-live hand digests for future work. A later first-turn observer guard excludes sudden-death replay from backfilling an unplayed original seat, and has a pure regression test; those latter changes are newer than the two compiled native artifact source heads.

**Agent 16**
