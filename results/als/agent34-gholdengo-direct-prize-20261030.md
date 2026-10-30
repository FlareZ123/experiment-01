# A post-Aichi repeatable direct two-Prize attack: Gholdengo 30th Celebration

**30 October 2026 | Agent 34 | card-text mechanism and exhaustive supplied-card-pool index | zero qualified competitive games**

## Why this is a potentially new win condition

The benchmark opponent 60s are frozen at **10 May 2026 Aichi Open League**, while the research target permits present-day paper Expanded **Black & White onward**, including legal newer expansions. The [Pokémon Company release notice](https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc) confirms **30th Celebration** released **16 September 2026**. The [2026 official Expanded rules](https://www.pokemon.com/us/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement) require two weeks between new-set release and tournament legality. [Limitless English/Japanese Expanded legality](https://limitlesstcg.com/cards/30C/108/formats) lists Gholdengo as legal in both. This is a **post-event candidate card**, and any fair reproduction of the May field must disclose that temporal advantage.

The [official Pokémon card database, 30C 108/128](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/30th/108/) prints:

- **Gholdengo**, Metal Stage 1 evolving from Gimmighoul, 130 HP.
- **Celebration**, cost **one Metal Energy**: when the attacking player's hand contains **exactly 30 cards**, take **two Prize cards**, then shuffle the player's hand into their deck.
- This is a direct Prize-card effect, independent of dealing attack damage or Knocking Out an opponent's Pokémon. **Hypothesis:** one correctly set up use can earn Prizes against otherwise hard-to-KO damage shields or walls. Effects preventing attacks, the required Metal Energy, and Ability/Item locks on assembling the hand remain real restrictions.

The bonus is considerable but the condition and aftermath are severe. This is a **strategic lead, not a recommended completed decklist**.

## Exhaustive search of the supplied card pool

Reproducible read-only index: `simulation/evaluation/agent34-direct-prize-attack-frontier.cjs`. It reads all 176 supplied English set JSONs and their corresponding card printings, filters set dates before Black & White's start, and finds *non-KO-conditional attacks directly taking Prize cards*. It does **not** equate a set's database legality flag with current Japanese paper Expanded legality; precise official legality and errata are a separate gate.

Within the syntax-matched subset: **13 physical printings; five distinct card/attack effects**.

| Card and attack | Direct Prize effect | Qualifying constraint |
| --- | --- | --- |
| **Gholdengo 30C — Celebration** | 2 Prizes | Exactly 30 cards in hand, one Metal Energy, then shuffle entire hand to deck; repeatable printed attack |
| **Slowbro PGO — Twilight Inspiration** | 2 Prizes | Opponent has exactly one Prize remaining; two Colorless Energy |
| **Naganadel & Guzzlord-GX CEC — Chaotic Order-GX** | 2 Prizes | One Colorless attack cost plus extra Psychic and Darkness; one GX attack per game |
| **Umbreon ex PRE — Onyx** | 1 Prize | Lightning, Psychic and Darkness attack cost; discard all attached Energy |
| **Kartana-GX CIN — Blade-GX** | 1 Prize | One Metal Energy; one GX attack per game |

The inventory excludes alternative instant-win attacks such as Unown V's `Victory Symbol` and conditional *extra* Prizes from KOs. It is a **candidate discovery filter**, not a theorem about every possible wording of a Prize-moving Ability, future errata, or every printed card.

## Critical resource reset, not a repeatable free +2

The published effect resolves in written order. Under the standard rule that taken Prize cards enter the hand, with no other effects intervening:

1. Resolve `Celebration` with **30 hand cards** and six Prizes remaining.
2. Take **two Prize cards** into the hand, temporarily reaching **32**.
3. Shuffle the entire **32-card hand** into the deck. End the turn with **zero** hand cards and four Prizes remaining.
4. On the immediately following normal turn, draw one card. A **second consecutive Celebration** therefore requires **29 more net cards entering the hand** through draw/search/recovery effects after paying all plays and discards. Setup can be spread over several turns instead, exposing the engine to opposing attack, deck disruption, lock and gust.

When taking the final two Prize cards, game resolution may finish before the post-prize hand reset matters. Other on-Prize effects could alter intermediate sequencing, and the precise effect must be validated in a real rules engine.

The [existing supplied Advanced Player's Rulebook](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) §§I.A-01, I.E and II.A supports attack/turn ordering, victory and effect precedence. [Official general rulebook](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf) confirms Prize cards enter the player's hand.

## Next useful experimental gates

1. Determine whether pinned Twinleaf **actually implements 30C Gholdengo**. A successful name lookup is insufficient; a native `Celebration` must verify exact hand-30 gate, two genuine Prize transfers, hand shuffle, action closure and win trigger. If unsupported, maintain a traceable research-owned adapter hook and card/engine pin. Do not infer an engine result from an official printed effect.
2. Construct a **complete fixed legal 60-card variant** with a plausible no-KO two-Prize turn, real 30-hand generation, native Metal Energy attachment and evolution timing, Item/Ability lock survival, and opponent response. Quantify source-real turn of first reach, Prize collapse and win rate against *all* 32 exact opponents once recovered. A single demonstration of access or paper legality is not competitive evidence.
3. Compare this direct-Prize axis to existing one-off `Chaotic Order-GX` and to faster ordinary two-Prize KOs. Any switch that takes an entire turn to gather 30 cards has significant tempo cost. Preserve the same policy/seed/source identity and actually settled native outcomes.

**Status:** Gholdengo is an eligible **post-event research lead**, with a severe hand-cycle bottleneck. No evidence establishes that a 60-card implementation can win a source-real game. **29/32 original opposing 60s authenticated; 0 qualified competitive games; 99.5% field target not demonstrated.**
