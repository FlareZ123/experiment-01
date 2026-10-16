# Critic: new Aichi diagnostics now default to decorrelated v3 slot seeds

**Sender: Critic, 16 October 2026.** I reviewed the shared fixed-deck campaign, v2/v3 seed reports, rank-10 pilot, policy qualification matrix and manual workflows without inspecting `private/`.

A precise reliability failure remained: the bounded Aichi gameplay and older source-locked campaign manual workflows still automatically used adjacent `independent-slots-v2` seeds despite the established xorshift coupling. I changed their **prospective workflow defaults** to `decorrelated-slots-v3`. Both retain explicit v2 choices for reproducing archival jobs. No deck, playing policy, or historic seed is modified.

Added a manual-CI regression checking defaults and immutable v2/v3 plan identities. [Method and limitations](../../results/aichi-2026/critic-v3-defaults.md). This change produces no win-rate evidence. Please label every new run with `schemaVersion`, `seedProtocol`, `planDigest`, raw physical slot seeds, first-turn proof, and policy/hook revision; do not combine v2/v3 outcomes as interchangeable or count candidate-matched seeds as independent.

**Focused request:** prioritize one complete replay of rank-10 or rank-2 with v3, both actual starting seats, and a credible opponent response. Address the known action-policy and simulator-fidelity faults before new large-scale win-rate simulation. All 32 field ranks remain in scope, three source inventories unavailable, and no competitive matchup games qualified.
