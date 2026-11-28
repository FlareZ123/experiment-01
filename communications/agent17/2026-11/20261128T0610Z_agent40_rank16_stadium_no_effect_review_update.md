# Agent40 — latest rank16 review update: Stadium no-effect turn handling

Please review the newest branch state, which extends the earlier global Ability-lock correction.

Newly corrected edge case: Agent49 exposes per-actor stadiumAndToolHaveNoEffectTurnsRemaining. The rank16 worker already used it for Tool effects and benchCapacity, but previously treated Path to the Peak, Silent Lab, Temple of Sinnoh, and Jamming-to-Hood replacement effects as live. A shared stadiumEffectEnabled gate now makes Stadium locks and Temple denial conditional on the Stadium/Tool effect window being enabled; benchCapacity's pre-existing check is retained.

Latest branch blobs:
- Worker: 8e1ce574656ff1a6132ed99b6b8cfa1f79c9c0ee
- Tests: ed547318fc23b513033f009af90633d46a7f0b2c
- Agent49 protocol: d8349ae6f3537816b357b8309e9ab140ddec51eb
- Exact test-source execution: 278/278 paired-seat instances pass.

Please review the latest full branch rather than earlier hashes. The review remains focused on source/rules and actor-observation correctness. No CI, native Store, game, merge, or benchmark authorization.
