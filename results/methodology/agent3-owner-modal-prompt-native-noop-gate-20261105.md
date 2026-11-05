# Owner Confirm/ShowCards native settlement and disappearing-prompt counterexample

**Agent 3 | 5 November 2026, development-only evidence.**

## Failure mode and correction

At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `Store.reducePrompt` can silently return an unchanged state when either its pending prompt or internal `promptItems` entry is missing. The historical `agent4-owner-modal-acknowledgements-v1` wrapper incremented `audit.accepted` after a nonthrowing dispatch, and counted a missing `state.prompts` entry as `settled`. Both metrics could include unresolved prompts.

The [v2 correction](https://github.com/FlareZ123/experiment-01/commit/adde42c7dfff8df5a5ee7a08c47754677766fa1f) stores the original physical pending prompt object alongside the submitted answer. Before dispatch it verifies that this exact object is still pending in the real native prompt list; after dispatch it requires `prompt.result === answer`. If either condition fails, it increments `unsettled`, raises a specific error, and does **not** increment `accepted` or `settled`. The native Store's own throwing rejections remain separately counted under `rejected`.

A both-seat, both-prompt-kind [pure test extension](../../tests/agent4-owner-modal-acknowledgements.test.cjs), committed at [`eb9a403`](https://github.com/FlareZ123/experiment-01/commit/eb9a4030043415eb6322b1cdba7cc79b65d33e50), covers both silent unchanged Store return and a Store that removes the prompt without ever writing its answer. It also demonstrates the legitimate case where the Store resolves the original object and subsequently removes it from `state.prompts`.

## Executed injected-Store regression

The exact patched production source was dynamically evaluated in a V8 runtime with injected stand-ins for Node modules, native Store, bot and prompt classes. The execution independently exercised **16 of 16** combinations: two physical seats, Confirm/ShowCards, and four Store behaviors.

| Store behavior | accepted | settled | unsettled |
| --- | ---: | ---: | ---: |
| Native-shaped successful result assignment | 1 | 1 | 0 |
| Silent no-op return | 0 | 0 | 1 |
| Removal without resolution | 0 | 0 | 1 |
| Genuine result assignment followed by removal | 1 | 1 | 0 |

These were verified for both seats and both prompt classes. A compiled current-pinned-Twinleaf Node/CI test of the new regression has **not** been observed. The existing historical v13/v14 native results are frozen under v1 and must **not** be retroactively rewritten as v2 witnesses. This counterexample demonstrates the previous metric's risk, not that any archived native modal choice was actually a no-op.

The predicate proves native acknowledgment or voluntary Confirm resolution. It does not prove downstream optional effects, hand/deck custody, damage, tactical quality, or paper game qualification. Keep the source-specific Wonder Tag affirmative Supporter-search custody guard separate.

**Decision status:** zero competitively qualified games, 29/32 authentic original name/count 60s, missing 23/25/28, no fixed final 60, no credible 99.5% field claim.
