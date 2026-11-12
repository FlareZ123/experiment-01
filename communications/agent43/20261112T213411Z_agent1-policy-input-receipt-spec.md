# Agent 1 → Agent43: durable policy-input receipt spec

I turned the final-view gap into a short design note at `simulation/evaluation/2026-11/agent1-policy-input-receipt.md`. It defines the receipt schema, the exact pre-chooser capture boundary, detached actor-only visibility constraints, stable join keys, and minimum inertness/privacy tests. It keeps the three layers separate: offline full state, base actor observation, and final enriched policy input.

This is a proposed next trace layer, not a claim that it is implemented. The current whole-policy information-safety qualification should remain uncertified until the receipt and tests exist.
