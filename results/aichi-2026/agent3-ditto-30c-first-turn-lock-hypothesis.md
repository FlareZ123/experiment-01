# Post-Aichi Ditto: a potential one-attack Stage 2 lock transition

**Agent 3, 19 October 2026. Classification: card-text/rulebook inference and candidate-design hypothesis.** No paper match, compiled Twinleaf test, or competitive win is asserted.

## Discovery and eligibility horizon

The attached paper-Expanded card pool includes **Ditto, 30th Celebration 115** (set `me55-115`, released 16 September 2026). Its Basic Colorless **Surprisingly Transform** costs `[C][C]`: flip one coin; on heads, search your deck for **a Pokémon** and **switch it with this Pokémon**; attached cards, damage, conditions, turns in play and effects remain on the new Pokémon, and Ditto returns to the deck. [Official printed text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/30th/115/). The text does **not** restrict the deck target to Basic Pokémon. The provided advanced rulebook, C-13, explicitly recognizes Stage 1 or Stage 2 Pokémon entering play directly through an attack without evolving, in which case they cannot be devolved. The implication that this particular swap permits a Stage 2 is strong but needs an **explicit rules replay/official ruling**, as no compiled Ditto-specific test has been produced.

Pokémon's [2026 rotation announcement](https://www.pokemon.com/uk/news/2026-pokemon-tcg-standard-format-rotation-announcement) confirms paper Expanded remains Black & White onward and new expansions become legal two weeks after release. Ditto is in the September set and is marked Expanded legal in the supplied inventory. **This candidate is post-tournament:** it could not have appeared in the 10 May 2026 Aichi field. If candidate deck legality is intentionally frozen to the historical event date rather than current paper Expanded, exclude this avenue; the main prompt does not expressly resolve that date-policy choice.

## Turn-one-going-second candidate ALS

With Ditto already Active, an unused hand Energy attachment, two reasonably discardable cards, and `Tag Call` or `Guzma & Hala`:

1. `Tag Call -> Guzma & Hala` (if starting from Tag Call).
2. Use [Guzma & Hala CEC 193](https://limitlesstcg.com/cards/cec/193), discarding two cards, to find **Double Colorless Energy + Glimwood Tangle DAA 162 + Stealthy Hood UNB 186**. It searches a Stadium, Special Energy and Tool in one Supporter. The two-card payment is an AMR/DCI cost, not free.
3. Play [Glimwood Tangle](https://limitlesstcg.com/cards/daa/162), attach Stealthy Hood to Active Ditto and Double Colorless Energy as this turn's Energy attachment.
4. Announce Surprisingly Transform on the player's first turn **going second**. On tails use Glimwood Tangle's once-per-turn option to ignore the flip and repeat. If the eventual result is heads, select an appropriate in-deck lock Pokémon, including **Vileplume AOR 3** (Irritating Pollen, both players cannot play Items), **Stoutland BCR 122** (Sentinel, opponent cannot play Supporters while Active) or possibly **Garbodor BKP 57** (Garbotoxin, conditional Tool-based Ability lock). The exact latter Tool interaction must be tested. Glimwood enables at most one reroll, not unlimited rerolls.
5. The printed attached-card preservation suggests Stealthy Hood remains on the incoming Vileplume, potentially preserving Irritating Pollen through Wobbuffet or Garbotoxin pressure. Validate actual effect ownership and removal interactions.

**Mathematical conditional success of the one-coin attack with one independent reroll: `1 - (1/2)^2 = 3/4 = 75%`.** This is *conditional on all prerequisites already being legal and in place*, the target remaining in the deck, no applicable coin-flip suppression or lock, and the rule-text inference above. It is **not** the opening success rate, actual first-turn lock rate, game win rate, or evidence that 75% is good enough against this field.

## Other distinct routes, not interchangeable

- [Backtrack Badge PBL 74](https://asia.pokemon-card.com/sg/card-search/detail/25764/) is a Pokémon Tool that rerolls coins for attached Colorless Pokémon attacks; paired with Ditto it supplies the same **one** reroll without the Glimwood Stadium, but then uses Ditto's Tool slot rather than Stealthy Hood. The possible stacking of multiple reroll sources is unverified and should not be used as a claim.
- [Will CEC 208](https://limitlesstcg.com/cards/cec/208) can choose heads for the **first** next coin flip from an attack/Ability/Trainer effect during the turn, apparently removing this one-coin attack's variance. **Will and Guzma & Hala both consume the only Supporter use that turn**. A Will line must acquire Ditto's Double Colorless Energy by another route (already in hand, Computer Search, eligible Stone search, etc.). Do not combine both Supporters in one imaginary turn.
- Stoutland's Sentinel depends on occupying Active; Vileplume AOR's Irritating Pollen does not. Different targets remove different opponent responses. A second-turn attack plan after transforming also matters.

## Necessary validation, in order

1. Freeze card identity/print mapping, current paper-Expanded September legality, ban status and whether candidate decks are allowed to use cards released after the May Aichi event.
2. Construct the smallest legal rule-engine state with Ditto Active and `[C][C]`, true deck Stage 2 Vileplume and Stoutland, then test heads/tails, Stage 2 direct replacement, original Ditto deck return, attached Tool/Energy conservation, turn-age conservation, and active/bench-dependent Abilities. Check whether the Twinleaf pinned engine even implements `30C 115`; no support is presumed.
3. Add a separate Glimwood one-retry attack-coin prompt test and Will forced-heads test. Distinguish attack coin flips from Confusion coin flips (a known PTCGL bug fixed in September 2026).
4. Compare a *fixed* 60 with a normal early-lock deck versus a Ditto-based fixed 60, first/second actual starts, opponent source states, Prizes, DCI discard costs, bench, search-path opportunity costs, and opponent's response. Test rank6 Iron Thorns and rank11 Absol/Garbodor first. A candidate that dies before its first attack or loses under Supporter/Item lock is an important falsifying result.
5. Preserve reproducible full games and the 32-rank coverage obligations before any claim of candidate strength.

**Status:** untested strategic candidate; 29/32 exact opponent source 60s, **zero competitively qualified games**, 99.5% target unverified. This branch is intentionally independent of Agent41's frozen bilateral v2 source-vs-New-Moon comparison and must not be silently inserted into its registered arms.
