> **Correction — 17 November 2026, 06:57 UTC:** The native `ResolvePromptAction` result is the **choice index**, not the draw count. My earlier review language recommending direct-result-as-draw-count was incorrect and is superseded below. The V3 prompt projector's `projectSimplePrompt()` iterates `prompt.values`, maps each worker token to `index`, and the dispatch path passes that index to `ResolvePromptAction`. For this exact descending `WANT_TO_DRAW_CARDS` prompt, the correct conversion is `drawCount = choiceCount - 1 - choiceIndex`. The derived draw count—not the raw action result—must equal the same-seat hand-count delta. I sent this correction to Agent6 at `communications/agent6/2026-11/20261117T065645Z_agent14-choice-index-not-draw-count-correction.md` (commit `c9b02a881eb09bfbe8315a40fb6d4bd85623eb43`). The latest 16-test helper still treats direct numeric `result` as a draw value and therefore is not correct for this prompt until changed.

> **Native option-list location — 17 November 2026, 07:02 UTC:** `snapshotPrompt()` names `message/text/options/choices` as prompt fields but not `values`; the full-state adapter preserves the remaining own properties in `extraFields`. Thus the native `SelectPrompt.values` array is at `promptBefore.extraFields.values` (also copied under `rawRow.promptResolverContext.promptSnapshot.extraFields.values`) when present. The runner's `buildPromptResolverContext()` uses only `promptSnapshot.fields` for `availableOptions`, so it does not copy this values array into the sanitized resolver context. The joiner must read the raw snapshot's values array to validate choice count/order, and inspect `promptBefore.fields.options.disabled` when present; the projector skips disabled indices. A generic `options/choices` count or `selectedCount` is not a substitute.

# Agent14 — V3 first-trace replay joiner audit

**Status:** review findings communicated to Agent6; helper remains unvalidated against a real accepted fixture/replay pair. This report is a methodological guardrail, not a game result or competitive-strength finding.

## Question

Can the first-trace `WANT_TO_DRAW_CARDS` choice be reconstructed from the sanitized native V3 fixture and a deterministic private replay without false prompt matches, false draw-count claims, or hidden-information leakage?

## Scope

Reviewed the first-trace joiner and its synthetic tests, the exact PR #58 sanitizer, the native full-state snapshot adapter, the V3 prompt projector/worker resolver, and the native fixture runner. Relevant sources:

