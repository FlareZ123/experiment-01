# Agent18: rank6 original turn2 Tag Call into first-source Volt Cyclone, K0 access 77.09853%

**5 November 2026. Independent conditional math and printed-card line. Actual root execution UNTESTED.**

## Exact source state

Original rank6 `6:101:B:champion-reference`, source seat0, global turn2, native Pass root17 in steward v5. Independent Agent20 prechoice owner-only evidence artifact13438739276 establishes an **owner-held Tag Call CEC**, no prior owner voluntary root, **46 own deck cards, six Prizes**, six owner hand cards, own Active **Iron Thorns ex TWM with zero Energy**, an unenergized Benched Iron Thorns ex, empty own discard and Lost Zone, open Item/Supporter/Stadium/hand-Energy action quotas and no corresponding play locks. The opposing previous turn (global turn1) attached Basic Psychic and passed; the actual original source chose Pass at global turn2 root17. No source-initiated deck search had occurred.

[Original rank6 exact printed 60](../aichi-2026/full-decklists.json) has two **Guzma & Hala CEC**, one **Double Colorless Energy SUM**, one **Thunder Mountain ◇ LOT**; none is in the owner's observed hand, in play, discard or Lost Zone. Thus all **four relevant copies** are among 46 own deck cards and six unknown Prizes.

The supplied card pool `cards/en/sm12.json` verifies Tag Call CEC searches up to two TAG TEAM cards; Guzma & Hala CEC is a TAG TEAM Supporter that searches a Stadium, optionally discards two other hand cards to also search a Pokémon Tool and a Special Energy. `cards/en/sm8.json` shows Thunder Mountain ◇ reduces the Lightning requirement of Lightning Pokémon's attacks by one Lightning; `cards/en/sm1.json` confirms DCE provides two Colorless Energy. Owner Active Iron Thorns ex has printed Volt Cyclone cost **[Lightning, Colorless, Colorless]**, so a correctly in-play Thunder Mountain reduces this attack's cost to **[Colorless, Colorless]**, paid by one attached DCE. The one Benched Iron Thorns permits Volt Cyclone's printed mandatory Energy move after dealing 140 base damage.

## Exact K0 joint target availability

Condition on the authentic six owner hand cards and two Pokémon already exposed, with 46 remaining deck cards and six face-down Prizes. Under uniform hidden-zone exchangeability and **before any owner search**, let `G` be at least one of the two unseen Guzma & Hala in the deck, `D` the singleton DCE in deck and `T` the singleton Thunder Mountain in deck. The exact probability all required search targets are in deck is

```text
P(G and D and T)
 = [C(50,6) - C(48,4)] / C(52,6)
 = P(D and T in deck) * [1 - C(6,2)/C(50,2)]
 = 0.7709853172038046  (77.09853172038046%)
```

Both singletons avoid all six Prizes in `C(50,6)/C(52,6)=0.7805429864253394` of compatible physical arrangements; among those, two Guzma & Hala copies simultaneously occupy Prize slots in `C(6,2)/C(50,2)` of arrangements. The other 22.90147% can fail at least one of these specific access prerequisites. The already documented marginal Guzma & Hala target availability alone is `1311/1326 = 98.86877828054298%`.

This is a **conditional pre-search theoretical access probability**. It does not establish which four physical cards are actually Prized in this frozen native deal and must never supply Prize/deck identities to a K0 game policy.

## Explicit action hypothesis, with costs

`owner-held Tag Call -> retrieve Guzma & Hala -> play Guzma & Hala -> pay two different remaining cards -> search Thunder Mountain ◇ and DCE -> play Thunder Mountain -> attach DCE to own Active Iron Thorns ex -> declare Volt Cyclone -> move attached DCE to Benched Iron Thorns ex`.

At original root17, the owner has five other printed cards besides held Tag Call, and playing Tag Call followed by Guzma & Hala leaves at least five other cards, so **two-card discard is physically possible**, but the DCI and opportunity cost of the exact two chosen printings are unresolved. Playing Guzma & Hala consumes the only allowed Supporter that turn. Attaching DCE and using Thunder Mountain consumes the owner's ordinary once-per-turn Energy attachment and Stadium play. The printed Volt Cyclone is a 140-damage attack and requires moving an Energy to own Bench; one Benched Pokémon is present. Opponent attack prevention, native prompt resolution, origin-specific GameState flags, the actual printing of targets, and opponent continuation all require native validation. A game win, actual paid attack or any empirical attack-success frequency **has not been observed here**.

Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` already has `TagCall` card code using TAG_TEAM filtering and owner ChooseCardsPrompt and `GuzmaAndHala` using a two-card discard prompt and search filtering, but this analysis did not execute the real Store prompt chain. The first proposed native experiment should freeze the exact **already authenticated** `6:101:B:champion-reference` initial deal and Pass17 prefix, execute genuine owner-only Tag Call prompts with source K0 information, preserve a failed/Prized/aborted branch as such, and compare to Agent20's native-verified root17 Tool Jammer placement. For general opponent competence, use a prospective source-independent both-seat policy and at least one meaningful challenger reply. **Do not describe the conditional probability as a turn2 attack frequency or win rate.**

**Evidence classification:** printed-card rule inference + exact hypergeometric K0 derivation + native state/owner-root observation. **Competitive qualification:** zero games, 29/32 original sixties authenticated, 99.5% entirely unproven.
