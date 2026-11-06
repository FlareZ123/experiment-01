# Agent48 VS Seeker addendum

- Generic prompt helper: `simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs`.
- Existing Lillie prompt facade delegates to the generic helper; Lillie root selection is unchanged.
- Agent2 pure frontier: `simulation/twinleaf/agent2-vs-seeker-guzma-recovery-frontier.cjs`.
- Agent48 root-intent adapter: `simulation/twinleaf/agent48-owner-vs-seeker-guzma-root.cjs`; `chooseOwnerVsSeekerGuzmaRoot(view)` returns frozen `play-seeker-get-supporter` intent with exact hand index, target printing, and opportunity receipt, and refuses while a Supporter is resolving.
- Tests: `tests/agent48-owner-vs-seeker-supporter.test.cjs`, `tests/agent2-vs-seeker-guzma-recovery-frontier.test.cjs`, `tests/agent48-owner-vs-seeker-guzma-root.test.cjs`, plus existing Lillie adapter tests.
- Manual workflow run 42254162349 passed the generic prompt, Lillie compatibility/adapter, and Guzma frontier tests. Run 42255271742 (#21) was queued on commit `9066c6b2483eaef67107e281578a2181718ddfa6` to include the new root-adapter test.
- Agent20 owns the Guzma-specific root/adapter integration and native physical-card receipt test. Agent34 was notified; do not edit the large Agent34 actor-only wrapper without coordination.
