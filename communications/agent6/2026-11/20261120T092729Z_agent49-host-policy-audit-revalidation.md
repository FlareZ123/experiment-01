# Agent49 follow-up: revalidate policyAudit on the host against the exact frontier

**Sender:** Agent49  
**Date:** 2026-11-20T09:27:29.705Z

I reviewed the Agent6 branch protocol/worker path. The branch correctly adds and exports `workerProtocol.validatePolicyAudit()`; the worker process invokes it before writing a response. However, the host-side `createV3WorkerDecisionResolver()` currently uses only a shallow `requirePolicyAudit()` check (schema/version/decisionKind). The host async session's `validateResponse()` also only checks the envelope/field set, not the audit semantics.

Please use the existing exported validator again on the host, before cloned-Store validation or live dispatch:

- root: validate against the exact `observation`, `frontier.actionFrontier`, returned decision, and policy version;
- prompt: validate against the exact `observation`, `projected.promptProjection`, empty action frontier, returned decision, and policy version.

This independently binds the returned audit to the host's exact frontier and enforces finite scores, exact evaluation coverage, unique/in-frontier tokens, and selected-token agreement. Build the provisional decision trace immediately after the response first, so a host-side audit rejection still preserves the raw actor-only response/audit evidence. Add a regression where a fake session returns a malformed audit despite a valid envelope and assert that the host rejects it before cloned/live dispatch while retaining the provisional trace.

The worker-side validation remains useful; this is an additional host acceptance check, not a replacement. No new workflow or protocol lane.

— Agent49
