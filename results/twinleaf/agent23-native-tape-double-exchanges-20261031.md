# Hidden opponent hand: authentic taped two-card exchange paths

**Agent 23, 31 October 2026. Compiled source-policy diagnostic. Zero competitive-qualified games.**

## Question and material new possibility

A one-card concealed hand/deck exchange may leave a selected action unchanged
even when two simultaneous concealed printing changes cross a threshold
used by the bot. In a deliberately diagnostic pure fixture, a synthetic
policy selects a different action only when the opponent's hand contains
at least two Trainers. Its initial opponent hand has two Energy and its deck
has two Trainers. Exhausting **all four possible single-card exchanges**
leaves the original action unchanged, while **both disjoint two-card paths**
change the action under the same exact RNG tape and owner observation.
This is a mathematical counterexample to treating even complete single-swap
coverage as proof of hidden-information invariance, rather than a claim that
any specific real card or genuine owner root exhibits that threshold.

## Implementation and replay gate

- [Disjoint path selector](../../simulation/twinleaf/agent23-bounded-double-exchanges.cjs)
  enumerates pairs of different-printing hand/deck exchanges with distinct
  hand indices and distinct deck indices; no physical card can be moved twice.
  The denominator is unordered **physical double-swap paths**, not distinct
  concealed-hand print multisets. Repeated printings cause duplicate outcomes
  and the sampling procedure does not assign a metagame probability.
- [Native tape scanner](../../simulation/twinleaf/agent23-native-tape-bounded-opponent-hand.cjs)
  accepts `swapSize:2` as a default-off option and preserves the original
  same-physical-root selected-action parity and strictly consumed native
  policy RNG tape on every independent world. It compares detached owner
  observations, physically conserves the opponent's concealed card-instance
  inventory, rejects shallow clones, and replays the original baseline at
  the end. Every rejected alternative remains explicit.
- [Pure controls](../../tests/agent23-native-tape-bounded-opponent-hand.test.cjs)
  include the synthetic two-Trainer threshold, no eligible double path,
  repeated-printing path-vs-world counting, and the preexisting one-swap
  negative/positive controls. The [manual native workflow](../../.github/workflows/twinleaf-hidden-information.yml)
  uses `agent23_native_opponent_hand_tape=true`,
  `agent23_native_bounded_opponent_hand_tape=true`, and
  `agent23_native_bounded_double_swap=true` together.

## Compiled evidence

[GitHub Actions 41158925221](https://github.com/FlareZ123/experiment-01/actions/runs/41158925221)
at research head `aa32fc15b11cfdad3608b9c428f6d16a6d84036d` **succeeded**.
The pinned compiled Twinleaf native job passed all **18/18** targeted
pure controls, reproduced all four real source-game controls, and archived
full trial rows in workflow artifact
`agent50-live-deck-order-historical-fourarm` (ID `13025578713`).

| Authentic historical development root | Eligible physical disjoint double paths | Attempted | Native tape valid | Selected-action changes |
| --- | ---: | ---: | ---: | ---: |
| Rank 6, champion candidate A | 10,589 | 16 | 16 | 0 |
| Rank 6, New Moon candidate A | 10,589 | 16 | 16 | 0 |
| Rank 11, champion candidate B | 3,854 | 16 | 16 | 0 |
| Rank 11, New Moon candidate B | 9,803 | 16 | 16 | 0 |
| **Total** | **34,835** | **64** | **64** | **0** |

Every root had matching original Store decision, unchanged live control
playback, actor-observation equivalence, original physical inventory
conservation and final baseline stability. No attempted double path
failed, exhausted its original policy RNG tape, or changed the selected
action. The 64 tests represent less than one percent of eligible physical
paths and cannot be interpreted as a representative success probability.

## What this does and does not establish

These four source deals were retrospectively chosen from ranks 6 and 11;
the unchanged original candidate lists and generic replay policy are
competitively unqualified. Both the one-swap and two-swap negative
findings apply to those tested roots and tested alternate concealed
assignments only. Historical opponent public reveals, legitimate known
Prize or deck contents, and the full information-set posterior remain
unauthenticated. The method cannot certify a hidden-information-safe
policy and does not establish a stronger deck or tournament game result.

Next priority is to find *decisive native scored* owner roots with exact
original-action RNG tape parity; those roots cannot be interpreted until
the parity gate succeeds. The baseline field remains **29/32 exact opposing
60s**, unverified final ranks **23/25/28**, **zero competitive-qualified
games**, and no validated **99.5%** fixed-deck win rate.
