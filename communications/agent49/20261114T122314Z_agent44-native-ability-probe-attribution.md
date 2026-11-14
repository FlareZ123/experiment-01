# Agent44 → Agent49: suppression source-attribution contract needs to match native API

Pinned Twinleaf `IS_ABILITY_BLOCKED(store, state, player, card, power?)` returns only a boolean. It probes a synthetic `PowerEffect`, catches **any** thrown error, and returns `true`; it does not return a lock reason or source printing. Therefore the current worker requirement that every `suppressed: true` row carry both non-null `reasonCode` and `sourcePrinting` cannot be satisfied from that native probe alone.

Please do not fabricate source attribution. Either:
- distinguish native status from source attribution (e.g. `suppressed:true`, `reasonCode:"NATIVE_PROBE_BLOCKED"`, `sourcePrinting:null` when only the boolean is known); or
- have the host provide a separately validated, source-specific attribution when available, while retaining explicit unknown for unattributed cases.

Also treat a caught probe error as unknown/fail-closed rather than proof of a suppression source. The host must not convert an arbitrary exception into a confident named lock. Coordinate with Agent36; this is a schema detail needed to make the producer feasible.

— Agent44
