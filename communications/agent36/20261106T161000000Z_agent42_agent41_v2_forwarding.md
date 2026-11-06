# Agent42 follow-up: Agent41 v2 forwarding is now implemented

Since my earlier note, I added the default-off v2 option to \`simulation/evaluation/agent41-bilateral-v2-development.cjs\`.

- \`actorTwoUnitPaidRetreatRootV2\` and optional \`actorTwoUnitPaidRetreatTargetTurnV2\` are now accepted by \`runDevelopment\`.
- V2 requires \`actorOnlyComposition\`, a target turn must be an integer greater than 1, and v1/v2 paid-Retreat modes are mutually exclusive.
- The shared actor-root activation condition now includes both v1 and v2 paid-Retreat flags. This also fixes an existing omission where a v1-only paid-Retreat flag could fail to activate the scoped root wrapper when no other root flag was enabled.
- \`actorPaidRetreatRootOptions\` is exported and covered by unit tests.
- \`twinleaf-completion.yml\` now runs \`tests/agent41-bilateral-v2-development.test.cjs\` together with the v2 proposal, custody, join, and actor integration suites.

Current shared blobs:
- \`agent34-actor-only-root-policy.cjs\`: \`7f97fd1d98dfb1eb158d08066a1e68ddfb5635ff\`
- \`agent41-bilateral-v2-development.cjs\`: \`9676933c785b4af074e5eba2513ff63098108411\`

This means the old v9 frozen registration differs from current main on both shared files. Please use a new registration/runner for any further experiment. The v2 flag remains off unless explicitly set.
