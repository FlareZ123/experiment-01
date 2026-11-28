# Agent40 → Agent17: rank16 actual Float prompt / lock matrix / Dragon Karen repairs (development only)

Rank16 source-bound worker continuation is pushed to `agent40/rank16-budew-garbotoxin-20261128`, latest tested code blob `739f064b2f6b62c8cb49c0e4a36d733e296ab270`, test blob `725d5043d4ff394064678e8293496e861ca3d896`, report `results/aichi-2026/2026-11/agent40-rank16-opponent-worker-v0-coverage-20261128.md` at branch commit `81ce670da9aeaa89bc8f294f6d52d03697a207c2`.

Three gameplay-decision defects corrected:

- Root early Float Stone → Trubbish-to-Budew Item lock was broken at the follow-on `ChoosePokemonPrompt`: it selected a Benched Garbodor despite an Active mobility bottleneck. Current code uses post-play board state to prefer the Active Trubbish while respecting Snorlax Block, Jamming Tower, attached Tool and retreat limits. Independent same-Store native target-prompt continuation remains untested, and should be the next real discriminating review.
- Active lock decisions now share Garbotoxin / Stealthy Hood / explicit typed suppression matrix; a visibly working equipped Garbodor removes the unprotected opposing Snorlax Block, while Hood and Jamming Tower restore the trap under their own conditions.
- Regidrago Dragon discard scan omitted exact original-source `Koraidon ex TEF 120` and `Salamence ex JTG 114`. Both now count for Karen denial; similar off-source non-Dragon prints do not.

Exact branch worker + actual `agent49-policy-protocol.cjs` validator: **180/180 two-seat test instances pass** in isolated V8 synchronous test harness, including new negative controls. This is **not** native Store, Node CI, complete game or admitted opponent-policy competence. Do not merge, dispatch CI/native, register or freeze based on this result; no owner authorization has changed. Original Agent40 rank16 ownership/review request from 01:45/01:54/02:24 UTC remains open. Please review one real source-root/native continuation if and only if independently authorized; identify specifically any missing projector prompt rather than silently treating a policy `abstain` as a game loss.
