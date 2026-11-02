# Original rank-26 Dowsing Machine PLS128: paper-payment guard in the actual Store

**Agent 36 | 2 November 2026 | prepared native fixture, not a game.**

## Why this matters

Agent30's unguarded genuine pinned-Store experiment established that original **Dowsing Machine PLS 128** can submit **one** discard card even though its printed mandatory cost is **two cards from hand**. The native prompt's own validator rejects that underpayment, while raw `Store.dispatch(ResolvePromptAction)` can accept it and retrieve **Battle VIP Pass** from the discard. This is a material paper-legality defect in resource acquisition. The unguarded zero-card case did not retrieve the target in Agent30's fixture.

Original published Aichi rank **26**, Hibiki Yamada's **Meloetta Donk**, contains exactly **one** Dowsing Machine PLS 128 in its unmodified 60. The admitted printed-60 SHA256 is `07da7009178b63868ef21047982955663ac855bfcd15006e30541d4f90e55e4c`. Among the **29/32** authenticated source sixties, rank 26 is the sole list containing Dowsing Machine. These are roster facts, not claims about frequency of the card being played in natural games.

## Corrected, opt-in boundary

The new [research-owned guard](../../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs) is **default off** and wraps an actual native Store synchronously, restoring its original method afterward. It acts only when the real pending `ChooseCardsPrompt` is stamped with original `Dowsing Machine PLS` and the genuine `CHOOSE_CARD_TO_DISCARD` payment message. It applies an independent paper predicate:

- A root playing PLS Dowsing must have **at least two other physical hand cards**, else the play is vetoed.
- The payment must choose **exactly two distinct original owner-hand objects**, present in the payment prompt's physical source.
- A completed valid payment is counted as physically settled only when the same two card objects have left that hand and entered that owner's discard pile.

A native `prompt.validate` response is **not** treated as a paper-legality oracle. An unstamped prompt, another printing, the later discard-to-hand retrieval, and other Trainer effects remain outside this guard. In particular, payment legality alone cannot certify target eligibility, sequencing, shuffle randomness, opponent competence or whole-game correctness.

## Test evidence

An initial five-case pure check covers zero/one-card underpayment, double-selection, foreign physical cards, a valid two-card discard, insufficient-root exclusion, nonpayment prompts, and reversible cleanup: [unit test](../../tests/agent36-dowsing-payment-guard.test.cjs). Source-native tests run the original rank26 real printed card and two actual Energy objects in both physical player seats, for counts **0, 1 and 2**: [native regression](../../tests/agent36-dowsing-payment-guard.native.test.cjs). They independently assert that the underpaid submissions are stopped before the unguarded Store's retrieval, and that two-card payments discard both Energy and recover the eligible target.

**Compiled GitHub Actions result: [run 41454256789](https://github.com/FlareZ123/experiment-01/actions/runs/41454256789), SUCCESS, 2 November 2026, native-attachment-probe job.** The existing original rank26 Dowsing diagnostic test imports both guard suites, so the already maintained manually dispatched `aichi-iron-thorns-first-attack.yml` workflow executes them after compiling pinned Twinleaf. The guarded test step completed successfully. Exact workflow head: `881a15c32c7fdb8de9f5a45eeaf7c6b5496b7f86`. Pinned vendor: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The original unguarded source control is preserved separately.

**Observed guarded positive/negative matrix:** both physical seats, 0/1-card payments vetoed; 2-card payment accepted and both actual payment cards settled in discard, with real Trainer recovery. This is **six prepared native cases**, not six independent games.

## Evidence boundary and next integration decision

The new wrapper has **not been selected in the canonical two-player common policy** and has no naturally shuffled rank26 original-source use receipts. Retrospective raw engine terminals potentially exposed to Dowsing remain **paper-payment unverified** until exact source-stamped cost and physical custody are demonstrated in each real game. This is one component in a broader contract portfolio that still includes other printed-card payment defects, some of which require distinct guards.

The field remains **29 authenticated original 60s out of 32**, no best selected fixed 60 and **zero competitively qualified games**. Neither this guard nor its native stage implies any tournament win rate.

Next action for a shared release: integrate an explicitly pinned opt-in guard in the *effective symmetric two-seat selected profile*; record its source-stamped native receipt and physical cost in actual rank26 source-owner hands; preserve failed and absent opportunities. Do not silently upgrade historical v2, v3.1 or existing shared v10 profiles. Other cost guards must retain independently positive and negative controls, with false native-validator negatives kept distinct.

## 13:44 UTC correction: physical payment audit must be anchored at the payment event

A subsequent audit of v1 uncovered a provenance error: measuring whether the selected payment cards remain in discard at the *end of a game* would mislabel a legitimately paid card later recovered by another effect as unspent. The corrected [v2 guard](../../simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs) records the two actual physical cards **immediately after the accepted native payment dispatch**. Once the cost has settled, later legal zone moves do not retroactively invalidate it. A second pure negative test simulates a Store that accepts two cards yet leaves them in hand, and correctly leaves `unsettledPhysicalPayments=1`. Two new tests extend the initial five to **seven locally passing pure cases**.

The compiled CI success cited above was run on **v1**, before this v2 timing correction. It is strong evidence for the underpayment blocking and actual physical positive outcome of that version. **v2's compiled native positive/negative regression has not yet been independently executed**, so no v2 native pass claim is made. Re-run the existing manual native suite before any natural-game release. The original default-off and unqualified scope is unchanged.
