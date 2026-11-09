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
- The initial four-target native fixture used four Unown AOR, exceeding the proposed New Moon 60's *three* Unown copies. Corrected the extension to three Unown AOR plus one Duskull VIV, all printed with 60 HP and present in the candidate 60. Added a real follow-on Rescue Carrier Item use and authentic recovery prompts for every retained Carrier, checking the exact target cards move from discard to owner hand. These new checks **passed** in pinned [run **42565825794**](https://github.com/FlareZ123/experiment-01/actions/runs/42565825794), head `fae95145d0a9386a1eae9c60474b459c3a6b6a76`. Both native seats with one target physically recovered **one Unown** after Secret Box and one retained Carrier. Both seats with four targets physically recovered **three Unown plus one Duskull** through two retained Carriers. The other three Trainer categories were already fetched and settled in all cases, with zero Secret Box payment or search-category guard vetoes. These remain staged sequences, not complete dealt games.

## Tactical prevalence boundary and research priority

The proposed New Moon 60 has exactly **one Secret Box** and **two Rescue Carrier**. As a restricted access calculation, if nine random physical cards are observed from the shuffled 60 with no effects or conditional mulligan treatment, the chance those nine contain the Secret Box and **at least one** Carrier is exactly `327/8555 = 3.822326%`; the chance they contain the Box and **both** Carriers is `21/8555 = 0.245470%`. The second condition is the special case in the initial native fixture. Both probabilities are direct-draw sample calculations, not prevalence in actual games with Pokémon searches, Supporters, Prizes, or previously discarded cards. They argue for next testing a **one-Carrier** payment choice at one versus two already-discarded recoverable targets, then measuring how often either choice arises in genuinely dealt original-source games. They do not justify promoting the current opt-in to the shared policy yet.

## Bot integration seam

A separate default-off wrapper, `simulation/twinleaf/agent16-secret-box-capacity-actor-prompt.cjs`, now intercepts genuine source-owned Secret Box prompts in the **actual `SimpleTacticsAi.decodeNextAction` interface**, leaving all root decisions and unsupported prompts to the prior policy. The adapter uses the new payment scorer for the three-card discard and Agent36's category selector for the subsequent owner-deck search; it attaches native action identity and delayed physical zone-change receipts to accepted Store dispatches. It can operate on a captured live Store (normal headless games) or on an explicitly supplied staged Store (test only). Both an injected pure actor test and a native Store actor test have been added under `tests/2026-11/`; the combined opt-in run is [42566576345](https://github.com/FlareZ123/experiment-01/actions/runs/42566576345) and was in progress when this section was written. This is **not enabled** in the shared canonical policy.

## Completed automatic actor and original-source reachability evidence, 9 November

The default-off actor bridge now has a separate opt-in `autoPlayRoot` option. It preflights the exact owner-hand payment and own visible Item restriction before generating a genuine native `PlayCardAction`; default behavior still delegates root decisions unchanged. The bot handles both source-specific payment and four-category search prompts itself, and the pinned Store checks the resulting physical zone mutations. Its native root option has **no impact on the selected shared policy unless explicitly installed**.

- [Native actor CI **42566576345**](https://github.com/FlareZ123/experiment-01/actions/runs/42566576345) passed both native actor-seat cases and the pure modules. All four staged source-payment/search cases settled with two actor-owned prompt actions and two physical custody receipts, with no guard vetoes.
- [Single-Carrier actor CI **42566984678**](https://github.com/FlareZ123/experiment-01/actions/runs/42566984678) passed. With a single Carrier and one eligible Unown, the actor paid that Carrier; with two Unown, it paid Lillie's Determination and used the retained Carrier to physically return **both Unown**. Both native seats produced the decision and recovery, under explicit experimental weights.
- [Native autonomous root CI **42567917607**](https://github.com/FlareZ123/experiment-01/actions/runs/42567917607) passed. In four staged source-board cases, the actor generated and the Store accepted the actual Secret Box `PlayCardAction`, all three physical payment cards, the full four-category search, and in the two-target cases the subsequent real Carrier recovery. One actor-owned root and two actor-owned prompts per case; zero paper guards vetoed.
- [First fresh source-dealt CI **42567348840**](https://github.com/FlareZ123/experiment-01/actions/runs/42567348840) passed the *execution* contract for four registered attempts, preserving all four unique source-deal identities. Against original ranks 6 and 11 with identical fixed 60 candidate controls, each attempt reached the **48-native-root-action limit** without finishing. **Zero** actor-owned Secret Box prompts occurred, therefore no improvement to matchup performance was observed. This experiment had the default root chooser; the native bot root option was developed afterward.
- A distinct prospective paired root-control experiment `simulation/evaluation/agent16-box-root-prospective-paired.cjs` was registered on **12 newly generated source deals** (six original rank 6 and six original rank 11, the *same* fixed New Moon challenger list in each arm). One policy retains the default root; the other opts into `autoPlayRoot` with a preregistered increased cost ceiling of 22 DCI units, chosen because Secret Box's four categories can sometimes justify more than the older 11-point setup-only ceiling. It records both source and full physical deal fingerprint parity and audits root/converted prompts. [Run **42568189314**](https://github.com/FlareZ123/experiment-01/actions/runs/42568189314) was pending when this section was written. Outcomes are development-only, with no competitive-qualified claims.

## Boundary and next decision

This is **immediate owner-hand capacity**, not future access to copies remaining in the deck or unknown Prizes. It does not prove access to or the playability of a subsequent Rescue Carrier after a lock, nor account for new Pokémon entering the discard, non-Recovery effects, turn tempo, or opponent continuation. It offers a tested local payment choice, subject to actual native results and competing connector uses of Secret Box. A policy-owner-approved opt-in can compare its real-game action choices on fresh deals and then assess downstream attack/control and opponent reply. The final deck remains unselected, with 29/32 authenticated opponent lists and zero paper-qualified competitive games.
