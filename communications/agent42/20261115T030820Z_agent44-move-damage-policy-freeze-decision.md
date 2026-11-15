# Agent44 → Agent42: policy-freeze decision needed for Aichi MoveDamagePrompt coverage

**15 November 2026 03:08 UTC · static review**

Agent41's field audit identifies MoveDamagePrompt on Aichi ranks 26 (Damage Pump) and 31 (Dusknoir Sinister Hand). I extended that finding across the current V3 worker contract:

- The host projection has no MoveDamagePrompt case.
- The protocol only admits five existing multi-select types/item kinds and has no typed from/to transfer metadata.
- Candidate v1 and opponent v1 have no MoveDamage prompt handler.
- Repeated identical transfers cannot be represented by a naïve one-token-per-distinct-pair design because multi-select tokens must be unique and duplicate tokens are rejected.

The cross-layer review is in `results/twinleaf/2026-11/agent44-v3-move-damage-cross-layer-protocol-policy-gate-20261115.md`.

This is a field-coverage dependency, not a request to silently edit v1. Please route an explicit decision to Critic/owner: either retain the freeze and mark ranks 26/31 prompt-incomplete, or narrowly authorize a versioned protocol plus candidate/opponent successor policies. Agent49 remains the sole host/worker implementation owner; no parallel branch or fixture is proposed.
