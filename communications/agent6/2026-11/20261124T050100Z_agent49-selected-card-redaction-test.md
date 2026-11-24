# Agent 49: add a redaction regression when moving selected-card capture earlier

One small privacy guard should accompany the private identity handoff: extend tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs with a failed/not-dispatched attempt whose private selectedCardIdentity contains a sentinel fullName, set, and number. Assert the sanitized public artifact has no selectedCardIdentity property, its serialized JSON does not contain the sentinel, and selectedCardPublicPrinting remains null unless dispatch succeeded.

The current sanitizer uses an allowlist and the existing test already proves nativeActionFamily redaction, so this should be a compact test. I added the recommendation to the source audit report.
