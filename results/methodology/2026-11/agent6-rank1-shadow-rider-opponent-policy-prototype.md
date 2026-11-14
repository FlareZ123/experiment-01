# Rank 1 Shadow Rider opponent-policy prototype

**Status:** prototype implemented; direct V8 contract exercise passed; not yet run under Node or GitHub Actions; not a qualified competitive opponent policy.

## Question

Can the rank 1 Aichi Shadow Rider list be represented by a separate, deterministic opponent-role policy that makes materially stronger owner-side decisions than a forced Retreat+Pass script, while consuming only the worker's validated actor view and legal action/prompt projections?

## Source evidence used

The source-specific baseline is `results/methodology/2026-11/agent11-original-rank1-raihan-third-psychic-nightwatch-prize-20261109.md`. It records an actual rank 1 opponent owner hand containing Tulip, two Shadow Rider Calyrex VMAX, Acerola, Mysterious Treasure, Raihan, Sky Field, Unfair Stamp and Teammates, with three Basic Psychic Energy in that owner's discard after the corrected Pale Moon-GX line. The report demonstrates native Tulip recovery, two VMAX evolutions, two Underworld Door uses, and four cards drawn. It also identifies the strategic alternatives that a competent policy must compare: Latias recharge, Girafarig/Get Lost, Acerola against a pending Pale Moon-GX effect, bulky Active promotion, Unfair Stamp, Sky Field, and Mimikyu Copycat as a text-derived tactical hypothesis now represented in the policy but not game-validated.

These are source-state opportunities and native tactical branches, not full-game matchup evidence. The prototype uses the recorded facts as acceptance scenarios, not as a hard-coded script or a claim that any branch is optimal.

## Implementation

- Policy: `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`.
- Tests: `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`.
- Role: `opponent`, seat-bound, empty config, deterministic policy version `agent6-rank1-shadow-rider-opponent-v1`.
- Input boundary: `aichi-actor-observation-v2`, `aichi-owner-prompt-projection-v3`, `aichi-action-frontier-v1`, and the versioned public event receipt. It selects only current opaque action/prompt tokens.
- Implemented priorities include: receipt-confirmed Acerola removal of a pending Pale Moon-GX threat from an Active damaged Latias; Tulip recovery of discarded Basic Psychic Energy; Shadow Rider V-to-VMAX evolution; Underworld Door use and Latias energy targeting; Unfair Stamp only when the prior-turn KO receipt or a large visible opponent hand justifies it; safe low-Prize Active promotion; and source-aware card-search, discard, energy-payment, and prize-slot choices.
- Unknown or unclassified prompts fail closed with an explicit abstention. The policy never reads native State/Store, opponent concealed hand/deck identities, physical RNG/seed, or host process/filesystem/network state.

## Validation performed

The exact committed test file was executed in a direct V8 harness after loading the current committed policy and worker protocol modules. The harness exercised the worker's actual `validateRequest` and `validateDecision` functions; its Node test/assert registration layer was stubbed only to execute the synchronous test definitions.

**Result: 46/46 policy tests passed in the V8 harness.** Covered cases:

1. Tulip is selected ahead of the VMAX evolution when three Basic Psychic Energy are available in discard.
2. Acerola is selected ahead of Tulip only when the prior-turn receipt confirms Pale Moon-GX and the damaged Latias is Active.
3. Tulip's multi-select recovers the visible Psychic Energy cards without selecting the empty-selection special token.
4. Underworld Door selects the uniquely visible Latias target using only printing and zone metadata.
5. Active promotion prefers a surviving two-Prize Shadow Rider V over a 90-HP one-Prize Girafarig and a three-Prize VMAX.
6. Energy payment selects the visible cost cardinality rather than every available Energy.
7. An unsupported prompt produces a typed abstention.
8. Unfair Stamp is not fired merely because the opponent took a Prize on an earlier turn; the policy requires prior-turn KO evidence or a visible hand-size reason.
9. A partially populated Tulip prompt returns only card tokens and never inserts an empty-selection token into a multi-select array.
10. Zero-count prize and card-order prompts use the dedicated empty-selection single-choice response.
11. Card-order multi-selects return only card-order-item tokens.
12. Prize multi-selects return only prize tokens, excluding cancellation tokens.
13. Raihan's search chooses a setup card rather than a second Basic Psychic Energy, because Raihan already attaches from discard.
14. Fog Crystal prioritizes a missing Shadow Rider V over Energy when no V is visible or in hand.
15. Battle Compressor prioritizes Basic Psychic Energy when a held Tulip/VS Seeker can recover it.
16. VS Seeker retrieves Tulip when the discard contains the recoverable Psychic package.
17. Unknown card-combination sources abstain rather than choosing a plausible-looking card.
18. Unknown confirmation sources abstain rather than defaulting to Yes.
19. A recognized Star Alchemy confirmation selects Yes.
20. Copycat chooses Max Geist over Eon Blade when both are exposed.
21. Non-Copycat attack-choice prompts abstain.
22. Mysterious Treasure's discard prompt selects only a low-value card token, never cancel/empty tokens.
23. Mysterious Treasure searches a missing Shadow Rider V when the visible board has only one.
24. Guzma abstains when the projected prompt requires multiple targets but the policy only supports one.
25. Raihan attaches to Latias when it is one Psychic Energy short of Eon Blade.
26. Field Blower selects the opponent stadium/tool and not the owner's stadium.
27. Get Lost prioritizes opponent recovery cards over Basic Psychic Energy.
28. Wonder Tag searches Tulip for a visible recoverable Psychic package.
29. Star Alchemy searches Field Blower to remove the opponent's Path to the Peak.
30. Mysterious Treasure searches Mimikyu when the opponent Active exposes a non-GX Copycat target.
31. Marshadow is played to trigger Resetting Hole against Path to the Peak.
32. Resetting Hole is prioritized only while a disabling stadium is active.
33. Mysterious Treasure searches Marshadow as a Path to the Peak counter when it is not visible on board or in hand.
34. Mimikyu is played when the opponent Active exposes a known non-GX Copycat target.
35. Mimikyu's Copycat attack is selected when a legal non-GX target is visible.
36. Mimikyu is not played when the opponent Active has no known non-GX attack.
37. Mysterious Treasure completes the second Shadow Rider V before optional Copycat setup.
38. Tapu Lele-GX is played to access a Supporter when none is held.
39. Mysterious Treasure searches Tapu Lele-GX when setup is complete and no Supporter is held.
40. Climactic Gate is used when a Shadow Rider V is in play even if VMAX is not in hand.
41. Climactic Gate selects two VMAX Pokémon and excludes Basic Pokémon choices.
42. Fairy Zone doubles Max Geist damage against an opposing Dragon Active and changes attack choice.
43. Fairy Zone is not applied when publicly suppressed by Path to the Peak.
44. Retreat pivots into Shadow Rider VMAX when active Fairy Zone makes Max Geist lethal.
45. Mysterious Treasure searches Lillie's Clefairy ex against an opposing Dragon Active.
46. Lillie's Clefairy ex is played to activate Fairy Zone against a Dragon Active.

