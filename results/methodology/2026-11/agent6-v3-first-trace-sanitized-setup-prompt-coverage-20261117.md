# V3 first-trace sanitized setup-prompt coverage

**Date:** 2026-11-17  
**Investigator:** Agent6  
**Question:** Can the existing sanitized V3 artifact directly preserve Agent14's requested `WANT_TO_DRAW_CARDS` decision row?

## Finding

**No. The existing sanitized artifact preserves enough to locate and classify a setup-prompt decision, but not enough to reconstruct the offered choices or the selected choice.** This is a source/schema finding on canonical PR #58 head `3f6a35ac404ac5705380a910cf5e027d2d3b5460`, not an observation from a played game.

In `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`:

- `sanitizeDecisionRecord()` retains the action ordinal, acting seat, turn, pending prompt **class** type, policy input kind, action name/type and dispatch status.
- `sanitizePromptContext()` retains prompt ID/type, player/perspective IDs, acting seat and resolver; it reduces each available option array to a **count** and retains only `min`, `max`, `minCards`, `maxCards` and `allowCancel`. It omits the engine prompt `description`/effect name (the `WANT_TO_DRAW_CARDS` identity) as well as option labels, values and ordering. Agent14 source-checked this as a generic `SelectPrompt`, so the sanitized artifact cannot identify the exact effect; it can only cross-check generic class, actor/seat/turn, option count and `allowCancel:false`.
- `sanitizePromptResolution()` reduces a worker-choice resolution to the generic `kind` / `ownerSeat` allowlist. The runner's pre-sanitized worker-choice summary includes `decisionKind` and `selectedCount`, but the sanitizer drops those too. No selected index/value or accepted-result detail survives.

Therefore, the current artifact cannot establish that a generic `SelectPrompt` is specifically `WANT_TO_DRAW_CARDS`, nor its option order, selected index/value or exact accepted draw count. Do not infer any of these from the sanitized text trace. Do not infer these from the sanitized text trace.

## Permitted analysis path

Use the existing public-seed deterministic replay only after the exact-SHA contract-only, compile/no-fixture and both-role/both-seat native no-game witness gates pass. Replay must use the registered unchanged candidate/opponent 60s, exact frozen policy identities/versions, pinned Twinleaf revision and research SHA. The public physical seed remains host-side and must never be passed to either policy worker.

For the setup-draw lens:

1. Locate the sanitized decision by action ordinal, acting seat, turn and pending prompt type.
2. Replay the same registered game and recover the native prompt's option labels/order, worker-selected index/value, and accepted native resolution.
3. Join the replay row to the sanitized row on ordinal/seat/turn/prompt type and compare all surviving public fields and decision/receipt hashes available in both.
4. Use the replayed choice only if the join is unique and the surviving fields agree. If they diverge or the prompt does not occur, mark the lens unreconstructed/unexercised; do not force a prompt or change the runner schema for this request.

This satisfies Agent14's request without expanding the artifact schema or creating another runner/workflow. The source-level coverage is a trace-planning aid, not a policy or matchup result.

## Next action

After acceptance, Agent6 should inspect the first uncapped natural-terminal trace and provide Agent14 the uniquely joined setup-draw row if it occurs. Agent14 owns interpretation of the `WANT_TO_DRAW_CARDS` mapping and paired-mulligan baseline; Agent6 owns trace integrity and replay matching.

## Replay identity check

The native driver sets `actionOrdinal = actions` immediately before each decision attempt and increments `actions` only after a successful native dispatch. Thus, in a completed trace, the ordinal is unique and is the primary join key; seat, pre-action turn and pending prompt type are independent cross-checks.

For a same-seed replay, do not accept a matching prompt row based only on those four fields. Re-run through the existing encrypted-full/offline diagnostic path, then apply the *same* `sanitizeFixtureArtifact()` projection to the replay artifact. Require matching trial seed/seed32, candidate/opponent seat assignment, printed-60 hashes, engine/research revisions and policy identities, plus exact equality of the sanitized game summary and `game.actorDecisionsSha256` / `game.rootDecisionsSha256`. Only then inspect the raw replay's matching `decisionTrace[actionOrdinal]` row for option order and selected index/value. If the digest or binding checks differ, reject the replay as non-identical and leave the requested choice unreconstructed. The encrypted-full route is optional and must remain offline/decrypted only on a trusted machine; do not upload plaintext full-state data.

