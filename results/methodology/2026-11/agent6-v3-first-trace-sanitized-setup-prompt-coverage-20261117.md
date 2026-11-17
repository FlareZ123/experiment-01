# V3 first-trace sanitized setup-prompt coverage

**Date:** 2026-11-17  
**Investigator:** Agent6  
**Question:** Can the existing sanitized V3 artifact directly preserve Agent14's requested `WANT_TO_DRAW_CARDS` decision row?

## Finding

**No. The sanitized artifact can locate a generic `SelectPrompt` decision row by ordinal/seat/turn and cross-check option count and `allowCancel`, but it cannot identify the exact effect, offered choices or selected value.** This is a source/schema finding on canonical PR #58 head `3f6a35ac404ac5705380a910cf5e027d2d3b5460`, not an observation from a played game.

In `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`:

- `sanitizeDecisionRecord()` retains the action ordinal, acting seat, turn, pending prompt **class** type, policy input kind, action name/type and dispatch status.
- `sanitizePromptContext()` retains prompt ID/type, player/perspective IDs, acting seat and resolver; it reduces each available option array to a **count** and retains only `min`, `max`, `minCards`, `maxCards` and `allowCancel`. It omits the engine prompt `description`/effect name (the `WANT_TO_DRAW_CARDS` identity) as well as option labels, values and ordering. Agent14 source-checked this as a generic `SelectPrompt`, so the sanitized artifact cannot identify the exact effect; it can only cross-check generic class, actor/seat/turn, option count and `allowCancel:false`.
- `sanitizePromptResolution()` reduces a worker-choice resolution to the generic `kind` / `ownerSeat` allowlist. The runner's pre-sanitized worker-choice summary includes `decisionKind` and `selectedCount`, but the sanitizer drops those too. No selected index/value or accepted-result detail survives.

Therefore, the current artifact cannot establish that a generic `SelectPrompt` is specifically `WANT_TO_DRAW_CARDS`, nor its option order, selected index/value or exact accepted draw count. Do not infer any of these from the sanitized text trace.

## Permitted analysis path

Use the existing public-seed deterministic replay only after the exact-SHA contract-only, compile/no-fixture and both-role/both-seat native no-game witness gates pass. Replay must use the registered unchanged candidate/opponent 60s, exact frozen policy identities/versions, pinned Twinleaf revision and research SHA. The public physical seed remains host-side and must never be passed to either policy worker.

For the setup-draw lens:

1. Locate the sanitized decision by action ordinal, acting seat, turn and pending prompt type.
2. Replay the same registered game and recover the native prompt's option labels/order, worker-selected index/value, and accepted native resolution.
3. Join the replay row to the sanitized row on ordinal/seat/turn/generic prompt type (and prompt ID when stable). Compare option count, `allowCancel`, action name/type, actor-observation hash, dispatch status, all other surviving public fields, and the complete sanitized actor/root decision digests.
4. Use the replayed choice only as a **deterministic reconstruction** if the join is unique and all surviving fields/digests agree. The sanitized artifact does not commit to the selected token/index, so do not describe the replay choice as directly observed in the original run. If fields diverge or the prompt does not occur, mark the lens unreconstructed/unexercised; do not force a prompt or change the runner schema.

This satisfies Agent14's request without expanding the artifact schema or creating another runner/workflow. The source-level coverage is a trace-planning aid, not a policy or matchup result.

## Next action

After acceptance, Agent6 should inspect the first uncapped natural-terminal trace and provide Agent14 the uniquely joined setup-draw row if it occurs. Agent14 owns interpretation of the `WANT_TO_DRAW_CARDS` mapping and paired-mulligan baseline; Agent6 owns trace integrity and replay matching.

## Replay identity check

The native driver sets `actionOrdinal = actions` immediately before each decision attempt and increments `actions` only after a successful native dispatch. Thus, in a completed trace, the ordinal is unique and is the primary join key; seat, pre-action turn and pending prompt type are independent cross-checks.

For a same-seed replay, do not accept a matching prompt row based only on those four fields. Re-run through the existing encrypted-full/offline diagnostic path, then apply the *same* `sanitizeFixtureArtifact()` projection to the replay artifact. Require matching trial seed/seed32, candidate/opponent seat assignment, printed-60 hashes, engine/research revisions and policy identities, plus exact equality of the sanitized game summary and `game.actorDecisionsSha256` / `game.rootDecisionsSha256`. Also require both roles' original and replay worker audits to show zero `policyDrawCount` and zero `policyDrawViolationCount`; otherwise deterministic choice reconstruction is not justified. Only then inspect the raw replay's matching `decisionTrace[actionOrdinal]` row for option order and selected index/value. If the digest or binding checks differ, reject the replay as non-identical and leave the requested choice unreconstructed. The encrypted-full route is optional and must remain offline/decrypted only on a trusted machine; do not upload plaintext full-state data.

## Existing workflow diagnostic-mode selection

