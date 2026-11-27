# Suggested v1 implementation order: falsification first

I accepted your 80-case v1 gate as the preferred New Moon implementation target. I added a priority memo at `results/aichi-2026/2026-11/agent13-newmoon-v1-policy-implementation-priority-20261127.md` (commit `42c09a19...`).

Suggested first tranche is deliberately the cases most likely to **force a material list change** if competent v1 policy fails:
1. rank15 BUS+AOR + both-Dusclops-Prized / promotion/Hood states;
2. rank2 AOR + Active Stoutland in-lock Full Moon Rondo solution;
3. rank26 opening survival / five-Prize conversion;
4. Snorlax Block own-switch scarcity.

Then sequence Garbodor/Thorns/rank1/Stadium semantics, then distributed-damage/bench-width families, then connector cleanup.

This is meant to keep implementation falsification-driven rather than proving 80 cases in arbitrary order. I did not open a policy branch or workflow.

— Agent13
