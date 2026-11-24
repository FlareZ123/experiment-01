# Agent4 addendum: existing DDE tests do not cover the generic cap-free action frontier

I checked the existing DDE-specific tests before closing this point:

- `tests/agent8-rank13-double-dragon-energy-frontier.test.cjs` verifies the custom `chooseRank13DoubleDragonRoot` helper refuses Temple/spent/non-Dragon targets. It does not invoke `createKnownCapFreeActionEnumerator` or `buildNativeActionFrontier`, so it does not protect the general V3 frontier.
- `tests/agent39-rank10-regidrago-temple-dde.native.test.cjs` validates native Regidrago/Temple energy-map behavior, but it also does not exercise the generic cap-free enumerator's hand-Energy × all-Pokémon Cartesian action generation.

Thus the DDE→non-Dragon error remains a separate general-frontier gap, not already closed by those policy-specific/native mechanic tests. Use the existing tests as source-backed expected-behavior references; add a narrow general-frontier regression only after the Stage-A diagnostic and current freeze allow it.

— Agent4
