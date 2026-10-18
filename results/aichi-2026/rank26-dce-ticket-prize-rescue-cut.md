# Rank-26 Meloetta: Double Colorless Prize cut and the Redeemable Ticket exception

**Agent 27, 18 October 2026.** Evidence classes: printed card-text inspection, exact finite-population combinatorics, independent miniature physical-deal enumeration, and published-list identity checks. This is an initial-card-zone bound, **not** a natural-game attack frequency, a policy win, or a competitive win rate.

## Related earlier research

Agent 34's [rank26 Ticket source audit](meloetta-redeemable-ticket-prize-gate.md) previously established the DCE-Prized 10.077777% figure and direct Ticket-in-first-eight opportunity. Agent 50's [K0 blind redeal posterior](../twinleaf/agent50-redeal-note.md) previously demonstrated unchanged marginal Prize risk using an eight-card observed-hand model. Agent 18's [verified corrected paper-order hook](../twinleaf/redeemable-ticket-paper-order-hook.md) and Agent 40's [hidden-Prize knowledge epochs](../twinleaf/agent40-root-prize-knowledge-epoch.md) are existing dependencies. The present work additionally evaluates the joint DCE/Ticket initially-Prized cut, the probability conditioned on Ticket held in a valid opening seven, and side-by-side real Store execution with all rank26 source cards conserved.

## Why an apparently Prized-only Energy bottleneck is recoverable in some states

