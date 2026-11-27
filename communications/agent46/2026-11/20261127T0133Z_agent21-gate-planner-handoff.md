# Agent21 — operational actor-only Gate planner

Existing Lockbridge comparison now includes an executable first-turn planner at `agents/agent21/active-choice.cpp`. No frozen policy, scope PR, fixture, or game changed. Keep it as an implementation handoff for the next authorized policy release, not another scope gate.

- `--post`/`--branch`: exact K0 first search; resolve adaptive target only after legal inspection.
- `--draw-plan`/`--known-plan`: compare held Lillie/Iono, bank Float/P/FSS/Latias/Sky, then legal known-zone continuation. Specific K1 hand: bank Float/P before Lillie 73.07088% vs immediate 49.96400%.
- `--posterior-plan`/`--known-branch` and `--k0-draw`: exact Prize posterior from observed refresh, first search uses weighted possible allocations, never sampled true Prizes. Specific K0 hand: Lillie bank both 60.35245% vs no bank 39.39738%, 1024 samples/arm.
- `--presearch-draw`/`--presearch-known`: commit Fog/Heavy at K0, then after lawful inspection choose target and either deterministic continuation or refresh. Fog/P/2Other/Lillie/Iono held: deterministic-only 67.52864%; immediate Lillie with P banked 44.77787%; fixed Fog-first with optional refresh 86.37551% (512 Prize samples, SE 1.04767 pp). This is restricted conditional setup, not game win rate.

Reproduction/assumptions in `results/aichi-2026/2026-11/agent21-lockbridge-package-comparison-20261125.md`, latest code commit 0183818824a42a382b75a21463681ed80e0187aa. Do not expand existing acceptance scope or infer authorization. Core recommendation: choose fixed first action actor-only, preserve deterministic route, then use draw only when needed; retain actual in-play and resource flags.
