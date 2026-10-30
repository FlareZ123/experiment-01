# Post-payment hand ceiling: why visible search access is insufficient

**Agent 7, 30 October 2026. Exact arithmetic + printed effect, hypotheses only; zero completed games.**

## The missing constraint in the new Tinkaton v0 proposal

A seven-card opening plus two ordinary start-of-turn draws yields **nine** cards seen by the owner's second turn, in the strictly limited no-other-draw model defined [here](agent7-tinkaton-hand-preservation-analysis-20261030.md). To use Tinkaton ex SVP31's 30-times-hand Big Hammer through Rare Candy, four distinct physical cards must have left hand:

- an opening Basic Tinkatink into play;
- Rare Candy, which is played and discarded;
- Tinkaton ex from hand into play;
- one Double Colorless or Double Turbo Energy attached.

Therefore even *conditional on finding all four*, the maximum attacking hand is **9 - 4 = 5**. That means at most **150** raw Big Hammer damage with Double Colorless, **130** with Double Turbo. This ceiling applies only without any additional draw, search additions, bonuses or other effects, and before other damage modifiers. Any additional Bench deployment, Item search cost or Supporter discard can make it lower.

A 230-HP opposing Pokémon instead requires **8 hand cards with Double Colorless** and **9 with Double Turbo**. Thus it requires at least **3 or 4 net extra hand cards beyond the no-extra-draw upper bound**, respectively. A 280-HP target requires **10 hand cards**, at least **5** net new hand cards. A 330-HP target requires **11** with Double Colorless or **12** with Double Turbo, at least **6 or 7** additional. The direct opening event's exact 3.248788694% cannot by itself establish an early relevant KO.

For comparison, a hypothetical Basic Galarian Perrserker V LOR129 line needs attacker + Basic Metal + a Double Colorless to use Metal+Colorless Treasure Rush by T2. Under nine no-other-draw cards, this spends at least three, leaving hand at most six and yielding **120** raw damage at 20× hand. Even though its Basic deployment is easier, its 230-HP target requires hand **12**, at least **6 net extra** after initial expenditure. The faster setup channel can still improve overall win rate by allowing earlier attacks, so these are resource bounds, not strength rankings.

## Printed Lillie's Determination creates a discrete setup-then-reset sequence

**Lillie's Determination MEG119** is an Expanded-legal Supporter in the supplied English pool. Its printed text shuffles the whole hand into the deck and draws **eight** if the player has exactly six Prize cards remaining, otherwise six. Under source-faithful rules, playing it on the player's **second turn before taking any own Prizes** can produce an eight-card hand after the attacker is fully powered. Thus one strategic line is:

```text
T1: establish Tinkatink (and ideally Dunsparce) in play; prepare Double Energy.
T2: access and play Rare Candy + Tinkaton ex, attach one Double Energy
    (or use an earlier attachment).
T2: play Lillie's Determination as the sole Supporter, with six own Prizes.
    Hand is replaced with eight cards.
T2: Big Hammer for 240 with DCE, or 220 with Double Turbo.
T2 optional: use an already evolved Dudunsparce's Run Away Draw after Lillie.
    A three-card draw raises hand from eight to eleven, enabling
    330 with DCE or 310 with Double Turbo, before other modifiers.
```

This **conditional ALS is mechanically stronger than passively hoping to hold 8+ cards**. It is still sharply timing-constrained: Rare Candy and evolution must be found without spending the same turn's Supporter on Arven or Guzma & Hala; the necessary Pokémon must be in play early enough to evolve, and Dudunsparce must be independently ready. Hand shuffle sacrifices all unplayed tactical resources. Early Item lock, ability lock, Bench contention and opposing disruption are real failure modes. Other draw or Energy effects may change the exact hand after Lillie.

A further restrictive naked direct-card coincidence requiring opening Tinkatink and among first nine Tinkaton ex (3), Rare Candy (4), Double Energy (6), **and** one of two Lillie's Determination is:

```text
P = 74863739 / 12095298540 = 0.6189490797% unconditional per shuffled 60.
```

This is calculated by the same inclusion-exclusion as the v0 four-channel bound with another two-copy missing category; there are multiple additional legal search routes, and this is **not** an execution rate, lower bound on competitive attack or a basis for deck win claims. Its small direct probability emphasizes why policy-aware connector allocation and native source interaction matter.

## Concrete revision hypothesis

Replacing v0's **two Colress's Experiment** with two Lillie's Determination creates the post-setup guaranteed-eight line. Replacing its two Boss's Orders with two **Guzma SM3-115** offers additional own-Active mobility and gust as a single Supporter, with the caveat that a targetable opponent Bench is necessary. Replacing the single Miriam with one **Float Stone BREAKthrough137** makes an accessible Tool-based retreat option. All are printed Expanded-legal in the English snapshot. These are **three structural action-economy amendments** and need a frozen 60 and prospective test; they are not assumed to improve win rate.

**No common chooser or adversarial source-first full game is qualified yet.** Preserve original v0 and any revised variant separately, test printed live Store chains and resource-hold negatives, and compare unchanged versions only after the shared qualification gate. Field baseline remains **29/32 opposing 60s and 0 competitive-qualified games**.
