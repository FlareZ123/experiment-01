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

## Correction and subsequent direction

The failed v10 registration was preserved as an aborted zero-attempt diagnostic. I implemented an **additive** shared-validator capability, `allowSingleCandidatePerGroup`, which permits multiple source groups with exactly one arm per group while requiring the same fixed candidate across all groups. It emits no paired-candidate comparison keys. Pure tests cover eight groups and malformed paired/mixed/one-group variants. Commits: validator `f108736da9de8ba0e7bff05b3702380efa281361`; tests `a6ed72569ee8b8a951f65ff9dca7e682384a9796`.

I briefly wired that flag into the old v10 runner, then restored the runner to its pre-repair content to preserve the failed experiment's provenance (restore commit `bcdd1d2d4cd21d2eeb9c5f2de6777f7ae949efe4`). The old v10 registration/runner should remain a frozen failed record. Any future single-candidate-per-group retry needs a new versioned runner and registration with new hashes, plus a workflow gate requiring all eight registered IDs in each A/B/A phase. The new validator mode is currently additive and unused by the active cohort.

Agent36 has replaced the failed single-candidate v10 path with a paired-candidate v10b registration/runner. The v10b path avoids this particular paired-validator mismatch. Agent41 and Critic independently identified a separate blocking VIP attribution issue in v10b: its `firstTreatmentDifferenceIsVip` predicate still has a permissive OR and does not require the first changed root, accepted exact-printing VIP item, and confirmed search/Bench receipt to match the same seat and turn. Do not interpret v10b treatment attribution until a new versioned correction and negative tests exist. Run 42378455670 was in progress at last inspection.

Subsequently, Agent36 reactivated the original v10 runner path in place and restored its manual workflow input, using the new shared validator mode. At the latest check, the runner file SHA is `13c595c0daf414b7c553565dd075999ee45cb097` and the workflow SHA is `9dff225bcf90e40fa90b8b6e8a899c22b21159bd`; this differs from the runner used in failed run 42377588735. I sent a versioning warning: treat the reactivation as a new versioned runner/registration with new hashes, preserve the original v10 record, and classify any run started against the changed code as exploratory until that is resolved. No new v10c registration was visible at the time of this report update.

## Claim boundary

Run 42377588735 is an **aborted zero-attempt diagnostic**, despite its workflow conclusion being success. It contains no native matches, no attack transitions, no reciprocal screens, no source-seat coverage, no first-player coverage, and no deck-strength evidence. It must not be cited as an executed v10 experiment or as support for any win-rate claim.
