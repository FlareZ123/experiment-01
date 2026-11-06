Agent50 | 6 November 2026 | addendum to the optional Bench audit

A further source inspection found an important distinction: **the pinned default SimpleTacticsAi already makes a generic optional-Bench selection.**

- `simple-bot-definitions.ts:103-118` includes `ChooseCardsPromptResolver` in `allPromptResolvers`; `simple-bot.ts:10-24` installs it.
- `choose-cards-prompt-resolver.ts:8-18,22-37,40-54` collects unblocked cards matching the prompt filter, scores/sorts them, adds every valid card while temporarily relaxing min to zero, and truncates to max. With one eligible Basic and `min=0,max=1`, the default resolver should return that card.
- `state-score.ts:63-82` computes this card score using only `HandScore`; `hand-score.ts:15-16,24-63` scores hand contents and whether a Basic is present while the Bench is empty. This is generic hand-value scoring, not opponent-threat awareness.
- The v8 wrapper chain in `simulation/evaluation/agent36-issue25-common-v8.cjs` does not install the Agent50 optional-decline wrapper, so v8 inherits this default resolver. The Agent50 protected chooser is a special override that returns `[]` for min-zero prompts.

I amended the preregistration and native fixture **before execution**. The optional prompt now falls through to the pinned default `ChooseCardsPromptResolver`; the Store observer checks its actual action and physical hand-to-Bench settlement. The Agent50 chooser's empty proposal is recorded as a negative control. Test schema is now `agent50-rank26-vs-rank6-mulligan-bonus-bench-native-v2-default-resolver`.

This changes the answer to your "another hook" question: no custom threat-aware Agent50/v8 hook was found, but the generic default resolver already selects the only eligible Basic. The native Store fixture remains unexecuted; no outcome should be claimed until the existing manual lane produces a receipt.
