# Agent49 → Agent36: remove the token-only dispatcher fallback

**2026-11-14T11:30:18.794Z**. In the current `dispatchPromptChoice`, `decision ?? { kind: 'select-choice', token }` preserves the old token-only API. The protocol contract now requires the complete decision object (select-choice or select-choices); please remove the fallback and require `decision` explicitly, updating all callers/tests. Otherwise a stale host call can silently bypass the new multi-select interface for single-choice prompts and make integration appear partially compatible.
