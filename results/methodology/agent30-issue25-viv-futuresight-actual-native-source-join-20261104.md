# Agent30: New Moon's blocked turn-nine ordering prompt is confirmed Duskull VIV Future Sight

**4 November 2026 | completed compiled actual original-source 48-root replay | source-attested printed attack, owner-only neutral resolution, zero qualified games.**

## Exact reproduction

The shared [Agent50 Issue25 V7 original four-arm trace](https://github.com/FlareZ123/experiment-01/actions/runs/41768564077) ended with three unhandled ATTACK prompts under the all-inherited-decoder fail-closed quarantine. The third, **original source rank11 vs frozen New Moon Lockbreaker v1, physical candidate seat1, turn9**, reported `OrderCardsPrompt CHOOSE_CARDS_ORDER allowCancel:false`, with the original printed attack not captured.

We implemented a **default-OFF exact-source Duskull VIV69 Future Sight observer/neutral responder** in [`agent30-owner-futuresight-neutral-order.cjs`](../../simulation/twinleaf/agent30-owner-futuresight-neutral-order.cjs). The untouched pinned [Duskull VIV reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-vivid-voltage/duskull.ts) is wrapped only when invoked by its actual **Future Sight AttackEffect**. Its original `store.prompt` creates an owner-attacker temporary four-or-fewer-card `OrderCardsPrompt` after owner chose own/opponent deck. The wrapper stamps that exact `OrderCardsPrompt` with a private `WeakMap`; its installed AI `decodeNextAction` override recognizes only that marked prompt, validates an identity `[0,1,2,3]` permutation using native prompt validator, and returns `ResolvePromptAction`. It deliberately reads **no card identities at all** and never calls inherited raw-State decoder for marked prompts. The native Store, printed source, real deck, natural physical deal and original other adapters are unchanged. This neutral default is for interface closure only; it is not a tuned tactical ordering policy.

The independent test [`agent30-issue25-futuresight-48root-origin.native.test.cjs`](../../tests/agent30-issue25-futuresight-48root-origin.native.test.cjs) replays the **same four frozen original Agent41/Agent50 development arms**, with the same go-second, owner starting-Basic, public setup acknowledgments and mandatory ShowCards adapters, outer Agent4 raw-native-decoder quarantine and the added source-scoped neutral choice. Its [existing manual-only native workflow CI **41771858036**](https://github.com/FlareZ123/experiment-01/actions/runs/41771858036) **COMPLETED SUCCESS** at **04:15:28 UTC** with pinned vendor commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Actual native proof

Diagnostic `AGENT30_ISSUE25_FUTURE_SIGHT_REAL_ROOT` from the successful CI:

| Native evidence | Observed exact value |
| --- | --- |
| Registered trial count | **4** original development arms, identifiers preserved |
| Exact Future Sight printed reducer invocations | **1** |
| Source-generated `OrderCardsPrompt` instances marked | **1** |
| Actual owner-only prompt selections | **1** |
| Source card and attack | **Duskull VIV / Future Sight** |
| Physical actor seat and turn | **seat 1 / turn 9** |
| Actual temporary revealed-card count | **4** |
| Selected legal permutation | **[0,1,2,3]** (neutral) |
| Handler inspections of card identities / full raw State | **false / false** |
| Unmarked ordering prompts intercepted | **0** |
| Outer raw native decoder executed | **false** |
| Remaining blocked prompt count | **2**, both `ChooseCardsPrompt` |
| New Moon rank11 same-register outcome | **returned; 48 native root-action horizon; turn11; no terminal** |

The remaining two quarantined prompts are **seat0 turn5** and **seat1 turn3**, both `ChooseCardsPrompt`, consistent with prior Night Watch and Get Lost source hypotheses. Their individual printed origins still require explicit same-root positive attribution.

The actual New Moon rank11 source/bench 60 attempt returned with `rootActionCount=48,turnCount=11` instead of failing closed at turn9 ordering. Its source-deal digest was `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`; its full physical deal digest was `a283e4d52a534f405c6ab05303024d1631005bcd45b23b99fffc85158c91c74f`. Rank6/NewMoon remained capped at 48 root actions/turn7. The two champion-reference arms still aborted at their unrelated `ChooseCardsPrompt` blockers. Four public wait ACKs evolved to **52** across the four attempts and ShowCards acknowledgments **4**; all actors remained within the owner-only decoders and outer quarantine.

Independent [staged native Store postcondition tests](../../tests/agent30-duskull-viv-futuresight.native.test.cjs) separately proved actual top-four physical card identity/order restoration for both actor seats, both deck targets, target sizes 2/4/6, and native prompt validation. Both stage and source-specific neutral handler tests passed **17/17** at [CI **41771665937**](https://github.com/FlareZ123/experiment-01/actions/runs/41771665937); the original-source root replay passed at **41771858036**.

## Interpretation and next action

**This now confirms the specific printed origin for the third V7 blocker**, beyond a shape-based inference. It also shows the mechanics of an information-scoped decision channel: Future Sight permits viewing only the temporary top four cards, leaving the rest of either deck and opponent hand hidden. A later intelligent policy may rank just those disclosed cards plus other legally known owner observations. The neutral current baseline avoids hidden information but cannot be interpreted as strategic strength.

Priority for the shared release: give the remaining two `ChooseCardsPrompt` blockers **source/zone-specific** handlers after confirming their printed origins, reusing [Agent12's Night Watch uniform physical-position sampler](../../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs) and [Agent29's Girafarig Get Lost public discard print hook](../../simulation/twinleaf/agent29-girafarig-getlost-paper-hook.cjs). Do not generalize either from a common native message alone. The selected starter cardinality and both-seat payment/turn clock still require separate common-policy acceptance.

**Strict boundary:** 29/32 original source 60s, missing 23/25/28. **0 competitively qualified games**, no chosen single final 60, no validated winner, no demonstrated 99.5% game win rate. All runs described here are four explicitly limited historical development attempts, not unbounded real-match simulations.