The exact published [rank-26 Meloetta 60](full-decklists.json) contains **12 Basic Pokémon, one Double Colorless Energy (SUM 136), two Basic Lightning Energy, one Tapu Koko Prism Star (TEU 51), two Technical Machine: Crisis Punch (PAF 90), and one Redeemable Ticket (JTG 156)**. [Agent 4's real-source turn-one probe](rank26-dce-reservation-source-response.md) establishes a narrower tactical restriction: the single ordinary attachment to Meloetta must provide two Energy via Double Colorless, because the printed Tapu Koko line contributes at most one additional Lightning to that target. A manual single Lightning leaves only two total Energy units for the three-Colorless attack on that turn. This is a necessary source-composition premise, not proof that the whole Crisis Punch setup is realistically available.

The actual **Redeemable Ticket** Item text changes how this Prize constraint must be modeled: it puts *all existing face-down Prize cards on the bottom of the deck*, then replaces the same number of Prizes from the top of the deck. See the bundled full card pool entry JTG 156 and [published printing](https://limitlesstcg.com/cards/JTG/156). Accordingly, an originally Prized Double Colorless can be moved out of Prizes **if Ticket is unprized, obtained, and legally played under the printed card order**. The pinned Twinleaf Item currently needs the existing reversible paper-order hook for faithful simulation. A subsequent shuffle/search/draw line is still needed to access the returned Energy. An ordinary Item restriction may disable this route; an unprized Ticket can also remain unreachable in practice.

This is a reason to **avoid treating every initially Prized DCE as an unconditional first-turn Crisis Punch veto**. Conversely, if **both the only DCE and the only Ticket start in Prizes**, neither the source's two Hisuian Heavy Balls (which retrieve Basic Pokémon) nor its Dowsing Machine (which retrieves Trainers from discard) provides a direct route to that DCE before the first attack. The 60 has no other printed three-Colorless Energy source or same-turn second attack furnishing the missing Energy. This is a *necessary* initial structural obstruction to this one attack line, subject to the stated exact source list and game rules.

## Exact probability with a legal Basic opening

Uniformly deal a starting seven from the 60, accept only hands containing at least one of the **12 Basics**, and place six face-down Prizes afterward. No player has drawn extra mulligan-bonus cards or taken Prizes. For a named group of `k` non-Basic singleton physical cards, the exact conditional all-Prized probability is

`[C(6,k)/C(60,k)] × [1 − C(60−k−12,7)/C(60−k,7)] / [1 − C(48,7)/C(60,7)]`.

| Static opening/Prize event | Exact fraction | Given legal opening |
| --- | --- | ---: |
| DCE initially Prized | 8432059 / 83669828 | **10.077777380%** |
| DCE and Redeemable Ticket **both** initially Prized | 2340430 / 271926941 | **0.860683385%** |
| DCE initially Prized, Ticket initially **not** Prized | 100255047 / 1087707764 | **9.217093995%** |
| Neither-card Prize obstruction absent (complement of both-Prized) | 269586511 / 271926941 | **99.139316615%** |

The last row is only an upper bound on the share of legal openings *passing this particular physical feasibility screen*. It does **not** assert 99.139% attack success. In particular, most legally opened games can still fail to draw or search the DCE, sequence Ticket early enough, reach Risky Ruins and five self-KOs, preserve Meloetta's Tool slot, attach Crisis Punch, satisfy its opponent-one-Prize condition, or survive the opponent.

The single-card DCE-Prized event is over ten percent of valid openings. Roughly **9.22 percentage points** of legal openings lie in the potentially recoverable DCE-Prized/Ticket-not-Prized category. Treating all such openings as impossible would exaggerate the strict physical cut by approximately that amount.

## K0 decision risk: Ticket also creates new Prized DCE outcomes

An owner holding Ticket with **no prior Prize mapping** has a materially different decision problem from an owner who searched the deck and knows DCE was Prized. Ticket does not choose favorable new Prize cards. It replaces the old six with the next six from an unknown shuffled deck. If DCE was already in that deck, the exchange can put DCE **into** the new Prizes.

For a strict *initial-state* model, additionally require **Ticket to be in the seven-card opening** and the same opening to contain a Basic. The DCE may be in that hand, the first six Prizes or the 47-card deck. Before any other draws, searches or deck modifications, exact physical symmetry yields:

| DCE event given Ticket held and a Basic-valid initial hand | Exact fraction | Probability |
| --- | --- | ---: |
| DCE already in starting hand | 13902 / 148571 | **9.357142376%** |
| DCE in initial Prizes | 808014 / 7874263 | **10.261455580%** |
| DCE in replacement Prizes **after Ticket** | 808014 / 7874263 | **10.261455580%** |
| DCE initially in deck, then selected among six replacement Prizes (conditional on initially in deck) | 6 / 47 | **12.765957447%** |
| DCE initially Prized, then still in Prizes after Ticket (conditional on initially Prized) | 0 | **0%** |

Why the initial and final marginal probabilities match: conditional on Ticket being in the hand, cards outside that hand occupy 53 exchangeable locations. Ticket exchanges the six Prize locations with six previously unobserved deck locations. For any nonheld singleton such as DCE, the number of Prize slots is still six out of those 53; hand conditioning does not privilege the old or replacement locations. This invariance is specific to **K0**, uniform hidden order and a Ticket played before other cards rearrange the deck. It says nothing about probabilities for specific combinations of other cards or the in-game consequences of moving six actual cards.

After the first full-deck search (**K1**), DCE's zone may become known. When it is known to be Prized, Ticket has a deterministic *physical* benefit: the old DCE moves to the bottom of the deck and out of Prizes. When DCE is known to be in the deck, a pre-shuffle 47-card deck faces a 6/47 chance of newly Prizing it on Ticket use. This makes a blind early Ticket play an unsuitable automatic repair rule; the appropriate policy must consider owner-known Prize mapping, current access and the other cards at risk. The two probability tables have distinct conditioning (Ticket held versus only legal opening).

The extended [source-aware calculator](../../scripts/rank26_prize_ticket_gate.py) now exposes `ticket_held_exchange_probabilities()`, with a second [exhaustive physical-deal test](../../tests/test_rank26_prize_ticket_gate.py) enumerating every accepted 10-card miniature opening, Prize subset and remaining ordered deck. It verifies pre/post Prize invariance and the conditional 3/4 new-Prize risk in that toy experiment.

## Reproducibility and source guard

- [Exact source-aware calculator](../../scripts/rank26_prize_ticket_gate.py) reads the rank-26 entry in the published full-decklist manifest, fails closed if its relevant identity, 60-card count or 12-Basic count changes, and produces exact rational probabilities.
- [Independent small-deck physical enumeration](../../tests/test_rank26_prize_ticket_gate.py) exhausts opening-hand/Prize combinations for a nine-card example and checks both the one-card and two-card events against a distinct direct combinatorial enumeration. It also checks the two 60-card exact fractions and source inventory.
- **Important fidelity correction:** [Manual compiled run 39172725909](https://github.com/FlareZ123/experiment-01/actions/runs/39172725909), head `d6b82042b677549443e5c9bf82568deb203008d2`, passed the exact Python source-manifest tests and an original two-seat `PlayCardAction` fixture that checked physical card conservation. However, that first fixture **incorrectly interpreted array index 0 as deck bottom**. In pinned Twinleaf, ordinary `CardList.moveTo` and `DRAW_CARDS` consume **index 0 as deck top**, so the unpatched Redeemable Ticket reducer moves old Prizes to the **top** and deals replacement Prizes from the **bottom**. Its [original artifact 12152884023](https://github.com/FlareZ123/experiment-01/actions/runs/39172725909/artifacts/12152884023) therefore demonstrates a real **engine-rule error**, rather than correct paper-order execution. It still proves that the physical DCE leaves the Prize zone and all 60 registered card identities are conserved.
- [Agent 18's pre-existing printed-rule correction](../twinleaf/redeemable-ticket-paper-order-hook.md) implements a reversible research-owned Ticket effect that takes replacement cards from the true deck top and returns shuffled old Prizes to the true bottom. Its independent mechanic tests [passed pinned compiled CI 38872173090](https://github.com/FlareZ123/experiment-01/actions/runs/38872173090) and opt-in lifecycle tests [passed 38872602784](https://github.com/FlareZ123/experiment-01/actions/runs/38872602784). The [rank-26 source-card-conserving fixture](../../simulation/twinleaf/rank26-redeemable-ticket-source-fixture.cjs) has since been revised to compare both actual `PlayCardAction` variants and six subsequent ordinary draws in each physical seat. **The revised four-arm source regression is pending independent compiled validation** until its later manual run is checked.
- Physical opening probabilities and K0/K1 Ticket strategy in this report apply to the **printed paper-order effect**, with `redeemableTicketPaperOrderCorrection:true` explicitly enabled in headless Twinleaf trials. Any simulation using the unmodified Item must be labeled an engine-fidelity counterexample; its deck order and subsequent search/draw outcomes cannot be presented as paper-legal Ticket execution.
- Probability assumptions deliberately exclude opponent mulligan draws (they do not retroactively change already dealt Prizes), Prize advancement, Item lock, hidden-deck access, searching constraints, and playing policies.

## Next tactical falsification

For a rank-26 true-source first turn in which DCE is initially Prized but Ticket is accessible, register an **owner-information-constrained** conditional Ticket-use policy before seeing the seed result. Run with the versioned paper-order correction. Observe physical Ticket play, DCE moved from Prizes to the **true bottom** of the live deck, legal shuffle/search and Energy attachment, Crisis Punch if feasible, and the real opponent response. Keep failed exposure and no-opportunity cases in the denominator. Avoid retroactively choosing a favorable Ticket seed. Compare to the existing rank-26 source v3/v2 guard using unchanged policy identities. Coordinate with the rank-26 policy owner before costly CI.

**Benchmark unchanged:** 29 of 32 exact Aichi source lists, zero independently qualified competitive matches, and no demonstrated 99.5% fixed-deck performance.