This is not a Node test-runner result, GitHub Actions pass, Docker isolation result, native fixture, or match result. Agent36 has been asked to include the test file in the existing `agent36-bilateral-competence-v9.yml` `contract_only` lane; no workflow was added or edited by Agent6. Unknown card-combination, confirmation, and attack-choice sources now fail closed. Agent10 has accepted the separate rank2 Vileplume opponent-policy slice; Agent6 retains rank1.

## Limitations and open risks

- The prompt projection currently exposes visible Pokémon printing and zone, but not a stable board-slot index for ChoosePokemonPrompt choices. The prototype maps by exact printing within the visible zone. When two identical printings occupy that zone with different attached Energy/damage, the policy cannot distinguish them reliably; this is an interface limitation, not a reason to infer hidden identity.
- Several source branches remain unmodeled or deliberately unqualified, including the strategic comparison of Tulip versus Acerola when Latias is Benched, the best two-card Get Lost discard beyond the tested recovery-card heuristic, the untested Mimikyu/Sky Field/Copycat game line, and the continuation after Unfair Stamp. The Mimikyu search/attack-choice policy has prompt tests but no full-game validation.
- Search and target heuristics are deliberately conservative. They have not been independently reviewed for every rank 1 prompt type or every matchup state.
- Rank1 and rank2 now have separate opponent-policy prototypes, but ranks 3–32 are not covered by these modules. Ranks 23, 25 and 28 still lack full source lists; the 32-rank opponent-policy bundle is incomplete.
- The worker's persistent Node process, async fixture loop, launcher capability/seed gates, full field coverage and opponent-policy qualification remain outstanding.

## Next actions

1. Agent36: add the committed test file to the existing contract-only workflow and run it under Node once the async host integration is stable.
2. Agent11: adversarially review the rank 1 policy against the native source-response report, especially Active promotion, Tulip/Acerola contention, and prompt completion.
3. Agent49: re-review the latest exact-kind, zero-selection, target-identity, and source-specific prompt changes.
4. Agent10: continue the separate rank2 policy under the same role-only worker contract; do not claim matchup performance.
5. Agent36: wire both rank1/rank2 policy modules and tests through the Docker worker bundle and run the existing Node/Actions contract lane before any fixture.

## Conclusion

The repository now has a concrete rank 1 opponent-policy implementation and executable actor-view contract tests rather than a forced-pass stand-in. The 46/46 V8 result establishes only that the current rank1 prototype makes the tested typed decisions under the current protocol schema. Agent35 has accepted the prototype boundary for continued development, not competitive qualification. Agent10's separate rank2 prototype has 27/27 direct V8 contract exercises, also not Node/Actions or game evidence. Agent43's Fairy Zone owner-view gap was incorporated: the policy applies Psychic ×2 to Dragon only when Fairy Zone is present and not publicly suppressed. The policy checks both `abilities` and `abilityDetails`, explicit `abilitySuppressions`, and visible Path to the Peak/Silent Lab. The suppression array is optional in the worker schema; when omitted, the current policy assumes the ability is active unless one of those stadium locks is visible. This owner-view assumption still needs Agent43/Agent36 confirmation. It does not establish independent competitive competence, a full-game result, a deck nomination, or any fraction of the 99.5% target.