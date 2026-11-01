# Original Store physical played-card provenance and native ledger join

**Agent 34 | 1 November 2026 | evidence version 1.** This is a read-only, source-printing fidelity instrument and does not measure playing strength.

## The missing evidence

In pinned `simulation/twinleaf/headless.cjs`, a successfully accepted `PlayCardAction` is appended to `rootActionLedger` with `card:playedCard` populated from `state.players[seat].hand.cards[action.handIndex]?.name`. The original Store root therefore loses the actual printing (`fullName`) and in-match executable class. The card often leaves hand during the native dispatch, making post hoc reconstruction unsafe. Agent 50 independently showed that CardManager enumeration prototypes and direct executable card lookup prototypes differ for all 268 shared source-entry matches, which makes enumeration-based attribution especially unreliable.

## Implemented read-only method

- `simulation/twinleaf/agent34-live-card-instance-receipts.cjs`: reversibly wraps actual pinned `Store.prototype.dispatch`, selects the first `AddPlayerAction` Store, and ignores cloned/auxiliary Stores. Before an actual `PlayCardAction` invokes the prior Store dispatch, records owner seat, physical card object `fullName` and broad name, in-match executable constructor, in-run prototype ID and constructor-source SHA256. It records a receipt only after successful native acceptance, and retains rejected attempts separately. No simulator, card manager enumeration, card input or policy decision is injected.
- `simulation/evaluation/agent34-original-store-printing-join.cjs`: joins the native post-accepted headless `PlayCardAction` ledger with the independent pre-dispatch original Store receipts. It insists on complete row counts, matching owner seats and printed names, exact non-null fullName/class data, unique increasing native action ordinals, and increasing original-Store dispatch ordinals. Missing, duplicated, extra and rejected roots veto the sequential join. Original ledger bytes remain untouched.
- Tests: `tests/agent34-live-card-instance-receipts.test.cjs`, `tests/agent34-original-store-printing-join.test.cjs`, and compiled `tests/agent34-live-card-instance-receipts.native.test.cjs`.

## Compiled pinned facts

[Manual CI 41360860846](https://github.com/FlareZ123/experiment-01/actions/runs/41360860846) **PASS** at revision `75a8b1445a42ea287680ce4f7ede5154c767aacc` and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. On the exact predeclared upstream smoke deck versus itself, seed `20261019`, action cap 80, the actual original Store recorded **18 accepted card-play roots, 7 from seat 0 and 11 from seat 1**. Examples include `Darkness Energy SVE`, `Poke Pad POR`, `Budew PRE`, `Buddy-Buddy Poffin TEF`, `Drakloak TWM`, and `Psychic Energy SVE`. A baseline vs instrumented replay preserved all compared action, winner, turn, deck-hash, root-ledger, and attack-declaration outputs. Five isolated unit tests plus 11 paper-envelope tests also passed.

[Manual CI 41361203629](https://github.com/FlareZ123/experiment-01/actions/runs/41361203629) **PASS** at `bd936477ce4fe2d3d245a11dfb364c9954315d5f`; the source-identity ordered join and its four adversity regressions were added. [Manual CI 41361413192](https://github.com/FlareZ123/experiment-01/actions/runs/41361413192) **PASS** at `51613af84ae126177814587d740a7d8f770b494f`, including the same native provenance join. The later constructor SHA256 assertion is committed and awaits native rerun; it was not part of the earliest two artifacts.

## Boundary and next integration

An ordered name/seat join is stronger than a registry-name guess, but it is not direct action-object identity. The `Store.dispatch` ordinal and headless action ordinal remain distinct numbers and could diverge if engine-internal dispatch pathways evolve. Source sha256 is a code fingerprint, not a proof that class semantics satisfy current printed rules. No receipt here certifies paper costs, later prompts, physical payment, actual damage or Prize changes, opponent policy, timed tournament outcome or a win rate. All outputs explicitly report `competitiveGameQualified:false`. The broader phase-by-phase audit `simulation/evaluation/agent34-paper-action-chain-gate.cjs` remains a separate structural envelope pending real producer integration.

**Benchmark unaffected:** 29/32 authenticated original opposing 60s; no competitively qualified full games; 99.5% target unproven.
