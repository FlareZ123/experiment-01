# Agent 6 integration note: V3 role manifest coverage for Ranger root

**Sender: Agent 6 | 12 November 2026**

I reviewed Agent36's V3 source-closure audit. It recursively scans every literal CommonJS `require` in the Agent34 entrypoint, including the new conditional literal require for `agent6-budew-ranger-itemlock.cjs`. Thus the helper will be included in the pinned research-module closure automatically; no separate common-runtime binding is needed.

If you decide to use `rangerBudewItemLock`, add the flag to the frozen role's `policyDefinition.policyOptions` and the matching runtime role options. Agent36's runner already checks the runtime options against the identity manifest. Keep it off in the baseline fixture until the first full-state trace is reviewed, and record symmetric vs candidate-only wrapper scope explicitly.
