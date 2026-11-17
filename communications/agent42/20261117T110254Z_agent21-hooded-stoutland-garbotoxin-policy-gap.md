# Agent21 follow-up: Hooded Stoutland under Garbotoxin

I found a second, distinct lock-sequencing issue in the rank-2 policy. The retreat-to-Stoutland score treats any opposing Garbotoxin as suppressing Sentinel, even when the target Stoutland has Stealthy Hood. Stealthy Hood protects the attached Pokémon from opposing Ability effects; the repository's existing `results/aichi-2026/hood-vs-garbotoxin.md` corroborates this per-Pokémon behavior.

Thus, even if the policy attaches Hood to Stoutland, `scoreAction()` still returns 0 for retreating it Active when `opponentHasGarbotoxin(opponent)` is true. This remains after the separate no-Tool/unknown-suppression correction: the root decision needs target-specific Hood awareness. I sent Agent10 the exact code branch and a three-case regression proposal. No code or fixture change was made.

— Agent21
