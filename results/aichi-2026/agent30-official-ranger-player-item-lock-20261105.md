# Official Ranger ruling: attacker-imposed Item lock is removable

**Agent 30 | 5 November 2026 | paper rule finding, no native qualification or win claims**

## Primary ruling and its generalization

The Japanese publisher's exact [FAQ ID 10619](https://www.pokemon-card.com/rules/faq/details.php?id=10619) asks whether a player, after the opponent used **Seismitoad-EX's Quaking Punch** on the prior turn, can use **Pokémon Ranger** and then play Item cards on that same turn. The official answer is **yes**. The [English Pokémon Ranger STS 104 card](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/xy11/104/) says it removes all effects of attacks on each player and their Pokémon. The attached Advanced Player's Rulebook Ver.3.4 §II.C-19 identifies attack-created restrictions on playing Items from hand as **effects on the player**. The official ruling therefore gives a concrete, authoritative Item-lock regression case.

**Budew's Itchy Pollen:** it likewise makes the *opposing player* unable to play Items from hand during the following turn. On the reported text and §II.C-19 classification, a Pokémon Ranger played on that locked turn removes the Itchy Pollen restriction, permitting later Item plays on that same turn. This Budew-specific conclusion is a **paper rule derivation from an official analogous FAQ**, not a separately located publisher FAQ about the exact Budew printing. A contemporary Expanded deck discussion [independently describes Ranger as an Itchy Pollen answer](https://note.com/famous_mango439/n/n096ec7d58d11), but is secondary strategy evidence.

### Critical distinction for ALS / source-policy decisions

- **Attack-imposed, player-scoped Item lock:** Seismitoad-EX Quaking Punch is explicitly confirmed removable by Ranger; Budew Itchy Pollen follows the same attack-on-player rule. An owner policy under that lock must retain the legal **Supporter Ranger → Item** line when Ranger is available and no separate Supporter prevention applies.
- **Ability-based, ongoing Item lock:** Vileplume AOR's Irritating Pollen / another ongoing passive Ability remains in force after Ranger; Ranger removes *attack effects*, not the effect of Vileplume's Ability. One should not treat Ranger as a global unlock.
- **Ongoing Supporter prohibition:** while an Active Stoutland's Sentinel Ability is genuinely preventing Supporter use, Ranger cannot simply be played from hand to break the lock. Ranger itself is a Supporter; applying its effect presupposes legal play. The Active-spot contention and other ability locks still require independent board checks.
- **GX-use quota:** removing a player's lingering effect from Altered Creation-GX does not refresh the already-used once-per-game GX permission. Official [Ranger FAQ results page](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E3%83%AC%E3%83%B3%E3%82%B8%E3%83%A3%E3%83%BC&page=3&regulation=all&regulation_faq_main_item1=all) also explicitly says GX attacks cannot be reused after Ranger.

## Aichi source exposure, exact unchanged 60s

A read-only scan of the authenticated `results/aichi-2026/full-decklists.json` finds exactly **one Pokémon Ranger STS104** in each of original ranks **4 (Shu Hosoda), 5 (Yamato Nakano), 7 (Hiroto Fuji), 18 (Hayato Omuro), and 32 (Kaito Higuchi)**. All other **24 authenticated** original sixties have no Ranger in the published name/count inventory. Original ranks **23, 25 and 28** remain missing, so their Ranger content is unknown. Presence is **not** access: the Ranger may be Prized, Lost Zoned, absent from hand, unobtainable under prevailing locks, strategically worse than a competing Supporter, or already spent. The earlier [Agent 30 Ranger source access report](agent30-original-ranger-erases-adp-gx-five-source-ranks-20261102.md) separately quantifies Ranger prefetch opportunities.

## Fixed-candidate relevance and explicit source challenge

The four historical fixed-60 comparisons include **one Ranger STS104 each** in [Hood Shield v1](candidate-hood-shadow-rider.json) and [Temple v1](candidate-temple-shadow-rider.json). The [rank-1 reference](full-decklists.json) and [New Moon English proxy](../als/new-moon-lockbreak-english-proxy-60.json) have no Ranger in their recorded sixties. Separately, **14 authenticated opponent ranks** include a **Budew ASC16**: **2, 8, 10, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27, and 32**. These facts make *original Budew attack -> candidate Ranger -> subsequent candidate Item* a direct, falsifiable original-field matchup line for the two Shadow Rider proposals. The source Budew print is **ASC16**, available as a registered `Budew ASC` class in the pinned Twinleaf Ascended Heroes set. The staged native test now uses this exact registered source printing. Native Store outcome was verified on 6 November in the regression documented below. Counts describe deck contents, with all physical access and downstream outcomes unresolved.

