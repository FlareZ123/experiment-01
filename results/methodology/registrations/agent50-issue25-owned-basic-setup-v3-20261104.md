# Agent50 Issue25 v3 prereg: owner's own starting Basic choice, still fail closed

**4 November 2026, before implementing or running the v3 native test.** Prior v2 [compiled CI 41765301159](https://github.com/FlareZ123/experiment-01/actions/runs/41765301159) handled four public GO_FIRST confirmations by choosing second in both seats, then stopped on four setup-phase turn0 `ChooseCardsPrompt` for seat0; no native scorer execution.

## Registered single-step intervention

Implement one isolated, opt-in CJS adapter `simulation/twinleaf/agent50-owner-starting-basic-choice.cjs`, installed **inside** Agent4 raw-State fallback quarantine and **outside** Agent41 canonical actor composition. It may act only on the current owner's live native `ChooseCardsPrompt` with `GameMessage.CHOOSE_STARTING_POKEMONS`, `GamePhase.SETUP`, owner player identity equal to `prompt.playerId`, `prompt.cards===owner.hand`, and no inaccessible opponent information. Use the native `Stage.BASIC`, card special play-on-setup tag, `prompt.options.blocked` and `prompt.validate` to form a deterministic, minimally legal list using only the owner's hand in its observed order. Prefer selecting all eligible opening Basics up to `options.max`, with the first eligible as Active. Never call full-State native scorer; when uncertain, let outer guard block and record the missing interface. The selector must not alter native state or promise strategic competence.

Keep `withGoFirstChoice([false,false])` outside the new owned Basic adapter, with Agent4 quarantine outermost. Re-execute identical four retrospective `developmentTrials()` of original rank6/rank11 printed sources versus champion/New Moon, exact historical seeds, both physical source seats, root cap16. Handle **only** this one setup prompt class and its exact message. Do not introduce new source-dependent policy or change candidate printings.

## Required negative and compiled evidence

1. Pure tests: no response to another player's prompt, wrong prompt message/phase, invalid Basic-less choice, or incompatible owner-hand identity; unchanged owner/opponent state on proposal; deterministic selection for two own-hand orderings and no dependence on injected opponent concealed card order.
2. Compiled pinned Store: record all four owner GO_FIRST confirmations, all actually selected owner starting Basic prompts by seat and selected printing (public once played), the **next** typed fallback class/turn/seat or, if no fallback within cap, every native attempted outcome, native scorer zero calls, actual source deal fingerprints when available, no paper-qualified games.
3. Retain all failures, strict prompt rejection and original Store trace. If the new setup prompt fails to validate, report it as a separate branch failure. Do not count any native terminal as competition.
4. Reuse existing Agent50 compiled manual native workflow and save full run ID and hash; no vendor modification, no extra workflow.

This is a **step toward** a total owner-only bilateral policy; the current entire policy remains competitively unqualified.
