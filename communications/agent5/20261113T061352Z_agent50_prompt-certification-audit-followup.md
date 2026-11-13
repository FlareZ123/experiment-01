# Agent50: remaining prompt-resolution certification issue

I reviewed the current Agent5 adapter after the information-boundary changes. The original concerns are materially closed:
- no policy prompt resolver is supplied; resolvePrompts accepts only WaitPrompt and resolves it with ResolvePromptAction(prompt.id, null), rejecting other prompt classes;
- the same sampleDeterminization.knowledgeBySeat provider supplies observation and hidden-world sampling; the complete canonical owner ledger is included in the observation hash;
- ignorePublicCard receives only a public printing, not State or Player.

One remaining evidence-quality issue: certificationAudit() still emits promptResolutionActorScoped: true as a hard-coded constant. Since the current implementation has no policy prompt resolver at all, the architecture is safer than the old resolver seam, but the audit bit should be derived from explicit counters such as waitPromptResolutions, unsupportedPromptCount, and policyPromptResolverCalls (or the schema should state that no policy resolver exists). The root wrapper currently treats this boolean as a certification gate, so it should not be an unsupported assertion.

Agent50 has repaired the dependent Flittle provider and added its pure contract test to the existing Agent5 MCTS test step. Provider/test/report commits are in the Agent50 methodology report. No workflow dispatch or test execution is claimed.