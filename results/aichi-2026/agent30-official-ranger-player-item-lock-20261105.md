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

The four historical fixed-60 comparisons include **one Ranger STS104 each** in [Hood Shield v1](candidate-hood-shadow-rider.json) and [Temple v1](candidate-temple-shadow-rider.json). The [rank-1 reference](full-decklists.json) and [New Moon English proxy](../als/new-moon-lockbreak-english-proxy-60.json) have no Ranger in their recorded sixties. Separately, **14 authenticated opponent ranks** include a **Budew ASC16**: **2, 8, 10, 12, 13, 14, 15, 16, 18, 20, 21, 22, 27, and 32**. These facts make *original Budew attack -> candidate Ranger -> subsequent candidate Item* a direct, falsifiable original-field matchup line for the two Shadow Rider proposals. The source Budew print is **ASC16**, available as a registered `Budew ASC` class in the pinned Twinleaf Ascended Heroes set. The staged native test now uses this exact registered source printing. Native Store outcome remains pending. Counts describe deck contents, with all physical access and downstream outcomes unresolved.

The independent new [two-seat staged native action test](../../tests/agent30-ranger-budew-item-native.test.cjs) is registered in an existing **manually dispatched** native fidelity workflow. It checks actual attacker Itchy Pollen, defender failed Item, genuine played Ranger, and the subsequent real Item search with a continuing Vileplume negative control. The test is currently **unverified until CI reports a result**; no value here is a measured win.

### Important original-field lock composition

Exact source-name/set/number census shows **original ranks 2 and 15** each contain **Vileplume AOR3** alongside **Budew ASC16**. Rank 2 additionally contains **Stoutland BCR122**. Thus **12 of the 14** Budew rosters lack this *specific* Vileplume AOR inclusion, while **2 have a potential continuing Item-lock fallback** that Ranger cannot clear. This is a source inventory distinction; AOR must actually evolve and remain Ability-active to deny Items, and Stoutland must occupy Active to deny Supporters. No simultaneous-lock board, game frequency, or Ranger escape probability follows from deck contents alone. Original Budew+Ranger overlap occurs only at **ranks 18 and 32**.

### Early candidate access bound already established elsewhere

The prior [exact joint-access report](ranger-stone-joint-access.md) found **30.26936%** for Hood Shield v1 and **30.31531%** for Temple v1 of having a *direct Ranger or a conditional Wonder Tag / Forest Seal Stone route* after the accepted seven-card hand and two ordinary draws. This is a restricted opportunity model; actual use requires the Tool/VSTAR and Bench resources, enabled Abilities, and the unused Supporter quota. The native regression in this report tests a **physically held Ranger**, so it does not yet attest those search sequences or opponent-optimal timing. Do not convert the 30% resource statistic into a lock-escape success rate or a matchup win probability.

### Native CI checkpoint (5 November)

The first executed [four-arm native CI](https://github.com/FlareZ123/experiment-01/actions/runs/41971790742) **failed at the initial Item denial assertion in all four arms**, before Ranger was executed. The actual thrown Twinleaf objects expose `.message` values `BLOCKED_BY_EFFECT` and `CANNOT_PLAY_THIS_CARD`, but do not inherit a regular `Error` string representation that satisfies Node's regex form of `assert.throws`. This confirmed that native blocked Item attempts do throw, but did **not** establish the Ranger-afterwards path. The test now predicates explicitly on the native object's `.message` (commit `ba9c6f8a`), and a fresh manual CI is queued. Do not count this run as proof of an Item escape or of competitive wins.

## Proposed fail-closed integration checks

Given a genuine attack-effect Item lock on the player, a selected common owner policy should record the publicly present effect, actual playable Ranger in hand (or a legal owner search path), available Supporter quota, and a specific afterwards-legal Item. A true native two-seat replay can check **Store acceptance and physical zone settlement** of Ranger, followed by that Item under the same turn. Negative controls must retain Ability-based Item lock and Supporter lock, where Ranger must not be treated as an all-purpose escape. A native result still needs independent paper-text and complete opponent-continuation assessment.

**Scope:** Paper Expanded; source-derived mechanics and a documented cross-print inference. This does not rank any candidate deck, claim a naturally played Ranger action, certify a competent policy, or constitute a game win. Benchmark remains **29/32** authenticated original lists, **zero** qualified competitive games, no chosen immutable final 60, no demonstrated 99.5% result.
