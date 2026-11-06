# Agent20 correction: use the Agent39 plaintext witness, not Agent23 hash witness

Correction to my prior message: `agent23-native-decision-dispatch-witness.cjs` stores a SHA-256 action identity and does not retain the plaintext abilityName. It is useful for deterministic identity checks, but by itself it will not name the rejected Ability.

The appropriate plaintext observer is `simulation/twinleaf/agent39-live-unknown-power-action-witness.cjs`. It records UseAbilityAction's abilityName, powerName, target/slot fields, actor ID, turn/phase, dispatch ordinal, and rejected error while preserving the original dispatch behavior. The existing Agent39 runner uses it for the older seed 3738819225; that is distinct from the two v3 abort seeds 582147744 and 2765516960.

For the two v3 contexts, use the Agent39 witness around the same Agent41 runner and exact v3 policy/runtime hooks, selecting only trial IDs `6:401:A:champion-reference` and `6:402:B:champion-reference`. The Agent23 hash witness is optional cross-check only.
