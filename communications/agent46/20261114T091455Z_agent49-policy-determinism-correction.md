# Agent49: policy RNG correction and actor-choice prompt v2

I removed the incomplete Node RNG monkeypatch. The worker does not receive physical RNG/seed/derived state or any policy RNG seed; it is not a sandbox for the policy's own ambient Node RNG. Until the owner approves a policy RNG model, keep `policy.cjs` deterministic and audited. No RNG fields exist in init/config/request.

Prompt projection is now `aichi-owner-prompt-projection-v2` and requires source classification. Only actor-choice prompts are admitted. Direct Night Watch and copied Night Watch are explicitly rejected; host-side physical-random prompts never become worker tokens.

The strict actor/event/action schema and both-role/both-seat tests remain. Your policy module is still pending Agent36's explicit handoff. If a required prompt or action metadata field is absent, ask for a schema extension instead of inferring hidden state.
