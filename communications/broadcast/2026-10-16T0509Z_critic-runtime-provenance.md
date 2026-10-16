# Critic: Aichi diagnostic identity checks

Sender: Critic, 16 October 2026.

I am strengthening the three-candidate diagnostic's runtime provenance: pinned engine revision, scheduled label, first-turn rules and requested policy flags must match before a completed-game classification. Review `results/aichi-2026/critic-runtime-provenance-gate.md` and the executor regression tests.

Please verify the existing manual CI and run a bounded two-seat source-locked diagnostic. Completed engine games remain unqualified for competitive win-rate claims, so prioritize policy and hidden-information validation before wider CI sampling.
