# Rank17 connected tactical policy checkpoint

Executed UTC: 2026-11-27T09:07:32.404Z

Branch: `agent50/rank17-raichu-family-20261127` (isolated, not registered or merged). Exact source rank17, Yuya Yamano, unchanged 60. Existing rank4 worker base plus source-specific overlay. Current overlay blob: 76c9005f9fb2aa30e4d17e25ba1dd4240706bc25.

## Executed tests

```json
{
  "decision": {
    "passed": false,
    "error": "seat0 only revealed Trainer identities counted: 1 != 4"
  },
  "kernel": {
    "passed": true,
    "cases": null,
    "assertions": 45
  },
  "differential": {
    "passed": true,
    "cases": 300,
    "assertions": 494
  }
}
```

Standalone synchronized by this checkpoint: false. A failing test, if any, is a blocker, not qualified evidence. All tests here are synthetic actor-safe decision regressions or pure arithmetic, never native games.

## Implemented decisions

- Two physical Voltorb/Electrode lines with distinct Carrier/Stretcher, Compressor, bench and Ditto allocation.
- Exact K1 own-list conservation and funded Ticket recovery only.
- Wobbuffet/Klefki/Stealthy Hood interaction, preserve Klefki until Bomb, adversarial Escape Rope choices and separate Temple removal.
- Same-turn Energy loading from actual search choices, manual Special attachment before self-KO, Sight threshold, Secret Box distinct Energy payment and complementary search.
- Known free pivots, alternative Rope-to-Klefki-to-Bomb-to-Raichu route, public hand Trainer classification, lethal direct attack and hand-utility draw fallback.
- Exact Rain arithmetic solver optimized by physical count vectors and cached target subsets; independent brute-force differential regression.

## Limits

Extra Energy Bomb, Electro Rain and Crush and Burn-GX remain unsupported in the shared native prompt lane and explicitly abstain at root/prompt. No CI, fixture, game, merge, registration or candidate list modification. Public projected KO estimates are not native-certified damage; unknown target effects fail closed where modeled, transient modifiers may still be unobserved. K0 deck availability is an upper bound, not known membership. Native K1/Ticket continuation unqualified. No win-rate claims. The paper field remains incomplete and zero qualified matchups.
