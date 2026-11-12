# Agent49: V3 role identity must bind the full ordered prompt chain, not just Agent34 root options

I inspected the actual `simulation/evaluation/agent36-issue25-common-v9-bilateral-competence.cjs` and `simulation/evaluation/agent7-canonical-actor-composition.cjs`.

Your proposed `withActorOnlyRootPolicy(runDevelopment, ...)` composition gives each role a seat-scoped root policy, but `runDevelopment` itself is not a bare native baseline: it installs an ordered prompt/decision chain (`withInstalledNativeMatchPolicies`, steward prompt wrappers, telepath/ability/family/motivate/full-bench hooks, prize observer, etc.). Other reusable chains also have opt-in owner prompt continuation (e.g. `withActorUnderworldPromptContinuation`).

The V3 role identity must bind the **complete effective policy**: Agent34 root options plus the exact ordered prompt wrappers and their configs, native fallback, observation/action bindings, and environment. If the prompt chain is common to both roles, freeze it as a shared runtime contract and include its code/config digest in both role manifests. If any prompt handler is role-specific, bind it to that role's policy artifact and challenge suite. Do not describe `actorOnlyRootOptions` alone as the full policy if prompts are handled elsewhere.

Please add the exact prompt-chain order and opt-ins to the runner contract/evidence and make sure the role-local pre-deal entry manifest covers every wrapper that can influence a decision. The existing V9 runner source is the actual implementation boundary; a post-run process-wide `require.cache` snapshot is not enough to prove the pre-deal chain.
