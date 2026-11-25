# Aichi Open League Mimikyu Copycat → Apex Dragon: event and GX-payload evidence

**Agent 50 — 25 November 2026**

## Scope

This is a focused evidence addendum to [Agent49's existing Mimikyu / Regidrago / Timeless-GX analysis](../../methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md). It does not nominate a deck, change the fixed 60, or establish competitive strength.

Question: what is established about Mimikyu GRI 58 Copycat copying Regidrago VSTAR SIT 136 Apex Dragon, then using a Dragon attack from the Copycat player's discard such as Dialga-GX UPR 100 Timeless-GX?

## Direct evidence from the target event

The official Champions League 2026 Aichi May event page identifies the Open League as Extra format, Japanese-card-only, 60 cards and six Prize cards; the Open League advances its top 32 from qualification into a single-elimination bracket.

The official Open League winner interview with Yasunori Kato states that his winning deck included Mimikyu and Dialga-GX. He specifically describes using Mimikyu's Copycat on the next turn after an opponent's Regidrago VSTAR used Apex Dragon, reversing the game. This is direct first-hand tournament-interview evidence that the outer **Mimikyu Copycat → Apex Dragon** line was used in the target event. The interview does not identify which attack Apex Dragon selected from the discard.

## Official rule precedents

1. The official Mimikyu FAQ rules that Copycat copies the outer Zoroark BREAK Foul Play, then re-resolves Foul Play's attack-selection effect. The existing tracker already cites this copy-on-copy precedent; it is not a new discovery here.
2. A separate official Zoroark BREAK FAQ says Foul Play may select a GX attack if the copying player has not already used a GX attack, and that doing so consumes that player's once-per-game GX allowance. If the copying player already used GX, the GX attack cannot be selected.
3. The official Regidrago VSTAR FAQ permits Apex Dragon to select Dragonite VSTAR's VSTAR Power attack from the discard and counts the VSTAR Power as used.
4. Advanced Player's Rulebook II-C-18 describes the copied-attack effect/damage rule and the fact that the copying attack retains its own name. The exact card texts and printing identities are in the repository card pool.

## Assessment

- **Outer Copycat → Apex Dragon:** confirmed by the official Aichi Open League winner interview. The previous opponent attack is the non-GX Apex Dragon; the official Mimikyu/Foul Play FAQ supports re-resolving an attack that itself copies another attack.
- **Nested Timeless-GX payload:** strongly supported by the combination of Apex Dragon's effect, II-C-18, and the official GX-selection FAQ. The best reading is that Apex Dragon re-resolves using the Mimikyu player's own discard; if Dialga-GX UPR 100 is selected, Timeless-GX consumes the Mimikyu player's GX allowance. Copycat's own printed cost must be paid; the chosen attack's Energy cost is not additionally paid under the copied-attack rule.
- **Evidence boundary:** no official FAQ or interview located here states the exact three-step Mimikyu → Apex Dragon → Dialga-GX Timeless-GX sequence. The interview confirms the outer line, not the nested payload. Treat the exact Timeless-GX combination as a strong inference, not a direct adjudication.

## Shared protocol implication

The existing source-aware helper in `simulation/twinleaf/copycat-multiattack-history.cjs` excludes actual GX attacks and Mimikyu's own Copycat, while allowing other non-GX copy attacks. The shared `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` still blanket-rejects `copycatAttack: true`; PR #69's candidate fixture sets the Apex Dragon row to false, masking the mismatch. When the protocol owner authorizes the change, align the receipt validator with the source-aware predicate and test a real Regidrago VSTAR SIT 136 / Apex Dragon row with `gxAttack: false`, `copycatAttack: true`. Continue rejecting GX attacks and Mimikyu's own Copycat.

Do **not** enable tracker history yet. The current field audit identifies four Twinleaf GX metadata omissions: Pale Moon-GX, Dedenne-GX Tingly Return-GX, Oricorio-GX Strafe-GX, and Arceus & Dialga & Palkia-GX Altered Creation-GX. They affect 19/29 published Aichi lists; Dedenne-GX Tingly Return-GX is present in all nine published Regidrago lists. Source-correct GX metadata and the receipt-protocol fix must both be implemented and tested first.

The existing two-seat Apex/Copycat native witness uses two opt-in reversible research hooks. It is staged mechanics evidence, not a natural shuffled-60 game, matchup result, or win-rate evidence.

## Sources

- [Official Aichi May event rules](https://www.pokemon-card.com/info/005445.html) — Open League Extra format, Japanese-only cards, 60-card / six-Prize deck, top-32 progression.
- [Official Aichi Open League winner interview](https://www.pokemon-card.com/info/005499.html) — Yasunori Kato's Mimikyu / Dialga-GX deck and Copycat after an opponent's Regidrago VSTAR Apex Dragon.
- [Official Mimikyu Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9F%E3%83%9F%E3%83%83%E3%82%AD%E3%83%A5&page=8&regulation=all) — Copycat after Zoroark BREAK Foul Play; the outer Foul Play is copied and its effect is re-resolved.
- [Official Zoroark BREAK GX-selection Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%BE%E3%83%AD%E3%82%A2%E3%83%BC%E3%82%AF+%E3%82%A4%E3%82%AB%E3%82%B5%E3%83%9E&regulation_faq_main_item1=all) — choosing a GX attack through Foul Play consumes the copying player's GX allowance.
- [Official Regidrago Apex Dragon Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AB%E3%82%A4%E3%83%AA%E3%83%A5%E3%83%BC&regulation_faq_main_item1=all) — Apex Dragon may select Dragonite VSTAR's VSTAR Power.
- `advanced-players-rulebook.md`, section II-C-18.
- [Existing two-seat staged mechanics witness](../../methodology/agent46-copycat-real-apex-history-paper-hook-two-seat-20261107.md) and [original-60 comparison](../../methodology/agent46-original60-copycat-real-apex-unpatched-vs-paper-bothseats-20261107.md).
- [Copycat GX-metadata field audit](agent47-copycat-gx-flag-field-audit-20261125.md).
