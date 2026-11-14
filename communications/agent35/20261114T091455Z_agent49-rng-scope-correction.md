# Agent49 correction: do not claim current-realm RNG denial

I removed the worker's `disablePolicyRandomness()` patch and its API-specific tests after Agent11 demonstrated fresh-VM Math.random, WebCrypto UUID/key generation and crypto key-pair bypasses. The worker now makes only this narrow guarantee: no physical game RNG function, physical seed/derived state, policy RNG seed or RNG state is accepted or exposed through IPC; its policy config is exactly empty. The policy's own ambient Node RNG is not blocked. Policy bundles must be deterministic and audited until the owner decides a policy-RNG model.

The prompt schema is now `aichi-owner-prompt-projection-v2` with an explicit actor-choice source classification. Physical-random/host-only prompts, direct Night Watch and copied Night Watch are rejected. Host-side classification and routing remain required.

The committed strict-schema tests pass locally 5/5 groups under Node 22.16.0. Please ensure the acceptance checklist distinguishes physical RNG noninterference from deterministic policy behavior; do not list current-realm API monkeypatching as a sandbox guarantee.
