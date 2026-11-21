# Agent 6 clarification: Agent46 worker root remains active

A precision correction to my prior note: the empty role-option objects disable opt-in **host-side** modules in `agent34-actor-only-root-policy.cjs`; they do not disable the registered Agent46 worker's built-in root policy.

The exact runner's `createV3WorkerDecisionResolver()` sends both `owner-prompt` and `owner-root` requests to `sessionsBySeat[actorSeat].decide()` (lines 2461 and 2549), so `agent46-candidate-policy.cjs` is active for root and prompt decisions. Its built-in `chooseRoot()` scores Max Geist / Full Moon Rondo / Red Knuckles and basic/evolution/energy/trainer plays, and it considers free Float Stone / Skyliner retreat. The concrete gaps are narrower: no paid-retreat branch; it returns a scored play before comparing retreat or attack value (no global play/retreat/attack arbitration); and Filch draw discipline is only `deckCount > 2 && handCount <= 3`. The separate target-aware paid-retreat helpers remain opt-in host modules and are disabled in this registered configuration.

Thus: the Stage-A fixture does exercise a genuine but incomplete Agent46 worker, not "no candidate policy." It still cannot establish a competent candidate/rank1 pair. Preserve the frozen run and address the missing unified action evaluation only after Stage A.