## Existing workflow diagnostic-mode selection

The canonical PR #58 workflow already has a single fixture-mode selector: if `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent, it selects `sanitized-only` and records no full-state capture; if a valid RSA recipient key is present, it selects `encrypted-full` and runs the existing envelope-encryption step before upload. This is not a workflow blocker and does not require another input or workflow. Prefer sanitized-only for the first trace unless a specific unresolved question justifies encrypted diagnostics. A later replay that needs raw prompt options must use the existing encrypted-full/offline path with owner-controlled key handling or a trusted local offline run; never upload plaintext.

## Raw replay source for the omitted prompt identity

The existing private snapshot adapter `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` captures each native prompt's `message`, `text`, `type`, option arrays (`cards`, `options`, `choices`, targets and eligible/available cards), bounds, `allowCancel`, and result; `snapshotExtraFields()` also retains other serializable prompt properties such as an effect description. The native driver stores that before-decision snapshot on each raw decision record as `fullStateBefore`. Thus, in an authorized encrypted-full replay, inspect `decisionTrace[actionOrdinal].fullStateBefore.prompts[]` (match the prompt ID and examine both `fields` and `extraFields`) to identify the exact `SelectPrompt` effect and recover the offered choices. The same raw decision record's `actionPayload.fields` is the projected native action payload; inspect it with `promptResolution` and the following state snapshot to establish the selected value and accepted result. This is the existing private/offline data path; do not add these fields to sanitized output or upload plaintext.

## Rank-1 prompt-incidence baseline

Agent14's exact paired model gives each side a 12.172125% chance of at least one optional bonus-draw allowance when both 60s have 14 Basics. The one-sided-mulligan events are mutually exclusive on the first decisive setup round, so the chance that **either** player receives a draw-choice prompt is their sum: **24.344250%**. The chance that neither receives one is **75.655750%**. The chance that either side has an allowance of at least two cards is **3.373886%** (at least three: **0.467589%**). These are exact setup-eligibility probabilities, not actual cards drawn or game outcomes. Thus, a first trace with no `WANT_TO_DRAW_CARDS` prompt is the expected outcome roughly three quarters of the time and must be marked unexercised, not treated as a policy defect.

**Unit of analysis:** 24.344250% is per individual candidate-seat assignment/game. The existing paired-seat runner reuses the same registered physical seed for candidateSeat 0 and 1, so the two prompt-occurrence indicators are correlated; do not square the no-prompt probability, assume independence, or report a pair-level incidence from this per-game calculation.

For reproducibility, with (q=\binom{46}{7}/\binom{60}{7}=0.1385906808712801), (p=1-q), and (D=1-q^2), the mutually exclusive one-sided events give (P(\text{any prompt})=2pq/D=0.24344249992495423), (P(\text{no prompt})=p^2/D=0.7565575000750457), and (P(\text{any allowance}\ge k)=2pq^k/D). This is per game, before either player's optional draw choice.

## Evidence limit of the replay match

A same-seed replay that matches all sanitized fields is a **deterministic reconstruction**, not direct proof of the original run's selected value. `sanitizeDecisionRecord()` deliberately omits both `actionPayload` and `actionPayloadSha256`; its `actorDecisionsSha256` therefore commits to the sanitized actor observation, action name/type, generic prompt context, public-state projections and dispatch status, but not the exact selected prompt token/index. The sanitized artifact also does not retain a worker-response digest. A replay match establishes that the frozen policy saw the same sanitized decision context and followed the same observable action path; with identical policy bundle/version, runtime and zero policy RNG draws, the raw replay choice is the deterministic reconstruction. Label it as such, not as an observed original-run choice. If any surviving sanitized field/digest, policy identity, seed, deck hash or engine/research pin differs, reject it. Only the original encrypted-full artifact could directly attest the original raw selected value; do not weaken the sanitized boundary to obtain that attestation.
