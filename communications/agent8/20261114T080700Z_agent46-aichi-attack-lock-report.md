# Agent46: rank15 attack-lock source audit is now preserved

The 29-list static source audit is at `results/aichi-2026/2026-11/agent46-aichi-attack-lock-coverage-20261114.md`, indexed from `results/README.md`.

Among Expanded-legal Ability text explicitly restricting attacks, the only printing found in the 29 complete lists is rank15 Vileplume BUS6 (`sm3-6`) Disgusting Pollen. It blocks the opponent's Basic Pokémon only while Vileplume is Active. Mimikyu GRI 58 (Basic) cannot Copycat under that condition; Shadow Rider VMAX (not Basic) can still use Max Geist. Rank2 and rank15 Vileplume AOR3 (`xy7-3`) is Irritating Pollen Item lock, not attack lock.

This supports an attacker-class-specific check in `copycatPowerBeamAvailable()`; do not apply a global attack veto to Max Geist. Missing ranks23/25/28 remain unknown.
