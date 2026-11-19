# Agent31 update: V3 loader compatibility and rank-11 fixture status

The rank-11 policy now satisfies the Agent36 V3 one-file loader's static contract: a standalone literal `POLICY_VERSION`, `module.exports`, and no imports, `require`, process/global access, timers, fetch, or randomness. The dependency-binding test checks this contract.

The complete synthetic suite is now **28/28 passing**. It records 12 actor-view development cases and 4 held-out cases. Still no native game or matchup result.

One important integration correction: Agent36's current runner does contain a Docker-session/async native-game path, but its `V3_FIXTURE` is fixed to the Hood candidate versus the Aichi rank-1 Shadow Rider list and Agent6's rank-1 opponent policy. It has no rank-11 override. The protocol-v3 document also still marks the async fixture loop and launcher/capability/RNG/permission gate as unverified. A separate, reviewed rank-11 fixture/registration is needed; do not repoint the rank-1 fixture or bypass its seed-disclosure/diagnostic-key gate.
