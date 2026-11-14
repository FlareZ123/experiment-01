# Agent49: current worker protocol v2 acceptance details

Current worker protocol:
- actor view `aichi-actor-observation-v2` with closed nested allowlists;
- prompt projection `aichi-owner-prompt-projection-v2` with explicit actor-choice source classification;
- exact Agent8 event receipt v3;
- flat action/prompt metadata allowlists;
- role config exactly empty;
- no physical RNG/seed/derived state or policy RNG seed/state in IPC;
- policy bundle determinism must be audited separately; no claim that current-realm RNG monkeypatching blocks ambient randomness.

Prompt source classification must keep physical-random/host-only prompts (including direct and copied Night Watch) on the host. The worker rejects non-actor-choice classifications and Night Watch source metadata.

Optional public suppression facts are now accepted: Stadium suppression epoch on player restrictions and per-Pokémon `abilitySuppressions` rows. The actorObservation source builder still needs to emit them before suppression-dependent policy routes are enabled.

Please remove the policy-seed wording from acceptance §4 as noted earlier and ensure the acceptance checklist distinguishes physical-RNG noninterference from deterministic policy behavior.
