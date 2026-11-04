# Native setup policy staircase: exact GO_FIRST owner decision verified on both seats

**Agent 21 | 4 November 2026 | developmental first-blocker tracing.** This report extends the [first unsafe decoder boundary](agent21-first-native-confirm-prompt-policy-blocker-20261104.md) and tracks a narrow owner-safe replacement for the pinned native setup `ConfirmPrompt`. There is no qualified game or selected competitive release.

## Native source semantics

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` [`setup-reducer.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) creates a `ConfirmPrompt` with `GameMessage.GO_FIRST` for the coin-flip winner. The callback interprets `false` as choosing to go **second**. The pinned [native `ConfirmPromptResolver`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/confirm-prompt-resolver.ts) already returns `false` for every `ConfirmPrompt`. The research-owned baseline preserves that exact decision only for `GO_FIRST` while in setup, with a matching acting bot ID. A different message, phase, owner, or decision delegates to Agent4's strict native decoder quarantine.

Implementation: [owner-only GO_FIRST adapter](../../simulation/twinleaf/agent21-owner-setup-go-first-confirm.cjs), [pure tests including both physical seats and guard nesting](../../tests/agent21-owner-setup-go-first-confirm.test.cjs). The adapter uses only the public setup phase, authenticated acting ID, and actual pending prompt kind and message, with no hand, draw deck, Prize or other player's concealed-card access.

## Original registered native reproducibility

- Existing manual [native CI run 41766738248](https://github.com/FlareZ123/experiment-01/actions/runs/41766738248), **SUCCESS**, head `822532ce614f8d40242f6323781ab39820e64871`, [artifact 13291934406](https://github.com/FlareZ123/experiment-01/actions/runs/41766738248/artifacts/13291934406).
- Original registered rank-5 source, complete original printed candidate pairs with distinct historical source seeds and both source-seat placements. Same original registration and preflight as the [first-blocker report](agent21-first-native-confirm-prompt-policy-blocker-20261104.md).
- Inner `agent21-first-owner-native-quarantine.json` SHA-256 `a0bd7591e27dc626c87494b0e09b52a55aaf5909b392e0ff1b19541392c3d2e5`.

| Registered source setup | Physically assigned source seat | Exact GO_FIRST owner decisions | Next fail-closed inherited decoder boundary |
| --- | ---: | --- | --- |
| Rank-5 candidate group `5:0:A` | 1 | seat 0: 2 native owner `ResolvePromptAction(false)` proposals | Seat 0, `ChooseCardsPrompt`, setup phase 1, turn 0 |
| Rank-5 candidate group `5:0:B` | 0 | seat 1: 2 native owner `ResolvePromptAction(false)` proposals | Seat 0, `ChooseCardsPrompt`, setup phase 1, turn 0 |

This genuinely changes the earliest observed unsupported interface from `ConfirmPrompt` to `ChooseCardsPrompt`, for both source-seat configurations, while **zero original decoder invocations execute**. Repeated counts arise as the native runner attempts to continue/handle a typed early failure; do not count them as independent games or paper-confirmed full settlements. Every group aborted before a completed native row and before a complete physical-deal fingerprint.

## Next gate and limitations

The next anticipated setup decision is the real `CHOOSE_STARTING_POKEMONS` owner-hand prompt, as the pinned setup reducer generates after GO_FIRST. Independently confirm message and actual native disposition. Its candidate set is the player's own private hand, legitimately available to the acting player; ranking those cards by generic raw-State scoring is disallowed by the hidden-information gate.

The additional [owner-hand starter baseline](../../simulation/twinleaf/agent21-owner-setup-starting-basics.cjs) is default off, specifically checks that the native `ChooseCardsPrompt.cards` object is the actor's hand and validates selected Basic cards against the pinned prompt before returning a root-neutral `ResolvePromptAction`. Its first eligible Active and remaining eligible Bench selection is mechanically conservative development staging, **not** a claim to strategic optimality. It requires a **separate native run** before any positive assertion about native acceptance or reaching the next boundary.

The whole game remains unqualified: actual hidden-info equivalence, full choice precedence, card payments and restrictions, paper clock, match strategy and opposing policy are unresolved. Keep common-policy release and 99.5% game-win claims blocked.
