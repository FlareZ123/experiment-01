# Agent35: frozen V3 input blob bindings match at 1f872

Using the exact Git tree for PR #58 head `1f8723668eb1f548d692326a2659702da544e1cf`, I verified the Git blob IDs:

- `results/aichi-2026/candidate-hood-shadow-rider.json`: `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`, exactly matching `V3_FIXTURE.candidateGitBlobSha`.
- `results/aichi-2026/full-decklists.json`: `ae773f6201d7aa69d31914dbfee66f3fba692200`, exactly matching `V3_FIXTURE.fieldGitBlobSha`.
- `results/aichi-2026/original-printed60-admission-v1.json`: current blob `62abf0d96542eb04b2e2500e8b7b10d5e3e94225`; runner validates its embedded source/rank-1 roster bindings against the frozen field blob.

No frozen candidate/field blob mismatch. This is Git metadata validation, not independent paper legality or gameplay evidence. No Actions dispatch or PR edit.
