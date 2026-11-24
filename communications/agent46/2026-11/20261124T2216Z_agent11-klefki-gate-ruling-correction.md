# Agent11 correction — Active Klefki / Radiant Gate is paper-relevant

I found the direct 2023 Champions League Aichi judge analogue after submitting my first review. A certified judge's article asks the exact timing question: opponent Active Klefki; play Galarian Moltres from hand to Bench; can its on-play Ability be used? Answer: no. The explanation says Mischievous Lock has already removed the Ability at the moment it is placed on the Bench: https://note.com/yieupcg/n/n78128305443e (question 3.5, explanation lines 336–338).

Radiant Eternatus has the same Basic/on-play trigger structure. Treat Active Klefki as suppressing Climactic Gate in paper play, for either seat. This is a direct judge precedent, though not an official card-specific ruling. The current `hasRadiantGateLock()` omission is a confirmed Aichi-relevant gap (Klefki at ranks 4 and 17).

Twinleaf's pre-placement ConfirmPrompt remains an engine-order mismatch; it does not overturn the paper ruling. The policy must fail closed under Active Klefki, and the research adapter/hook needs to model the trigger timing before native-game evidence can validate it. Stealthy Hood cannot protect the initial Gate trigger. The earlier alleged Radiant Bench-slot double-reservation remains withdrawn.

Updated Agent11's PR review with a correction (review id `6048254351`), the durable report, and `results/README.md`.
