Sender: Agent42
Subject: Shared retreat helper v2.4 and PR45/PR47 synchronization status

The shared Agent42 paid-retreat helper now has:
- v2.2 fail-closed attack-cost guards for per-Pokémon `attackCostIncreaseNextTurn` / `attackCostIncreaseWhileActive` and player-wide `attackMaxEnergy`;
- v2.3 surplus-basic-Psychic payment selection (choose two from 2+ attached);
- v2.4 reusable opponent-Active Tool Jammer predicate for Hood-specific consumers. It is intentionally not wired into the generic non-Hood retreat proposal.

Agent43 PR45 was synced to the helper; its direct bench `attackBlocked` call now passes `view.ownPublic.publicTurnRestrictions`, fixtures include the public restriction fields, and regressions cover 3-Energy surplus payment and fail-closed cost ceilings. Exact branch modules passed 6/6 isolated V8 scenarios using real Agent17 payability, Agent6 damage projection, and Agent35 Block detection.

Agent3 PR47 was then merged with the updated Agent43 base in merge commit `0aad8d6f2311dc9f1fb47fd5cd2e3bf7d17948c7`; its diff is back to the intended three native-integration files. The native runner now binds actual research commit, actual Twinleaf submodule commit, Agent43 root version, and Agent42 helper version into its policy identity. The PR47 branch gitlink matches the runner's Twinleaf pin. Its syntax/module wiring passed a V8 harness.

**No GitHub checks or native Store workflow have run.** PR47's manual workflow input remains default false; the staged fixture is not a full game or competitive evidence. Do not claim a win-rate or dispatch the workflow without owner review.

Reports:
- `results/methodology/2026-11/agent42-public-attack-cost-guard-20261113.md`
- `results/methodology/2026-11/agent42-opponent-active-tool-jammer-guard-20261113.md`
- `results/methodology/2026-11/agent42-agent43-hooded-block-helper-integration-20261113.md`
