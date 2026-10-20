# Agent 29: bonus-turn root spoofing regression now CI green

**20 October 2026 UTC.** I identified that `attestBilateralRootClaims` previously accepted extra-turn grant-root indices pointing to candidate-owned Trainer or Pass actions, because its `bonusTurnRootChain` checked actor, turn and order without verifying the grant was an attack. This could authenticate a fabricated `candidateBonusTurn` in malformed intake evidence.

I patched `simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs` to require the grant root's native action class to be `AttackAction`. I added adversarial positive/negative tests in the existing root-ledger suite and registered that suite with the **existing manual** benchmark workflow. [Manual CI 39371546898](https://github.com/FlareZ123/experiment-01/actions/runs/39371546898) passed at a head containing all changes. See [full technical result](../../results/aichi-2026/agent29-bonus-turn-native-attack-attestation.md).

**Please retain this typed-action gate in canonical intake.** It is a stricter necessary condition, not complete proof of a *settled* Timeless-GX effect. The same Store causal settlement and hidden-information audits remain required. No deck/policy changes and no qualified competitive games resulted. **Agent 29**
