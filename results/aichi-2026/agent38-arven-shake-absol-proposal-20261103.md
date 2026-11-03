# Arven–Boost Shake Absol: an independently specified fixed-60 contender

**Agent 38 | 3 November 2026. Developmental contender, not the selected best deck.** One fixed 60 is registered in [the print-aware manifest](candidate-arven-shake-absol-v1.json). The line is a candidate hypothesis about reducing early Garbotoxin access contention. **No autonomous native game, paper-valid opponent response, match clock or Aichi competitive win was tested.** The shared benchmark remains 29 authenticated original opponents of 32, zero qualified games and no 99.5% demonstration.

## Proposed card sequence and mechanical prerequisites

On the *first personal turn going second*, place a physical **Trubbish FST 168** in play; if **Arven SVI 166** is held and usable, search **Boost Shake EVS 142** (Item) and **Float Stone BKT 137** (Pokémon Tool) from the remaining deck. Attach the Tool to Trubbish, then play Boost Shake to search **Garbodor BKP 57** from the deck and evolve immediately. Boost Shake explicitly allows first-turn/newly-played evolution and **ends the turn**. The Tool remains attached through evolution, enabling Garbotoxin's global Ability suppression. Arven consumes the Supporter and the Tool must occupy its sole attachment slot. These instructions are mechanically supported by the supplied card texts and Advanced Rulebook, subject to applicable opponent locks and other board conditions. A pre-existing Item or Tool lock can prevent the line. The first player cannot ordinarily use Arven on the first turn; that seat has only the modeled directly held Shake/Tool route.

This deliberately tests a multi-axis search connector: one Supporter retrieves both required Trainers. Garbodor's lock also suppresses the candidate's own non-exempt Abilities once established, including potentially valuable draw/search/support routes. Position Tapu Lele-GX or other Ability-dependent setup before the lock if used. No claim is made that early Garbotoxin dominates other actions against a specific opposing deck.

## Fixed 60, original rank-11 source lineage

Derived from the authenticated original [rank-11 Wataru Yano Absol/Garbodor inventory](full-decklists.json) using the immutable changes below; every unchanged printed identity is inherited from that list. The new Arven SVI 166 is present in the bundled card database and was already examined in another candidate. The historical 10 May 2026 Japanese Expanded banned-identity snapshot contains no added Trainer here, which is a narrow check rather than a comprehensive event-legality certificate.

### Pokémon (14)

- 3 Mega Absol ex (MEG 86)
- 3 Trubbish (FST 168)
- 2 Garbodor (BKP 57)
- 2 Oranguru V (ASR 133)
- 1 Latias ex (SSP 76)
- 1 Tapu Lele-GX (GRI 60)
- 1 Crobat V (DAA 104)
- 1 Squawkabilly ex (PAL 169)

### Trainer (38)

- 2 Carmine (TWM 145)
- 2 Marnie (SSH 169)
- 2 Guzma (BUS 115)
- 4 Battle VIP Pass (FST 225)
- 4 Quick Ball (FST 237)
- 3 Professor's Letter (BKT 146)
- 2 Dark Patch (ASR 139)
- 3 Boost Shake (EVS 142)
- 1 Escape Rope (BST 125)
- 1 Super Rod (PAL 188)
- 1 VS Seeker (PHF 109)
- 1 Secret Box (TWM 163)
- 4 Float Stone (BKT 137)
- 1 Forest Seal Stone (SIT 156)
- 1 Muscle Band (XY 121)
- 1 Shopping Center (EVS 157)
- 2 Temple of Sinnoh (ASR 155)
- 3 Arven (SVI 166)

### Energy (8)

- 8 Darkness Energy (MEE 15)

### Exactly recorded changes versus rank 11

| Printed card | Original | Challenger | Change |
| --- | ---: | ---: | ---: |
| Trubbish (FST 168) | 2 | 3 | +1 |
| Arven (SVI 166) | 0 | 3 | +3 |
| Boost Shake (EVS 142) | 2 | 3 | +1 |
| Carmine (TWM 145) | 3 | 2 | -1 |
| Dark Patch (ASR 139) | 3 | 2 | -1 |
| Float Stone (BKT 137) | 3 | 4 | +1 |
| Forest Seal Stone (SIT 156) | 2 | 1 | -1 |
| Marnie (SSH 169) | 3 | 2 | -1 |
| Professor's Letter (BKT 146) | 4 | 3 | -1 |
| Shopping Center (EVS 157) | 2 | 1 | -1 |

Totals: **14 Pokémon, 38 Trainers, 8 Energy = 60.** All named non-Basic-Energy quantities are at most four; the existing Secret Box remains the sole ACE SPEC. The added Trubbish raises starting-eligible Basics from 11 to 12. No Top 32 source was overwritten and no tournament player is claimed to have registered this challenger.

## Exact opening-resource experiment

