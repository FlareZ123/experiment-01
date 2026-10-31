# Temporal discard liquidity: Secret Box can fund **later** search costs with its own outputs

**Agent 44 | 31 October 2026 | Structural game-state hypothesis with a pinned native mechanics witness.** The distinction between paying costs before and after a search is a general dynamic feasibility constraint for paper Expanded. It extends the [rank-8 source original Secret Box / Boost Shake models](agent44-rank8-secretbox-firstturn-connectivity-20261030.md) while retaining their original published probabilities. No comparative win-rate conclusion is made.

## The concrete overlooked line

A single Secret Box simultaneously searches four independent types, **Item + Pokémon Tool + Supporter + Stadium**, after requiring a **three-card discard from the existing hand**. In original rank-8 Absol/Garbodor, its Item selection can be **Boost Shake**, and its Tool selection can be **Float Stone**. A held **Quick Ball or Ultra Ball** can then obtain Trubbish if Trubbish is still unprized and in the deck.

The order of card production and payment matters. The player can select a Supporter or Stadium as an *additional* Box result and subsequently discard that newly acquired card to pay the held Quick Ball's one-card cost or Ultra Ball's two-card cost. This may preserve the fetched Shake, Tool and the rest of the tactical line. Those same Supporter and Stadium outputs **cannot** pay Secret Box's *own* preceding three-card discard. Therefore two separate liquidity gates are required:

- **Upfront liquidity**, before Box resolves: three discardable physical cards already present besides Box and any strategically protected resources.
- **Post-search liquidity**, after Box resolves: the remaining hand plus any selected and legally obtained Box outputs must finance the Basic-search Item without consuming the Shake/Tool/other pieces needed for the plan.

The [native pinned Store witness](../aichi-2026/agent44-rank8-native-box-fetch-shake-synthetic-20261030.md) already confirms genuine category-capped Secret Box search of Boost Shake + Float Stone + Temple of Sinnoh in one response, under a **declared synthetically modified, retrospectively selected source state**. It demonstrates production timing and prompt acceptance. It does not show a natural opening or that discarding the fetched Stadium is strategically optimal.

## State-transition formalization

Let `H0` be the owner's available hand before the Item, `C0` the three chosen Box discard cards from `H0\{Box}`, and `F` the set of actually found Box cards after the search. A legal Box transition has:

`H1 = (H0 \ {Secret Box} \ C0) ∪ F`, with `|C0| = 3` paid **before** `F` exists.

For a subsequent held Quick Ball `Q`, the owner must then choose one discard `q ∈ H1 \ {Q}`. If preserving Shake and Float Stone is necessary, `q` must also avoid those cards. For a subsequent held Ultra Ball, two distinct discardable cards are required *at that later time*. A Stadium or Supporter in `F` can satisfy one of those later physical obligations. Its value may be high, and choosing it as a discard still has opportunity cost; the existence of a viable physical payment does not imply a good game decision.

This dependency is **directional and noncommutative**: an Item search that creates an auxiliary card before the next discard step may make the second Item possible, whereas choosing the second Item first or paying the first Item with imagined future outputs may be illegal. A static associativity graph with fixed pre-turn cost fails to capture that difference. The more accurate abstraction is a **time-indexed, hand-resource transition graph** with explicit results and costs at each step, plus a discrete strategic objective to evaluate what the searched categories would have done otherwise.

For a Box search that fetched both one Supporter and one Stadium, at most two newly generated auxiliary *physical cards* are available for later discard. They can cover a one-card Quick Ball deficit or up to a two-card Ultra Ball deficit, if both targets are actually present in the owner deck, the prompt accepts their combination, and they are strategically disposable. These are conditional upper capacities, **not observed game frequencies**.

## Implementation and evidence boundary

The [read-only owner K0 classifier](../../simulation/twinleaf/agent44-rank8-box-k0-window.cjs) now **keeps its prior strict event unchanged** and adds three independently inspectable fields:

- `postBoxSearcherDiscardShortfall`: how many later search discards are missing after reserving upfront Box payment and line-critical held cards.
- `boxFetchShakePotentialAuxiliaryPayment`: the K0 line has enough *upfront* cards for Box, but needs at most two **unverified post-Box** extra cards to pay QB/Ultra.
- `anyK0OrConditionalAuxiliaryWindow`: union of the original strict hand-only opportunity and the conditional post-Box subsidy, explicitly marked as requiring a real K1 owner-deck inspection and correct later payment.

[Unit tests](../../tests/agent44-rank8-box-k0-window.test.cjs) assert that one or two added auxiliary cards can bridge a later Quick/Ultra Ball deficit; they also confirm that these hypothetical outputs cannot rescue an inability to pay the original three-card Box cost.

At K0 the player **cannot** know whether one or both searched auxiliary categories remain unprized and in the deck without prior legal search. At K1, after the Box is genuinely played and prompts access the owner's deck, an owner-only selector can verify which actual Supporter/Stadium cards are present. The [existing owner K1 Box selector](../../simulation/twinleaf/agent44-secretbox-owner-prompt.cjs) currently proves a safer **Shake + Tool** selection with native `prompt.validate`. It does **not yet** automate a Stadium/Supporter subsidy or the eventual Quick/Ultra payment; an optimizer must plan and test that extension rather than counting every K0 conditional opportunity as a confirmed lock.

## Suggested falsifiable next test

On a preregistered, naturally original rank-8 K0 deal with Box and a held Ultra Ball or Quick Ball, find a state where the original strict physical-hand condition fails **only** on later Basic-search discard liquidity. Compare two default-off owner-visible decision policies using the *same unmodified source and candidate physical deal*: (A) Box fetches Shake+Tool and (B) Box fetches Shake+Tool+unprized auxiliary Supporter/Stadium. Use the real Store to settle Box's three discards and the subsequent search Item; record which held cards were discarded, whether the Evolution was actually put into play, whether either policy consumes a superior search connector, and what happens after the opponent acts. Preserve aborts, no-triggers and both seats. A synthetic accepted search by itself cannot score a win.

The benchmark remains **29/32** authentic opponent 60s and **zero competitively qualified games**. This result is about time-ordered access and payment, not final fixed-deck superiority.
