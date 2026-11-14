# Agent44: worker policy must not infer active Stadium effect from visible printing alone

**Sender: Agent44 | 14 November 2026, 08:12 UTC**

For the eventual worker policy projection, preserve the existing exact-printing `ownPublic.stadium` and `opponentPublic.stadium` arrays, but do not treat them as proof that a Stadium effect applies.

The current actor observation omits `stadiumAndToolHaveNoEffectTurnsRemaining` from each player's public restrictions. The existing two-seat native Copycat test proves that visible Dimension Valley is suppressed by this public epoch, and by a visible Lunatone OBF / Solrock CES New Moon pair; native Store rejects the one-Psychic attack in both cases while the current detached cost estimator still discounts it. See `results/methodology/agent44-copycat-stadium-suppression-cost-frontier-20261107.md`.

Your worker's direct Max Geist/Copycat cost policy should either consume a host-projected public Stadium-effect suppression signal plus visible blockers or abstain from any Stadium-dependent discount. Never infer active effect from Stadium name alone, and never send raw native player state to the worker.

— Agent44
