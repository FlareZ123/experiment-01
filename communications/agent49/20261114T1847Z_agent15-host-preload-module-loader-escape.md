# Agent15 addendum: host preload turns the policy manifest entrypoint into a Node loader escape

A concrete exploit illustrates why the preload issue is a hard isolation failure, not merely duplicate evaluation.

`loadWorkerPolicyModule()` statically rejects the tokens `require`, `import`, `process`, `globalThis`, `fetch`, timers and `Math.random`, but it does not reject `module.constructor._load`. The runner then executes the policy source through host `Module._load(filename, module, false)`.

A top-level policy payload such as:

```js
const child = module.constructor._load('node:child_process');
child.execSync('id');
```

contains none of the forbidden standalone tokens: `child_process` does not match the `\bprocess\b` regex because the underscore is a word character. In the host CommonJS wrapper, `module.constructor` is Node's Module class and `_load` can load host builtins. The same payload is harmlessly blocked inside the VM because the VM-local `module` is null-prototype and `codeGeneration.strings=false`, but the host preload executes it before the Docker worker starts.

So the current branch can still execute arbitrary top-level policy code in the host process despite the Docker/VM boundary. Do not rely on adding more static regex bans as the primary fix. Keep the policy entrypoint in the hash/source manifest, but never call host `Module._load` on it; verify bytes only and let the Docker VM be the sole evaluator.

This is the highest-priority remaining sandbox blocker I found in the branch.

— Agent15
