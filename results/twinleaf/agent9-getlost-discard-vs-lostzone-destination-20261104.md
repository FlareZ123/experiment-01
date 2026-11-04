# Agent 9: printed Get Lost needs exact Lost Zone destination evidence

**4 November 2026 | narrow source-level and regression result.** Actual game win claims: **none**. This is an audit-fidelity correction to the selected bilateral developmental policy, rather than a claim that actual Twinleaf Get Lost is broken.

## Original pinned print and potential false-positive

The pinned upstream implementation is [`ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/girafarig.ts` at `a9905a76`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/girafarig.ts). Its printed Get Lost attack chooses **two cards from the opponent's discard pile and puts them in the Lost Zone**, with native `MOVE_CARDS(store,state,opponent.discard,opponent.lostzone,...)`. `Player.lostzone` is a public `CardList` in the [pinned Player class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/player.ts).

The [original source-stamped Get Lost owner hook](../../simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs) counted one `postDispatchPublicDiscardDepletions` when selected physical card references disappeared from the opponent discard and the discard count fell by the selected count. Those checks **do not establish destination**. Disappearance into the opponent's hand, deck or nowhere could pass that weaker audit while violating the printed attack. A mock-based legacy unit test originally deleted the selected cards without a Lost Zone and still counted a positive depletion. This was a **real audit false-positive risk** for future nonempty-discard native interactions, not an observed native card engine defect.

## Minimal research-owned correction

Commits [`25906996`](https://github.com/FlareZ123/experiment-01/commit/259069967b75d7efa511bf570946cb2bab78100b) and [`5d3b4611`](https://github.com/FlareZ123/experiment-01/commit/5d3b46113111361622457dfb67eca225a2f4110d) modify the research-owned hook and its existing pure regression test only. No upstream Twinleaf files, final deck or experimental opponent registration were modified.

The hook now records **two distinct post-dispatch evidence levels**:

1. `postDispatchPublicDiscardDepletions`: legacy positive-card removal count from public discard, retained for comparability.
2. `postDispatchExactLostZoneTransfers`: stronger proof that **the exact selected physical card objects** leave the opponent's discard and appear in `opponent.lostzone.cards`, with matching before/after zone counts and no preexisting duplicate references. Failed or unavailable positive-card destination checks accumulate in `postDispatchLostZoneTransferUnverified`.

The individual public event keeps `discardBefore/After`, `lostZoneBefore/After`, `discardDepletionConfirmed`, and `exactLostZoneTransferConfirmed` without copying the private opponent hand or deck. Zero-card Get Lost cannot count as a positive transfer.

## Negative controls and actual field impact

The extended existing `tests/agent36-source-stamped-getlost-owner.test.cjs` includes three otherwise identical source-marked two-card prompts with a mock original Store:

| Post-dispatch destination | Discard depletion counter | Exact Lost Zone transfer counter | Transfer unverified |
| --- | ---: | ---: | ---: |
| Opponent Lost Zone | 1 | **1** | 0 |
| Opponent hand (wrong) | 1 | **0** | 1 |
| Nowhere (wrong) | 1 | **0** | 1 |

A fourth test checks that legal zero-card Get Lost completion has zero positive-card resource transfer and zero unresolved positive-card transfer. These are constructed model controls, separate from actual source match observations.

The initial real joined-v5 four-arm native receipt [41893046249](https://github.com/FlareZ123/experiment-01/actions/runs/41893046249) had three empty opposing-discards. Consequently its real positive-card Lost Zone effect denominator remains **zero**. Neither the newly instrumented code nor its pure tests create an original-source positive-card Get Lost witness; the next required native evidence is one positive-card source-marked prompt with exact physical `lostzone` settlement and a meaningful opponent reply.

The existing manual-native workflow, `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`, already runs the updated owner-hook tests. Source and regression changes were queued for actual CI execution at commit `5d3b46113111361622457dfb67eca225a2f4110d`; final native CI status should be checked separately and recorded before treating this code change as integration-verified.

The full field remains **29/32 exact original name/count inventories, zero qualified games**, and no final selected 60.

## Actual pinned CI regression outcome

[Manual GitHub Actions run 41895319517](https://github.com/FlareZ123/experiment-01/actions/runs/41895319517) executed commit `5d3b46113111361622457dfb67eca225a2f4110d` against the pinned native build and reported **SUCCESS in both `issue25-joined-v4` and `koko-native` jobs**. The `issue25-joined-v4` job includes the updated `tests/agent36-source-stamped-getlost-owner.test.cjs` as part of its source-printed handlers contract test and a subsequent real pinned Store joined-v5 execution. The pure negative-control test therefore ran inside the same successful native-compiled workflow. This establishes test execution and the changed instrumentation's backwards compatibility with the existing four original development attempts. It **does not** establish a nonempty-discard original-source Get Lost movement, and the 4-arm v5 receipt still excludes competitive games.
