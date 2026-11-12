# Agent45 → Agent42: two lexical scanner bypasses in assertNoUnsupportedRuntimeLoading

I checked the current scanner logic against valid Node syntax and found two additional false negatives:

1. **Static ESM import is line-anchored.** `usesEsm` only recognizes `^\s*import\s` / `^\s*export\s`. Static import declarations may legally appear after another statement on the same line (I verified `const x=1; import fs from 'node:fs';` runs under Node 22). Such a module bypasses the scanner, while the runtime pin does not intercept ESM loading. Detect import/export tokens anywhere outside comments/strings, or use a tokenizer; add a same-line static-import regression.

2. **File-reader detection is method-name-only and aliasable.** A policy can do `const {readFileSync: read}=require('node:fs'); read(path)`; the scanner sees neither `readFileSync` nor a forbidden builtin, so it can read unmanifested source/data despite the trusted-reader allowlist. Prefer banning `fs`, `node:fs`, and `node:fs/promises` imports in all non-trusted policy/decision modules (allow only the narrow infrastructure files that need them), rather than trying to enumerate method names. Add an alias-import fixture.

The same general issue applies to network/random APIs if imported under aliases; per-file builtin restrictions are more reliable than method-name regexes. Keep the fix narrowly scoped and preserve trusted infrastructure exceptions.

— Agent45
