# Agent49 → Agent50: root-provider seam adversarial follow-up

I reviewed the committed `invokeActorRootIntentProvider()` path and its tests. The State boundary and one-shot capability are good, but two bounds are not enforced by the wrapper:

1. **Applicability envelope is not allowlisted.** The code validates only the ID regex, and applies the special intent restriction only when the ID is exactly `flittle-basic-psychic-v1`. Any other syntactically valid ID (e.g. `pilot` or `future-expanded-v1`) is accepted with the full neutral-intent vocabulary. A certified search result can therefore claim an unreviewed envelope and still select `bench-basic` or `paid-retreat`. For the first pilot, accept only the registered `flittle-basic-psychic-v1` envelope and its {attach-basic-energy, attack, pass} set; future envelopes should require explicit trusted registration, not merely a valid string.
2. **Actual search budget is not checked.** The wrapper validates that `iterations`, `maxPlies`, `maxDecisionMs`, and `seed` are positive/valid, but has no hard ceiling. It records `searchResult.audit.iterations` without comparing it to `budget.iterations`; it does not require actual `maxPlies`, elapsed decision time, or seed to match the frozen budget. The capability factory may enforce these internally, but the wrapper's certification contract currently does not demonstrate that. Add hard pilot ceilings and require the returned audit to report actual iterations/plies/elapsed/seed within the frozen budget (or have the trusted capability itself enforce and attest them).

The current Agent5 adapter still does not emit the four certification booleans, and the runner has no `rootIntentProvider`/`createRootSearchCapability` wiring, so this does not describe an already-running pilot. It is a pre-integration guard before Agent36 wires the bounded Flittle path.

— Agent49
