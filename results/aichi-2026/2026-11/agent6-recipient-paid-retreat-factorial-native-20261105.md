# Original rank 1/rank 3 recipient plus multi-Basic retreat: native negative opportunity gate

**Agent 6, 5 November 2026, 19:42 UTC.** Follow-up to the preregistration at [agent6-rank1-rank3-recipient-plus-paid-retreat-aba-20261105.md](../registrations/agent6-rank1-rank3-recipient-plus-paid-retreat-aba-20261105.md). This is retrospective developmental evidence from historically reused initial seed/seat cohorts, not an unbiased paper-Expanded win-rate estimate.

## Frozen question and source

Does the existing identical, source-independent, both-seat multi-Basic paid-retreat policy add any executable game actions or game payoff when both players already use the documented owner-only Basic Energy recipient frontier? The previous recipient-only intervention physically placed rank-1 Basic Energy on the Bench more often, while two Dialga-GX stranded Active scenarios remained zero-attack.

- Exact original rank-3 source 60 SHA256: `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`.
- Exact original rank-1 reference 60 SHA256: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Eight original pairs: seeds `3565472974`, `130758722`, `3792360798`, `1654918696` at rank-3 physical seat 0 and 1; three A/B/A arms per pair, 24 actual native attempts.
- A and A-prime run Basic recipient ON, paid-retreat override OFF. B runs the same Basic recipient ON plus the identical two-seat paid-retreat proposal. Exact source printings, seats, seeds, game policy otherwise unchanged.
- Registered runner: `simulation/evaluation/agent6-recipient-plus-paid-retreat-aba.cjs`. Root-level test: `tests/agent6-recipient-plus-paid-retreat-aba.test.cjs`. Manually dispatched pre-existing `agent2-fss-float-rank3-native.yml` with `agent6_recipient_paid_aba=true`.

## Actual pinned-native executions

The first registered [CI42060236761](https://github.com/FlareZ123/experiment-01/actions/runs/42060236761) succeeded at checkout `c92998fd1d61195f0fa9fb8eace665dfd475e40e`, compiled the vendor, passed 11/11 targeted pure tests, executed the 24-arm runner, and uploaded [artifact 13431466876](https://github.com/FlareZ123/experiment-01/actions/runs/42060236761/artifacts/13431466876); ZIP SHA256 `bcfc79e336f78bba55a84d85ca0dbda239455dc8ac6d1dafeb20470b0fcab429`. Original CI did not echo the JSON summary to logs.

To independently inspect the aggregated recorded outcome, a diagnostics-only stderr summary was added after the runner's full result calculation, retaining the exact JSON stdout artifact and gameplay functions. [CI42095552902](https://github.com/FlareZ123/experiment-01/actions/runs/42095552902), checkout `e0e3149cd51922a3c34687c41ecf897223e492ef`, completed SUCCESS, with 11/11 pure tests and **24/24 native terminals**. Its compact `AGENT6_RECIPIENT_PAID_NATIVE_SUMMARY` log reports:

| Native measure | A recipient only | B recipient + paid retreat |
| --- | ---: | ---: |
| Distinct same-deal seed/seat games | 8 | 8 |
| Native terminals | 8 | 8 |
| Native errors | 0 | 0 |
| Rank-1 native attack roots | 130 | 130 |
| Rank-3 native attack roots | 7 | 7 |
| Rank-1 physically witnessed Basic Bench attachments | 41 | 41 |
| Rank-3 physically witnessed Basic Bench attachments | 4 | 4 |
| Rank-1 terminal zero Bench Energy | 1 | 1 |
| Competitively qualified games | 0 | 0 |

All eight pairs are classified `paired-development` with exact initial full physical deal, original source deal, first seat, and A/A-prime full native root and terminal repeat parity. Every game has the same native winner across A and B. The B proposer observed **358** original native Pass decisions across the two physical seats, resulting in **0 owner-nominal retreat offers, 0 typed RetreatAction proposals, and 0 physically confirmed paid retreats**. Each of the eight groups had `nominalMultiBasicOffersBySeat: [0,0]`, `typedRetreatsBySeat: [0,0]`, and no accepted Retreat receipt. Thus the registered treatment was never activated: aggregate equality is a negative *opportunity* result, rather than evidence that an actually used retreat offers no tactical value.

The emitted eight source groups retain per-seed results in `AGENT6_RECIPIENT_PAID_NATIVE_SUMMARY` and full original action, target, deal, error, and game data in [CI42095552902 artifact 13447386942](https://github.com/FlareZ123/experiment-01/actions/runs/42095552902/artifacts/13447386942), ZIP digest `sha256:efcd1cd0f7f7093876ed330ff1efe49967db76ac06fef538930a5d1d19352506`.

An intermediate diagnostic [CI42094773456](https://github.com/FlareZ123/experiment-01/actions/runs/42094773456) compiled and passed all 11 pure tests but the runner immediately exited 1 before writing its normal summary; error-only JSON is preserved as [artifact 13447850594](https://github.com/FlareZ123/experiment-01/actions/runs/42094773456/artifacts/13447850594). **Later reproducible attribution:** Agent 2 independently inspected the archived failed runner JSON, finding a `SyntaxError: missing ) after argument list` in their newly introduced `simulation/twinleaf/agent2-bilateral-skyliner-free-retreat-bot.cjs:71`: an apostrophe appeared inside a single-quoted assertion. An eager shared-runner import exposed that unrelated experimental module before our runner could start. Agent 2 repaired the string in `fffd1f10` and moved its import to the explicit opt-in mode branch in `e0e3149`, after which the original paid native rerun succeeded. See [Agent2's dated direct attribution](../../../communications/agent6/20261105T1938Z_agent2_syntax_error_ci_regression_fixed_in_shared_runner.md). The failed CI remains an actual setup failure and cannot count as a game result.

## Interpretation and next discriminating work

The current paid-retreat policy is intentionally very restrictive. It only proposes at original Pass when the owner's Active has exact 2-4 printed Colorless Retreat Cost, the same number of attached Basic Energy cards, no Tool or retreat blocker, the owner is behind in a public deck-count race, the Active has no payable positive printed attack, and a Bench attacker can deal nominal printed damage fast enough before owner deck-out. The registered native evidence proves **zero intersections of these prerequisites at the 358 actual treatment Pass roots**. This does not identify which prerequisite eliminated the most roots. A read-only stage-census on those *same recipient-enabled* native roots would distinguish missing payment, mismatch of deck race, and missing funded Bench attacker while preserving the native decision policy. Existing Agent2 noninterventional `agent2-multi-basic-retreat-pass-cascade.cjs` is a suitable starting point, but its older no-recipient 340-Pass observations should not be conflated with these 358 recipient-enabled roots.

Do not prioritize larger reruns of this exact intervention as if they exercise retreat mechanics. Testing a new mobility policy would require new registration, an owner-observable opportunity denominator, proof of exact physical payment and promotion, and settled attack/control plus an opposing reply.

**Qualification:** still 29/32 authenticated name/count original Aichi inventories (missing 23, 25, 28), no selected fixed 60, no full-field competitive simulation or 25-minute paper-clock adjudication, and **0 competitively qualified games**. No evidence supports a 99.5% win rate.
