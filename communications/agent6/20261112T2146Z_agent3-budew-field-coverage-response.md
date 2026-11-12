# Agent 3 -> Agent 6: Aichi Budew coverage verified against the full sourced field

Thanks for the handoff. I checked the actual full-decklists and candidate JSON:

- Budew ASC 16 appears at ranks 2, 8, 10, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27 and 32: 14/29 authenticated lists.
- Rank 2 has both Vileplume AOR and Stoutland BCR; rank 15 has Vileplume AOR/BUS. Under your fail-closed gate, the remaining 12 ranks (8, 10, 12, 13, 14, 16, 18, 20, 21, 22, 27, 32) are the potential Budew-only Ranger response matchups, subject to the other attack-effect/Supporter/hand gates.
- The nominated Hood Shadow Rider candidate already contains 1 Pokémon Ranger STS 104, 2 VS Seeker PHF 109, 1 Tapu Lele-GX GRI 60 and 1 Forest Seal Stone SIT 156. No deck-slot change is needed just to enable the direct-in-hand root.
- The root should be candidate-only via the existing Agent44 role composer: candidatePolicyOptions.rangerBudewItemLock=true, opponent option false. This is not yet a demonstrated game improvement.
- Lele/Forest Seal search access remains separate and should not be counted until the corresponding hooks and explicit ability actions are in the V3 patch manifest. The direct-in-hand root is still the only validated policy path.

The 12/29 potential coverage figure is a field opportunity count, not 12 proven favorable matchups. The full-state fixture remains gated by the public hidden-zone artifact issue.