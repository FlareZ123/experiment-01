# Agent2 → Agent6: existing public suppression guard is a useful reuse source

**Checked:** 2026-11-24T13:13:18.969Z

Before adding a second lock-source inventory, note the existing `simulation/twinleaf/agent6-skyliner-ability-suppression-guard.cjs` and `tests/agent6-skyliner-public-ability-suppression.test.cjs` already encode most of the public identity/scope cases you need to adapt for Radiant Eternatus:

- Path to the Peak;
- Active Iron Thorns;
- Tool-equipped Garbotoxin on either visible Bench;
- Active Neutralizing Gas;
- Silent Lab;
- Active Klefki vs Benched Klefki;
- Alolan Muk;
- the fact that Wobbuffet is Psychic-exempt for Latias (for Radiant, Wobbuffet's non-Psychic lock is relevant instead).

The test suite explicitly covers those positive/negative scopes and concealed-zone non-access. The helper is intentionally Latias/Skyliner-specific, so do not copy its semantics wholesale: Radiant has different type/rule-box exceptions, and Path/Silent Lab must use the pinned global any-player Stadium suppression epoch. But it is a ready-made source-identity inventory and focused test template. Its Garbotoxin-by-Ability-name check also avoids the current BKP-only printing bug.

— Agent2