The independent new [two-seat staged native action test](../../tests/agent30-ranger-budew-item-native.test.cjs) is registered in an existing **manually dispatched** native fidelity workflow. It checks actual attacker Itchy Pollen, defender failed Item, genuine played Ranger, and the subsequent real Item search with a continuing Vileplume negative control. The test's original 5 November status was unverified; the corrected 6 November native result is documented below. No value here is a measured win.

### Important original-field lock composition

Exact source-name/set/number census shows **original ranks 2 and 15** each contain **Vileplume AOR3** alongside **Budew ASC16**. Rank 2 additionally contains **Stoutland BCR122**. Thus **12 of the 14** Budew rosters lack this *specific* Vileplume AOR inclusion, while **2 have a potential continuing Item-lock fallback** that Ranger cannot clear. This is a source inventory distinction; AOR must actually evolve and remain Ability-active to deny Items, and Stoutland must occupy Active to deny Supporters. No simultaneous-lock board, game frequency, or Ranger escape probability follows from deck contents alone. Original Budew+Ranger overlap occurs only at **ranks 18 and 32**.

### Bench-based Garbotoxin is the more realistic simultaneous access contest

The 29 original source print inventories contain **Budew ASC16 plus Garbodor with Garbotoxin** in ranks **8 (2×LTR68), 16 (2×LTR68 and 1×BKP57), and 22 (2×BKP57)**. Both printings carry the same Tool-conditional Garbotoxin Ability. Unlike Active Klefki, an evolved **Benched, Tool-equipped Garbodor can suppress Tapu Lele-GX Wonder Tag while a different Active Budew has imposed next-turn Item lock**. The conditional ~20% Ranger opportunity (Wonder Tag unavailable, Forest Seal Stone still potentially usable) is therefore a more pertinent **hypothetical board state** in these three source matchups. Existence of Garbodor in a roster proves neither evolution nor Tool attachment nor uninterrupted Ability operation. Do not count the combination as actually established without native board/turn evidence.

### Early candidate access bound already established elsewhere

The prior [exact joint-access report](ranger-stone-joint-access.md) found **30.26936%** for Hood Shield v1 and **30.31531%** for Temple v1 of having a *direct Ranger or a conditional Wonder Tag / Forest Seal Stone route* after the accepted seven-card hand and two ordinary draws. This is a restricted opportunity model; actual use requires the Tool/VSTAR and Bench resources, enabled Abilities, and the unused Supporter quota. The native regression in this report tests a **physically held Ranger**, so it does not yet attest those search sequences or opponent-optimal timing. Do not convert the 30% resource statistic into a lock-escape success rate or a matchup win probability.

### Native CI checkpoint (5 November)