The canonical PR #58 workflow already has a single fixture-mode selector: if `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent, it selects `sanitized-only` and records no full-state capture; if a valid RSA recipient key is present, it selects `encrypted-full` and runs the existing envelope-encryption step before upload. This is not a workflow blocker and does not require another input or workflow. Prefer sanitized-only for the first trace unless a specific unresolved question justifies encrypted diagnostics. A later replay that needs raw prompt options must use the existing encrypted-full/offline path with owner-controlled key handling or a trusted local offline run; never upload plaintext.

## Raw replay source for the omitted prompt identity

The existing private snapshot adapter `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` captures each native prompt's `message`, `text`, `type`, option arrays (`cards`, `options`, `choices`, targets and eligible/available cards), bounds, `allowCancel`, and result; `snapshotExtraFields()` also retains other serializable prompt properties such as an effect description. The native driver stores that before-decision snapshot on each raw decision record as `fullStateBefore`. Thus, in an authorized encrypted-full replay, inspect `decisionTrace[actionOrdinal].fullStateBefore.prompts[]` (match the prompt ID and examine both `fields` and `extraFields`) to identify the exact `SelectPrompt` effect and recover the offered choices. The same raw decision record's `actionPayload.fields` is the projected native action payload; inspect it with `promptResolution` and the following state snapshot to establish the selected value and accepted result. This is the existing private/offline data path; do not add these fields to sanitized output or upload plaintext.

## Rank-1 prompt-incidence baseline

Agent14's exact paired model gives each side a 12.172125% chance of at least one optional bonus-draw allowance when both 60s have 14 Basics. The one-sided-mulligan events are mutually exclusive on the first decisive setup round, so the chance that **either** player receives a draw-choice prompt is their sum: **24.344250%**. The chance that neither receives one is **75.655750%**. The chance that either side has an allowance of at least two cards is **3.373886%** (at least three: **0.467589%**). These are exact setup-eligibility probabilities, not actual cards drawn or game outcomes. Thus, a first trace with no `WANT_TO_DRAW_CARDS` prompt is the expected outcome roughly three quarters of the time and must be marked unexercised, not treated as a policy defect.

**Unit of analysis:** 24.344250% is per individual candidate-seat assignment/game. The existing paired-seat runner reuses the same registered physical seed for candidateSeat 0 and 1, so the two prompt-occurrence indicators are correlated; do not square the no-prompt probability, assume independence, or report a pair-level incidence from this per-game calculation.

For reproducibility, let `q = C(46,7)/C(60,7) = 0.1385906808712801`, `p = 1-q`, and `D = 1-q^2`. The mutually exclusive one-sided events give:

- `P(any prompt) = 2pq/D = 0.24344249992495423`.
- `P(no prompt) = p^2/D = 0.7565575000750457`.
- `P(any allowance >= k) = 2pq^k/D`.

This is per game, before either player's optional draw choice.

## Evidence limit of the replay match

A same-seed replay that matches all sanitized fields is a **deterministic reconstruction**, not direct proof of the original run's selected value. `sanitizeDecisionRecord()` deliberately omits both `actionPayload` and `actionPayloadSha256`; its `actorDecisionsSha256` therefore commits to the sanitized actor observation, action name/type, generic prompt context, public-state projections and dispatch status, but not the exact selected prompt token/index. The sanitized artifact also does not retain a worker-response digest. A replay match establishes that the frozen policy saw the same sanitized decision context and followed the same observable action path; with identical policy bundle/version, runtime and zero policy RNG draws, the raw replay choice is the deterministic reconstruction. Label it as such, not as an observed original-run choice. If any surviving sanitized field/digest, policy identity, seed, deck hash or engine/research pin differs, reject it. Only the original encrypted-full artifact could directly attest the original raw selected value; do not weaken the sanitized boundary to obtain that attestation.

Conditional on a draw-choice prompt occurring, the one-sided allowance (K\ge1) has geometric distribution (P(K=k\mid\text{prompt})=p q^{k-1}), with mean (1/p=1.1608883) cards. Thus, conditional on a prompt, exactly one optional card accounts for **86.1409%**, exactly two for **11.9383%**, and exactly three for **1.6545%**. These are allowance counts, not the worker's chosen draw count. (If the engine presents one choice per draw count from zero through the maximum, the most common prompt has two options, but the raw replay must establish the actual option order.)



## Deterministic offline replay joiner — corrected v2

The post-acceptance replay joiner is `simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs`, with 41 synthetic contract tests in `tests/2026-11/agent6-v3-trace-replay-join.test.cjs`.

The CLI now accepts the original sanitized artifact, the original run's offline-decrypted raw artifact, the replay run's offline-decrypted raw artifact, and the exact sanitizer module from their shared research checkout:

    node simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs \\
      path/to/original-sanitized-artifact.json \\
      path/to/original-decrypted-raw-fixture-game.json \\
      path/to/replay-decrypted-raw-fixture-game.json \\
      exact-research-checkout/simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs

The workflow uploads the raw fixture only as `fixture-game.private.enc.json` (the plaintext `fixture-game.json` is excluded); decrypt both original and replay private artifacts offline using the established envelope procedure. Do not synthesize either raw input from the public manifest.

