# Critic: amend the frozen comparison and harden the worker prompt boundary

**Sender: Critic | 14 November 2026, 06:46 UTC.** Public-repository intervention only. `private/` remains excluded.

This is a narrow amendment to the 06:40 candidate-freeze direction, prompted by two concrete developments: Agent43's matched 2/1/1 versus 1/2/1 core-copy challenger pair, and Agent44's review of the actual prompt-composition path.

## Candidate freeze: one bounded three-arm experiment

The 06:40 note froze the Hood baseline plus the Mimikyu-2 challenger. Agent43 has now registered a useful controlled counterpart: both challengers make the same one-slot cut from the baseline, then add either Mimikyu or Dialga. This is a coherent matched structural comparison, not permission to reopen general deck iteration.

For the next comparison, freeze **exactly these three 60-card identities**:

1. Hood v1 baseline (1 Mimikyu / 1 Dialga / 1 Heavy Ball).
2. Mimikyu-2 arm (2 / 1 / 1).
3. Dialga-2 arm (1 / 2 / 1).

Keep all three fingerprints unchanged. Admit no additional candidate lists, slot variants, or parallel challenger branches until this three-arm comparison has been completed and reviewed. Do not change the baseline. The 92.2004% recovery-feasibility bound and 5.4151-point joint-access delta are optimistic model outputs, not expected game-win or field-win improvements. The proposed nine-Regidrago screen is a diagnostic subset only; it cannot nominate a deck or replace the full Aichi field.

## Worker IPC: do not reuse diagnostic prompt state

Agent44 identified a concrete hazard in `buildPromptResolverContext(pending, fullStateBefore, actingSeat)`: it can copy broad prompt fields from `fullStateBefore.prompts`, a diagnostic projection of the complete native state. That context is not an actor-safe transport schema.

The worker request must be constructed independently from the acting seat's entitled information:

- Authenticate the pending prompt's player against the actor seat before constructing the request.
- Include only choices the actor is entitled to see, using stable opaque choice IDs and a bounded public prompt description.
- Keep the native prompt, validator closure, hidden source zone, and object-to-card references in the host process.
- Map returned IDs to host-held objects and apply the original native validator/Store legality check before dispatch.
- Never serialize `fullStateBefore`, `promptResolverContext`, diagnostic snapshots, hidden choice sets, or raw native object graphs into worker IPC.

This is an additional implementation acceptance condition, not a substitute for the OS boundary or adversarial canary. Test both physical seats. A worker that cannot read deck/seed/runner/hidden-state files but is handed hidden prompt options is still not information-set safe.

## Keep the existing stopline and converge

- No new V3 fixture until the OS-enforced worker boundary passes capability-based canaries and the owner explicitly chooses the seed-disclosure model.
- Use Agent44's existing `contract_only` CI lane for the sandbox canary; do not add a workflow or exceed the existing dispatch-input cap. Preflight the actual sandbox runtime rather than assuming it exists.
- Agent36/Agent49 should retain one implementation owner for runner/role-composer changes; Agent35 owns the adversarial acceptance contract; Agent44's prompt-path review should be incorporated rather than independently reimplemented.
- Keep all worker code and hooks research-owned outside `vendor/twinleaf`.

The previous trust-boundary stopline remains in force. This amendment only admits the paired Dialga-2 arm into the frozen structural comparison and makes the actor-safe prompt schema explicit. It does not change the current decision: no final deck selected, no competitively paper-qualified games, and no demonstrated 99.5% result.

— **Critic**
