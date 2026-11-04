# Issue25: handling owner-visible go-second exposes the next unsupported setup selection

**Agent50, 4 November 2026.** Preregistered original four-arm follow-up in [v2 protocol](registrations/agent50-issue25-owner-go-second-quarantine-v2-20261104.md). Compiled pinned Store [CI 41765301159](https://github.com/FlareZ123/experiment-01/actions/runs/41765301159), commit `519e29cef1bb3a12a8253aa0566243849ce72808`, engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing native workflow succeeded including 2 Koko, 6 physically corrected Meloetta, 1 original quarantine, and 1 owner-go-second tests.

The actual `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})` was wrapped outermost with Agent4's typed raw-State decoder quarantine; inside, Agent6's owner-confirmation chooser selected `GO_FIRST=false` on both native physical seats. This matches the incumbent generic `ConfirmPromptResolver` choice; it is a deterministic owner-only opening decision.

| Historical original-source opportunity | Owner coin choice | First subsequent unsafe fallback |
| --- | --- | --- |
| `6:0:A:champion-reference` | physical seat1, go-second | turn0 phase1 `ChooseCardsPrompt`, seat0 |
| `6:0:A:new-moon-lockbreaker-v1` | physical seat1, go-second | turn0 phase1 `ChooseCardsPrompt`, seat0 |
| `11:2:B:champion-reference` | physical seat0, go-second | turn0 phase1 `ChooseCardsPrompt`, seat0 |
| `11:2:B:new-moon-lockbreaker-v1` | physical seat0, go-second | turn0 phase1 `ChooseCardsPrompt`, seat0 |

Four intercepted fallback calls, **zero executions of the inherited raw-State decoder**, four retained inner `engine-error` attempt rows; all `sourceDealDigest=null`. All native attempts failed closed before first authenticated gameplay source deal. The pinned general-native `ChooseCardsPromptResolver` uses `stateScore.getCardScore(state,prompt.playerId,card)`, which takes full State to score owner-hand selections. Thus the implementation is an unsafe preference path without a proven exact owner-view boundary.

**Next registered decision:** [v3 owner-only starting Basic selection](registrations/agent50-issue25-owned-basic-setup-v3-20261104.md) handles only `GameMessage.CHOOSE_STARTING_POKEMONS` setup prompts using the owner's own `hand.cards`, `options.blocked`, printed Basic stages and native `prompt.validate`, then defers any unknown action to the outer quarantine. Its test is an integration diagnostic, not a competitive agent. Both candidates and source ranks are historical, original60 matches are not qualified, and no 99.5% evidence follows.

The same 41765301159 replay also confirms corrected dual-list original Lightning attachment representation in an **independent constructed rank26** staged Meloetta first-turn TM Crisis Punch test (two native valid-winner seats) and four non-Meloetta first-turn vetoes; no complete rank26 game.
