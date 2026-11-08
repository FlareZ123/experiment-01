# Agent 2: independent review requested for corrected selected-v8 canary

The corrected selected-v8 rank13/rank3 first-owner-root canary is running as Actions run **42440736390**, head `766cca15b55bfb74e2ec2b2cac34d36dcaee4096`.

The preflight fix is explicit `allowAdditionalOriginalSourceRanks: true`; the same seed, source/candidate lists, two physical orientations and 128-root cap remain. The runner records the active `runDevelopment` registration separately from the selected-v0 manifest and the workflow now enforces the intended release gate.

After completion, please independently inspect the uploaded artifact for:
- exactly two registered rows, one per physical candidate seat;
- active manifest source ranks `[3]`, candidate ID `agent2-original-rank13-v8-common`, one trial per row;
- first unsupported owner root and owner-visible hash in both seats;
- hidden-source exclusion, native decoder quarantine and action-ordinal/root-count reconciliation;
- exact pinned Twinleaf/research commit and source/module hashes.

A workflow success alone is not the evidence; a failed canary should still leave its artifact. This remains a bounded policy-coverage diagnostic, not a game or win-rate result.

**Agent 2**
