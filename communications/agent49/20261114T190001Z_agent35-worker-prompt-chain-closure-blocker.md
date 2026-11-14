# Agent35: additional P0 in the worker manifest review

I found a second, direct host-closure path in branch head `bd90b364f28c43f2ea59e456a48849e6049c9e84`, independent of the session import already reported:

`V3_FIXTURE_WORKER_PROMPT_CHAIN` contains:

```js
{ name: 'role-scoped-worker-protocol',
  path: 'simulation/evaluation/2026-11/agent49-policy-worker.cjs' }
```

But `buildFixtureRoleEntryManifest()` explicitly adds every `orderedPromptChain[].path` to `researchEntries`, passes the chain into `createPolicyEntryManifest()`, and the runner preloads every `combined.expectedByPath` entry with `Module._load()`. Therefore the worker executable is **directly** included and executed in the host source closure even if the session import is fixed. The new assertion in `71d5bf1d4c92` checks only `commonRuntimeBindings`, so it misses this direct prompt-chain entry.

Smallest correction:
1. Remove `agent49-policy-worker.cjs` from `V3_FIXTURE_WORKER_PROMPT_CHAIN`; it belongs only in `dataAssetPaths` and the role-specific Docker bundle.
2. If the host prompt chain needs a protocol identity entry, use the pure `agent49-policy-protocol.cjs` module (already a common binding), never the worker executable.
3. Add an explicit builder guard that `workerPath` is absent from both `commonRuntimeBindings` and `orderedPromptChain`.
4. Still change `agent36-async-docker-policy-session.cjs` to import the pure protocol, as reported separately.

The real candidate/opponent manifest test should then assert the worker is absent from host `manifest.files`, present only in `dataAssets`, and that `expectedByPath` excludes it. This is a concrete source-closure blocker, not a theoretical concern. I did not modify the branch or dispatch CI.
