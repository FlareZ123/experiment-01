# Source-first rank11: printed Back Order window reopened at T2 before T6 Rope

**Agent 28 | 21 October 2026 | independent card-print and original-native-ledger audit | one selected historical physical source deal; no new native action execution, game or win-rate sample.**

## Narrow causal question

After New Moon's T2 Field Blower removed the source Garbodor's Float Stone, could rank-11 source Oranguru V use its **Back Order** Ability from the Active Spot to search for replacement Pokémon Tools before the candidate's T6 Escape Rope moved it to the Bench? This is a concrete source-policy alternative to repeatedly testing late T7 Marnie/Crobat draws.

## Card and source proof

The supplied `card-list.zip` contains `cards/en/swsh10.json`, `swsh10-133`, **Oranguru V ASR 133**, Colorless Basic 210 HP. Its Back Order Ability says: *Once during your turn, if this Pokémon is in the Active Spot, you may search your deck for up to 2 Pokémon Tool cards, reveal them, and put them into your hand. Then, shuffle your deck.* Its Psychic costs three Colorless. This is printed-card evidence, independently checked against the local source database. Source `Garbodor BKP57` (`xy9-57`) has **Garbotoxin**, which suppresses Abilities only while a Pokémon Tool is attached; that includes Oranguru's Back Order while the Tool lock is active.

Original compiled CI source: [Agent 42 original source-first Rope artifact 12378308188, run 39668297155](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155), ZIP SHA256 `9f2ac75ab15d6dc97af04540b09e14729d618b0fe16230b72336b7ddb2bf7b7f`. Rank-11 New Moon row, source deal `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, native treatment ledger SHA256 `b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`. Both verified against actual downloaded artifact bytes and recomputed JSON ledger SHA256.

The original `garbotoxinWindowAudit` supplies simultaneous public source board and genuine native printed Ability checks:

- Immediately **before T2 Field Blower**, the source **Active is Oranguru V**, source Benched Garbodor has `Float Stone` equipped, and candidate New Moon and Reconstitute printed Abilities are genuinely blocked.
- **After the T2 Item resolution**, same source Active Oranguru V remains, Garbodor's `toolCards` is empty, and the candidate's native printed Abilities are unblocked. This validates actual Tool deletion, while source Back Order itself has **not** been individually Store-tested at this root.
- Source **T3** actual root actions were `ResolvePromptAction` ordinal27, `PassTurnAction` ordinal28, `ResolvePromptAction` ordinal29. Source **T5** actions were `ResolvePromptAction` ordinal33, ordinary `Darkness Energy` attachment ordinal34, `PassTurnAction` ordinal35, `ResolvePromptAction` ordinal36. **No root `UseAbilityAction` for Back Order was dispatched** in these two historical source turns. No source switch/retreat occurred between the T2 Tool deletion and T6 Rope.
- At **T6 Rope**, Oranguru was moved to the Bench, disabling its printed Active-only Back Order prospectively. The independently authenticated T7 source-own audit shows it with only one Darkness Energy; the printed three-Cost Psychic was not ready. [One-Energy first-attack correction](agent28-rank11-rope-one-energy-source-correction-20261021.md).

The rank-11 published source 60 originally registers **3 Float Stone BKT, 2 Forest Seal Stone SIT, 1 Muscle Band XY**. It already used and discarded one Float Stone by T2. These are total-registered counts, not authenticated available T3/T5 search targets. Earlier K1 searches and hidden deck/Prize state have not been reconstructed for this proposed Ability route.

## Interpretation and falsification

The **printed timing window** is strong: T2's actual Item removes Garbotoxin's condition while Oranguru is Active, and T6 later makes its Active-only search unavailable. The current source-policy record passed on T3 and T5 without a Back Order root. This exposes a *potentially earlier missed recovery-resource acquisition*, distinct from whether a direct mobility out existed in the T7 hand.

**This is not yet a demonstrated legal or beneficial missed move.** Independent source-owner K1 observation is required to establish whether at least one applicable Tool was present in the deck, whether some other rule or engine implementation actually suppressed Back Order on T3/T5, and whether a real native Store `UseAbilityAction` plus its search/choice prompt would be accepted. Finding Float Stone in deck does not prove using Back Order dominates every alternative action or yields a win.

The most discriminating experiment is a source-owner-only, actual original Store T3 proposal for Back Order under the already-archived pre-T3 state, with exact supported action/prompt validation, owner deck visibility, selected Tools, T5 source follow-through, T6 candidate response and full continuation. Run this as an isolated adversarial source-policy branch against both unchanged candidate reference and New Moon, and preserve absent/Prized Tools, native rejects and unchanged negative cases. A robust common policy should consider Active-only Tool search and upstream self-Ability locks as part of action sequencing, rather than treating Back Order as guaranteed active.

No new competitive games are supplied. Source coverage remains 29/32, zero qualified games; no fixed-list 99.5% claim follows.
