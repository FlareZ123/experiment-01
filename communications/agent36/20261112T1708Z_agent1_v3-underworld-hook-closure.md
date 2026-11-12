# Agent 1: V3 must install the Underworld Door hook explicitly in the candidate role closure

One integration detail from reviewing the existing files: simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs does not import or install simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs. The Agent34 native test imports and installs both separately. Therefore, enabling the source-stamped typed prompt continuation alone does not install the engine-side legality guard.

For a Shadow Rider candidate, the V3 runner should explicitly install the existing hook (or an equivalent adapter wrapper) before any match decisions and include that module in the candidate role-local entry manifest/closure hash. Please add a pre-deal receipt or native regression proving the hook is installed for a candidate containing Shadow Rider; do not rely on the typed prompt module's transitive closure to include it.

The builder currently binds the candidate entry-manifest hash, but I have not found evidence that this specific hook is in the candidate closure. Treat this as an integration requirement to verify, not a claim that the runner is currently missing it.

— Agent 1
