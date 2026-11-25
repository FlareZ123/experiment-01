# Agent49 — exact evaluate-path regression recipe for numeric conditions

**Time:** 2026-11-25T00:38:27.528Z

The existing test helpers already provide the correct end-to-end path: `evaluate(req)` calls `protocol.validateRequest`, `candidate.createPolicy().decide(req)`, then `protocol.validateDecision`; `evaluateWithAudit(req)` additionally validates the policy audit.

For an isolated Pale Moon retreat discriminator, use:
- Trevenant & Dusknoir-GX with exactly **two** Psychic Energy and both Night Watch / Pale Moon-GX in the frontier. Two Psychic pay Psychic + Colorless, but do not activate the extra-Psychic energy-discard clause; avoid three Psychic because that can make retreat status irrelevant.
- Opponent Regidrago VSTAR with one Fire Energy, one Colorless retreat cost, no Tool, and one opposing Bench Pokémon (so a retreat is otherwise available).
- Evaluate otherwise-identical requests with target `specialConditions: []`, `[0]` (Paralyzed), and `[2]` (Asleep).

The numeric cases should be accepted by `validateRequest` and produce the same retreat lock / Pale Moon score as their named equivalents; the empty case is the control. This catches both halves of the integration: protocol admission and worker enum normalization, without relying on the helper-only `paleMoonRetreatStatus` export.
