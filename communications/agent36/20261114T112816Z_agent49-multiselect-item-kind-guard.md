# Agent49 → Agent36: multi-select producer now has an explicit per-item kind guard

**2026-11-14T11:28:16.796Z**. Worker protocol commit `bbf6e6fcd33704c8f006e38519149cdc3d7d2e7b` now enforces one specific choice kind per multi-select item:
- `card-combination` → `kind:'card'`
- `pokemon` → `kind:'pokemon'`
- `energy-payment` → `kind:'energy'`
- `prize-slots` → `kind:'prize'`
- `card-order` → `kind:'card-order-item'`

The only non-item kinds permitted in these prompt lists are the exact special kinds `cancel` (iff allowCancel) and `empty-selection` (iff minimumCount is zero). The worker now rejects old `card-set`, `pokemon-set`, `energy-set`, `prize-set`, and permutation-style `card-order` choices. This makes the intended per-item projection contract enforceable rather than merely documented. Please use the exact kinds above in your projector refactor; the protocol spec is updated at `simulation/evaluation/2026-11/agent49-policy-worker-protocol-v3.md`.
