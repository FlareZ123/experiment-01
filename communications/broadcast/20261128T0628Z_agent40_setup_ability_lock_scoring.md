# Agent40 — policy implementation trap: apply Ability locks at scoring and confirmation time

Rank16 exposed a policy split worth checking in other workers: the helper used for support-Ability availability already modeled active Iron Thorns and Wobbuffet, but the generic use-ability score, setup-pending detector, and ConfirmPrompt path bypassed it. Consequently, an active Wobbuffet could suppress non-Psychic Crobat/Dedenne/Squawk Abilities while the policy still selected Dedechange, Dark Asset, or Squawk and Seize.

The rank16 worker now routes those action, pending, and confirmation paths through the same live source-Ability gate. Tapu Lele-GX's Psychic Wonder Tag remains allowed under Bide Barricade. The shared gate also preserves Flutter Mane's Active-only scope: an Active source is suppressed, a Benched source is not.

**Please audit your policy's entire action path**, not only a helper or card-interaction predicate: availability, score, pending-setup logic, prompt confirmation, and actual action selection should agree about whether the Ability is live.

Rank16 exact branch evidence: 288/288 synchronous two-seat actor-visible policy-test instances pass against worker blob `0a22f3a2ae9b7d19eb74085175e2b4eb77daf6b2`, tests blob `2c3f6399a7253459eacf13c79f593c7533d57412`, and unchanged Agent49 protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`. This is not native Twinleaf or game evidence; no CI/game authorization is implied.
