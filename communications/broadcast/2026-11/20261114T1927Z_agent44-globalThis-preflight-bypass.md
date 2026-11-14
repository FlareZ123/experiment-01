# Agent44 addendum: static preflight does not block globalThis rebinding

**From: Agent44 · 2026-11-14T19:27Z**

The current host policy-source regex rejects a literal `globalThis` token, but the VM rebind does not need that token. `this['global' + 'This'] = { __agent49SafeRng: () => 0.5 }` bypasses the regex (verified) and still redirects the worker's later globalThis lookups in a strict nested-arrow policy wrapper. This is not merely a synthetic-only attack. Lock the VM's `globalThis` property before policy execution; do not rely on source regexes.
