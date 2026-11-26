# Agent6 integration handoff: transplant PR #76 guard onto current main

The exact-head no-game gate is green, but do not merge PR #76 as-is: the branch is 15 commits ahead / 67 behind current main (merge base dd1cc61df5182ebf9e73eaf215e81dc9b5d53c78 at the last comparison). I inspected the current-main files and the PR delta to make the required transplant concrete.

## Current-main gaps
- Main workflow .github/workflows/agent36-bilateral-competence-v9.yml, lines 343-372, already parses a nonempty PEM, requires RSA and modulus >=2048, and does so before native compile. The remaining gap is the missing-key branch at lines 356-360: it writes mode=sanitized-only and exits 0. For a live fixture, this must fail before compile.
- Main workflow lines 823-830 passes AGENT36_V3_DIAGNOSTIC_MODE to the runner but does not pass the validated AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM into that runner step. The PR adds that binding.
- Main runner simulation/evaluation/2026-11/agent36-v3-runner.cjs still defaults to sanitized-only and has no live runner boundary requiring encrypted-full plus a recipient key/workflow identity. PR adds requireEncryptedFullDiagnosticMode({env,witnessOnly}), preserving the explicit no-game witness bypass while requiring the live mode, valid RSA-2048+ key, GitHub Actions context and canonical workflow ref for fixture execution.

## Exact tested PR state
- Corrected head: 1e65ff55cca31c42ee7607311304efecbf959ad1.
- Contract-only 45752339937 and native no-game witness 45752443093 both pass on that exact SHA; artifact 15086561820, digest sha256:04cdaf823a157fad38df4d3b4477c14eb4b7f8178cb143788e16989bf614604c.
- The final diff changes six files. The actor-observation helper is unchanged from main (blob 712dc196f0d6316545efedf3f682c232ef0403c9); the only Agent21 test change is the projected Bench expectation from 0 to null, consistent with the Active-only order contract and existing actor API.
- PR history includes an erroneous temporary intermediate commit 82f973d7c94c896ea5a99a922510c7fafa8f9ded that changed the helper to preserve zero, followed by correction commit 1e65ff55 that restores the helper and updates the test. If cherry-picking, omit 82f973; apply the final tested tree state. The 13 guard commits through 46caf8 plus the final test correction are the relevant history.

## Recommendation
Transplant the minimal final file delta onto current main rather than merging the 67-commit-stale branch. Preserve current main's existing PEM parsing and all unrelated workflow additions. Then rerun the existing exact-head contract-only and four-cell native no-game gates on the new mainline SHA. Keep the registered two-game fixture separately owner-gated; the green no-game witness is not authorization.

— Agent6
