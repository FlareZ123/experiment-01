# Agent 47: printed Dragon attack-library coverage across Aichi Regidrago

**18 October 2026.** Evidence class: exact source-deck inventory plus local English printed card texts, **not a simulated attack, legal-source play, matchup score or win rate**. Reviewed the nine published Regidrago full inventories in [the source manifest](full-decklists.json) against resources/sets/en.json and resources/cards/en/*.json. The missing complete Regidrago lists at ranks **23 and 28** cannot be represented, and Japanese paper print availability is not certified by the English database.

## What changes relative to name-level scheduling

The previous [Regidrago source-name panel](agent47-regidrago-source-diversity.md) maximizes overall distinct name exposure with rank 10 as an already-studied anchor: ranks **10, 27, 32** cover 53 of the 60 names across the nine published lists. That is a useful broad source-inventory metric. A different diagnostic objective is to cover printed *Dragon attack payloads* available to Regidrago VSTAR's **Apex Dragon**, whose printed SIT136 text copies an attack from a Dragon Pokémon in the discard pile.

From the actual eight non-Regidrago Dragon Pokémon printings present in the published lists, there are **14 printed attack identities**:

| Source Pokémon printing | Printed attacks | Published Regidrago ranks |
| --- | --- | --- |
| Dialga-GX UPR 100 | Overclock, Shred, Timeless-GX | all nine |
| Kyurem SFA 47 | Trifrost | all nine |
| Dragapult ex TWM 130 | Jet Headbutt, Phantom Dive | all nine |
| Hisuian Goodra VSTAR LOR 136 | Rolling Iron | 10,14,18,21,32 |
| Koraidon ex TEF 120 | Retribution Strike, Kaiser Tackle | 10,12,18,21,27 |
| Noivern ex PAL 153 | Covert Flight, Dominating Echo | 12,13,14,20,21,27,32 |
| Mega Dragonite ex ASC 152 | Ryuno Glide | 14,20,32 |
| Salamence ex JTG 114 | Wide Blast, Dragon Impact | **13 only** |

All nine rank values: **10,12,13,14,18,20,21,27,32**. The source printings were resolved by set code, number, name, printed typing and attack names, rejecting an absent or ambiguous printing.

## Exhaustive rank-10-anchored scheduling frontier

Exhaustively enumerated every subset of the nine source ranks containing 10 (**256** possible subsets), then optimized at each panel size first for distinct printed attack coverage, next for distinct full-deck name coverage, then by rank sequence.

| Panel | Dragon printings / 8 | Printed attacks / 14 | All-deck names / 60 |
| --- | ---: | ---: | ---: |
| Rank 10 | 5 | 9 | 36 |
| Rank 10 + 13 | 7 | 13 | 41 |
| **Rank 10 + 13 + 32** | **8** | **14** | **51** |
| Previous name-first 10 + 27 + 32 | 7 | 12 | 53 |

Only three triples containing rank 10 reach all eight payloads and all fourteen attacks: **[10,13,32]**, **[10,13,14]**, and **[10,13,20]**. The first also maximizes full-deck name coverage among attack-complete triples, at 51 of 60 names. The missing rare **Salamence ex** from rank 13 explains why the previous name-first [10,27,32] panel misses two printed attack identities, even while covering two more general card names.

## What to test next

Once rank-10 replay, policy and opponent-response qualification gates are sufficiently established, consider **rank 13 then rank 32** as high-yield additional Regidrago source adversaries, while preserving the nine-rank source diversity audit for remaining trainer/stadium/tech questions. Do not use panel selection to avoid other matchups: the fixed-deck objective still covers all 32 placements.

For an actual matchup qualification, record whether each listed Dragon can legally reach discard, whether the Regidrago policy chooses its copied attack in the right board state, whether the attack resolves with correct costs and effects, and whether the frozen candidate chooses a meaningful legal answer. Pay special attention to conditional tactical effects (e.g. Timeless-GX), protection, damage spreading, and opponent attack response. **Printed attack presence is an upper-level coverage target, not evidence the attack is realistic, reachable, or good.**

Reproduce with [the printed-payload enumerator](../../scripts/aichi-regidrago-attack-payload-panel.cjs) and [five source-integrity regressions](../../tests/aichi-regidrago-attack-payload-panel.test.cjs). Its manual-only statistical workflow was run at source head c6aeefbadf0bebc6257a6928ea6afd3112ff2239: [CI 39116362759](https://github.com/FlareZ123/experiment-01/actions/runs/39116362759) shows **test-benchmark success**, including all five new tests, while the overall workflow was **red** due to a separate rank-11 prospective exposure test failure in the other job. Therefore report **targeted validation passed; full workflow did not pass**. The failing rank-11 job is unrelated to this source attack census and needs independent investigation by its owner.

This inventory does not amend the global score: **29/32 exact published source lists, zero competitively qualified wins, and no certified 99.5% deck**.
