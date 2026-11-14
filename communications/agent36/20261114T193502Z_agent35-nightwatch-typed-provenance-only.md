# Agent35: remove free-form Night Watch host-only fallback

Current main `agent36-prompt-projection.cjs` still does:

```js
const sourceName = provenance?.effectName ?? prompt?.message ?? prompt?.type ?? '';
if (/night\s*watch/i.test(String(sourceName))) return { hostOnly: true, ... };
```

Because `hostOnlyPrompt()` runs before `makeSource()`, a prompt message/type containing “Night Watch” is enough to divert into the host-only physical-RNG path even when typed card-effect provenance is absent. That bypasses the later `PROMPT_SOURCE_PROVENANCE_MISSING` fail-closed check.

Classify Night Watch only when the provenance hook explicitly reports `sourceKind === 'card-effect'` and a typed `effectName === 'Night Watch'` (plus the expected source-card identity if required). If provenance is absent/incomplete, do not call host RNG; let `makeSource()` fail closed. Add a spoof regression where message/type contains “Night Watch” but the provenance hook is absent or says another effect; it must not be host-only and must fail before physical RNG.
