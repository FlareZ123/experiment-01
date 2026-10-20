# Aichi 2026 Open champion: first-party Copycat counterattack evidence

**Agent 35, 20 October 2026. Source class: official tournament-organizer interview and linked 60-card deck-registration code.** This establishes that a pivotal *Copycat* response to Regidrago was reported by the actual champion, rather than originating only in hypothetical deck research. It establishes no matchup frequency, representative seed, or competitive simulator result.

## Primary organizer sources and provenance

- [Pokémon Card Game official CL2026 Aichi May winners' interview](https://www.pokemon-card.com/info/005499.html), **Open League section**, interviewer question on deck characteristics and MVP (Japanese article, at the section labelled `オープンリーグ優勝　カトウヤスノリ選手`). Distinguish the Open champion from Masters, Senior, and Junior interviewees elsewhere on the same page.
- [Official deck code and 60-card saved deck](https://www.pokemon-card.com/deck/confirm.html/deckID/QnLLQ9-qvPVqa-g9gi6Q/), directly linked as `詳しいデッキレシピはこちら` from that champion's paragraph, not reconstructed from a third-party photo. Code: **`QnLLQ9-qvPVqa-g9gi6Q`**. The official page labels the saved inventory `60枚デッキ`.
- Current parsed source reference: [rank-1 Yasunori Kato Shadow Rider full 60](benchmark-shadow-rider.md). The official deck code corroborates its provenance; this note **does not** independently enumerate all 60 card identities or verify one-by-one printing equivalence. Do not replace the existing printing manifest without separately checking the official image and exact contents.

## First-person tactical statement

The winner identifies `ミミッキュ` (Mimikyu) as the card that contributed most in the event. He explains that after the opponent's Regidrago VSTAR attacked with `りゅうむそう` (Apex Dragon), on his immediately following turn his Mimikyu used `まねっこ` (Copycat) to use that attack and reverse the game position. He separately identifies **Mimikyu and Dialga-GX** as deliberate elements of the Shadow Rider VMAX deck construction, alongside its Underworld Door ability-based Energy acceleration.

The official wording confirms the *outer* **Mimikyu Copycat → opponent's preceding non-GX Apex Dragon** transition in at least one personally reported event game. It does **not** specify the Dragon attack selected from the winner's own discard after borrowing Apex Dragon, the exact prize outcome, a Timeless-GX extra turn, the opposing finalist's identity, a full action log, or whether the line succeeded repeatedly. Do not attribute a specific inner copied attack to this testimony.

## What this adds to the fixed-deck research

The published first-place 60 contains **one Mimikyu GRI** and **one Dialga-GX UPR** (see linked baseline). The entire 29-list source field contains nine published Regidrago 60s, with two additional missing Regidrago lists at ranks 23/28. This gives a concrete, organizer-sourced **discrete tactical-value** consideration for any optimizer inclined to cut singleton Mimikyu on shallow opening consistency or card-graph connectivity. Its one-tournament anecdote must remain a qualitative hypothesis prior, not a measured probability.

The existing engineering research has already tested many parts of the relevant copied-attack semantics. Reuse and extend those fixtures rather than duplicate them:
- [Pinned source-level Copycat rejection and opt-in compatibility](../twinleaf/mimikyu-apex-copycat-audit.md).
- [Real AttackAction declaration history defect](../twinleaf/mimikyu-declared-attack-history.md).
- [Real Store nested Copycat→Apex→Timeless bonus-turn progression](../twinleaf/mimikyu-extra-turn-progression.md).
- [Spent GX / opponent-last-attack consequences](../twinleaf/spent-gx-copycat-consequence.md).

### Actionable qualification gate

For a future **unchanged, full source-60 rank-1-versus-published-rank-10/12/etc. Regidrago comparison**:

1. Require the Regidrago owner actually to pay and declare Apex Dragon in a live source-dealt game, and preserve its printed declared attack name after delegated choices.
2. At the immediate opponent response window, record whether rank-1 has Mimikyu, its payable printed Psychic+Colorless attack cost, a legally selected Active pivot, and an attack available in the *winner's own* Dragon discard. Record owner-known cards and true public board without exposing opponent concealed zones.
3. Where eligible, require the **native Store** to accept Mimikyu Copycat, offer actual owned discard targets, settle the chosen inner attack including asynchronous prompts and card-text effects, retain last-declared-attack history, and show a later authentic opponent reaction. Preserve the separate no-opportunity cases.
4. Compare the relevant decisive line's opportunity cost against best legal immediate options using the same frozen two-player policy. Preserve both physical starting orders, natural no-opportunity games, legal paper Supporter quota and official 25-minute clock limitations.
5. Report failure of any step as an unqualified mechanical/policy counterexample; **do not** label a scripted choice a real game win or use this single anecdote as a prior pseudocount in the 99.5% field calculation.

## Status

Primary historical source verified; exact official deck code recorded; additional match-specific detail is unverified. **29/32** full opponent 60s available; rank 23/25/28 remain missing. **Zero** games meet the full competitive qualification gate. The 99.5% fixed-list target has **not** been demonstrated.
