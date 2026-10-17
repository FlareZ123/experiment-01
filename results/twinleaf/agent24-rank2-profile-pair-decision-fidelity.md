# Rank-2 Expanded source-K0 decision fidelity: frozen source-paired diagnostic

**Agent 24, 17 October 2026.** This is a bounded Twinleaf bot-policy diagnostic. It cannot establish candidate superiority, real-paper matchup win rate, or performance toward the 99.5% target.

## Fixed comparison protocol

- Exact published **Aichi rank-2 Vileplume Control and rank-1 Shadow Rider** sixty-card registrations, resolved through the source field manifest.
- Two predeclared distinct physical seat assignments: rank 2 in seat A at seed `20261021`, and rank 2 in seat B at seed `20261023`.
- Two predeclared policy arms per physical allocation: `expanded-action-fidelity-probe-v1` and `expanded-source-k0-stage-gh-v2`.
- Same per-arm source deck hashes, RNG seed, starting-slot evidence and strict pre-dispatch prompt validation. These checks establish source/seed identity, while policy-dependent earlier decisions may alter downstream draws.
- Maximum 350 root actions per arm. Truncated action-limited episodes remain truncated; an engine outcome is not a qualified competitive result.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; standalone runner `simulation/twinleaf/expanded-source-profile-pair.cjs`.

## Predeclared questions and evidence boundaries

1. Do both profiles begin from the same physical rank-1/rank-2 source lists and first mover?
2. Where is the **first differing recorded meaningful action**, if one exists? This is a projected action chronology (ordinal, global turn, player seat, action kind, card, ability, attack, option or selected cards). The recorder omits some Store actions, RNG and closure state; a matching prefix is **not** full replay certification.
3. Does the actual rank-2 player play Guzma & Hala, choose the discard-two mode, select Jet Energy and TM Evolution, attach/use TM, and announce Barrage Evolution? A search/attachment/prompt success is still a partial ALS witness.
4. If no such source-legal opportunity occurs in the sampled games, classify the experiment as **unexposed**, rather than treating identical outputs as a finding of policy equivalence.

The two arbitrary seeds are an intentionally cheap smoke comparison and **do not guarantee rank 2 goes second or starts Bunnelby**. The independently enumerated opening visibility event `Bunnelby in original 7 AND any evolving Basic plus Guzma & Hala/Tag Call in first 8` occurs in `1,564,841,264 / 20,468,966,760 = 7.644945064%` of unrestricted source-rank-2 first-eight observations. This calculation groups printed source inventory as Bunnelby 2, evolvable Basics 6, Guzma & Hala/Tag Call 8, other 44. It excludes Prizes, discard economics, search sequencing, Energy/Tool selection, board choices and all opposing decisions. It is an upper-level visibility gate for that particular natural route, **not an actual ALS or win probability**.

## Versioned execution

Manual-only workflow input: `expanded_source_pair:true` on `.github/workflows/aichi-tm-attack-policy.yml`. Source change `b08d60ac9375eedde661acb7bf32743d12dee55a`, test `e15c9d472b98e21423be9fe27c21bbb08b4b3e50`, workflow `70998560bdf80bcb026ea4c3bc1a578edbb31e9b`. The output archive is named `rank2-expanded-source-policy-pair`.

[Manual compiled run 39053233363](https://github.com/FlareZ123/experiment-01/actions/runs/39053233363) was dispatched on this revision. Its result must be inserted below after checking the actual workflow conclusion, decision readouts and archive provenance.

## Completed source-pair result

[Compiled manual CI 39053524045](https://github.com/FlareZ123/experiment-01/actions/runs/39053524045) passed. In seed 20261021 both experimental policies had the same recorded root decisions; in seed 20261023 they diverged at global turn 5, root action 68, when v1 chose Guzma & Hala and v2 chose Bellelba & Brycen-Man. Neither source allocation produced a rank-2 Evolution attack. Full artifact provenance, prompt choices, action counts, explicit limitations and the unrelated first red CI are in [the verified evidence report](agent24-rank2-policy-fork-ci-evidence.md). No competitive games are qualified.

## Initial status

The benchmark continues to have **zero independently qualified competitive games**, and exact Top-32 opponent lists remain **29/32**. The rank-1 reference list and all challenger statuses remain unchanged. The more recent `expanded-gh-root-search-v3` policy is independent and intentionally excluded from this first v1/v2 comparison.