- `simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs`
- `tests/2026-11/agent6-v3-trace-replay-join.test.cjs`
- `simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs` (at the exact PR #58 revision)
- `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs`
- `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`
- `simulation/evaluation/2026-11/agent36-v3-runner.cjs`
- `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs`

Agent6 requested this review in `communications/agent14/2026-11/20261117T062433Z_agent6-request-joiner-audit.md`. Detailed review messages are `communications/agent6/2026-11/20261117T063652Z_agent14-joiner-adversarial-review.md` and `communications/agent6/2026-11/20261117T064455Z_agent14-raw-replay-binding-gap.md`.

## Findings

### 1. Canonical prompt identity must be exact

The full-state snapshot adapter copies native `message`, `text`, and `type` into `prompt.fields`; other own properties are placed in `extraFields`. The source-backed identifier is the exact `GameMessage.WANT_TO_DRAW_CARDS` message (with `text` as a documented fallback).

The first joiner implementation recursively searched all strings in both `fields` and `extraFields`, accepting substring matches. That is broader than the source contract and permits a generic `SelectPrompt` to be misclassified because unrelated metadata or option text contains the identifier. Use exact equality on the canonical message field(s), not a recursive substring scan. Test a non-target message with the target string only in unrelated metadata.

### 2. Numeric choice evidence must be tied to the native resolved result

The V3 host maps the worker's opaque token to a native `rawResult`, validates it, and constructs `new ResolvePromptAction(prompt.id, rawResult)`. The actual worker-resolution summary is `{kind:'worker-choice', decisionKind:'select-choice', selectedCount:1}`; `selectedCount` counts selected options, not cards drawn.

The initial helper recursively collected generic `result/value/index/count` fields and reconstructed whenever any numeric value matched the hand delta. This could accept an option index or unrelated numeric metadata. Agent6's commit `972381149848ad6f0448befb9705790204ca2a4e` improved this by requiring a unique direct numeric draw value to match the hand delta and treating conflicting/index-only evidence as unresolved; the synthetic suite increased to 16/16. This is a useful partial correction, but the tests should model the actual V3 worker-choice summary and the native action's actual serialized result field rather than invented `promptResolution.value` fields.

### 3. Before/after hand delta is valid only with a verified prompt lifecycle

The native runner captures `fullStateBefore` immediately before `store.dispatch(action)` and `fullStateAfter` immediately afterward. The full-state adapter derives hand count from the native hand zone. For this specific setup prompt, the selected number of cards is moved from deck to hand; the resulting hand-count delta is a valid independent corroboration of the selected draw count.

However, the joiner must prove that the prompt was pending before dispatch and resolved afterward. The original synthetic fixture set `pending:false` in both snapshots, and the helper accepted it. A zero-card choice (action result 0, hand delta 0) could therefore be reported as reconstructed even if the prompt was already resolved or remained pending. Require `pending:true` before; afterward, reject if the same prompt remains pending, and if it remains in the snapshot require `pending:false` and a result agreeing with the native action result. If the engine removes resolved prompts, absence is acceptable only with the matching native action result and hand delta. Add a negative zero-choice test for a still-pending after snapshot.

### 4. Three-input CLI currently fails to bind the raw replay to the replay-sanitized artifact

This is the critical unresolved integrity issue introduced by the sanitizer-decoupling correction.

The current helper accepts three separate files: original sanitized artifact, replay sanitized artifact, and private raw replay. It compares the first two, then checks only a limited set of fields from the raw replay (seed, seed32, seats, first-player seat, and the selected row's ordinal/seat/turn/prompt/action/dispatch/options). It does **not** recompute the sanitized representation from the supplied raw replay, nor otherwise prove that the replay-sanitized file was generated from that raw file.

Consequently, a different raw replay with the same public seed and seat fields could be paired with a replay-sanitized artifact that matches the original. Engine/research pins, deck hashes, policy identities, worker audits, and the complete sanitized decision trace are verified only in the unbound sanitized file, not against the supplied raw replay. The row-level cross-check does not repair this missing binding.

The first helper version's injected `sanitizeFixtureArtifact(replayRaw)` provided the necessary raw-to-sanitized link. Preserve that property while keeping the helper independent of a hard-coded mainline module path: inject the exact sanitizer function or accept an explicit exact-revision sanitizer module path in the local CLI. Alternatively, provide a verifiable attestation binding raw replay SHA-256, sanitizer blob SHA, and sanitized artifact SHA, with the joiner checking the raw file hash. Add a negative test pairing a valid matching sanitized file with a different raw replay of the same seed/seat but changed trace or policy identity; it must be rejected before prompt reconstruction.

Until this is fixed, `replayIdentityVerified:true` is not justified by the current three inputs.

### 5. Privacy is adequate on the intended path, but the allowlist should be narrower

The worker's opaque token is decoded host-side before constructing the native action, so no direct token leak was identified in the intended `WANT_TO_DRAW_CARDS` path. The helper does not emit raw snapshots or card names.

Nevertheless, the generic recursive option/evidence scans inspect arrays such as `cards`, `targets`, and `selectedCards` in both fields and extra fields; `safeScalar` accepts numeric values and digit-only strings. If a broad prompt match lands on unrelated metadata, numeric card IDs/indices or numeric-looking tokens could be emitted as safe labels/evidence. Restrict the target prompt to its canonical draw-options array and validated draw-count values; test numeric tokens and numeric card IDs explicitly.

A small output precision issue also remains: the source's `Draw N card(s)` label form does not match the current `SAFE_LABEL` pattern, which recognizes `Draw N card(singular/plural)` without parentheses. The helper may therefore omit the human-readable option labels and fall back to counts (or emit no labels after the later tightening).

## Current implementation status

- Agent6's numeric-conflict/index-only correction is committed and reportedly passes 16/16 synthetic tests.
- Agent6 confirmed the trusted-local full-state replay path: `runV3FixtureGame` is exported; `AGENT36_V3_DIAGNOSTIC_MODE='encrypted-full'` captures full state and writes raw `fixture-game.json` to the supplied private output directory before the separate Actions encryption step. A non-witness run still requires the exact accepted no-game witness receipt and exact research/Twinleaf pins, registered seed, and frozen policies. This is source-level confirmation only; no replay was run.
- The raw-to-sanitized binding, exact prompt identity, and pending-before/resolved-after checks remain outstanding in the reviewed helper revision.
- No real accepted fixture/replay pair has exercised the helper. No game was dispatched, and no deck, policy, or seed was changed.

## Decision

Do not use the helper's `reconstructed` status as first-trace evidence until raw replay identity is cryptographically linked to its sanitized representation, the exact prompt message is identified, and the prompt lifecycle is verified. Once those checks pass, the hand-count delta is a sound corroboration for this particular setup effect. If the accepted natural-terminal trace contains no target prompt, report the lens as unexercised rather than manufacturing a prompt or expanding the schema.

This audit is not a matchup result, not a policy-strength result, and not evidence toward the 99.5% target.
