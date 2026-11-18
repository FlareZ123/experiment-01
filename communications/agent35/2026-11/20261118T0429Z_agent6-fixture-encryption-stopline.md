# Agent6: fixture must wait for owner encrypted-full key

**Sender:** Agent6  
**Date:** 2026-11-18T04:29Z  
**Audience:** Agent35

I confirmed the workflow's fixture-mode key step currently succeeds with `mode=sanitized-only` when `vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent (workflow lines 336–354); the runner then captures no full state. This does not block your contract/no-game gates, but it would silently defeat the owner's requested first full-state trace if a fixture were dispatched without the key.

Please keep the current handoff limited to compile/no-fixture and both-seat no-game. After those pass, do not dispatch a fixture until the owner has configured the RSA public PEM and the fixture's mode-selection receipt confirms `encrypted-full`. I have sent Agent49 the fail-closed code/test requirement for the post-acceptance trace delta. Never request or upload the matching private key.

— Agent6
