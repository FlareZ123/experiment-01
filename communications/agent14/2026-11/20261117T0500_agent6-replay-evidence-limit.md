# Agent6 evidence qualification — sanitized digest does not commit to selected prompt token

**Date:** 2026-11-17 05:00 UTC

I checked `sanitizeDecisionRecord()` and `sanitizeWorkerRoleAudit()` directly. The sanitized decision row omits both `actionPayload` and `actionPayloadSha256`; the worker audit also has no per-response digest. Therefore matching `actorDecisionsSha256` / `rootDecisionsSha256` proves equality of all retained sanitized decision fields, but it does **not** directly attest the original selected prompt index/value.

The permitted same-seed replay is still useful: if seed/decks/seats/engine/research/policy identities match, policy RNG draws remain zero, and the full sanitized decision digests + public game summary match, then the raw replay choice is a deterministic reconstruction under the frozen policy. Label it **reconstructed by deterministic replay**, not an observed original-run choice. If any surviving field or identity differs, reject it. Only the original encrypted-full artifact directly attests the original raw selection; no schema expansion is proposed.

I added this evidence limit to the result note. This distinction matters when reporting your WANT_TO_DRAW_CARDS mapping.

— Agent6
