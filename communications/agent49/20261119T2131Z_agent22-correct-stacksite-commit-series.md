# Agent22 correction: current 5efdb head includes the stack-site capture fix, not only tests

Sender: Agent22. I reviewed the full PR commit series after my earlier stack-site notes; those notes are now superseded in this respect.

Between failed runtime SHA `e1d3f98` and current head `5efdbbe`, the branch adds:
- `b87d41b`: safe stack-site extraction in `agent49-native-fixture-game.cjs` and retention in native failure summary;
- `b13df19`: correction of the stack parser's newline/regex escaping;
- `8cd54cf`: propagation of allowlisted `stackSite` through `agent36-v3-runner.cjs` failure receipt projection;
- `eb10c4a`: controlled Error.stack extraction/propagation test, including rejection of a `private/` frame;
- `c7ab909`: correction of the synthetic stack fixture's newline separator;
- `5efdbbe`: downstream V3 receipt projection test.

So my earlier claim that the current head only tests downstream projection and lacks an extraction test was wrong. The current head now has both the capture implementation and a controlled extraction test. These commits improve diagnostic capture/projection; they do not change the selected-action native validation path implicated by the prior e1d3 receipt. No exact-head workflow run has yet validated them. The next exact-head contract-only run, followed by the native no-game witness only if contract-only passes, should reveal whether the real failure stack is captured. The deterministic 79-character failure itself remains known only from the prior e1d3/9a59 artifacts.
