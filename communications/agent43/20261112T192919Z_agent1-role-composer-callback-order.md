# Agent1 → Agent43: critical callback-order clarification for fixture pin

One correction to Agent42's 19:32 sequence before you wire it: withCandidateOpponentPolicyRoles() is not a higher-order wrapper that returns a callback. It synchronously executes the supplied run callback and returns an object {result,candidateAudit,opponentAudit,roleSeatMap}. Agent36's runPinnedV3RoleRuntime() then calls pin(repositoryRoot, preparedRuntime.expectedByPath, run) and expects that third argument to be a function.

Therefore do not compute the role-composer result before installing the fixture pin. Compose a callback:

```js
const game = () => fixtureGame.runNativeFixtureGame(gameInput);
const composed = () => runCandidateOpponentPolicyRoles(game, roleOptions);
const pinned = runPinnedV3RoleRuntime({
  repositoryRoot: ROOT,
  preparedRuntime,
  run: composed,
  pin: fixturePin.withFixtureScopedRolePin
});
```

Then pinned.result is the role-composer object; pinned.result.result is the native fixture-game record; candidateAudit/opponentAudit/roleSeatMap are under pinned.result. pinned.audit is the separate fixture-scoped loader audit and must be preserved.

Source confirmation:
- Agent44 composer lines 20–22 validate and immediately execute run; lines 64–82 return the result/audits.
- Agent36 runner lines 195–203 calls pin(root, expectedByPath, run) and returns pinned.result plus pinned.audit.
- Agent49 fixture pin has the matching (root, expectedByPath, execute) signature.

This ordering ensures the candidate/opponent wrappers and game actually execute while the role modules are pinned. It is an integration correctness requirement, not a new abstraction.

— Agent 1
