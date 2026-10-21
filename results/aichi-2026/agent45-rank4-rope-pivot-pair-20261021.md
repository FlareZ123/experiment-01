# Rank-4 source owner Escape Rope pivot: pre-registered native matched comparison

**Agent 45 | registered 21 October 2026, 01:23 UTC.** This is a **development-only**, retrospectively chosen eight-deal diagnostic. It is not competitively qualified and cannot estimate a win rate.

## Prior evidence and distinct test

The previous source-only Battle Compressor policy physically resolved in all eight same-deal treatment games, selecting Reversal Energy PAL, Counter Energy CIN, Unit Energy LPM UPR from the owner deck. [Completed comparison](agent45-rank4-owner-position-frontier-20261020.md) found 25 source-decision snapshots across three games where both Alolan Raichu and Electrode-GX were Benched, at least three relevant Energy cards were discarded, an Escape Rope was held, and the public Prize trade window was nominally open. No Extra Energy Bomb followed. All eight original deal trajectories are retained; no additional favorable seeds are selected.

The existing **untested-in-native-game** `simulation/twinleaf/rank4-raichu-rope-pivot-policy.cjs` proposes an owner-hand Escape Rope and tries to resolve the owner's own switch prompt to Benched Alolan Raichu. Its current predicate checks the owner's live board/hand/discard and public Prize counts; it never reads opponent private zones. The opponent's preceding Escape Rope choice remains an ordinary bot decision. This experiment tests whether the proposed root, opponent response and own choice actually resolve, and whether corrected Electrode prize trade follows. The game may instead expose a hook or policy incompatibility; retain that as a failure.

## Frozen comparison contract

Run the **same historical, unmodified** rank-4 paper-source 60 against four unchanged candidate 60s, both physical candidate seat assignments, with the preexisting `decorrelated-slots-v3` seed plan. Exactly eight attempt records per arm. Use one frozen git branch/checkout, pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, no vendor edits. Both arms must enable identical strict prompt validation, Forest Seal correction, Electrode-GX mandatory attachment, Electro Rain damage correction, Electrode Prize-trade policy, source-only opening Battle Compressor, paper minimum-one Compressor selection, opportunity observer, decision trace, fixed existing campaign options and deterministic policy isolation.

The **sole intended policy difference** is `rank4_raichu_rope_pivot_source`: false in control, true in treatment. The bounded manual workflow is `.github/workflows/aichi-first-game.yml`, dispatched once for each arm against a frozen ref. The test does not change the candidate list, source list, role mapping or original seed.

## Falsification and evidence to record

1. Confirm eight complete matching trial IDs; same printed 60 hashes, engine pin, seed, actual first-player mapping, paper-correction flags and only intended Rope toggle. Preserve all failures/aborts/terminal statuses.
2. Find **first chronological/root divergence** in each pair. Verify the source owned and legally played Rope only when the owner predicate was met, then inspect both players' actual pending Pokémon-choice prompts and resulting public Active/Bench transitions. Attribute engine exceptions or prompt vetoes to their exact root.
3. Check whether any source Alolan Raichu becomes Active while Electrode-GX remains Benched, relevant discarded Energy is available, and the opponent remains on a legal Prize trade path. Record real Extra Energy Bomb action dispatch/acceptance, attached Energy identities and source Electro Rain declarations with opponent turn continuation. Mere resource-window counts do not pass this test.
4. Compare opponent source attack declarations, turn caps, winners, and changes in source options with every case in the denominator. Distinguish an actual completed native effect from an owner-intended proposal and distinguish engine output from paper-validated play.
5. Even a resolved pivot or changed engine terminal leaves `competitiveGameQualified=false` and `strengthClaimPermitted=false` until the common two-player policy, rules and clock gates are met.

**Pre-result status:** no native Rope result or qualified performance claim yet. The exact frozen branch/run IDs and artifact hashes will be appended only after observed execution.
