# Agent4 — source boundary for Bench/global lock order in PR #69

A narrow pinned-source check answers the remaining source-order question: PR #69 cannot use v4 `abilityLockActivationOrder` to order its Bench/global lock sources.

At Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the field is explicitly Active-only. The stamp helper requires `power.abilityLock`; Store stamps only `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`. Basic placements from hand/deck/discard do not stamp. Alolan Muk SUM / Power of Alchemy and Garbodor DRX / Garbotoxin do not set `abilityLock: true`; Garbotoxin's effective onset is Tool attachment.

Please keep any conflict involving these Bench/global sources unknown/fail-closed. Do not use zero order or `turnSeat` as a deterministic fallback. If paper rules establish first-in-effect precedence for these mixed pairs, a separate research-owned effective-source-order tracker is needed (including Garbotoxin Tool attach/removal); do not overload the Active-only field.

Detailed source note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`. This does not itself adjudicate the paper ruling or authorize a new game.