Uniformly choose seven physical opening cards from the 60, then six face-down Prizes from the 53 remaining cards. The model is independent of the identity of the starting Active (Trubbish in hand makes these successful resources Basic-valid). A **direct** route requires Trubbish, Shake and Stone in the starting seven and at least one Garbodor in the remaining 47-card deck. An **Arven** route requires Trubbish and Arven in that seven and at least one Shake, Stone and Garbodor each in that remaining deck. The union counts overlap once. No first-turn draw, search, mulligan bonus, extra item, Bench congestion, lock, target, Energy, simulator policy or turn sequencing is included. These are only starting-resource opportunities.

| Exact seven + six-Prize event | Original rank-11 60 | Arven Shake v1 |
| --- | ---: | ---: |
| Direct Trubbish + Shake + Stone, Garbodor deck | 1.031585% | 2.769320% |
| Held Arven with searchable Shake + Stone + Garbodor | 0.000000% | 8.580314% |
| Union, no duplicate overlap | 1.031585% | **10.773747%** |
| Union conditional on a Basic-valid opening seven | 1.326663% | **13.311551%** |

For the challenger, the exact union numerator is **955236827612197** of **8866337641761600** distinct equally weighted hand-and-Prize configurations. The original rank-11 restricted event occurs 10.444 times less often under this intentionally narrow comparison. Conditional percentages divide by the corresponding Basic-valid first-seven event, using 11 original and 12 challenger Basic cards. This conditioning is descriptive; it does not model repeated mulligans.

### Proof and independent validation

[BigInt multivariate combinatorial implementation](../../scripts/agent38-arven-shake-opening.cjs) enumerates opening-hand category counts, then uses inclusion-exclusion to exclude Prize allocations in which every remaining copy of Shake, Stone or Garbodor is Prized. The direct case only needs Garbodor left in deck because Shake/Stone are already held. [Seven pure Node 22 regressions](../../tests/agent38-arven-shake-opening.test.cjs) passed locally, including a separately enumerated eight-card physical toy space, no-Garb and no-Basic counterexamples, count validation and overlap accounting. The same fetched source code was re-evaluated directly on the two full GitHub manifests, reproducing the exact counts. There is **no compiled Twinleaf CI witness or native match** attached to this proposal.

## Competitive tradeoffs and explicit next falsification gate

The list spends three Supporter slots on Arven and raises Trubbish/Boost Shake/Float Stone density. Against rank 11, it loses one Carmine, one Marnie, one Professor's Letter, one Dark Patch, one Forest Seal Stone and one Shopping Center. These sacrifices may hurt immediate draw, Energy Drive-style resource accumulation, Darkness acceleration, VSTAR access and Stadium replay. The Tool-expanded line conflicts with other Tool uses and can be dismantled by removal. An early global Ability lock may also interfere with its own search and draw plan. The apparent >10x narrow-resource gain is therefore **not an estimated gameplay improvement**.

The next test should take a small preregistered actual source-seeded two-seat sample using the shared symmetric owner-information-safe policy and pinned Twinleaf hooks. It should verify whether Arven is naturally selected, whether the exact printed physical payments and searches settle, whether Garbotoxin remains live at the opponent's consequential root, and whether opponents can actively answer the Tool or position. Use the same policy for the unchanged rank-11 reference and this exact challenger, preserve all negative/aborted/censored cases, physical deals and first-player choice, and include rank 1/2/5/6/11 threats before any promotion. Any broader game rating requires the **entire Top 32** and paper-valid timed-match adjudication.


## Second exact model: first seven plus one ordinary turn-one draw

A first player receives one ordinary card draw on their first turn, while only the second player can ordinarily play the Arven Supporter during that turn. To distinguish this from the preceding restricted opening-seven calculation, [the second exact checker](../../scripts/agent38-arven-shake-one-draw.cjs) samples the initial seven, six Prizes, and a single ordinary draw in their proper stochastic sequence. It **conditions on a Basic Pokémon being present among the actual initial seven**, even when the required Trubbish is the eighth card drawn. The code uses the equivalent unordered eight-card sampling representation with the eight possible final-draw positions tracked exactly, then applies the six-Prize exclusion to every searched deck component.

| One draw, conditional on Basic-valid original seven | Original rank-11 60 | Arven Shake v1 |
| --- | ---: | ---: |
| Direct Trubbish + Shake + Stone; Garbodor deck | **1.938316%** | **4.882985%** |
| Arven + Trubbish held, Shake + Stone + Garbodor deck | 0% | **13.024510%** |
| Union with overlap removed, for **going second** | **1.938316%** | **16.679734%** |

Under this model the challenger going-second union event also has an unconditioned joint probability of **13.499798%** of all valid-or-invalid eight-card-and-six-Prize random configurations. The **exact** weighted numerator is **56,256,070,550,245,168** over denominator **416,717,869,162,795,200**, before dividing by the **80.935331%** chance of a Basic-valid initial seven. For rank 11, the same valid-seven probability is **77.757886%**. The directly held route is also potentially accessible on a first-player first turn, but Arven cannot ordinarily be played then.

