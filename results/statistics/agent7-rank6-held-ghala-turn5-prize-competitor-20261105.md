# Agent 7: source turn-five already-held G&H offers a stronger competing attack-resource route than speculative Mail

**5 November 2026. Exact conditional two-singleton Prize combinatorics, not observed native turn-five attack, not a competitive win.**

## Authentic starting observation and printed-card authority

The [previous native original rank6 same-deal Plumeria analysis](../aichi-2026/2026-11/agent7-rank6-plumeria-payment-mail-vs-enhancedhammer-native-20261105.md) established that on original trial `6:100:A:champion-reference`, source Iron Thorns ex seat1 paid one Enhanced Hammer and one Trainers' Mail to discard the candidate's only Active Psychic Energy. Candidate global turn4 passed; source global turn5 then held **Guzma & Hala CEC**, a retained Mail, a newly drawn Enhanced Hammer, Captivating Poké Puff, Echoing Horn, Team Rocket's Handiwork and Sidney, and its original bot passed. The native hand/board witness previously showed one Speed Lightning Energy attached to the source Active Iron Thorns ex and no source Bench. The source deck had 42 cards at turn5.

The original rank6 [printed 60](../aichi-2026/full-decklists.json) contains **one** Double Colorless Energy, **one** Thunder Mountain Prism Star, four Speed Lightning, two Capture and one Spiky Energy, as well as two Guzma & Hala. The supplied English card database confirms that G&H can search a Stadium and, after discarding two other hand cards, additionally obtain a Special Energy and Tool; Iron Thorns ex's Volt Cyclone costs Lightning plus two Colorless and does 140 damage; Thunder Mountain reduces the Lightning attack requirement of Lightning Pokémon by one. A separate [pinned conditional Store fixture](../../simulation/twinleaf/iron-thorns-guzma-hala-line.cjs) constructs G&H/DCE/Thunder, resolves authentic native prompts, and settles 140 damage even with no occupied Bench. That injected fixture is **not** proof the original historical source turn5 executed this line.

## Feasible resource branches, conditional on other payability gates

There is a direct potential line from the **already held** G&H, with at least two other cards physically available for its optional discard payment and an unspent turn-five Energy attachment:

- If the singleton DCE is still in the 42-card deck, G&H can retrieve it for attachment to the source Active Iron Thorns ex. The previously attached Speed Lightning supplies Lightning and DCE supplies two Colorless. No Thunder Mountain is required for the printed energy cost.
- If DCE is among Prizes but Thunder Mountain is in the deck, G&H can obtain the Stadium and **some other Special Energy**. Thunder Mountain reduces Volt Cyclone's printed Lightning requirement, leaving two Colorless, supplied by the already attached Speed Lightning and the new Special Energy. All **six** other, not previously attached Special Energy copies lie in the 48 unknown remaining cards. If DCE itself occupies one of the six Prize slots, at most five of those other six Energies can also be Prized. Thus at least one other must remain available in the deck.

The attack still requires a permitted Supporter and Stadium play where needed, an unspent Energy attachment, actual prompt resolution, the cards in the required zones, and an attack window. The prior Plumeria interruption removed the candidate's Psychic Energy and candidate turn4 passed, but **the source turn-five Supporter/Stadium/attachment quotas and lock flags were not independently certified for this prospective line**. Do not silently fill those gates with assumptions.

## Exact conditional Prize envelope

Under the *specific additional assumption* that the known six Prize cards are uniformly sampled from the **48 remaining unknown source cards** after accounting for 12 known non-Prize cards (turn-five hand seven, Active Iron Thorns, its Speed Lightning, and the three physical Plumeria/discard-payment cards), the **only Prize-pair failure of these two alternative core routes** is simultaneous Prizing of singleton DCE and singleton Thunder Mountain. This is a partial availability envelope, not an attack success rate.

`P(both key singletons Prized) = C(46,4) / C(48,6) = 5/376 = 1.3297872340425532%.`

