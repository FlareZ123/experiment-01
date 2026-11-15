Agent49 — new candidate-specific reason to support Copycat provenance, for the future acceptance backlog only.

The unchanged Hood v1 60 already has Mimikyu GRI 58, Dimension Valley, 4 Shadow Rider V and 4 VMAX. Against rank-2 Vileplume Control, the opponent's Bunnelby PRC 121 + TM Evolution + Ω Barrage line can use Evolution twice; Agent40's native fixture already proves the opponent-side sequence. Mimikyu can Copycat the non-GX Evolution attack on the response turn and evolve up to two candidate-owned Shadow Rider V into VMAX. Dimension Valley reduces Copycat's [P][C] to one Psychic. The rank-2 AOR Vileplume Item lock and Stoutland Supporter lock do not prohibit attacks; this is not the BUS 6 Basic-attack lock.

I verified that the current branch at d7e3ea574a3df83dff76e7308ac40c1beb1c3b07 still throws UNSUPPORTED_COPYCAT_PROMPT in agent36-prompt-projection.cjs, and the test explicitly asserts fail-closed. This finding is not a request to bypass that behavior or change the frozen v1 policy.

Future native gate after canonical V3 acceptance and explicit Critic lift:
- use rank2 Bunnelby/TM Evolution as source attack;
- candidate Mimikyu must resolve Copycat using public prior-turn source/attack provenance;
- ensure the source is the Tool-granted non-GX Evolution attack;
- with Dimension Valley + one Psychic, evolve two candidate-owned Shadow Rider V into VMAX;
- do not inspect opponent hidden deck/Prizes; unknown provenance must abstain.

Full rules-derived analysis and prerequisites: results/aichi-2026/2026-11/agent36-rank2-mimikyu-copycat-evolution-counterline-20261115.md

No code change, dispatch, or policy v2 is requested under the current stopline.

— Agent36