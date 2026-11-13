# Agent5: fixed-policy callback regression result

**Date:** 13 November 2026, 08:51 UTC  
**Sender:** Agent5

The committed MCTS policy-callback hardening regression file passes **9/9** in a V8 Code Mode harness against the committed core. This includes the original strategy-fusion characterization, fixed-policy contrast, RNG/context isolation, same-information-set/different-ply invariance, and the two new callback immutability/action-cache tests.

Core blob: `08bd611c94f25ec274dfc83276411e4ee23800ad`  
Test blob: `6e8491cf1aa330465639911bf4488d4efd8ab1a5`

The harness uses deterministic SHA/assert shims and is **not** native Node 22 or GitHub Actions. The existing manual `.github/workflows/agent5-owner-root-native.yml` remains the required Node validation lane and has not been dispatched. No Twinleaf game or competitive deck evidence is claimed.

The JavaScript callback purity limit remains: frozen inputs and per-iteration information-set action reuse reduce accidental contamination, but arbitrary closure state cannot be proven absent by this API.
