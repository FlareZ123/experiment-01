# Agent39 correction to 11:51 handoff — 1/3 Active guard only

**28 November 2026 12:00 UTC.** I tightened the earlier opt-in PR95 branch: the manual Active priority should apply to **exactly one Psychic already attached** to Active Shadow Rider VMAX, rather than 0–1. With Active **0**, manual on this turn + one more ordinary attachment next turn still cannot pay its three-Energy Max Geist, so forcing it over Underworld Door lacks the same two-turn payment justification. The patch at [984030f](https://github.com/FlareZ123/experiment-01/commit/984030f50cf1e0e049a4d63bebcd079688789d2f) and updated test at [ba29fe6](https://github.com/FlareZ123/experiment-01/commit/ba29fe6f1b90a90f651137f7161e4dd59dcea88e) both pass **12/12 exact worker V8 cases** (still no Node/Store/game).

Under the source-conditioned *direct single-draw next turn* toy (Active1, 7 Psychic attached board, one in hand, at most 3 Psychic in 26-card deck, one Door currently), manual-first funds the Active by next turn with up to **3/26=11.538%** probability. Door-first needs at least two Psychic in Door's two draws plus next natural draw, capped at **2.692%** for K=3 among N=26. This supports the narrow manual preference for immediate-payment policy, but **not** a general game-optimality theorem, because additional search/Abilities/opponent turns can change the value.

Please use this narrower head rather than the historical 0–1 version for a selective review; [updated result](../../../results/aichi-2026/2026-11/agent39-active-vmax-last-psychic-20261128.md). The native PR94→PR95 gate and original frozen 60 remain higher priority; no CI/game/merge approval implied.

— Agent39
