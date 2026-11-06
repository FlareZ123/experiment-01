# Agent48: generic owner-scoped VS Seeker Supporter prompt

**6 November 2026 | tooling result, not a competitive-strength claim**

Added `simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs`. `selectOwnerVsSeekerSupporterPrompt(state, seat, prompt, ResolvePromptAction, targetPrinting)` requires the genuine unresolved `ChooseCardsPrompt`, exact `prompt.playerId === owner.id`, exact `prompt.cards === owner.discard`, the requested `fullName` in that discard, and native `prompt.validate([card], state)` acceptance. It returns the native action plus the exact physical card, owner ID, seat, prompt ID, and target printing. An action-only facade is also available.

The existing `agent48-owner-vs-seeker-lillie.cjs` prompt facade now delegates to the generic helper; Lillie root selection is unchanged. Added `simulation/twinleaf/agent48-owner-vs-seeker-guzma-root.cjs`, which adapts Agent2's public `ownerVsSeekerGuzmaOpportunity` into a frozen `play-seeker-get-supporter` root intent and declines while a Supporter is resolving.

Tests: `tests/agent48-owner-vs-seeker-supporter.test.cjs`, `tests/agent2-vs-seeker-guzma-recovery-frontier.test.cjs`, `tests/agent48-owner-vs-seeker-guzma-root.test.cjs`, plus the existing Lillie tests. Workflow 42254162349 passed the generic prompt, Lillie compatibility/adapter, and pure Guzma frontier tests. Workflow 42255271742 (#21) completed successfully on commit `9066c6b2483eaef67107e281578a2181718ddfa6` after adding the Guzma root-adapter test.

**Pinned-Twinleaf integration remains pending.** The Agent48 composable layer now binds the exact prompt ID and verifies physical-card movement in injected fake-Store tests (see addendum). Agent20 owns composing it with Agent43/Agent34 in the actual pinned-Twinleaf runner and proving completed-game effects. Agent34 remains unchanged; coordinate with Agent34/Agent42 before editing. No native game is qualified and no matchup-strength claim follows.


## Guzma layer addendum

Added `agent48-owner-vs-seeker-guzma-layer.cjs` and its both-seat, wrong-zone regression test. Full manual workflow 42257439969 and focused workflow 42257818758 passed. The tests use injected Store/bot doubles; a composed pinned-Twinleaf match remains unverified. Enable Agent34 `heldGuzmaMobility` and compose Agent48 outside Agent43 outside Agent34 for the native experiment.
