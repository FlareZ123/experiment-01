# Agent 45: preregistered rank-4 Electrode readiness census (18 October UTC)

**Registration before dispatch of any campaign evidence.** This is an engine-policy exposure test, not a competitive-game qualification or win-rate estimate.

## Frozen comparison

- Source opponent: published Aichi Top-32 rank **4**, Shu Hosoda, original source 60 in `results/aichi-2026/full-decklists.json`.
- Candidate arms: the four unchanged benchmark/challenger 60s in the source campaign schedule (champion reference, Hood Shield, Temple, New Moon). No list edits.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Exact research baseline SHA `71d312cff0fa8b3c17c2104c5985f424df7bbbbd`. Fixed branch `agent45-rank4-opportunity-20261018`; both workflow runs must resolve to the **same new branch head after this report is committed**.
- Manually dispatched existing `.github/workflows/aichi-first-game.yml`: `pilot_ranks=4`, `seat_seed_protocol=decorrelated-slots-v3`, `expanded_action_policy=false`, `electrode_gx_energy_correction=true`, `electro_rain_damage_correction=true`, `electrode_gx_prize_trade_policy=false`. Four candidates × both physical seats = eight scheduled trials per arm. No retrospective seed replacements.
- Control sets `electrode_opportunity_observer=false`. Experiment sets **only** `electrode_opportunity_observer=true`.

## Predeclared outcomes and gates

1. Require identical exact source/candidate hashes, seed, actual starting player, per-game rule and policy flags except the observer, actions, turns, all chronological source action traces, terminal states, and winner. Any gameplay divergence invalidates read-only interpretation; preserve failures.
2. Count all eight scheduled games, including noncompletion, no-opportunity, failed setup and terminal loss.
3. In experiment reports, inspect `electrodeOpportunitySummary.countsBySeat`, choosing the physical seat occupied by source rank 4 for each game. Distinguish six increasingly specific **necessary** conditions: active Alolan Raichu, Benched Electrode-GX, both, both plus discarded relevant Special Energy, at least three opponent Prizes before Bomb, and a post-Bomb prize-deficit window. Summarize both per-action decision counts and number of games ever reaching each condition. Preserve all negative exposures.
4. The observer omits Ability-lock, prevention, live Ability-use history, discard Energy allocation, legality of attack, and opponent hand. Even a positive necessary state does not prove a legal Bomb or profitable Electro Rain. A zero at an earlier necessary stage rules out later stages in the sampled decision points only.
5. Target claim remains **29/32 exact 60s, zero independently competitively qualified games, no demonstrated 99.5%**.

## Separate staged tactical bound

The independent compiled 5-Energy dual-recipient fixture sends Unit Energy LPM to Crobat V instead of Raichu. The v1 Prize-trade predictor counts 11 Lightning units (330 potential damage) on the aggregate discarded resources but only 10 (300) would reach Raichu under that specific bot choice. An unmodified 320-HP Active target is a conditional KO forecast inversion. This **does not assert** that this precise state occurred in any source campaign; the dedicated regression in `tests/electrode-gx-energy-hook.test.cjs` is a staged falsifier.

## Outcome

Pending dispatch. Record source run IDs, exact head SHAs, status, artifact IDs and fingerprint comparisons here after both finish.
