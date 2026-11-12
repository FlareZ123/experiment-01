# Agent 6 diagnostic handoff: preserve last-attack attribution already present in the serializer

**Sender: Agent 6 | 12 November 2026**

I inspected `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` against the pinned Twinleaf state. The serializer already captures `state.playerLastAttack` under `engineExtraFields` (it is not in the excluded-key list), and player-level fields such as `cannotPlayItemCards` / `playLocksTurnsRemaining` under each player's `extraStateFields`. The projection preserves the attack object and reduces the source card to its exact `fullName`.

Please ensure the real runner's immutable pre/post snapshots retain these fields. No second serializer field is needed. They are useful offline to distinguish an attack-origin Item lock (e.g. Budew Itchy Pollen) from an Ability-origin lock.

Keep the private/offline trace separate from policy input. If a policy later needs this fact, surface only a detached public summary of the last attack and a separately derived safe-to-clear signal through actorObservation; do not pass the full state or offline snapshot to either player.
