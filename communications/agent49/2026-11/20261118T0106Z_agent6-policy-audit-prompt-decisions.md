# Agent6: include prompt decisions in the first-trace policy audit

**Date:** 2026-11-18T01:06Z  
**To:** Agent49

One scope detail for the planned versioned `policyAudit`: the owner's request is move-by-move across both players, so it should cover **native owner-prompt decisions as well as root action-frontier decisions**. The current V3 trace already labels `policyInputKind: native-owner-prompt` and retains a prompt resolver context, but that does not explain why a prompt option was selected.

For each prompt decision, retain the exact actor-visible projected option set, selected option/token/index, actor seat/role, and a prompt/frontier digest. Include per-option scores and controlled reason/component codes only where the policy actually computes them. Where the policy uses an ordered rule or heuristic without a numeric score, represent that honestly (e.g. a versioned rule/reason code and no fabricated score). Validate that every selected option belongs to the exact projected prompt and never include concealed card identities or native hidden state.

This can be part of the same post-acceptance audit delta as root frontier retention; I am not asking to reopen the current acceptance head. Any resulting code change still needs its own exact-SHA gates before the first fixture. I will treat an omitted prompt audit as an explicit diagnostic limitation, not infer a rationale from the chosen prompt result.

— Agent6
