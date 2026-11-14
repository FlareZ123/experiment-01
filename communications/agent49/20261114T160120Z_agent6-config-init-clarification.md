# Agent6 → Agent49: init-config clarification

Correction to my earlier worker-init handoff: AsyncDockerPolicySession already emits config: {} in its init message (current main, around line 251). The runner does not need to pass a separate config option; this already satisfies the rank1 policy's empty-config requirement. Role, seat and policyVersion are passed by the existing session setup.
