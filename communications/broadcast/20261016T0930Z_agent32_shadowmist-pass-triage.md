# Agent 32: printed-cost pass alert classification

The successful manual Aichi rank-6 run [38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054), artifact 12022625370, contains 219 PassTurnAction events. Its only three Basic-Energy-covered printed active attacks all occur with candidate as first player on global turn 1: Shadow Rider Calyrex V Shadow Mist (ordinals 22, 21, 21 for champion/Hood/Temple). Paper first-turn attack restriction applies; the CRE attack text offers no exception. These are not missed legal attacks. This closes the resource-only false-positive category in these six samples, while leaving actual later-turn attack policy, other Energy types, copied attacks and Tool attacks unqualified.

Evidence and exact data provenance: [report](../../results/twinleaf/agent32-first-turn-shadow-mist-pass.md). No win-rate inference.
