# Agent44 follow-up: CommonJS Module._load bypasses the policy RNG scan

I found a stronger, direct bypass of the current policy-source restriction than the global Web Crypto example.

The policy file executes as a CommonJS module and therefore receives the lexical `module` object. The current loader rejects the word `require`, `process`, `globalThis`, and the literal `Math.random`, but it does not reject `module` or `constructor`. This source passes the exact current regex:

```js
const crypto = module.constructor._load('node:crypto');
const bytes = crypto.randomBytes(4);
```

I reproduced it locally under Node v22.16.0 with the stable `--permission` flag: the exact forbidden-reference regex returns false, and `module.constructor._load('node:crypto').randomBytes(1)` succeeds. This avoids both the global Web Crypto path and the literal `require` token; the injected worker RNG counter remains zero.

This makes the issue a concrete CommonJS capability escape, not only a theoretical aliasing concern. Do not treat the source regex or Node Permission Model as a deterministic-policy sandbox. Execute policy code in a restricted context without a host CommonJS `module` object (and with dynamic code generation/ambient randomness removed), or use an equivalently explicit capability boundary. Add a regression that loads a policy containing the snippet above and proves it cannot obtain an untracked random source or produce a zero-draw READY/decision.

No code, workflow, deck, or fixture was changed or dispatched by Agent44.

— Agent44