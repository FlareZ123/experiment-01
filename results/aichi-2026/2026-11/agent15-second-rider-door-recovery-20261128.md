# Hybrid Gate with a second Rider: how often the initial one-Door bottleneck can be repaired by T2

**Agent 15 | 28 November 2026 | actual fixed-60 physical deals, restricted upper-reachability model; not game/competitive win-rate evidence.**

## Concrete line and design implication

The [one-Door action ceiling](agent15-one-door-attachment-action-ceiling-20261127.md) explains why a Deoxys Gate opening can lose up to one Underworld Door attachment and two drawn cards per turn to Hood's immediate double Rider VMAX. This is **not necessarily permanent** because Deoxys Gate v0 contains **three Shadow Rider Calyrex V and three VMAX** in its fixed 60. The strongest immediate repair is:

`T1: play Shadow Rider Calyrex V Active/Bench → search/play Radiant Eternatus onto Bench → Climactic Gate fetch Rider VMAX + Deoxys VMAX from deck, end turn`

`T2: naturally evolve the older Rider V from hand into another Rider VMAX → use both Rider Underworld Door Abilities if legal`

The T2 evolution does **not** violate first-turn evolution rules because the Rider V was in play on T1. A fresh Rider V put into play on T2 would not qualify. The extra Rider V occupies a real Active/Bench slot. With Active non-Rider Basic, T1 Bench must accommodate Radiant + Rider V + two VMAX (four positions), within the standard five-Spot Bench. If Rider V began Active, three Bench positions suffice. Later evolution requires access to a separate Rider VMAX; the one fetched by Gate is already in play and cannot also evolve the Basic.

**Actionable policy:** if deciding on a Rider+Deoxys Gate in a matchup where neutral high-HP Max Geist matters, prioritize preserving/benching an eligible extra Rider V *before* ending the turn with Gate, and reserve a plausible T2 VMAX access connector (held VMAX, Mysterious Treasure, Forest Seal Stone or Arven→Stone). Do not burn the only second-Rider search connector as arbitrary discard fodder. This is not an instruction to always choose hybrid Gate; the extra setup can lose tempo, Bench or a protected singleton.

## Reproducible 60-card restricted opening experiment

The [Python planner](../../../scripts/2026-11/agent15-second-rider-t2-restoration.py) uses the **exact 60 physical counts** of the previously defined Deoxys Gate v0. It shuffles 7 opening cards, sets 6 physical Prize cards, chooses Active by a fixed opening-hand-only priority, rejects Radiant as forced sole Active, and checks the **two** distinct T1 search goals (Radiant and an extra Rider V). It permits Quick Ball, Mysterious Treasure and Fog Crystal with their distinct targets and costs, conserves physical cards, enumerates distinct discard sets and connector contention, and requires one Rider VMAX and one Deoxys VMAX actually in deck for Climactic Gate.

For T2 it computes the exact probability over the one ordinary draw from the remaining shuffled deck that the established Rider V can evolve. Access channels: already held or newly drawn Rider VMAX; paid Mysterious Treasure into the remaining deck copy; Forest Seal Stone's unused Star Alchemy on a Pokémon V; or turn-two Arven fetching an available FSS. No T1 Supporter, full draw engines, mulligan bonus, opponent first response, Item/Ability lock, Pokémon Tool occupancy, getting a second legal VMAX through any unmodeled connector, Trainer search beyond those listed, or attacks are simulated. It chooses the **best conditional plan among enumerated T1 choices using the sampled deck composition**, so it is an **optimistic restricted-action opportunity upper screen**, not an implementable K0 policy or a real-game frequency.

A second run mode protects all Rider VMAX, Psychic Energy, FSS, Arven, Valley, Clefairy, Latias, Ranger, Acerola, Guzma, VS Seeker, Mysterious Treasure, Hood and Stamp from being paid as generic T1 discard costs. This deliberately strict protected set is a **sensitivity assumption**, not a universal DCI classification; the real optimal discard choice depends on matchup/game state.

### Matched seeds, 100,000 attempted deals

Two independent 50,000-deal runs (seeds `27112028`, `27112029`) share the same exact 60 and opening/shuffle rules. **86,275 Basic-valid seven-card deals**. The second-Rider restoration numerator is a fractional expectation over the actual T2 top-draw possibilities, not an additional random sampled T2 game.

| Opportunity event | Permissive search/discard | Protected-resource discard |
|---|---:|---:|
| T1 hybrid Gate possible, among Basic-valid hands | 36.69% | 35.39% |
| T1 hybrid Gate **and extra Rider V established**, among Basic-valid hands | 26.09% | 23.25% |
| T2 second Rider evolution given T1 hybrid Gate **with established extra V** | 57.80% | 56.20% |
| **T1 hybrid Gate + successful T2 Rider restoration**, among Basic-valid hands | **15.08%** | **13.07%** |
| T2 Rider restoration opportunity **given any T1 hybrid Gate opportunity** | **41.10%** | **36.93%** |

These are *model-conditional chance-of-opportunity estimates*. Because the model omits T1 Supporters and full card draw, its “Gate possible” fraction is **not** the true maximum or actual turn-one Gate rate and is not comparable directly to the different Agent11/Agent6 full opening screens. Because T1 plans are chosen with an optimistic knowledge-of-the-sampled-deck decision criterion, the 41.10% is **not** a calibrated real-player policy probability; it's a benchmark for possible restricted T1+T2 sequences. FSS may be tactically dominated when needed for something else and Arven consumes the T2 Supporter. An opponent can knock out the extra Rider before it evolves.

### Decision impact

The original one-Door action-ceiling report remains correct **only while one Door stays one**. This model shows a concrete path that can remove that ceiling by turn two and why it is not automatic. Within the restricted no-T1-Supporter opening class, a majority of possible Gate starts do **not** simultaneously reach the second-Door restoration by T2. A real optimal mixed policy must compare **hybrid Rider+Deoxys with a credible extra Rider V/VMAX** versus **two Rider Gate and immediate two-Door tempo**, plus the first-turn Clefairy/Latias and Boss/Guzma Supporter trades. It is not enough to classify Deoxys as either “permanently one Door” or “always restores two Doors.”

### Tests, boundaries and next implementation

The [local tests](../../../tests/2026-11/agent15-second-rider-t2-restoration.test.py) passed constructed cases where a held VMAX permits certain T2 restoration, forced Active Radiant prevents Gate, Prized singleton Deoxys VMAX prevents hybrid Gate, and all-three-Rider-V-Prized prevents second Rider despite a possible base Gate. Paired sample tests verify nested event/protected-discard relations and conserved 60-card counts. The planner remains in a separate research script, **not** a worker policy. It may inform the existing authorized successor worker, where T1 selection needs actor-only K0 information and opponent-response handling.

No deck, frozen profiles, source registration, Twinleaf vendor, workflow or game was changed. The fixed 60 objective remains unselected; Aichi source coverage 29/32 and zero qualified competitive matchups; no 99.5% claim.
