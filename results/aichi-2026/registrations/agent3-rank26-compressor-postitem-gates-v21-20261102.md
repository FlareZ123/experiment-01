# Retrospective rank26 original-source post-Compressor prerequisite gate replay v2.1

**Agent 3 | 2 November 2026 08:40 UTC | fixed before executing the additional v2.1 observer. This is a REPLAY of existing deals, zero new independent games.**

## Frozen parent evidence and narrow question

[Prospective v2 native result](../agent3-rank26-compressor-physical-v2-native-20261102.md) was emitted by successful compiled [CI 41412768803](https://github.com/FlareZ123/experiment-01/actions/runs/41412768803) at immutable head a2a6dfe0b335b93f48b97d1361e99b11c8312680. Its precise results: 24 exact paired original source physical deals, 48 native arms, 14 authentic rank26 source-first, 0 baseline and 8 treatment firstturn Battle Compressor plays, 0 additional firstturn Crisis Punch, 11 deals with positive physical Compressor settlements **at any turn** per treatment and control. That any-turn observer count does not identify firstturn settlement. The v2 native full artifact is [13126447034](https://github.com/FlareZ123/experiment-01/actions/runs/41412768803/artifacts/13126447034), ZIP SHA256 e316ccb67a754a02ff356f1e371b6720a14d300e2d467d6af2ab2509053e96e6.

**Question:** on those *same unchanged initial physical source deals*, did the early Battle Compressor decisions actually put distinct original Lightning cards into owner discard during turn one? After the decision, which additional known, owner-visible barriers remained: Benched Meloetta, Benched Tapu Koko, both Lightning in discard, held/attached single DCE, held/spent Cologne, and having given the opponent five Prize cards?

## Prespecified replay

Call the exact existing v2 prospective runner a second time with the same source rank26 and opponent rank6 original 60s, seed base 20261106, repeats 72 through 83, both physical seats, same fixed native game engine pin a9905a76a6c4103ba4b6cb9a49e86bad795c5c05, 120-action maximum, and identical control and treatment decision policies. Do not change preexisting v2 code, Tactics or prompt resolver behavior.

Install **only a reversible read-only Store dispatch wrapper outside the v2 run** that snapshots, on each true first-global-turn source-owned native normal action root, the owner's hand, visible board, discard, attached Energy and Tools, own Lost Zone, visible Stadium, and opposing Active/Prize count. Never read opposing private zones, owner's facedown Prizes, owner unrevealed deck card identities or alter decisions. Mark root captures as correlated within original deal. The v2 native physical observer itself records globalTurn on each deck-to-discard receipt; the replay postprocessor must independently filter **globalTurn===1**, require native dispatch returned and the paper positive minimum. Treat card IDs as physically unique within that same game and never aggregate repeated moves as distinct games.

The wrapper infers baseline/treatment index from the exact AddPlayerAction 101 start ordering; assert precisely 48 starts, all original 24 matched paired fingerprints and zero native errors. Assert exact reproduction of the previously published v2 aggregate numbers (24,48,14,0/8 BC uses, 11/11 anyturn positive settlements, 25 Lightning movement events and 17 Exeggcute movement events in treatment anyturn, 0 new Crisis Punch, 3/3 unqualified native terminals). Fail closed if any of these change. This parity is necessary before treating new snapshots as a faithful read-only replay.

Output per original deal and arm with full source owner root snapshots and positive physical firstturn receipts. The primary contrasts are baseline versus treatment firstturn physically settled Compressor prompt cases, original Lightning copies physically moved in the firstturn, and firstturn owner-root prerequisites following those movements. If numbers are zero or unchanged, retain them. This does **not** add a new unselected gameplay sample or qualify competitive games.

## Interpretation limits

These are descriptive state and mechanics observations on 24 previously reported seeds. Same-seed replication cannot be pooled with v2 as 48 more independent source deals. The observer does not establish firstturn owner resource acquisition beyond native actions already seen, proper opponent human strategy, 25-minute paper clock, all 32 exact original lists, or candidate superiority. Original-source and fixed-deck comparison qualification remains at **zero**.


## Pure-test import preflight correction

First manual [CI 41414786379](https://github.com/FlareZ123/experiment-01/actions/runs/41414786379) failed **before game compilation and before any retrospective native replay**, because the new pure source-root test imported the diagnostics module, which had eagerly imported the compiled Twinleaf-dependent v2 runner. Node raised MODULE_NOT_FOUND during module loading. The other 33 standalone tests passed. This is a pure-test initialization defect and supplies **zero v2.1 result**.

The diagnostic runner is now loaded lazily inside diagnostic(), preserving the exact original native parent run and all passive snapshot logic. Source commit d2d7729. All frozen original cards, seeds, game policy and source observations remain untouched. The corrected run must satisfy the preregistered strict v2 aggregate equality checks before publishing a finding. This preflight failure stays in the record.
