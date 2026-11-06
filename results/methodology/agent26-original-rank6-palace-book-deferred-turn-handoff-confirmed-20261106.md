# Agent26: native original-rank6 Palace Book ends turn after deferred prompt settlement

**6 November 2026, independent completion of earlier preregistered evidence | pinned native developmental result | zero competitively qualified games.**

## Finding and evidence classification

The authentic Aichi rank6 Iron Thorns source in original native trial `6:101:B:champion-reference`, source physical **seat0**, previously held `Palace Book SMP NAN25` at its global turn4 while the historical bot chose Pass. Agent9's preregistered [24-attempt original A/B/A](agent9-rank6-turn4-palacebook-original-prereg-20261105.md) substituted a real `PlayCardAction` for **only that single actual Pass**. Agent26 preregistered an independent deferred-phase root analysis [before execution](agent26-palacebook-original-deferred-handoff-prereg-20261106.md), against the **same 24** original attempts and native 48-root ceiling.

**Observed:** the item-play root is followed by a native prompt settlement on turn4; there are **zero further same-turn voluntary source actions**; the next voluntary root is the opposing player's **turn5 Pass**; the source resumes at turn6 with a `Spiky Energy` play. This supports **native turn-ended fidelity of the selected original Palace Book action** and refutes the old concern that its synchronous Store snapshot meant the turn continued. The opponent's Pass is a weak response and does not certify competent strategic counterplay, paper-perfect gameplay, a completed game, or comparative benefit to this original deck.

The card's [Japanese promotional printing](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en) is recorded with translated text **“Draw 3 cards. Your turn ends.”** This is the printed Aichi JP promo, not an international-print substitute; remain explicit about national Expanded format and card provenance.

## Exact original native root continuation

| Accepted native ordinal | Global turn | Actor seat | Actual root | Interpretation |
| ---: | ---: | ---: | --- | --- |
| 40 | 4 | 0 | `PlayCardAction Palace Book` | The **single replaced** pre-registered Pass |
| 41 | 4 | 0 | `ResolvePromptAction` | Deferred prompt settlement; *not* an extra voluntary source turn decision |
| 42 | 5 | 1 | `ResolvePromptAction` | Opponent turn setup/prompt |
| 43 | 5 | 1 | `PassTurnAction` | **First genuine opponent voluntary root after Book** |
| 44 | 5 | 1 | `ResolvePromptAction` | Deferred prompt |
| 45 | 6 | 0 | `ResolvePromptAction` | Source turn setup/prompt |
| 46 | 6 | 0 | `PlayCardAction Spiky Energy` | **First subsequent genuine source voluntary root** |
| 47 | 6 | 0 | `PassTurnAction` | Source next-turn Pass |

All eight original trial contexts were repeated in control A / treatment B / unchanged-control A' (24 native attempts). The producer asserts identical A/A' accepted roots, complete identity of the **seven non-target B** root tapes, identical first-changed-root prefix and source/candidate opening physical-deal equality. The selected control, treatment and repeated-control all returned **unqualified** within the bounded native experiment. No win result can be extracted.

The immediate Store return in the earlier [Agent9 intervention](agent9-rank6-turn4-palacebook-original-prereg-20261105.md) observed source deck **41→38** and source hand **5→7** (one Item played, three cards drawn), but initially marked `physicalBookSettlement` flags false because the Item remained in the intermediary Trainer zone while `WaitPrompt` was unresolved. The native reducer defers the end-turn transition through pending prompts. Agent26's independently executed [six staged Store controls](../../tests/agent26-palace-book-deferred-phase.native.test.cjs), on both real seats and remaining deck sizes 1,3,5, verified after *resolving the WaitPrompts* that the actual Item entered discard, the deck-to-hand draw occurred up to available cards, the turn transferred, and no WaitPrompt remained. Those staged controls are a distinct rules/fidelity witness, not an original game.

## Critical correction: raw roots and voluntary decisions

The first native run at [CI 42199368837](https://github.com/FlareZ123/experiment-01/actions/runs/42199368837) succeeded mechanically, but its extractor erroneously labeled **root41 `ResolvePromptAction`** as the “next voluntary root” and rejected turn-end support. That measurement was invalid. The committed correction [`dea1baec2`](https://github.com/FlareZ123/experiment-01/commit/dea1baec2) excludes `ResolvePromptAction` from the voluntary-decision sequence, and [`9c26b5740`](https://github.com/FlareZ123/experiment-01/commit/9c26b5740) adds positive and negative pure fixtures.

The corrected, **already completed** [compiled manual CI 42200045703](https://github.com/FlareZ123/experiment-01/actions/runs/42200045703), pinned at upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed the four pure extractor tests and staged native deferred controls. Its logged original A/B/A root suffix contains ordinals 40–47 above, explicitly showing `nativeRootSupportsItemEndedSourceTurn:true`. The artifact is [13494281269](https://github.com/FlareZ123/experiment-01/actions/runs/42200045703/artifacts/13494281269), ZIP SHA-256 `50f0d9b935bc1f95856a400dc9b010bb5320c9c75fbe5c3bf4ca2da35e4e4609`. Code and reproduction: [extractor](../../simulation/evaluation/agent26-original-palace-postwait-handoff.cjs), [pure tests](../../tests/agent26-original-palace-postwait-handoff.test.cjs), [native Store controls](../../tests/agent26-palace-book-deferred-phase.native.test.cjs), [original native producer](../../simulation/evaluation/agent9-rank6-palace-book-native-aba.cjs). The [existing manual workflow](../../.github/workflows/agent26-skyfield-owner-native.yml) uses only the opt-in `agent26_palace_handoff` input; no per-commit CI was added.

A duplicate manual run was queued by the current Agent26 incarnation before finding the **already successful corrected** 10:06 run; [42301828438](https://github.com/FlareZ123/experiment-01/actions/runs/42301828438) was **cancelled** to conserve CI. The corrected earlier CI is the evidentiary run.

## Implications and limits

The native original source's `Palace Book` is a concrete reachable owner-held Item decision against a real opponent, with verified draw and deferred end-turn behavior. The original bot's Pass discarded this opportunity. The action consumes the source's chance to take an attack on the same turn by its printed text, however, and this selected original opponent's next decision was also Pass. **No strategic value or matchup improvement follows from the turn-end witness alone.** Any attempt to compare strength needs prospective, information-safe original-rank6 and opponent policies, paid attacks, meaningful alternative actions, actual settled outcomes, and the match clock. The official Aichi Top32 source inventory remains 29/32 and competitively qualified games remain zero.

**Research next step:** preserve genuine Store/prompt identities and disambiguate interim reducer returns from settled outcomes for other end-turn effects. Integrate this fixed action/provenance boundary into the shared policy's complete-game milestones rather than extending a single retrospectively selected turn4 opportunity as a win-rate claim.
