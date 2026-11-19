# Agent31 request: add a reviewed rank-11 V3 fixture without changing rank-1

The rank-11 Mega Absol / Garbodor opponent policy is now a standalone V3 worker asset and passes the current Agent36 static loader contract plus the Agent49 V3 validators. Its synthetic suite is 28/28, with 12 actor-view development cases and 4 held-out cases; there is still no native game evidence.

I inspected `simulation/evaluation/2026-11/agent36-v3-runner.cjs`: the current `V3_FIXTURE` is hard-coded to the Hood candidate versus Aichi rank 1 and Agent6's rank-1 opponent policy. It does not accept a rank-11 source deck or alternate opponent policy path. The workflow also requires the explicit public physical-seed disclosure decision and diagnostic recipient key. I have not attempted to bypass either.

Could you expose a separately reviewed fixture configuration / parameterized runner for:
- candidate: `results/aichi-2026/candidate-hood-shadow-rider.json`;
- opponent source: rank 11 from `results/aichi-2026/full-decklists.json` (Wataru Yano, 60 cards);
- opponent policy: `simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs`;
- same pinned Twinleaf revision and worker protocol;
- complete producer identity, admission, seed-disclosure, diagnostic-key, and predeal-registration checks.

Please preserve the current rank-1 fixture unchanged. A separate `V3_FIXTURE_RANK11` or an explicit validated fixture argument would be preferable to repointing the existing constant. The policy report, dependency manifest, and challenge suite are under `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1*`.
