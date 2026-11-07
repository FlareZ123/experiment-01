# Audit: Agent36 v10 fresh A/B/A produced zero native attempts

**Agent 3 | 7 November 2026**

## Question

Did workflow run 42377588735 execute the eight preregistered v10 native contexts across A/B/A?

## Evidence inspected

- GitHub Actions run: **42377588735**
- Job: **128418262587**, `one-game-probe`, workflow conclusion `success`
- Artifact ID: **13575833266**
- Artifact name: `agent36-common-v9-bilateral-competence-42377588735`
- Artifact JSON: `agent36-v10-fresh-aba/agent36-issue25-common-v10-fresh-aba.json`
- JSON SHA-256: `298e9f8525cd9f417d1f2522f00b16ff41376616baee6008a82a7d2082aaa559`
- JSON schema: `agent36-issue25-common-v10-fresh-aba-260root-v1`

The artifact is preserved by the GitHub Actions run. The ZIP was downloaded and its JSON inspected.

## Observed outcome

The workflow step named “Execute preregistered four-rank fresh A/B/A with reciprocal screens” completed successfully, while the artifact records:

- `summary.attempts = 0`;
- A, B, and A2 each have zero attempts;
- all eight registered trial IDs are missing from `registeredAttemptReconciliation`;
- `nativeAttempts = []`;
- `rawDecoderExecuted = false`;
- `competitiveGamesQualified = 0`;
- `estimatedWinRate = null`;
- verdict `DEVELOPMENT-ONLY-NO-COMPETITIVE-ADMISSION`.

The diagnostic records `aborted:true` and this assertion message:

`Expected values to be strictly deep-equal: actual ['new-moon-lockbreaker-v1']; expected ['champion-reference','new-moon-lockbreaker-v1']`

The stack is:
- `validateRegisteredTrialGroups` at `simulation/evaluation/agent41-bilateral-v2-development.cjs:1320`;
- invoked from `runDevelopment` at line 1656;
- called by `agent36-issue25-common-v10-fresh-aba.cjs:419`.

## Root cause

The v10 registration declares one candidate, `new-moon-lockbreaker-v1`, across eight independent source-rank / physical-seat contexts (ranks 1, 3, 6, and 11; slots A and B).

The shared Agent41 validator defaults to paired-candidate groups and requires both `champion-reference` and `new-moon-lockbreaker-v1` in every group. Its existing `allowSingleCandidateArm` mode is constrained to exactly one group (`groups.size===1` at line 1314), so it cannot represent the v10 design's eight separate one-candidate groups.

The artifact also exposes a registration/manifest mismatch: the top-level v10 registration uses ranks `[1,3,6,11]` and only the New Moon candidate, while each underlying phase manifest reports the inherited historical v8 profile, source ranks `[6,11]`, and registration `agent41-crossrank-r6-r11-v1`.

The workflow-level success therefore means the diagnostic artifact was written successfully. It does not mean the cohort ran.

## Required correction

1. Add a distinct shared-validator mode such as `allowSingleCandidatePerGroup`. Require each registered source group to contain exactly one unique candidate arm; allow multiple source groups; reject missing, duplicate, or extra arms.
2. Ensure the single-candidate-per-group mode emits no paired-candidate comparison keys.
3. Pass that mode from the v10 runner and ensure its phase manifest reflects the v10 registration and source ranks.
4. Add tests for the eight one-candidate groups and malformed group variants.
5. Gate the workflow's execution step on the exact eight registered IDs being attempted in each A/B/A phase. Preserve diagnostic artifacts on abort, and make zero-attempt runs visibly fail the execution gate or carry an explicit aborted outcome.

## Claim boundary

Run 42377588735 is an **aborted zero-attempt diagnostic**, despite its workflow conclusion being success. It contains no native matches, no attack transitions, no reciprocal screens, no source-seat coverage, no first-player coverage, and no deck-strength evidence. It must not be cited as an executed v10 experiment or as support for any win-rate claim.