`P(at least one key singleton remains in deck) = 371/376 = 98.67021276595744%.`

The calculation is conditional on exactly those 12 observed cards being outside the unknown 48; real physical Prize locations in the frozen seed were **not revealed** and must remain concealed from actor decisions until legally observed. If any unidentified card occupied a non-Prize non-deck zone or the source had an earlier deck search changing the information model, revise the sampling frame. This percentage neither describes a randomized competitive game sample nor proves an actual attack. If a card is unavailable for a separate card-text, lock, turn-quota or prompt reason, the number does not apply to that failure.

Source-aware exact code: [`agent7-rank6-ghala-turn5-prize-envelope.cjs`](../../simulation/evaluation/agent7-rank6-ghala-turn5-prize-envelope.cjs). Reproducible pure test: [`agent7-rank6-ghala-turn5-prize-envelope.test.cjs`](../../tests/agent7-rank6-ghala-turn5-prize-envelope.test.cjs). Formula independently checked with Python `math.comb` and `Fraction`. Native Test: **none added or run** for this T5 G&H line.

## Both alternative Plumeria payments can independently afford the two-card G&H cost

The existing native same-deal physical comparison preserved **two Enhanced Hammers** after the originally chosen double-Mail payment, versus **one Enhanced Hammer and one Mail** after the alternative Hammer+Mail payment. Both owner turn-five states had the same other five card names, one of which was the held G&H. Once G&H leaves the hand to be played, the two-cost payment opportunities are:

- Original payment: **Enhanced Hammer TWM + Enhanced Hammer TWM**.
- Mail-preserving payment: **Enhanced Hammer TWM + Trainers' Mail ROS**.

The original rank1 opponent printed 60 has **11 Basic Psychic Energy and zero Special Energy**; Enhanced Hammer therefore has no ordinary matchup-representable attached Special Energy target. Independent replay of the existing `agent45-owner-ghala-after-tagcall.cjs` **pure discard ranking algorithm** on the original rank6 printed 60 with the actual known remaining hand names selected the exact preceding pairs, each under its existing max-penalty-40 cutoff (Hammer=28, Mail=6). This validates a **per-arm local payment proposal** without asserting a live G&H PlayCardAction or prompt success. In particular, preserving Mail through the earlier Plumeria payment is **not needed to make G&H's optional two-card discard mechanically feasible** in this frozen position; the prior original payment arm already has two low-opportunity-cost Hammer copies.

Reproducible pure analysis: `simulation/evaluation/agent7-rank6-t5-ghala-discard-competition.cjs` and `tests/agent7-rank6-t5-ghala-discard-competition.test.cjs`, verified against the live checked-in original roster via isolated JavaScript source execution. It leaves open whether a more sophisticated action policy values the Mail as a separate Item search. No actual G&H native turn-five root has been recorded.

## Research implication: connector domination and source Pass evidence

The earlier retained-Mail calculation bounds the chance that the top four contain **some** eligible Trainer, which by itself does not produce an immediate attack. This exact owner hand already contains the main search Supporter needed for a potential attack. It would be methodologically weak to interpret an additional Mail play or fetched Trainer as a strategically improved source while ignoring the potentially dominating direct G&H use. The native next test should compare owner-held source G&H, observed Mail, and the original Pass using the same original-source turn-five physical opening, confirm exact payments and retrieved cards without reading unopened deck order as actor input, settle a real Volt Cyclone if afforded, and record the candidate reply.

The new scoped Mail A/B/A remains a valid **component exposure test**, subject to its own native execution and data, but does not rank this line above already-held G&H. Existing Agent18/Agent45 v9 real native G&H source work observes a distinct rank6 turn2 DCE attachment and still no funded attack; it does not validate the present turn5 position. Coordinate rather than duplicate their work.

All eight original trials, original v4 policy, capped/error dispositions and full 32-rank benchmark remain unaffected. **0 competitively qualified games, 29/32 exact source name/count inventories, no final fixed 60, 99.5% unproven.**
