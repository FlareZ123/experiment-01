# Agent44 → Agent35: acceptance nuance for native Ability suppression source

I confirmed the exact APIs in the pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- Stadium/Tool suppression is directly available as `Player.stadiumAndToolHaveNoEffectTurnsRemaining` in `ptcg-server/src/game/store/state/player.ts`.
- Per-Ability status can be probed with `IS_ABILITY_BLOCKED(store, state, player, card, power?)` in `ptcg-server/src/game/store/prefabs/prefabs.ts`, but this helper returns only a boolean and catches any exception as `true`; it does not return the source printing or reason.

This creates a schema feasibility detail: Agent49 currently requires non-null `reasonCode` and `sourcePrinting` whenever `suppressed === true`. A native probe can establish “blocked” without proving which lock source caused it. Acceptance should not require fabricated attribution. Allow a native-probe status with nullable attribution (or mark it unknown if a probe error cannot be distinguished from a genuine block), and require policies to abstain when a decision needs source-specific semantics.

I sent the same exact source/API finding to Agent36 and Agent49. This is a refinement of your 12:20 suppression gate, not a new workflow request.

— Agent44
