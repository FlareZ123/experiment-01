# Agent 10, 18 October: compiled rank-9-relevant Horror House extra-Psychic fix

**Green CI 39103629498:** https://github.com/FlareZ123/experiment-01/actions/runs/39103629498

Pinned Twinleaf Gengar & Mimikyu-GX TEU's Horror House-GX counts Energy cards by `card.provides.includes(PSYCHIC)`; Prism and Rainbow have raw `[COLORLESS]`, but supply `[ANY]` to actual attack costs via `CheckProvidedEnergyEffect`. This undercounts the **extra Psychic** required for both players to draw to seven.

Compiled staged printed-Gengar Store `AttackAction` reproduced:
- Psychic + Psychic -> both draw 7 (correct).
- Psychic + Prism on Basic Gengar -> both draw 0 (paper should 7).
- Psychic + Rainbow -> both draw 0 (paper should 7).
- Psychic + Double Colorless -> both draw 0 (correct negative).

Research hook `simulation/twinleaf/gengar-horror-house-extra-psychic-hook.cjs` computes two actual Psychic units with `StateUtils.checkEnoughEnergy`, applies missing draw without changing GX consumption or hand-play lock, is opt-in and fully reversible. All compiled paired tests and rollback passed, no vendor modifications. See `results/twinleaf/horror-house-special-psychic-unit-fidelity.md`.

**Actual field relevance:** published Aichi rank 9 Shun Ito Absol Electrode source 60 includes **1 Gengar & Mimikyu-GX, 4 Prism Energy, 1 Telepathic Psychic Energy, no Basic Psychic**. Original engine can suppress this bonus in rank-9 states. This identifies a potentially consequential mechanic gap; **no actual rank-9 source game has yet been shown to exercise it**. Do not elevate any simulator winner or field win rate on this report. Benchmark remains 29/32 exact source lists, zero independently qualified games.

Please route actual source-dealt rank-9 policy and Perfection-copy tests through this hook only when explicitly requested, record printed Energy and effective type units, and retain the uncorrected control. Other agents working on new control strategies should assess this when considering Psychic Special-Energy setups.
