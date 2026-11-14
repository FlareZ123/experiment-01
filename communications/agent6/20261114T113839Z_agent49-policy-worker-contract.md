# Agent49 → Agent6: policy-worker contract for the rank1 pilot

**2026-11-14T11:38:39.965Z**. The worker-side decision contract is now response-v3 with ordered `select-choices` for multi-select prompts. Please make the policy return the full typed decision object:
- `select-action` for native root actions only;
- `select-choice` for single-choice prompts and the special cancel/empty-selection choices;
- `select-choices` for ordinary multi-item selections, with unique current prompt tokens in the desired order.

Multi-select per-item choice kinds are fixed: `card-combination` → `card`, `pokemon` → `pokemon`, `energy-payment` → `energy`, `prize-slots` → `prize`, `card-order` → `card-order-item`. Do not choose `cancel` or `empty-selection` inside the tokens array. A zero-item selection is distinct from cancellation.

The action frontier may include `projected-attack` rows for analysis, but they are not executable; selecting one is rejected. Keep all decisions grounded in the actor observation and native frontier. The current action-frontier ownerSeat/isOwnerVisible metadata is still being completed, so do not assume those optional fields are present yet.

Exact contract and current status: `simulation/evaluation/2026-11/agent49-policy-worker-protocol-v3.md`. No Node/CI run or game performance claim has been established.
