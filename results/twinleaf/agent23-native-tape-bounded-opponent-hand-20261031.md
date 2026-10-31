# Native same-root RNG-tape bounded opponent-hidden-hand audit

**Agent 23 | 31 October 2026 | validated compiled retrospective diagnostic. No competitive win inference.**

## Research problem

The earlier authenticated one-exchange tape study established 4/4 original-action
replay parity and found no selected-action changes under one chosen concealed
hand/deck exchange per root. Its negative result had one-world coverage.
The updated checker repeats that authenticated decision and its **exact native
policy RNG tape** over a bounded collection of different opponent concealed
hand/deck assignments, without replaying or changing a live turn.

## Frozen authentic source and experiment

- Engine pinned Twinleaf submodule `vendor/twinleaf` revision
  `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Field: original source ranks 6 and 11, with the rank-1 champion reference
  and New Moon Lockbreaker v1 in their frozen real-game candidate seats A/B.
  These four historical seeds are development fixtures, not a held-out sample.
- Code: [bounded tape scanner](../../simulation/twinleaf/agent23-native-tape-bounded-opponent-hand.cjs),
  [native same-world parity](../../simulation/twinleaf/native-same-world-tape-parity.cjs),
  [preexisting one-world comparator](../../simulation/twinleaf/native-tape-opponent-hidden-hand-contrast.cjs),
  [pure tests](../../tests/agent23-native-tape-bounded-opponent-hand.test.cjs)
  and the [existing manual compiled workflow](../../.github/workflows/twinleaf-hidden-information.yml).
- Workflow test head `60e6c0307f26a9e1b4c66d3bf18315cc854633ab`,
  [Actions run 41158374693](https://github.com/FlareZ123/experiment-01/actions/runs/41158374693),
  **completed success**. Its native historical control and compiled pure
  test steps passed, all four original real-game projections matched.
- The entire four-arm JSON was retained as workflow artifact
  `agent50-live-deck-order-historical-fourarm`,
  artifact ID **13026485119**. All four original candidate action signatures,
  original selected RNG tape digests and matching source fingerprints were
  captured by the authentic observer and replayed before counterfactual swaps.

## Exact compiled outcome

| Historical original-root arm | Eligible distinct-printing one-card swaps | Fully attempted | Tape-valid | Action reversals |
| --- | ---: | ---: | ---: | ---: |
| 6:0:A, champion reference | 170 | 16 | 16 | 0 |
| 6:0:A, New Moon v1 | 170 | 16 | 16 | 0 |
| 11:2:B, champion reference | 109 | 16 | 16 | 0 |
| 11:2:B, New Moon v1 | 159 | 16 | 16 | 0 |
| **Total** | **608** | **64** | **64** | **0** |

All four roots had native original action parity, original source replay
noninterference, current owner-observation equivalence, opponent hidden-card
instance inventory conservation, source State conservation and bracketed
replay stability. There were **0** alternate-world rejections or RNG-tape
exhaustions and **0** selected-action reversals across these 64 worlds.
None of the four source-root tests exhausted the set of eligible single
exchanges; **544 eligible one-exchange states were not run**.

## Interpretation

This is a demonstrated **negative conditional action-sensitivity result**
at precisely four retrospectively chosen owner roots. Its native same-root
parity gate gives stronger evidence than an unseeded fresh-bot replay.
Selection of alternate worlds was still retrospective and based on actual
concealed printings. The work does not establish their compatibility with
past opponent-revealed cards, the owner's K0/K1 state, or the opponent's
prior decision process. A one-card swap census also excludes all cases
requiring two or more simultaneous hidden changes.

The tested roots were candidate turn 3 and may be weak opportunities for
hidden-information-dependent tactical choices. A separate first-finite-score
root experiment is the next discriminating check. In all cases, the original
policy remains generically hidden-information-unsafe and the opponent
decision quality remains unqualified.

**No fixed-list deck was changed or promoted. Exact field source coverage is
29/32 (missing final ranks 23, 25, 28), competitive games qualified 0,
and the 99.5% win-rate target unproven.**
