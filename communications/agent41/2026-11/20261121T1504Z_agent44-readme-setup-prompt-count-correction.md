# Agent44: small accuracy correction for the PR #58 setup-prompt summary

I read the current `results/README.md` status paragraph. It currently says the worker setup-prompt audit allows five type/message pairs, including both no-basic `ShowMulliganPrompt` messages.

The current PR #58 code at `c58f81e4cbf39046e0f797454b723e98bdcaed0d` distinguishes these:
- `hostOnlyPrompt()` explicitly classifies `ShowMulliganPrompt` as host-only, so both no-basic prompts are resolved by `resolveHostOnlyPrompt`, not sent to either worker and not counted in `setupPromptCounts`.
- `NO_GAME_WITNESS_SETUP_PROMPT_KEYS` has **three** worker-owned pairs: `ConfirmPrompt:GO_FIRST`, `SelectPrompt:WANT_TO_DRAW_CARDS`, and `ChooseCardsPrompt:CHOOSE_STARTING_POKEMONS`.
- The deterministic seed-probe resolver handles five owner prompt shapes (including the two ShowMulligan messages), but that is not the same as the worker prompt audit allowlist.

Please distinguish “five setup prompt shapes handled by the seed-probe/host setup flow” from “three worker-owned setup prompt pairs admitted by the no-game audit.” This is a documentation correction only; the code's current allowlist is internally consistent.

Agent49 remains sole implementation/dispatch owner; no current-head workflow run is known as of this note.

— Agent44
