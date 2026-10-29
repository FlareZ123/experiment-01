# First-turn Carmine active-move realism: four native-legal holds, four cost-blocked owner hands

**Agent 48 | 29 October 2026 | source-authentic first-turn actor observation; no competitively qualified games**

## Research question

The printed Carmine first-player exception is mechanically valid and was accepted by the genuine native Store in **all four actual first-owner-held card opportunities in 24 predeclared original-source deals** ([native positive control](agent48-carmine-firstturn-native-source-20261029.md)). Yet the [conservative optional actor chooser](../../simulation/twinleaf/agent48-conservative-first-carmine.cjs), which protects non-Carmine cards from its discard-all-hand cost, selected the Supporter **zero times across those same 24 paired sources**. Why does mechanically playable Carmine not become a practical setup route for this particular bot?

## Locked sources and observation method

- Original **rank 1 Shadow Rider Calyrex** versus original **rank 11 Absol/Garbodor**, with both authentic 60-card source lists unchanged.
- Exactly 24 fixed native-deal seeds `2026102901..2026102924`, a 48-root limit, 24 owner-only actor decisions, and compiled pinned Twinleaf Store. The actor has only the observable hand, own/public board, game turn and resource counters.
- An instrumented, reversible wrapper around the pure `chooseConservativeFirstCarmine` function captures every **genuine first-player, global-turn-one actor root** while that player physically holds `Carmine TWM`. No card text, deck state, prize identity or action result is altered. For each actual held deal, calculate the **minimum number of other physical cards in that owner's hand** across roots, after the existing actor has had opportunities to Bench Basics and attach basic Energy. Retain card printings of the minimum residual hand.
- The independent policy-option experiment used a matched default-versus-Carmine-flag comparison with the same 24 source deals. It reported zero new proposal roots, zero rejected actor roots and zero failed arms.

## Genuine observed results

<escape>[Green original native GitHub Actions run 40961172814](https://github.com/FlareZ123/experiment-01/actions/runs/40961172814) completed the AMR ledger and archived all original source attempts. Summary:</escape>

| Measurement | Count |
| --- | ---: |
| Fixed source games observed | 24 |
| First-owner actor decision sequences with physically held Carmine | **4** |
| Actual optional `play-carmine-first` choices | **0** |
| Held deals with minimum of **3** other hand cards | **1** |
| Held deals with minimum of **5** other hand cards | **3** |
| Native AMR-ledger execution errors | **0** |
| Competitively qualified games | **0** |

The exact original printed cards observed in the **four minimum residual hands** include:

| Physical printing in minimum residual hand | Number of held deals (of 4) |
| --- | ---: |
| Sky Field ROS | 3 |
| Quick Ball FST | 2 |
| Fog Crystal CRE | 2 |
| Acerola BUS | 2 |
| Guzma BUS | 2 |
| Lillie's Determination M1L | 2 |
| Mysterious Treasure FLI | 1 |
| Unfair Stamp TWM (ACE SPEC) | 1 |
| Psychic Energy MEE | 1 |
| VS Seeker PHF | 1 |

**Interpretation:** this limited set of original source-owner hands contains important Stadiums, Pokémon access, Supporters, an ACE SPEC, and other resources. Blindly reducing the Carmine discard-protection threshold would expose potentially irreplaceable game-plan pieces, even if it makes the Supporter technically selectable. Their full strategic discardability remains matchup- and action-sequence-dependent. The observed minimum other-hand counts are not independent draws or a universal threshold for the other 27 original source lists.

This is direct support for the prior human research's **discard-capable index (DCI)**, **undiscardable-due-to-play (UDP)** and **active move realism (AMR)** concerns. The source data does **not** establish a numeric DCI for any printing; it demonstrates a concrete need to model that cost alongside accessible card effects and alternative uses.

## Reproducibility and persistent evidence

- [Owner first-turn AMR ledger program](../../simulation/twinleaf/agent48-carmine-firstturn-amr-ledger.cjs), with exact seeds and all 24 original source owner snapshots.
- [Separate matched actual actor-choice census](../../simulation/twinleaf/agent48-carmine-owner-policy-census.cjs), also in green [run 40959969698](https://github.com/FlareZ123/experiment-01/actions/runs/40959969698), establishes **zero proposed** opt-in Carmine roots without a rejected-root or runtime confounder.
- AMR ledger raw artifact `agent48-carmine-original-source-amr-ledger` ID **12936351215**, 1430-byte ZIP, SHA-256 `bf0303048b7ae2ad222b3f66ee21f156e5b018d25876b7dd9a52c8767814054f`. Includes minimal physical card identities observed by owner, fixed source seed and all negative trials. This is observation of **own hand only**, never opponent hidden identities.
- Mechanical positive-control artifact was separately archived as `agent48-native-firstturn-carmine-source` ID 12934680987, SHA-256 `78171cc5e158ccecc273bdaaae73f5ad83d1d3d269730c66e61ca373af26213d`.

## Strategic implications and next qualification gate

A stronger policy needs an explicit **affordability-aware board and matchup model**, and must compare Carmine against competing opportunities to first play Quick Ball, Fog Crystal, Stadiums and other protected resources. A low hand with an ACE SPEC can be worth preserving despite apparent numerical hand deficit. Restricting Carmine to purely redundant retained hand cards avoids this error but may make the choice extremely rare until the wider Item/Supporter action vocabulary itself is implemented.

Do **not** interpret zero natural actor use as weakness of the physical Carmine card or four forced native successes as evidence of increased win rate. The result is a player-policy implementation limitation under two source opponents and 24 fixed starts. No candidate had its 60 cards modified; full field status remains **29/32 exact opposing sixties and zero competitively qualified games**.
