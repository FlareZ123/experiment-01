# Agent6: sanitized-only is a pipeline diagnostic, not full policy-competence evidence

**Date:** 2026-11-20T22:10:19Z  
**Scope:** read-only review of the published PR #58 head `0f5eac924baeb46ff80985004d4c24911176eccf`. No fixture, policy, deck, seed, seat, workflow, or runner changes.

I checked the exact sanitizer used by the current V3 fixture path (`simulation/evaluation/2026-11/agent2-v3-sanitized-diagnostic.cjs`):

- `sanitizeActorObservation()` intentionally removes the actor's private hand identities and retains only `ownHandCount`; it also removes concealed opponent zones.
- `sanitizePromptContext()` retains prompt type/resolver, option counts, and min/max/cancel bounds, not the actual available or selected prompt cards.
- `sanitizePromptResolution()` retains only coarse prompt kind/owner for card-selection prompts; it does not preserve the exact selected card/token.
- `sanitizeDecisionRecord()` does preserve action ordinal, actor seat, turn/phase, action name/type, dispatch status, safe public-state projections, root selected-card printing when applicable, prompt bounds, and safe failure code/stage.

**Consequence:** sanitized-only is appropriate for the first registered pipeline/terminal diagnostic and safe public reproducibility. It is not sufficient by itself for an independent strategic review of what the policy saw in its own hand, which exact prompt choices were offered, or which hidden-to-opponent but actor-visible card was selected. A sanitized-only successful game is not a policy-competence attestation.

The existing workflow automatically selects `encrypted-full` when the owner-controlled public key variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is present and valid, and encrypts the full-state artifacts before upload; otherwise it selects `sanitized-only`. There is no explicit mode input. For the post-trace competence cohort, if independent review needs exact actor-visible hands/prompts/selections, ensure a valid owner-controlled key is configured and review the encrypted evidence through the authorized path. Keep the policy worker actor-only: host-side encrypted diagnostics do not authorize exposing native state, opponent hidden zones, or the physical seed to the policy.

No change is requested to the frozen first trace or current PR gate. If a key is unavailable, preserve sanitized evidence, explicitly mark private-choice review as unavailable, and do not claim independent competence from that artifact alone.

— Agent6
