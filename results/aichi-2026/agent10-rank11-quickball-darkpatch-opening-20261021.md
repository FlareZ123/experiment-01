# Rank-11 Mega Absol source: direct Quick Ball / Dark Patch acceleration is absent from two native histories

**Agent 10 | 21 October 2026 | exact combinatorics plus archived Store ledger audit | development only, zero qualified games.**

## Tactical hypothesis, source and paper gates

The *unchanged published* Aichi rank-11 Mega Absol/Garbodor 60 contains **four Quick Ball, three Dark Patch, eight basic Darkness Energy, three Basic Mega Absol ex**, four Professor's Letter and three Carmine. These quantities were checked against `results/aichi-2026/full-decklists.json`. The supplied English card snapshot identifies Quick Ball `swsh8-237` as an Item costing the discard of one other hand card before searching for one Basic; Dark Patch `swsh10-139` attaches a basic Darkness Energy **from discard to a Benched Darkness Pokémon**; Mega Absol ex `me1-86` is a Darkness Basic. One conceivable first-turn setup sequence, if there is no Item lock, is:

`hold Quick Ball + Dark Patch + basic Darkness Energy -> discard Darkness with Quick Ball -> fetch or retain a Bench-eligible Mega Absol ex -> Bench that Mega Absol -> play Dark Patch to attach the discarded Energy`.

This sequencing uses two separate actual Items, a discard payment, a Basic Bench slot, a searchable Mega Absol if no suitable one is already held, and legal first-turn Item access. It does **not** imply an immediately payable Claw of Darkness (printed `[D][D][C]`), an attack, a Prize or a win. Quick Ball itself can be a *discard outlet* whose alternative Basic search targets matter; the route competes with the source's first-turn Boost Shake Garbotoxin timing and Oranguru V/Forest Seal Stone setup. It should be treated as a candidate actor-visible source line, subject to dynamic opportunity costs and actual prompts.

## Exact source opening opportunity, including the initial Active restriction

Collapse the exact 60 into disjoint classes: `(Quick Ball 4, Dark Patch 3, Darkness Energy 8, Mega Absol ex 3, other Basics 8, other 34)`. Condition on the starting seven having a Basic, place six random Prize cards, and draw one ordinary first-turn card. Demand Quick Ball, Dark Patch and a basic Darkness Energy among the resulting eight cards. A Bench-eligible Mega Absol must also be possible:

- A held Mega Absol qualifies if the original seven included *a different Basic* that could have been chosen Active, or if at least two Mega Absol are held after the turn draw.
- Otherwise Quick Ball must have at least one unprized Mega Absol available in the deck. This last condition matters when the only original Basic is a Mega Absol forced Active. A merely held Active Mega Absol cannot receive Dark Patch.

Count each source seven-card category vector of size seven with its multivariate binomial multiplicity, each possible first-draw category with its remaining multiplicity, and the valid six-Prize combinations. A held-Bench-eligible Mega Absol permits all `C(52,6)` Prize choices; a required deck search with `g` unheld Mega Absol permits `C(52,6)-C(52-g,6-g)`. The denominator for conditional valid original seven, one natural draw and six Prizes is **324,031,005,021,884,160**.

| Structural subevent | Exact favorable configurations | Conditional on valid H7 |
| --- | ---: | ---: |
| First-turn Quick Ball discard to Dark Patch onto a Bench-eligible Mega Absol | **24,942,193,298,467,648** | **7.69747120%** |
| Mega Absol can be Benched from held cards | 5,264,272,876,495,360 | 1.62462011% |
| Mega Absol must be fetched through Quick Ball from an unprized deck | 19,677,920,421,972,288 | 6.07285109% |

These disjoint route partitions sum exactly. A looser calculation that requires only Mega Absol in hand or deck, ignoring the possibility that the only held one is forced Active, gives **7.71258781%** and overcounts by **0.01511661 percentage points**. The stricter first-turn setup event is an optimistic resource possibility, *not* a lower or upper bound on native setup success. It omits other simultaneous playable search routes, opponent setup locks, full Bench behavior after an actual setup choice, card sequencing by the bot, voluntary discard desirability and turn-one Supporter restrictions. It also excludes opponent-mulligan bonus draws. Independent Python `math.comb` exact enumeration produced the integers above. A 600,000-permutation physical-deal Monte Carlo with seed `202610211552`, 466,898 valid source starting sevens, found 35,884 of these opportunities, or **7.68562% ± 0.07640 percentage points** approximate 95% sampling margin, consistent with the exact result.

## Two native source-first histories: no evidence the line was attempted

I independently reopened the immutable original-Store ZIP from compiled manual [run 39618482555](https://github.com/FlareZ123/experiment-01/actions/runs/39618482555), artifact **12353143565**, verified ZIP SHA-256 `3a669df1fb5d7482383c46ed1b56025d8f341a1629dff3e22dcc3fc3fb4231e4`. Both rank-11 source-first original seed `482443328` rows have confirmed source turn-one Battle VIP Pass / Float Stone / Boost Shake resolving to equipped Garbodor. In **neither** the champion nor New Moon candidate row did physical source seat 0 issue a `PlayCardAction Quick Ball`, `PlayCardAction Dark Patch`, or `PlayCardAction Professor's Letter`. Source-seat Darkness manual attachments total two versus champion (global turns 5 and 9) and four versus New Moon (global turns 5, 9, 19 and 23). Source attacks are respectively **zero** versus champion and **18 Oranguru V Psychic** versus New Moon. Rank-11 champion ends with candidate five Prizes taken and source zero (89 roots); New Moon ends source all six and candidate zero (225 roots). Both have explicitly unqualified policies and outcomes.

**Causal limit:** archived source owner hands and searchable-deck status at those later root decisions are unavailable. Absence of a played Quick Ball, Dark Patch or Professor's Letter cannot establish that any was held, payable, strategically worthwhile or omitted despite a legal opportunity. The above exact 7.697% is an *independent opening resource-access event*, not the conditional probability that those two archived physical deals allowed the move. The printed card routes and archive root facts should therefore be combined in **one new same-deal, actor-visible source-policy falsification**, not turned into claims about the source's competence from this archive alone.

## Next high-value test

Within the existing canonical both-seat Store workflow, on rank-11 genuine source-first turns observe the source's **own hand**, public Basic bench candidates and actually searchable owner-deck prompt, then explicitly compare whether a legal Quick Ball payment into Dark Patch to Mega Absol is available *before* the irreversible Boost Shake turn end. Preserve Tool/Star Alchemy competing uses, discard value, Item lock, opponent response and the actual next attacking turn. Compare a source-only, preregistered opt-in against unchanged source/candidate physical deals and include failed/Prize-blocked states. No vendor patch or extra workflow is indicated by this note. **No deck-strength claim follows.**
