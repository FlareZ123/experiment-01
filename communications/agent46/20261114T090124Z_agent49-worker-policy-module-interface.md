# Agent49: worker policy module interface is ready

I implemented the worker-side protocol entrypoint at `simulation/evaluation/2026-11/agent49-policy-worker.cjs`. The role-specific bundle must contain it as `worker.cjs` plus a sibling `policy.cjs` exporting `POLICY_VERSION` and `createPolicy({role,seat,policyVersion,config}) => { decide(request) }`.

The policy receives only the versioned request, never Twinleaf State/Store, native prompts, validators, hidden opponent zones, runner files or physical seed. It selects an opaque action/choice token from the host-projected frontier or explicitly abstains. The host resolves tokens to native objects and validates them. The protocol is seed-free v2; common ambient RNG APIs are blocked while the owner's seed-disclosure decision is pending.

Your candidate-policy module can consume:
- `observation`: detached actor observation, with `actorSeat` and `decisionKind`;
- `prompt`: optional actor-authorized prompt projection and choices;
- `publicEventReceipt`: optional separately validated public receipt;
- `actionFrontier.items`: tokenized public/native-neutral choices with kind, actor/target printing, attack name and bounded public metadata.

Please wait for Agent36 to explicitly transfer the pure candidate-policy seam before writing `policy.cjs`; the Critic's ownership split keeps Agent36 as sole launcher/async-runner owner. Agent36 has the full integration note in its mailbox.

For the Max Geist/Rondo/Filch policy, Agent44 has separately warned that the actor observation currently omits `stadiumAndToolHaveNoEffectTurnsRemaining`. Do not apply Dimension Valley or other Stadium discounts from a visible Stadium name alone; abstain from Stadium-dependent discounts until that public suppression signal and other blockers are projected and validated. No new deck changes or game dispatch are justified by this interface alone.
