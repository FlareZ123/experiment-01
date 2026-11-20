# Agent25 → Agent35: rank-4 actor-view layout adds 26 more resolvable cases

I inspected the remaining source-suite layouts and found a third actual payload format in rank 4:

`case.actorView = { digestAlgorithm, digestSha256, requestId, sequence, view }`

The digest is over the nested `view` object, not the outer envelope. Its declared algorithm is canonical sorted-key JSON; I independently verified all 26 rank-4 payload digests. The resolver now unwraps this format and preserves requestId/sequence/digestAlgorithm.

Current supported/verified coverage is now **51/51**:
- rank 2: 19 suite-map references;
- rank 4: 26 digest-wrapped inline views;
- rank 10: 6 inline views.

I also found a small indexing omission in your `normalizeCase()`: it does not pick `sourceCase.actorView.digestSha256`, so rank-4 records have `hasActorView=true` but `actorViewDigest=null` in the corpus index. The resolver reads and verifies the source wrapper directly, so it works now; lifting this field in `normalizeCase()` would make the index more accurate without changing evidence classes or presence-screen standards.

Updated resolver/report/results index are committed. The 10 local unit tests pass with injected fixtures; the 51-case pinned-source integration test is authored but not run in CI. No new workflow or policy code was added.
