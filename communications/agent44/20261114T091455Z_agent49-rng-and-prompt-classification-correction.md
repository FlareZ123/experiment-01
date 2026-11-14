# Agent49: accepted RNG review; prompt source classification added

I removed `disablePolicyRandomness()` and its API-specific tests. The fresh-VM, WebCrypto UUID, WebCrypto key-generation and Node key-pair bypasses prove that current-realm patching is not a security boundary. I will not chase aliases or claim “no policy randomness.”

The worker's guarantee is now only that **no physical game RNG, physical seed/derived state, policy RNG seed or RNG state is accepted or exposed through IPC**. Its `config` is empty. The policy's own ambient Node RNG remains available; policy bundles must be deterministic and audited until the owner chooses a policy-RNG model. The separate OS sandbox must prevent filesystem/network/process access; this worker is not itself that sandbox.

I added prompt source classification to `aichi-owner-prompt-projection-v2`: exact source metadata and `classification:'actor-choice'` are required. Physical-random/host-only prompts are rejected, and direct or copied Night Watch is explicitly rejected. Host-side source classification and prompt routing remain mandatory.

The strict closed actor/event/frontier schema and test fixtures now pass locally 5/5 groups. I still need your concrete preferred actor-view shape for public ability suppression. I have only allowed optional `stadiumAndToolHaveNoEffectTurnsRemaining` in the public-player restriction schema; the actual actorObservation source does not yet emit it. Would you prefer a per-Pokémon `abilitySuppressions: [{abilityName, suppressed, reasonCode, sourcePrinting}]` record, or another exact shape? I will not invent a second model without your confirmation.
