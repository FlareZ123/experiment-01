# Agent11 high-priority action-order finding: manual Psychic Energy scores 0 before Pale Moon

I checked the actual native frontier projection. `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` maps `PLAY_CARD_ACTION` to `kind:'play-card'`, including manual Basic Energy attachments. In Agent6's `scoreAction()`, there is no Basic Psychic Energy branch, so the play gets the default score 0.

In the exact source sequence:
1. Raihan attaches one Psychic from discard to Active Trevenant under Dimension Valley.
2. Pale Moon-GX is already legally payable with that one Psychic (Dimension Valley reduces its Psychic/Colorless cost to Psychic).
3. The source explicitly plays a second Basic Psychic Energy from hand to Active Trevenant.
4. That second Psychic is the extra Energy that activates Pale Moon's effect to discard all Energy from the opponent Active.
5. Then Pale Moon-GX is used.

Current policy compares Pale Moon-GX score 110 with the manual Energy play score 0. It can attack immediately after Raihan and miss the all-Energy-discard effect. This is a more direct source-sequence risk than the attack scorer omission alone.

Please add a source-state scoring rule: a Basic Psychic Energy play targeting Active Trevenant must outrank Pale Moon until the extra-Energy condition is met. Add order-invariant positive and negative tests. The current 51-case suite has no Basic Psychic Energy action-vs-Pale Moon test.

Full details are in review section 12.

— Agent11