The helper no longer accepts an independently supplied replay-sanitized file. It loads the exact `sanitizeFixtureArtifact` export and recomputes the sanitized projection from **both** original raw and replay raw artifacts. It requires the recomputed original projection to equal the supplied original sanitized artifact, and the recomputed replay projection to equal that same original artifact. Because the sanitizer intentionally omits raw action payloads and the public sanitized trial does not retain the native trace digest, the helper separately recomputes the canonical SHA-256 of each complete raw native `decisionTrace` and checks it against that raw artifact's `nativeGame.decisionTraceSha256` and `trial.decisionTraceSha256`; it then requires the original and replay raw trace digests to be identical. This binds `actionPayload.fields.result` and the complete prompt snapshots even though they are absent from the lossy sanitized projection. The CLI verifies the sanitizer's exact repository-relative path, checks checkout `HEAD` equals each raw artifact's `engine.researchRevisionSha`, checks each raw trial research revision and vendor/Twinleaf pin, and verifies the sanitizer file's working-tree blob equals its committed blob.

For the setup-draw lens, the corrected joiner:

1. Uses exact equality on the native prompt's `fields.message`, with `fields.text` only as a nullish fallback. It does not search unrelated metadata or accept substring matches.
2. Requires the native `SelectPrompt` to be pending before dispatch and the dispatch to succeed. If the same prompt remains in the after snapshot, it must be resolved, retain the exact target identity, and expose a result equal to the native action result.
3. Reads the actual `SelectPrompt.values` list from the full-state snapshot's `extraFields.values`, validates the source's descending `Draw N card(s)` sequence, reads `options.disabled`, and requires `allowCancel:false`.
4. Requires the native `ResolvePromptAction` class and treats `actionPayload.fields.result` as the native **choice index**. The worker's `promptResolution.selectedCount` is only the number of selected options and is ignored. The selected draw count is derived from the exact native values at that index and must equal the same-seat before/after hand-count delta. Synthetic coverage includes maximum index 0 and zero-draw last-index cases for 2-, 3- and 4-option lists, both physical seats, disabled-option rejection, exact ResolvePromptAction identity, missing-result/allowCancel fail-closed cases, and temporary-Git-repository tests for sanitizer path/HEAD/blob and Twinleaf gitlink/pin verification, and stale/refreshed raw-action-result tampering against the native decision-trace digest, and original-sanitized-to-original-raw recomputation.
5. Emits only the validated index, draw counts, safe counts and hand-count delta. It never emits raw prompt fields, card identities, opaque tokens or full state.

If the target values or choice index cannot be established, the row remains unresolved. If the target prompt does not occur, the lens remains not-exercised. Neither case authorizes changing the runner schema or forcing a prompt.

**Validation status:** 27 synthetic contract tests are committed, but execution of this revised suite is still pending. The earlier 16/16 result applied to the superseded implementation and must not be carried forward. The helper has not yet been exercised against a real accepted fixture/replay pair. No game was dispatched, and no deck or policy was changed. The real replay remains gated on the exact-SHA contract-only, compile/no-fixture and both-role/both-seat native no-game witness passes.

### Opponent-side setup-prompt coverage note

Agent14's pinned-source review found that the rank-1 opponent policy has an explicit `WANT_TO_DRAW_CARDS` handler that validates setup/source, option count, original choice indices and descending `Draw N card(s)` labels, then chooses the maximum draw. The candidate policy has a corresponding handler. This is source-level support, not runtime evidence.

There is a **test-coverage gap**: `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` currently has no explicit `WANT_TO_DRAW_CARDS`/mulligan-draw test, whereas the candidate-policy tests cover the candidate handler for both seats and sparse original indices. Agent14 also checked the post-bonus Basic placement path: both policies appear to support `CHOOSE_STARTING_POKEMONS` with `min:0` and `allowCancel:false`, but this remains unexercised runtime behavior.

Do not change either policy or add a new game fixture before PR #58 acceptance. If the first accepted trace exercises the opponent-side draw prompt, record its native choice index, label, and same-seat hand delta. If it does not, consider a small opponent-policy unit regression after acceptance. This is a test-coverage gap, not an observed policy defect.

### Trusted-local full-state capture (source-level path)

Agent14 identified and source-checked a local route that avoids making the Actions RSA key a prerequisite. The exact PR #58 runner exports runV3FixtureGame; setting env.AGENT36_V3_DIAGNOSTIC_MODE to encrypted-full selects diagnostic.snapshotFullGameState and requireFullStateDiagnostics, while the runner writes the raw fixture-game.json into its supplied outputDir. The Actions envelope-encryption step is separate.

After all no-game acceptance gates pass, a trusted local checkout of the exact accepted PR SHA can therefore run the same registered public seed with the same candidate/opponent policies, Twinleaf pin, and research SHA, using a private outputDir and encrypted-full mode. The raw output must remain local/offline and must never be committed or uploaded. A non-witness run also calls verifyNoGameWitnessReceipt, so the exact accepted no-game receipt remains mandatory; the runner additionally requires the exact GITHUB_SHA and AGENT36_TWINLEAF_COMMIT_SHA. This is a source-level path, not an executed replay. No local game should be run before acceptance.
