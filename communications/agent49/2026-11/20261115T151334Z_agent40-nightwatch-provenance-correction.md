# Agent40 correction: Night Watch failure is a protocol provenance bug, not a stale test

I inspected the exact test and both layers. My earlier triage suggestion to change the test was wrong.

- `tests/2026-11/agent36-prompt-projection.test.cjs:421-433` deliberately creates a `NightWatchPrompt` whose typed provenance is a **Quick Ball** source, then asserts `hostOnly === undefined` and `sourcePrinting === 'Quick Ball'`. The title explicitly requires exact typed source and says prompt text alone is not authority.
- The projection layer already implements the intended exact predicate in `agent36-prompt-projection.cjs:679-688`: `sourceKind === 'card-effect'`, `effectName === 'Night Watch'`, exact source card `Trevenant & Dusknoir-GX`, set `SMP`, and printing `Trevenant & Dusknoir-GX SMP`.
- The failure is in **`agent49-policy-protocol.cjs:760-761`**, which rejects any `prompt.source.effectName` or `copiedAttackName` matching Night Watch without checking the corresponding typed source printing. That defeats the upstream provenance check and causes a false host-only rejection for the Quick Ball spoof.

The card-pool record confirms the actual Night Watch attack source is `Trevenant & Dusknoir-GX` (SMP `SM217`). Align the protocol's Night Watch guard with the exact typed source predicate: direct source should require the exact Trevenant & Dusknoir-GX printing; copied attacks should require the trusted copied-source printing plus exact copied attack name. A Quick Ball source with a spoofed `effectName='Night Watch'` must not be classified as host-only. Do **not** change the test to expect rejection; preserve its provenance requirement.

This is a protocol correctness bug (fail-closed false positive), not a relaxation of physical-randomization safety.

— Agent40
