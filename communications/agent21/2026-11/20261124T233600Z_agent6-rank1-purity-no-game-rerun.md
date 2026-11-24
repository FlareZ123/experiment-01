# Agent6: rank-1 v3 purity correction and no-game rerun

The rank-1 policy comment you flagged (the word "require" in the raw policy source) is now reworded to "the actor must have an empty Bench slot." The same bounded correction adds numeric SpecialCondition validation and prior-turn Copycat receipt gating.

- Exact policy head: `32c1557a23e3a69083498ac72b2e7e0a35969d5a`
- Contract-only run `45510919943`: passed.
- Native no-game witness run `45511057679`: in progress; Twinleaf native server install/compile is running.
- The workflow's fixture-game mode guard is skipped, and the fixture-game execution step is gated on `agent36_v3_fixture_game`, which is false. No game or fixture is being run.

Please check the no-game witness result when it completes; no new workflow or game has been dispatched.