An [independent six-test suite](../../tests/agent38-arven-shake-one-draw.test.cjs) exhaustively enumerates an eight-physical-card toy with ordered starting cards, separate draw and Prize removal, verifies the exact valid-opening denominator, checks the known rank-11 and challenger counts, and rejects an absent-Garbodor result. All six passed against the original fetched source in an isolated V8-compatible test harness, with a Node `assert` and `test` shim. **These six were not executed under a Node runner or compiled Twinleaf CI**. The prior seven-card test suite did run under local Node 22; both programs are intended for Node 22.

**This model remains a resource-exposure ceiling for the specified narrow two-root line.** It does not certify Arven is the best Supporter, that Trubbish has an open Bench, that Item/Tool play is legal under opponent locks, that native selected actions follow this line, that Garbotoxin remains operative when the opponent can act, or that an early lock improves wins. Prize recovery, other tutors, opponent-mulligan bonuses and additional draw engines can also create lines outside these probabilities. The two model percentages are distinct estimands and must not be conflated.


### Held-component Arven hybrids: explicit refinement

The initial "Arven" event in both tables requires Shake, Float Stone and Garbodor **all in the remaining deck**. This is intentionally narrower than the real card's flexibility: if Shake is already in hand, Arven may search just the missing Float Stone; if Stone is held, Arven may search the missing Shake. The source rulebook permits selecting fewer than the stated number of cards in type-restricted deck searches, so these hybrid lines are legitimate *resource* opportunities when the held components and remaining deck permit them.

I extended the same exact eight-visible-card, Basic-valid-seven and six-Prize combinatorics to count **Arven-assisted hybrid** states (Trubbish+Arven observed, Garbodor available in deck, and every missing Shake or Stone accessible in deck) and then form the union with independently held Shake+Stone when Arven is absent. The full unrestricted-within-this-three-component resource event is:

| Going-second first turn, conditional on Basic-valid seven | Original rank-11 60 | Challenger 60 |
| --- | ---: | ---: |
| Narrow all-three-in-deck Arven route | 0% | 13.024510% |
| Arven including held-Item or held-Tool hybrid | 0% | **13.130234%** |
| Direct Shake+Stone OR either eligible Arven route | **1.938316%** | **16.755733%** |

The hybrid union numerator is **56,512,392,832,556,911** over the same total hand-draw-Prize denominator **416,717,869,162,795,200**; conditioning uses the independently counted Basic-valid initial-seven numerator **337,271,985,613,442,880**. The extension changes the narrow union estimate from 16.679734% to **16.755733%**, a **0.075999 percentage-point** increase in this resource-only experiment.

An updated [seven-test one-draw suite](../../tests/agent38-arven-shake-one-draw.test.cjs) includes an **independent ordered physical toy census of both hybrid and narrow lines**, ensuring no duplicate union reward. All seven passed when original source/test files fetched from GitHub were executed in an isolated V8-compatible harness; a compiled Node/Twinleaf run is still absent. This refinement does not address the possible self-lock cost of Garbotoxin, actual first-turn selection, opposing Item lock or opponent counterplay.

## Printed-card database coverage and MEE energy identity

The [bundled corpus audit](../../scripts/agent38-candidate-printing-audit.cjs) separately verifies each of the proposed 27 printed rows against `resources/sets/en.json` and the corresponding `resources/cards/en/<set>.json` card identities, testing both the printed card name and printed category. **26 of 27 printed identities representing 52 of 60 physical cards are exact matches in the supplied English corpus.** The five critical Arven/Boost Shake/Float Stone/Trubbish/Garbodor identities resolve exactly, and the printed `expanded` legality field says `Legal` for them. The printed Secret Box entry is the only indexed ACE SPEC. A combined-name four-copy check passes for all non-Basic-Energy cards.

The sole unmatched database identity is **8 × Darkness Energy MEE 15**. This exact printed code and count are *inherited unchanged* from the authenticated rank-11 source 60; the local `sets/en.json` contains no `MEE` release. This is an incomplete bundled set index, rather than evidence that the original physical Energy is imaginary. Separately, external collector checklists identify **MEE as Mega Evolution Energies**, released in September 2025, and **#015 as Basic Darkness Energy**, matching the manifest's type/name convention (see [Setavaria set list](https://sets.setavaria.com/wiki/Pokemon%3AMega_Evolution_Energies), [CardOS printed MEE 15](https://business.getcardos.com/browse/pokemon/cards/mee-15vh)). These public catalogue matches are external corroboration and do **not** establish official Japanese event legality or engine availability.

[Five corpus regression fixtures](../../tests/agent38-candidate-printing-audit.test.cjs) cover all 27 exact printings, the matching unknown in original rank 11, an ACE SPEC uniqueness check, a duplicate-printing four-copy aggregation counterexample and malformed deck totals. They are registered but **have not yet been run in a repository Node runner or compiled Twinleaf CI**. For any native candidate run, retain the original MEE manifest as provenance and record an explicit permissible equivalent Basic Darkness Energy mapping under the shared `planAichi(...,{allowEquivalentBasicEnergies:true})` resolver, including substitutions. Do not claim a literal `MEE15` engine card if the pinned engine lacks that printing. Original-source and candidate paper identities remain unchanged.
