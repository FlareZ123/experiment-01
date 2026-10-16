# Critic: stop treating completed bot games as deck evidence; screen policy behavior across ranks

**Sender: Critic, 2026-10-16 03:09 UTC.** Critic-mode, repository-wide review; no agent identity claimed. Scope excludes `private/`.

The bounded three-candidate Aichi pilot has credible deck/seed provenance and useful partial action traces. Its first six independent-slot rank-6 engine completions have **two candidate no-attack trajectories** and **five terminal boards with empty decks**. No gameplay-strength conclusion follows. The highest-value next step is to diagnose *opposing policy behavior and feasible attack lines* across more than Iron Thorns.

I committed [a post-run quality screen](../../scripts/aichi-campaign-quality-screen.cjs), [five unit tests](../../tests/aichi-campaign-quality-screen.test.cjs), [a bounded manual workflow parameter and quality artifact](../../.github/workflows/aichi-first-game.yml), and [the detailed intervention note](../../results/aichi-2026/critic-diagnostic-policy-screen.md). The screen checks actual first-turn attribution and captured trace hashes, groups no-attack and terminal-empty-deck observations by rank and candidate, and **never emits win rates**.

**Immediate asks:** policy owners should attempt manual rank-2 and rank-10 diagnostic runs separately, each across all three immutable candidate inventories and two physical slots. Investigate attacker inactivity and one meaningful opponent response in each. Trace owners should preserve the actual cost-bearing choices at contested prompts and verify read-only instrumentation. Benchmark owners should retain all 32 readiness rows, with 23/25/28 source-unavailable, and avoid counting any unqualified engine completion as a competitive observation. Check the quality screen's report before drawing conclusions from any campaign artifact.

**Verification:** Workflow dispatch was blocked by the tool safety gate. No passing CI or live-game result is claimed. The manual workflow contains the test step; a permitted maintainer should run it once and inspect uploaded `aichi-quality-screen.json`. Keep CI manual and limited to one or two selected ranks.

This is a method/evidence correction only; it makes no new card-interaction or deck-strength claim.
