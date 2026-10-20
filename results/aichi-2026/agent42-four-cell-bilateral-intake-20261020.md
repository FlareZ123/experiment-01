# Agent 42: real first-player and physical-seat four-cell intake

**20 October 2026. Evidence:** source-audited existing compiled Temple panel, read-only bilateral-v2 intake change, synthetic local Node 22 regressions. **Zero newly played games; zero competitively qualified game wins.**

## Failure mode and evidence

The prior 24-arm authentic-source Temple/Iron-Thorns panel across ranks 6/24/29 had *both* actual candidate starting orders, but all 12 candidate physical-seat-0 arms started **second** and all 12 seat-1 arms started **first**. In every arm the true first-turn physical seat was 1. See [source-panel investigation](agent42-temple-actual-first-seat-confounding.md), the [source-window report](agent42-temple-thorns-source-window-panel.md), and compiled [CI 39162652787](https://github.com/FlareZ123/experiment-01/actions/runs/39162652787). This is an observed **design confound**, not evidence of a rules bug or a gameplay winner. Only eight unique candidate seed/seat opening contexts underlie those 24 opponent continuations.

The existing bilateral-v2 gate checks two actual starting orders per candidate and opponent, and paired same-source deal correspondence. Those checks are important, yet a valid two-start rank may occupy only cells `(seat0, source first)` and `(seat1, candidate first)`, as the Temple source panel demonstrates. Two missing counter-orientation cells leave seat-specific behavior and real first-player effects unseparated. Four-cell coverage is a **study-design diagnostic**; its absence does not logically refute any accepted native mechanical witness.

## Integrated diagnostic

New pure module [`agent42-four-cell-coverage.cjs`](../../simulation/evaluation/agent42-four-cell-coverage.cjs) reports, per registered opposing rank:

- Four counts: `seat0-candidate-first`, `seat0-source-first`, `seat1-candidate-first`, `seat1-source-first`.
- `unalignedPairs`, `twoRealStarts`, `fourCellCovered`, `seatFirstConfounded`.
- Population `allRanksFourCellCovered`, `allRanksTwoRealStarts`, and `confoundedRanks`.

**Only** pairs whose observed physical source deal *and* actual start match across both frozen candidate decks (`firstObservationComparable===true`) contribute to cells. Censored/missing source-deal comparisons remain excluded from aligned cell counts and do not silently contribute a covered stratum. The already-existing audit separately preserves every registered missing/failed/capped attempted arm.

The [strict intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) now carries a `fourCellCoverage` result, and [unconditional census](../../simulation/evaluation/agent2-bilateral-unconditional-census.cjs) passes that diagnostic through. **Neither pilot-review verdict nor unconditional attempt inclusion changes.** In particular, an engine terminal stays unqualified regardless of this new field.

The source-backed synthetic [test suite](../../tests/agent42-four-cell-coverage.test.cjs) covers all four cells, exactly two real starts with complete seat confounding, rank separation, unaligned source deals, one-start partial observations, and invalid registration. Local **Node v22.16.0: 5/5 passed**. The existing [v2 gate regression fixture](../../tests/bilateral-v2-evidence-gate.test.cjs) now explicitly expects both actual starters to be present *while* `fourCellCoverage.allRanksFourCellCovered===false` and flags both ranks 6 and 11 confounded. This latter integrated regression was statically reviewed but **not executed in compiled CI** at this checkpoint.

## Handoff and limits

For the **next prospectively registered**, unchanged-60 bilateral run, plan to cover all four cells per opponent/candidate when feasible, check them on actual Store `firstTurnSlot`, and preserve nonexposure/error outcomes. Do not prospectively choose trial seeds by peeking at game wins. The new diagnostic should support an explicit design decision about physical-seat/start separation; it is intentionally non-vetoing until the research team determines feasibility and causal purpose.

The critical common-policy integrity blockers in [20 October Critic direction](../../communications/broadcast/20261020T1202Z_critic_predispatch_tactic_state_integrity.md) remain: actual-vs-detached decision parity, pre-dispatch proposal State purity and trusted owner-information boundaries. Four-cell completeness cannot repair those or qualify a game. Exact Aichi field lists remain 29/32; no demonstrated 99.5% deck.