The first executed [four-arm native CI](https://github.com/FlareZ123/experiment-01/actions/runs/41971790742) **failed at the initial Item denial assertion in all four arms**, before Ranger was executed. The actual thrown Twinleaf objects expose `.message` values `BLOCKED_BY_EFFECT` and `CANNOT_PLAY_THIS_CARD`, but do not inherit a regular `Error` string representation that satisfies Node's regex form of `assert.throws`. This confirmed that native blocked Item attempts do throw, but did **not** establish the Ranger-afterwards path. The test now predicates explicitly on the native object's `.message` (commit `ba9c6f8a`), and the ensuing 5 November manual CI found a separate stale-state test assertion, resolved and retested successfully on 6 November. Neither failed run counts as an Item-escape proof or competitive win.

## Proposed fail-closed integration checks

Given a genuine attack-effect Item lock on the player, a selected common owner policy should record the publicly present effect, actual playable Ranger in hand (or a legal owner search path), available Supporter quota, and a specific afterwards-legal Item. A true native two-seat replay can check **Store acceptance and physical zone settlement** of Ranger, followed by that Item under the same turn. Negative controls must retain Ability-based Item lock and Supporter lock, where Ranger must not be treated as an all-purpose escape. A native result still needs independent paper-text and complete opponent-continuation assessment.

**Scope:** Paper Expanded; source-derived mechanics and a documented cross-print inference. This does not rank any candidate deck, claim a naturally played Ranger action, certify a competent policy, or constitute a game win. Benchmark remains **29/32** authenticated original lists, **zero** qualified competitive games, no chosen immutable final 60, no demonstrated 99.5% result.


## Native CI resolved: 6 November 2026

**Result: 4/4 staged genuine-Store native tests passed, 0 failed**, with every subsequent existing Future Sight and printed-attack prompt job step also passing. [Successful manual GitHub Actions run 42208416526](https://github.com/FlareZ123/experiment-01/actions/runs/42208416526), exact executing main commit [714e21cc114dc16418ad82e2cccdb70f297ec1fb](https://github.com/FlareZ123/experiment-01/commit/714e21cc114dc16418ad82e2cccdb70f297ec1fb), pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, Node 22 compiled real Store, no upstream edits.

The earlier failed [5 November rerun 41973874369](https://github.com/FlareZ123/experiment-01/actions/runs/41973874369) occurred **after the deliberately rejected Item attempt**. The pinned `Store.reduce` restores its deeply cloned `this.state` backup when an action throws. The staged helper still held the original `x.opponent` object, detached after rejection. It read `supporterTurn=0` even after the valid native Ranger play incremented the **live** player's Supporter quota to 1. The corrected test reads the player from `x.store.state.players` after every dispatch, asserts the pre-rollback player reference is detached, and reruns all real physical actions. This is a **test-harness state-reference correction**, not a Twinleaf card implementation change.

| Original attacking Budew physical seat | Bench Vileplume AOR ongoing lock | Before Ranger | After genuine Ranger | Genuine Fog Crystal result |
| --- | --- | --- | --- | --- |
| 0 | absent | Item denied | Item allowed | Native search resolved; physical Psychic Energy SVE reached owner hand |
| 0 | present | Item denied | Attack-created lock erased, Ability lock remains | Item still denied, physical Fog Crystal retained |
| 1 | absent | Item denied | Item allowed | Native search resolved; physical Psychic Energy SVE reached owner hand |
| 1 | present | Item denied | Attack-created lock erased, Ability lock remains | Item still denied, physical Fog Crystal retained |

All four arms used printed Budew ASC16 Itchy Pollen, Pokémon Ranger STS104, and Fog Crystal CRE under actual native turn transition and real `PlayCardAction`. Both unlocked searches resolved `ChooseCardsPrompt` and later display/shuffle/wait prompts. Two negative controls explicitly confirmed persistent Vileplume AOR Ability Item restriction after Ranger. [Test source](../../tests/agent30-ranger-budew-item-native.test.cjs).

**Evidence boundary:** The published Japanese FAQ confirms the analogous Quaking Punch attack-lock removal; the Budew case is derived from the player's attack-effect rules and corroborated here in this **pinned native model**. A constructed board with held cards cannot measure the natural frequency of Ranger access, optimal Supporter/Item timing, board establishment, counterplay, source-field outcomes, or any win. The final objective remains **29/32 authenticated original field rosters, zero competitively qualified games, no selected fixed 60 and no 99.5% demonstration**. A whole-policy release should expose Ranger as a candidate decision only when the attack-scoped restriction, a payable Ranger, Supporter quota, and afterwards-usable Item are all actor-known and legal; preserve the continued Ability-lock negative control.


### Independent ongoing Supporter-lock negative control, 6 November

Two more staged native cases added a correctly evolved **Active Stoutland BCR122 (Sentinel)** on the opposing board, with a physical Pokémon Ranger STS104 in the actor's hand. The actual Store rejected Ranger as blocked, left it in hand, and preserved the owner's unused Supporter quota. Both physical attacker seats passed. [Complete manual compiled run 42209448456](https://github.com/FlareZ123/experiment-01/actions/runs/42209448456) executed commit [58953af0](https://github.com/FlareZ123/experiment-01/commit/58953af0f55f64a2cfafb3101fa81b17b168f404): **6/6 total Ranger lock tests passed, zero failed** (four Budew/Vileplume and two Stoutland), with all remaining workflow test steps successful. The Stoutland scenario is a *separate board*, so no simultaneous Active Budew and Active Stoutland are presumed. This establishes a native **cannot-play-the-Supporter** negative, which cannot be handled by simply trying Ranger as a universal lock escape. It certifies no source-specific opponent policy or competitive games.
