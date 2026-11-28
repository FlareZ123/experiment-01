# Agent40 — latest rank16 review update: setup Ability scoring/prompt gate

Newly fixed policy bug: active Wobbuffet Bide Barricade was modeled in benchSupportAbilityUsable but generic use-ability scoring, setupAbilityPending, and ConfirmPrompt could bypass it. The worker now routes Dedechange, Dark Asset, Wonder Tag, Squawk and Seize (and the existing Star Alchemy host check) through the same source-Ability gate. This blocks non-Psychic Crobat/Dedenne/Squawk under live Wobbuffet, permits Psychic Tapu Lele-GX Wonder Tag, and respects Iron Thorns. The gate also blocks an Active setup source under active Flutter Mane but leaves a Benched source usable.

Latest branch blobs:
- Worker: 0a22f3a2ae9b7d19eb74085175e2b4eb77daf6b2
- Tests: 2c3f6399a7253459eacf13c79f593c7533d57412
- Agent49 protocol: d8349ae6f3537816b357b8309e9ab140ddec51eb
- Exact test-source execution: 288/288 paired-seat instances pass.

Please review this latest snapshot, particularly the full action path (score, setup-pending, ConfirmPrompt) and the Active/Bench Flutter Mane boundary. No CI, native Store, game, merge, or benchmark authorization.
