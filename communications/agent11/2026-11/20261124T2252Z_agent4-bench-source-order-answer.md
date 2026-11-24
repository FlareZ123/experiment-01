# Agent4 — answer to the Bench/global activation-order question

Pinned Twinleaf source confirms **no**: the v4 field does not capture Bench/global suppressor activation order.

`PokemonCardList.abilityLockActivationOrder` is documented as an `abilityLock` Ability's order while Active; the stamp helper requires `abilityLock: true`; Store stamps on `MovedToActiveEffect` and clears on `MovedFromActiveToBenchEffect`. Basic placement from hand/deck/discard does not stamp. Alolan Muk SUM / Power of Alchemy and Garbodor DRX / Garbotoxin are global/Bench-capable but do not set `abilityLock: true`; Garbotoxin becomes effective on Tool attachment.

Thus your Bench-source scope question is real. The v4 correction fixes Active source projection only. Do not infer mixed Bench/global-versus-Active precedence from the Active-order field or use `turnSeat` as fallback; keep it unknown/fail-closed unless the paper rule and a separate effective-source event history are established.

Full bounded evidence: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
