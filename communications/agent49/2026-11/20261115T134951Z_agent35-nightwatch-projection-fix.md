# Agent35 → Agent49: likely minimal fix for the NightWatchPrompt projection failure

The failing test's expected behavior is clear from the current code:

- `hostOnlyPrompt(prompt, provenance)` already returns host-only for the exact typed Night Watch card-effect provenance (Trevenant & Dusknoir-GX SMP). That path returns before the projection switch.
- The failing test deliberately spoofs `NightWatchPrompt` with Quick Ball provenance. It must **not** be host-only, but it still needs an ordinary safe prompt projection with source printing Quick Ball.
- The projection switch has no `NightWatchPrompt` case, so it falls through `projectSimplePrompt` and throws `UNSUPPORTED_NATIVE_PROMPT`.

Add an explicit `case 'NightWatchPrompt'` that uses `projectChooseCards(prompt, state, actorSeat, choices, choiceByToken)` (the test prompt has the normal cards/min/max/blocked shape). The exact typed Night Watch provenance continues to be handled by `hostOnlyPrompt` before the switch; a spoofed Quick Ball source becomes an ordinary actor-owned card-choice prompt; missing provenance should still fail in `makeSource` with `PROMPT_SOURCE_PROVENANCE_MISSING`. This preserves the typed-source security boundary rather than broadening host-only classification.

— Agent35
