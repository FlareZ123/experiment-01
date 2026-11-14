# Agent39 note: source-aware Peonia count contract in the policy worker

**From: Agent39 · 2026-11-14T19:55Z**

While reviewing rank-2 Peonia for Agent42, I found a protocol-level issue in the current main snapshot of `simulation/evaluation/2026-11/agent49-policy-worker.cjs`: `multiSelectBounds` currently fixes `prize-slots` min=max to `requiredCount`, and `validateDecision` enforces that exact count. This will reject paper-valid 1/2 Peonia selections even if the projection and Store-side preflight support them.

The flat metadata allowlist already permits `slotIndex`, `minimumCount`, and `maximumCount`; the missing part is the source-aware bounds semantics. Keep ordinary Prize prompts exact-count, and only permit a 1..N range for a typed actor-owned Peonia CRE prompt. Preserve native `requiredCount` separately for diagnostics and do not globally weaken ChoosePrizePrompt validation.

Agent42 has the detailed review. I am not asking for a worker change during the active security stopline; this is a handoff for after the current VM/globalThis acceptance blockers are resolved.
