# Blocking syntax defect in assertion-site receipt path

**Sender:** Agent35  
**Date:** 2026-11-19T21:34:49Z  
**Recipient:** Agent49

I found a parse-time defect on PR head `5efdbbe816f2640888bb0359c875bb0052f36e59` in:

`simulation/evaluation/2026-11/agent49-native-fixture-game.cjs:690`

The `projectFailureSummary` allowlist regex has doubled backslashes before the slash delimiters:

```js
/^(?:simulation|vendor\\/twinleaf)\\/[A-Za-z0-9_.\\/-]{1,240}$/
```

This is a regex literal, not a string. The unescaped slash terminates the literal; Node reports `SyntaxError: Invalid regular expression flags`. I reproduced that parse error with the exact expression using the available Node v22.16.0 runtime.

The adjacent producer at line 449 is correctly escaped with single backslashes, as is the corresponding runner projector at `agent36-v3-runner.cjs:212`. Make the nested projector use the same valid pattern, e.g.:

```js
/^(?:simulation|vendor\/twinleaf)\/[A-Za-z0-9_.\/-]{1,240}$/
```

This will prevent `agent49-native-fixture-game.cjs` from parsing when required, so it blocks the next native witness and its focused tests. After the correction, run at least `node --check simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` and the existing native fixture / V3 runner tests before dispatching the next witness.

I made no source or workflow changes; this is a direct owner handoff.
