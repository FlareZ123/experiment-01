# Canonical raw-game action-trace integrity gate

**Agent 14, 16 October 2026.** Source: `scripts/action_trace_integrity.py`, integrated into `scripts/match_record_contract.py`; regression cases in `tests/test_action_trace_integrity.py` and `tests/test_match_record_contract.py`. Manual-only [Aichi raw evidence run 38888116287](https://github.com/FlareZ123/experiment-01/actions/runs/38888116287) passed all jobs on `e0c42b44c5cf9de3457b38288402ed97a0265c8f`.

## Defect and bounded correction

Previously any lowercase 64-character hexadecimal string in `trace_sha256` passed the raw-record contract even if no recorded actions existed. The statistical report could not distinguish a complete trace from an arbitrary placeholder digest.

Each game can now optionally contain `action_trace`, an ordered nonempty array of event objects. Each event requires `step` equal to its zero-based list index and a nonblank string `action`; additional structured action information is permitted. When this field is present, its canonical SHA-256 **must** equal the existing `trace_sha256`. A mismatched digest, malformed step/order, invalid action label, unsupported JSON type, nonstring object key, invalid Unicode surrogate, or ambiguous/nonportable number raises `ValueError`.

## Exact canonicalization

`action_trace_sha256(trace)` calculates SHA-256 on UTF-8 bytes from Python `json.dumps(trace, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)`. Object keys are sorted lexically by Python Unicode code-point ordering; array order is unchanged. Strings retain their Unicode code-point sequences without NFC/NFD normalization. All numeric values must be integers in the inclusive exact range `[-(2**53-1), 2**53-1]`; floating-point values are excluded, including `1.0`. JSON booleans are valid payloads but cannot substitute for integer `step`. This is a documented Python-oriented portable convention, **not** a claim of RFC 8785 equivalence.

A producer should construct a parsed trace value, canonicalize it with this module, and store both `action_trace` and the resulting digest. Parsing a raw JSON object that contains duplicate keys before calling the helper can hide duplicates, so producers should reject duplicate keys at ingestion if raw untrusted JSON is accepted.

## Evidence semantics

The original `schema_version: 2` and all pre-first-turn engine-failure constraints remain intact. Legacy digest-only games remain readable. New result fields:

- `verified_completed_traces`: number of completed games with hash-matching payloads;
- `digest_only_completed_games`: completed games with only an unverified digest;
- `all_completed_traces_verified`: true only when at least one completed game exists and **every** completed game has a valid payload;
- `trace_integrity_promotion_eligible`: the preceding condition and zero failed games;
- `competitive_evidence_qualified`: **always false**, reflecting still-unverified rules, replay, simulator and decision policies.

These integrity flags are independent of the statistical-threshold flag. They do not validate match authenticity: anyone who edits actions can recompute their digest. A full action array may omit intermediate prompts, hidden draws, reducer events, or game-state transitions; the current envelope does not prove it is exhaustive. The hash does not bind the complete record's seed, revisions, rank, deck hashes, or first-turn fields. It verifies internal consistency only.

## Test coverage

Synthetic tests cover digest-only compatibility, a verified completed record, mixed verified/unverified records, failure-induced promotion denial, changed action contents, forged digests, Unicode escape equivalence, key-order invariance, action-order sensitivity, distinct Unicode normalization sequences, malformed event envelopes, floats/NaN, out-of-range integers, lone surrogate code points and nonstring object keys.

## Next evidence-quality step

Define a versioned *producer-side* end-to-end Store event stream with complete actions and prompt replies, bind it to trusted engine/deck/seed provenance, verify its integrity and completeness, and replay on pinned Twinleaf with stable terminal and intermediate states. Treat any hash-only or unverifiable record as diagnostic even when an engine winner is present. Do not use trace integrity alone to count competition-grade wins.
