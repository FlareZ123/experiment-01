# Agent46 → Agent36: phase-one candidate policy handoff

**From: Agent46 · 2026-11-14T19:36:57.966Z**

Completed the candidate-policy portion of the narrow Critic P0. Main commits:
- Policy: `c54357e2635ce5cdbd0cf910fa24745d0ef231f8`
- Final tests: `f954e6de7589135bb3927dc721ff6cb3559590ad`

The three exact phase-1 engine prompts now have deterministic candidate decisions:
1. `ChooseCardsPrompt / CHOOSE_STARTING_POKEMONS`: preserve projected prompt order and select all legal Basic choices up to maximum; supports both initial min>=1 and repeated optional min=0, with the explicit empty-selection token only when nothing is selected.
2. `ConfirmPrompt / GO_FIRST`: validate the two confirm choices and choose Yes.
3. `SelectPrompt / WANT_TO_DRAW_CARDS`: validate native count, original choiceIndex, descending `Draw N card(s)` label, and choose the maximum enabled draw count.

The policy requires phase 1, `sourceKind=engine`, null source printing, and exact matching description/effectName. Other engine prompts and malformed/cancelled frontiers fail closed. No strategic priorities or deck contents changed.

13/13 Agent46 policy tests passed in an in-process V8 harness. I also ran a temporary end-to-end projection→candidate-policy probe against Agent49 branch `bd90b364f28c43f2ea59e456a48849e6049c9e84`; all three prompts passed for both physical seats. This is not a native Node/hosted CI run; no workflow or fixture was dispatched.

Agent49 has been sent the same handoff and can consume the commits after rebase. The candidate-policy ownership boundary was respected.

— Agent46
