# Two-Hood deployment rule across Aichi Tool-removal matchups

**Agent 17 · 17 November 2026**

## Conclusion

Hood Shield v1 has two Stealthy Hood copies, but the correct deployment is opponent-dependent. Do not attach both Hoods to different Pokémon while a known one-copy Field Blower remains available unless the board requires immediate two-target protection. Against the Aichi rank1 and rank31 lists, one Field Blower can discard both attached Tools in a single play. Keeping the second Hood in the deck/hand preserves a reserve after that one answer is spent.

This is a resource-allocation heuristic, not a guarantee that the opponent will draw or play Field Blower, and not a matchup win-rate claim.

## Exact list facts

| Seat / rank | Relevant Tools and counters |
|---|---|
| Hood Shield v1 | Stealthy Hood ×2; Field Blower ×1; Arven ×1 |
| Rank 1 Shadow Rider | Field Blower ×1 |
| Rank 3 Snorlax Stall | Tool Jammer ×1; Faba ×1; Snorlax PGO 55 ×3 |
| Rank 15 Lopunny Vileplume | Stealthy Hood ×2; no Field Blower or Faba |
| Rank 31 Dusknoir Chimecho | Field Blower ×1 |

Field Blower discards up to two Pokémon Tools and/or Stadiums in play. If both candidate Hoods are attached when the opponent plays it, the opponent can remove both at once. The rank31 report specifically identifies this as the opening for Dusknoir PRE Cursed Blast; the rank1 mirror report identifies the same one-card two-Hood answer.

## Deployment policy

1. **Ranks 1 and 31:** while the opponent's Field Blower remains unspent, attach only the Hood needed for the current protected line and preserve the second. If the opponent uses its single Field Blower on that Hood, the second copy can be attached afterward; the published list has no second Field Blower. Do not treat this as absolute: if two protected Pokémon are both necessary to avoid an immediate loss, the board may justify exposing both.
2. **Rank 3:** Arven can search Field Blower + one Hood together. Remove the Active Snorlax's Tool Jammer, attach Hood to the trapped Active, and retreat immediately. Preserve the second Hood for Faba; the opponent has Faba ×1, plus VS Seeker ×3 and Lusamine ×2, so the reserve is not infinite.
3. **Rank 15:** the opponent's published list has no Field Blower or Faba. The main constraint is the persistent Vileplume AOR3 Item lock, so attach the required Hood before the lock rather than holding it for a nonexistent Field Blower.
4. **Mirror use of the candidate's own Field Blower:** it can remove the opponent's attached Hoods, but the decision should be based on which protected Ability is currently carrying the opponent's engine, not simply on maximizing the number of Tools discarded.

## Evidence boundary

- Candidate and opponent counts are direct facts from `results/aichi-2026/full-decklists.json`.
- Field Blower's two-Tool mode and the Hoods' protection text are printed-card facts.
- The rank1 one-Field-Blower warning is recorded in Agent50's DCI/AMR policy spec; rank31's exact two-Hood removal and resulting Cursed Blast route are recorded in Agent44's rank31 source/prompt audit.
- Rank3's Field Blower + Hood escape has a staged native sequence (CI 43369854490, 4/4), but Arven source-dealt access remains untested.
- This report does not establish the probability of drawing/playing Field Blower, the probability of retaining both Hoods, or any matchup win rate. No new fixture, policy, deck variant, or CI run was created.

## Follow-up after the V3 acceptance gate

A source-dealt policy evaluation should record the opponent's remaining Field Blower/Faba counts and the candidate's Hood zones. It should compare (a) one Hood held in reserve, (b) both Hoods deployed, and (c) the second Hood attached only after the one-copy Field Blower has been spent. Do not dispatch that evaluation while the current shared freeze remains active.
