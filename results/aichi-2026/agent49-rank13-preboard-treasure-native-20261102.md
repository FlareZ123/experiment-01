# Agent 49: first-Regidrago Treasure donor continuation, rank-13 source printing

**2 November 2026.** This is a narrow native-store mechanism proof, **not** an original-source 60-card natural game, representative strategic decision, paper-qualified matchup or deck-strength result. The fixed objective remains one unchanged paper Expanded deck versus all 32 Aichi 2026 Top 32 originals; ranks 23/25/28 are still missing and the repository has zero competitively qualified games.

## Identified setup gap

Agent47's pre-board donor observation and Agent8's VSTAR-access finding motivated an explicit owner-registered pre-board line. Rank-13 authenticated original source holds **4 Mysterious Treasure FLI**, **4 Regidrago V SIT** and **1 Salamence ex JTG**, with the Salamence donor being a Dragon Pokémon payload (Wide Blast). A conservative earlier chooser requires Regidrago already in play and therefore cannot propose this first-Basic access route.

The tested pre-board module (`simulation/twinleaf/agent49-registered-treasure-early-setup.cjs`) takes only the current owner-visible root, public printed catalog and that owner's **registered exact sixty**. It never claims the missing V is definitely in the deck: K0 leaves the target split across the unknown deck and unknown Prize cards. The genuine native owner search prompt independently determines whether a V is available.

## Native staged evidence and provenance

New test: [`tests/agent49-native-registered-treasure-preboard.test.cjs`](../../tests/agent49-native-registered-treasure-preboard.test.cjs), included as one step in the **existing manual-only** [Aichi card audit workflow](../../.github/workflows/aichi-card-audit.yml), with no added CI trigger or separate per-card workflow.

- [Pinned compiled CI 41484488350](https://github.com/FlareZ123/experiment-01/actions/runs/41484488350), checkout `122d4620f8895e7b199985c16b01b4e30de36793`, upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: **2/2** actual native physical-seat tests passed. The complete job succeeded.
- Native state: a deliberately staged owner Active, empty Bench, held original-printing `Mysterious Treasure FLI` plus `Salamence ex JTG`, and a physically seeded `Regidrago V SIT` in the owner deck. The 60-card *registration* is drawn from rank13's original source file, but the **staged game zones and Active are not an original full 60**.
- The owner-root chooser selected the known Salamence donor while preserving `targetExactDeckMembershipKnown:false`. The actual native Store removed the Item from hand, presented an owner-hand `ChooseCardsPrompt`, discarded Salamence, then issued a separate owner-deck `ChooseCardsPrompt`. The owner-specific bridge selected the real V card.
- Native reveal, seeded non-null deck permutation and Wait prompts completed; both tests assert no pending prompt, donor and Item physically in discard, retrieved V physically in owner hand, and `nativeItemFinalized=1`, `completedPhysicalChains=1`, `failedOrRejectedReplies=0`. A subsequent detached owner-root choice identifies the newly held V as a Basic to Bench.

A stronger post-search native Bench action was added in [commit 4995c4e7](https://github.com/FlareZ123/experiment-01/commit/4995c4e7c86482649867f6455cee1071dbd7894f). **Fresh pinned compiled CI [41485137386](https://github.com/FlareZ123/experiment-01/actions/runs/41485137386) passed the entire job and both physical-seat tests (2/2)** at head `4995c4e7`: after native owner-deck retrieval, the same actor chooser proposed the held Regidrago V as `bench-basic`, the real Store accepted `PlayCardAction` to the selected free Bench slot, and assertions found the exact V physically occupying that slot and absent from hand. Preserve both CI runs as distinct historical receipts. The additional Bench action is a controlled staged line, still without full source natural-deal evidence.

## Qualifications and next experiment

This test demonstrates a possible **owner-paid access mechanism**. It does not estimate source opening frequency, prove a realized natural-deal line, independently check all paper effects of copied Wide Blast, perform VSTAR evolution, perform an attack, or show a competent opponent response. The original rank13 source has additional competing Quick Ball, Trainer, Supporter and Energy lines, so a feasible Item is not necessarily the dominant action.

For genuine decision evidence, register a prospective source-dealt seed cohort and freeze a single **bilateral** common-policy profile using the existing canonical runner. Record original 60s, both seats, actual source deal fingerprints, all attempts, prompt/zone finality, the Basic Bench transition, subsequent VSTAR evolution/attack and opponent continuation. Compare to the same-deal control and keep every error and cap. Do not use selected successes to claim a win-rate improvement.
