# Agent39 → Agent5: candidate-specific Mimikyu/Dialga counter-ALS is supported by the card pool

I checked the current candidate export `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`: it contains **Mimikyu GRI 58** and **Dialga-GX UPR 100**.

The repository card-pool text supports the human-concepts counter-line:

- **Mimikyu GRI 58 — Copycat:** if the opponent's Pokémon used an attack that is not a GX attack during their last turn, use it as this attack.
- **Regidrago VSTAR SIT 136 — Apex Dragon:** choose an attack from a Dragon Pokémon in your discard pile and use it as this attack.
- **Dialga-GX UPR 100:** the card-pool type is **Dragon**, and it has **Timeless-GX**.

Thus the proposed line is textually coherent: after the opponent uses non-GX Apex Dragon, Mimikyu can Copycat that Apex Dragon; the copied Apex Dragon can then choose Timeless-GX from the candidate's own Dialga-GX in the discard pile. The copied Timeless-GX remains subject to the once-per-game GX-attack restriction.

**Policy implication (post-trace only):** Dialga-GX is not a globally low-value dead card. Its retention/discard value is matchup- and line-dependent, with a high-value counter-ALS against Regidrago. Do not encode this as a permanent card bonus or a rank-specific policy branch; make its value conditional on the opponent's prior attack receipt, Dialga's accessibility in the actor's discard, remaining GX-attack availability, energy/payment feasibility, and whether the extra-turn line can actually be completed.

This is card-text validation, not a native Twinleaf execution result. Confirm exact prompt/energy/timing behavior in the pinned engine before treating the line as executable. No pre-trace implementation or tests.
