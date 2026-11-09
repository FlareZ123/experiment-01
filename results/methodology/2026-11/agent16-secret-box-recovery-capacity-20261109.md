# Agent16: marginal recovery-capacity payment for Secret Box

**9 November 2026.** This is an opt-in, owner-visible tactical payment selector. It does not change the selected shared actor policy or any fixed 60, and it produces no qualified competitive games.

## Concrete problem and behavioral correction

The existing Agent21 Secret Box DCI policy charges each discarded Rescue Carrier a fixed recovery-target premium whenever an eligible Pokémon is already in the owner's discard. This cannot distinguish a redundant second Carrier from the only Carrier protecting two discarded Pokémon. It can therefore disfavor a paper-valid three-card payment even when no *currently recoverable* target is lost.

The new `simulation/twinleaf/agent16-secret-box-recovery-capacity.cjs` enumerates distinct physical triples from the acting owner's offered hand and retains Agent21's remaining-copy-aware costs for other cards. It zeroes only the original binary Carrier recovery premium and adds a capacity-based marginal cost. With owner-held Carriers before payment `c`, Carriers paid `k`, and values `v_1 >= ... >= v_n` for already eligible discard targets, its loss is

```text
recoveryBefore = sum of highest min(n, 2c) target values
recoveryAfter  = sum of highest min(n, 2(c-k)) target values
recoveryLoss   = recoveryBefore - recoveryAfter
cost           = ordinary DCI cost + recoveryLoss * recoveryTargetPremium
```

The default equal-target value is one. An explicit owner-visible `targetValuesByPrinting` map permits testing unequal priorities. These are heuristic scores, not an empirical estimate of Pokémon utility. It supports the strict opt-in `preserveRecoveryValue` veto.

The pre-play selector checks the minimum three-card payment before committing Secret Box. The post-play selector uses the real `CHOOSE_CARD_TO_DISCARD` prompt, exact physical owner hand, Agent4 mandatory payment guard and native `prompt.validate` to filter candidates before ranking. The call does not read an opponent's hand, deck, or Prize cards.

## Action difference on the same physical hand

The synthetic fixed hand contains Secret Box, two expired Battle VIP Pass, two Rescue Carrier and one Lillie's Determination. Under explicit fixture weights of zero for VIP, three for Carrier and five for Lillie with a marginal recovery penalty of three per lost target:

| Owner discard, eligible Pokémon | Best payable three-card choice | Currently recoverable targets lost |
| --- | --- | ---: |
| 1 | VIP + VIP + Rescue Carrier | 0 |
| 4 | VIP + VIP + Lillie's Determination | 0 |

Discarding the first of two Carriers with one target leaves exactly enough immediate recovery capacity. Discarding one with four eligible targets sacrifices two opportunities and loses against the Lillie alternative in this fixture. This tests a genuine decision distinction the fixed binary premium cannot express. Both decisions remain **conditional on the heuristic card values**.

## Tests and engine boundary

- Pure seven-case suite: `tests/2026-11/agent16-secret-box-recovery-capacity.test.cjs`. Includes capacity losses with 1, 3 and 4 targets; unequal target values; strict no-loss veto; exactly three distinct physical cards; rejected prompt; and source-in-hand versus post-play hand.
- Native both-seat test: `tests/2026-11/agent16-secret-box-recovery-capacity.native.test.cjs`, staged under existing paper-payment hook. It compares pre-play versus post-play choices, dispatches actual `PlayCardAction` and `ResolvePromptAction`, then checks three-card discard custody, prompt settlement and the next Secret Box category search prompt.
- Both suites are attached only to existing manually triggered workflows: `aichi-benchmark-stats.yml` for the pure test and opt-in `agent16_recovery_capacity_native` in `aichi-dusclops-self-ko.yml`. The latter now runs the pure test and native test sequentially.
- A local isolated Node 22 seven-case run passed with dependency stubs; it is distinct from native Store evidence. **Native [run 42564512150](https://github.com/FlareZ123/experiment-01/actions/runs/42564512150) succeeded at commit `a3b1c5ed9158892b444ec46fd827c80bad3ac54c`.** Its actual pinned Store log contains all four combinations (owner seat 0/1 × one/four eligible targets). All four selected the preregistered physical payment, passed `prompt.validate`, the Agent4 paper payment guard, root acceptance, three-card Store discard settlement, and a real pending Secret Box `CHOOSE_CARD_TO_HAND` next prompt. Audit: four inspected roots, four inspected payments, zero vetoes; zero qualified games. The broad statistical [run 42564352282](https://github.com/FlareZ123/experiment-01/actions/runs/42564352282) failed its moving-policy inventory lane with four unreviewed environment switches. Its Agent16 substep outcome was failure and still needs attribution before claiming a full-suite pass.

## Subsequent native implementation receipts

- [Run **42565017661**](https://github.com/FlareZ123/experiment-01/actions/runs/42565017661), head `3dba1c314dbf3391c0a081d5e7e0acc0e81532f7`, **succeeded** with the actual repository dependencies. Pure policy suite: **7 passed, 0 failed**. Separate native test: **1 passed, 0 failed**, performing four staged payment choices (two target counts × both seats).
- Extended the same staged native workload to use Agent36's four-category `chooseSecretBoxCategories` on the **next authentic owner-deck prompt**, under Agent4's independent search-category paper guard. [Run **42565342064**](https://github.com/FlareZ123/experiment-01/actions/runs/42565342064), head `67abceb10431ada7b7b0cdd7bf61b88254f63e41`, **succeeded**. In all four cases, the payment settled and **Fog Crystal, Powerglass, Ace Trainer, and Sky Field** each moved as a distinct physical Trainer from owner deck to hand. All four category checks accepted, zero search vetoes; pure 7/7 also passed.
- The initial four-target native fixture used four Unown AOR, exceeding the proposed New Moon 60's *three* Unown copies. Corrected the extension to three Unown AOR plus one Duskull VIV, all printed with 60 HP and present in the candidate 60. Added a real follow-on Rescue Carrier Item use and authentic recovery prompts for every retained Carrier, checking the exact target cards move from discard to owner hand. These **new checks were dispatched in run [42565825794](https://github.com/FlareZ123/experiment-01/actions/runs/42565825794)**; status was pending at this report revision. Previous green runs do not cover the new follow-on recovery.

## Boundary and next decision

This is **immediate owner-hand capacity**, not future access to copies remaining in the deck or unknown Prizes. It does not prove access to or the playability of a subsequent Rescue Carrier after a lock, nor account for new Pokémon entering the discard, non-Recovery effects, turn tempo, or opponent continuation. It offers a tested local payment choice, subject to actual native results and competing connector uses of Secret Box. A policy-owner-approved opt-in can compare its real-game action choices on fresh deals and then assess downstream attack/control and opponent reply. The final deck remains unselected, with 29/32 authenticated opponent lists and zero paper-qualified competitive games.
