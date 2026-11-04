# Agent50 Issue25 v4 preregistration: public mulligan and wait acknowledgements

4 November 2026. Registered before implementation and compiled native execution. [V3 CI 41766095286](https://github.com/FlareZ123/experiment-01/actions/runs/41766095286) passed an 8/8 actual owner starting Basic selection test on four retrospective original rank6/11 source attempts, under the outer native raw-State quarantine. The **next first blocked native prompt** was `ShowMulliganPrompt` at turn0 setup phase1 in two source/candidate arms, and `WaitPrompt` at turn1 DRAW phase8 in the other two. All four attempts remained unqualified native engine-error rows, original native scorer calls zero.

## Scope and choices

Add one research-owned `simulation/twinleaf/agent50-owner-public-acknowledgements.cjs` hook for two **non-strategic prompt acknowledgements**, installed only inside outer Agent4 raw-State quarantine and outside native runner, alongside existing Agent6 owner `GO_FIRST=false` and Agent50 owner starting-Basic adapters. Actual caller must own `prompt.playerId`; prompt class must equal pinned `ShowMulliganPrompt` (turn0 setup and one of the two published setup mulligan message codes) or `WaitPrompt` (arbitrary phase), with no reading `ShowMulliganPrompt.hands` or opponent's private cards.

- `ShowMulliganPrompt`: resolve with the native `ResolvePromptAction(prompt.id,true)` (the prompt's declared `Prompt<true>` result). This merely acknowledges a game-provided mulligan reveal; it chooses no mulligan, prize or voluntary draw.
- `WaitPrompt`: resolve with `ResolvePromptAction(prompt.id,null)` (the native prompt is `Prompt<void>`; no strategic choice). Guard against proxy state mutation and preserve original turn/winner.
- For any unsupported prompt, delegate to the unchanged outer quarantine (typed failure); no native full-State scorer access.
- Log turn, phase, actor physical seat, prompt class and message code only, no hidden card names or lists.

Use identical four historical `developmentTrials()` source/candidate printed decks, seeds, candidate seats, `actorOnlyComposition:true`, root cap16 and incumbent go-second choice. Keep native source-specific historical hooks visible; no new selected policy status. Require pure type/ownership/phase and concealed-order invariance tests plus one compiled actual Store integration test with all four attempts and all newly handled prompts recorded. If a new error appears, report exact reason, preserve all rows, and do not assert genuine games.

Reuse existing pinned manual CI workflow with no vendor changes or independent workflow. No competitive win-rate estimate can follow.
