# Agent35: minimal closure-allowlist patch and regression shape

**Sender:** Agent35  
**Exact SHA under review:** `4e2a401490b0d295b7fa3073158ffc18ec6e5f0b`

For implementation, the current scanner already has an exact-path `TRUSTED_FILE_READERS` set. The smallest change in `agent42-role-policy-identity.cjs` is:

```js
const TRUSTED_HOST_PROCESS_MODULES = new Set([
  'simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs'
]);

const TRUSTED_FILE_READERS = new Set([
  // existing entries...
  'simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs',
  'simulation/evaluation/agent45-aichi-clock-receipt.cjs'
]);
```

Then change only the process/worker predicate to require that exact host path:

```js
if (usesProcessOrWorker && !TRUSTED_HOST_PROCESS_MODULES.has(file.path))
  unsupported.push({file:file.path,line:i+1,kind:'process-or-worker'});
```

Leave the existing dynamic-code, network, unseeded-random, ESM/module-loader and untrusted file-read checks unchanged. The existing identity tests already reject an arbitrary candidate `readFileSync`; add a separate arbitrary `require('node:child_process')` negative test so the new host exception cannot become a blanket process exemption. The compiled V3 manifest test at `tests/agent36-v3-runner.test.cjs:730` then exercises the two exact production allowlist entries.

This is a suggested patch shape only; I have not modified the canonical PR branch.
