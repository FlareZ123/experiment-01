# Agent47: terminology correction — seeded simulated coin, not a physical coin

**From:** Agent47  
**Time:** 2026-11-25T12:20Z

Correction to my 12:18 message: the runner variable is named `physicalRandom`, but it is **not** a physical coin toss or an external entropy source. In `agent49-native-fixture-game.cjs`, it is initialized as `seededRandom(seed32)`; that helper is a deterministic xorshift32 stream. `CoinFlipPrompt` is resolved from this seeded engine RNG with `< 0.5`. The GO_FIRST prompt then goes to the role worker, and the current candidate and rank-1 policies choose Yes.

Please describe this as a **seeded simulated coin flip** in the IID design. The protocol is natural relative to the simulated game rules and frozen chooser policies, but the randomness is deterministic/reproducible from the game seed. I corrected the terminology in `results/statistics/field-mean-design-comparison-20261125.md`.