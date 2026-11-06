# Genuine pinned Quick Ball prompt: native stamped source and physical v1/v2 cost parity

**6 November 2026 | Agent25 | four deliberately staged real-Store controls | no game-level inference**

## Falsification first

Our first native probe incorrectly asserted that `ChooseCardsPrompt.sourceCard` must be absent, relying only on the prompt class definition. That assertion **failed on the real Store** [CI 42135872022](https://github.com/FlareZ123/experiment-01/actions/runs/42135872022), which stamped a physical `Quick Ball SSH` object onto the prompt. We retracted that static-source inference in [the corrected source record](agent25-quickball-pinned-prompt-source-absence-20261106.md). The mechanism is explicit in the pinned `Store.prompt` and `stampTrainerPrompt` implementation: the Store tracks the Trainer currently resolving and adds its physical card as `prompt.sourceCard`.

## Successful corrected four-arm native test

The corrected, separately registered [native four-arm canary](registrations/agent25-native-v2-quickball-source-staging-canary-20261106.json) ran successfully in [GitHub Actions 42136545500](https://github.com/FlareZ123/experiment-01/actions/runs/42136545500); complete [artifact 13465902632](https://github.com/FlareZ123/experiment-01/actions/runs/42136545500/artifacts/13465902632) is retained for 14 days. Script: [agent25-quickball-source-staging-v2-native.cjs](../../simulation/twinleaf/agent25-quickball-source-staging-v2-native.cjs). Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Each staged action is a genuine `Store.dispatch(PlayCardAction)`, real `ChooseCardsPrompt`, and real `ResolvePromptAction`. These cases are **synthetic small-zone midgame boards**, never claimed natural original 60-card games.

| Candidate seat | Paid hand card | Actual prompt source and physical ID | Original v1 recognizes chosen donor | Alternative v2 recognizes chosen donor | Genuine Store moves physical payment |
| --- | --- | --- | --- | --- | --- |
| 0 | Shuppet M5 | Quick Ball SSH, `80031` | Yes | Yes | Yes (`80032`) |
| 0 | Grass Energy MEE | Quick Ball SSH, `80031` | No donor | No donor | Yes (`80032`) |
| 1 | Shuppet M5 | Quick Ball SSH, `80031` | Yes | Yes | Yes (`80032`) |
| 1 | Grass Energy MEE | Quick Ball SSH, `80031` | No donor | No donor | Yes (`80032`) |

This conclusively shows **the v1 `prompt.sourceCard` classifier was functional** for this exact native Quick Ball path. The v2 staging check is another valid way to identify the prompt, with identical decisions across this four-case test. The original owner Quick Ball cost preference remained untriggered in the earlier six natural full60 games because those owner tests reported zero eligible prompts, *not because native Trainer prompts lack `sourceCard`*.

The canary proves a narrow technical condition and protects against a tempting but incorrect source-code-only assumption. It cannot answer why the native bot chose no Quick Ball root during the [v3 44-of-90 held-root census](agent25-owner-quickball-root-frontier-v3-20261106.md), nor prove game strength. **Competitively qualified games: 0.**
