# Both-seat pinned Tinkaton ex Double Turbo correction, original Store

**Agent 7 | 30 October 2026 | original pinned Store paper-fidelity gate, no match wins.**

The frozen Twinleaf submodule is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The original pinned implementation of **Tinkaton ex SVP31's Pulverizing Press** performs custom direct 140-damage application and bypasses the normal `DealDamageEffect` path that processes **Double Turbo Energy BRS151**'s minus-20 attack modifier. As independently documented in the [original source-code and two-seat real Store audit](agent7-tinkaton-press-dte-original-store-20261030.md), physical seat0 and seat1 both produced **140 damage** with one Psychic plus one Double Turbo attached, versus the **120** printed-paper expectation.

A **research-owned, reversible, default-off** patch `simulation/twinleaf/agent7-tinkaton-dte-hook.cjs` changes only that exact attack printing when Double Turbo is physically attached and unblocked. It installs a wrapper on the **shared Tinkatonex class prototype** and restores the original reducer with the returned undo function. This precise scope matters because Twinleaf's `CardManager.getCardByName` produces `Object.create(sourcePoolCard)` clones; wrapping the first clone's immediate prototype can miss subsequent cards or seat variants. A first compiled hook test at [CI run 41011890499](https://github.com/FlareZ123/experiment-01/actions/runs/41011890499) **failed**: the seat0 patched arm dealt 120 but seat1 patched arm remained at 140. It was a test failure, and is retained rather than reclassified as a positive result.

The improved hook from commit `c4514d8826e9f196f09f9d8dcee220e3eb4fcf0b` selects `Object.getPrototypeOf(Object.getPrototypeOf(sample))` and asserts the constructor `Tinkatonex`, reaching the shared class reducer across clones. The same native test `simulation/twinleaf/agent7-tinkaton-press-dte-native.cjs`, using real original Store `AttackAction`, physical printed Energy objects, authentic prompt resolution and both physical owner seats, then passed the complete comparison:

| Owner seat | Printed attacker Energy | Baseline native damage | Patched native damage | Printed paper damage |
| --- | --- | ---: | ---: | ---: |
| 0 | 1 Psychic + 1 Double Turbo | **140** | **120** | **120** |
| 1 | 1 Psychic + 1 Double Turbo | **140** | **120** | **120** |
| 0 | 3 Basic Psychic | 140 | original unaffected | 140 |
| 1 | 3 Basic Psychic | 140 | original unaffected | 140 |

**Actual independent compiled acceptance:** [manual-only Twinleaf smoke run 41012295949](https://github.com/FlareZ123/experiment-01/actions/runs/41012295949) at run-head `1278c4389661c76ff72dd1f768e4b0774462db18`, **Step 7 `Audit original-Store Tinkaton ex Press versus Double Turbo in both seats` completed SUCCESS on 2026-10-30 06:10:17Z** after the real pinned vendor was checked out and compiled. The script asserts original control damage `[140,140,140,140]` across no-Turbo and Turbo treatments, then verifies the two original Store patched DTE cases `[120,120]` with paper parity. These are two separate physical owner-seat fixtures, not competitive games. The overall smoke job may fail later on its unrelated pre-existing Canceling Cologne step; the bounded Step7 result remains successful. A second standalone `simulation/twinleaf/agent7-tinkaton-dte-hook-native.cjs` performs baseline/patch/restore/no-Turbo contrasts but has **not** separately been compiled in CI and must not be described as already green.

The research-owned correction **does not claim** general attack-damage correctness. Interactions with other damage bonuses, pre-Weakness reducers, some prevention effects, and Energy locks are outside the tested matrix; Stage2 evolution, real 60-card setup, adverse source-first pressure and competitive opponent policy remain absent. Do not enable the patch by default in the common bilateral runner without expanded paper-rule tests and acknowledgement of its exact-card scope. It is useful for future evaluation of [the fixed Tinkaton/Lillie v1 hypothesis](../als/agent7-tinkaton-lillie-reset-v1.json).

**Field qualification remains unchanged: 29/32 authenticated exact opponent printed 60s, zero competitively qualified games and no verified 99.5% fixed deck.**
