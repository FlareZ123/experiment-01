# Pale Moon-GX effect-clear and retreat-access model (revision 5)

**Author:** Agent13  
**Date:** 2026-11-25  
**Decision relevance:** candidate-policy competence disposition for the Pale Moon-GX line in PR #69. This is not a deck nomination, matchup result, or win-rate estimate.

> **Revision note (revision 5):** The revision-3 Stoutland withdrawal and conditional rank-2 Pidgeot state remain. Revision 4 qualified Guzma's both-Bench requirement and the three-/five-out cases. This revision makes explicit that the hypergeometric values are no-search-history priors, not posteriors after rank 2's setup searches; it also distinguishes known-in-hand, spent, and still-hidden outs. These remain conditional access calculations, not games or matchup results.

## Field audit: direct effect-clear, switch and return outs

A pattern-assisted card-text scan for attack-effect resets, switch/return effects and retreat Tools, cross-referenced against all 29 authenticated Aichi lists, found the following relevant cards: This is the modeled set plus one separately identified but not yet modeled Special Energy switch route; see the Jet Energy section below.

| Card | Lists | Copies | Field ranks / qualification |
|---|---:|---:|---|
| Guzma | 25 | 48 | Requires both players to have a Bench |
| Escape Rope | 7 | 11 | The affected player needs a Bench; the other player may decline to switch if they have none |
| Pokémon Ranger | 5 | 5 | Ranks 4, 5, 7, 18, 32; direct global attack-effect reset |
| Prime Catcher | 3 | 3 | Ranks 10, 18, 27; ACE SPEC, requires both Benches |
| Jet Energy | 3 | 5 | Ranks 2, 7, 15; hand-attachment switch; **not included in the modeled means** |
| Cassius | 1 | 1 | Rank 2; returns any of the player's Pokémon and attached cards to deck |
| Penny | 1 | 1 | Rank 3; returns a Basic Pokémon and attached cards to hand |
| Acerola | 1 | 1 | Rank 1; only if the affected Pokémon is damaged |
| Scoop Up Cyclone | 1 | 1 | Rank 3; ACE SPEC, returns one of the player's Pokémon and attached cards to hand |

The important corrections are:

- **Pokémon Ranger** (XY 104, Expanded legal) says to remove all effects of attacks on each player and their Pokémon. It directly clears Pale Moon-GX's delayed-KO effect without moving the target and does not require a Bench. It appears in five lists, including two Regidrago lists (ranks 18 and 32).
- **Prime Catcher** (TEF 157, Expanded legal ACE SPEC) switches an opponent's Benched Pokémon into the Active Spot and then switches the player's own Active Pokémon with one of their Benched Pokémon. It is an out when both players have a Bench and the ACE SPEC remains available. It appears in three Regidrago lists (ranks 10, 18 and 27).
- **Cassius** (XY 115) and **Penny** (SVI 183) are Expanded-legal Supporters. Cassius can return any target Pokémon to the deck; Penny applies only to a Basic target. The Advanced Player's Manual, C-02, states that a Pokémon put into its owner's hand or deck loses its damage counters and effects. Both therefore clear the delayed attack effect and remain playable under Item lock.
- The complete card pool also contains **Channeler**, another attack-effect reset, but none of the 29 Aichi lists plays it.

Bench prerequisites are modeled card by card. Guzma and Prime Catcher require both Benches. Escape Rope, Switch, Cassius, Penny, Acerola and Scoop Up Cyclone require the affected player's Bench; Escape Rope still switches that player if the other player has no Bench. Pokémon Ranger has no Bench requirement. The ACE SPEC availability and Item-lock flags apply to Prime Catcher and Scoop Up Cyclone; Supporter outs remain available under Item lock.

## Revised static access prior

The model includes Guzma, Cassius, Pokémon Ranger, conditional Penny and Acerola, Escape Rope, Switch, Scoop Up Cyclone and Prime Catcher. It also generalizes Battle Compressor + VS Seeker retrieval to any eligible Supporter in the deck, and VS Seeker retrieval when an eligible Supporter is already in the public discard. Jet Energy is identified in the field audit but deliberately remains outside these calculations; its direct-hand and Guzma & Hala routes are recorded separately below.

These are equal-weight means across the 29 authenticated 60-card lists, with six unknown Prizes, no public history, both Benches available, Supporter/Item access, and the ACE SPEC unused. H is the modeled hand size.

| Target condition | Original Agent46 H=6 | Revised H=6 | Original Agent46 H=7 | Revised H=7 |
|---|---:|---:|---:|---:|
| Non-Basic, undamaged | 20.8% | **23.3%** | 24.2% | **26.9%** |
| Basic, undamaged | 20.8% | **23.5%** | 24.2% | **27.3%** |
| Non-Basic, damaged | 21.1% | **23.6%** | 24.5% | **27.3%** |
| Basic, damaged | 21.1% | **23.9%** | 24.5% | **27.6%** |

The nine authenticated Regidrago lists now average **26.0% (H=6) and 30.1% (H=7)** for a non-Basic undamaged target, versus the original 21.7%/25.3%. This increase is explained by Pokémon Ranger in ranks 18 and 32 and Prime Catcher in ranks 10, 18 and 27; rank 18 contains both.

Selected H=7 list-level access:

| Rank | Target condition | Revised access | Main reason |
|---|---|---:|---|
| 2 Vileplume Control | Any target | 31.5% | Two Guzma plus Cassius |
| 3 Snorlax Stall | Basic target | 31.5% | Guzma, Penny and Scoop Up Cyclone |
| 3 Snorlax Stall | Non-Basic target | 22.1% | Penny is ineligible |
| 4 Raichu/Electrode | Any target | 40.0% | Pokémon Ranger plus three Escape Rope |
| 5 Mew/Genesect | Any target | 40.0% | Pokémon Ranger, two Guzma and Escape Rope |
| 7 Snorlax Stall | Any target | 22.1% | Guzma plus Pokémon Ranger |
| 18 Regidrago | Any target | 47.5% | Three Guzma, Pokémon Ranger and Prime Catcher |

These are access priors, not the probability an opponent chooses to use an out, the probability the delayed Knock Out fails, or a game result.

## Public-zone conditioning

The estimator conditions the hidden hand/deck/unknown-Prize pool on the current hand size, deck size, unknown Prize count, total publicly known cards, known identities of relevant cards, and the public discard.

For an unknown pool of size N = H + D + P, with k remaining direct outs, the direct-hand probability is:

\[
P(\text{direct out in hand})=1-\frac{\binom{N-k}{H}}{\binom{N}{H}}.
\]

If an eligible Supporter is in the discard, VS Seeker in hand is an additional route. If none is in the discard, the model evaluates Battle Compressor + VS Seeker in hand plus an eligible Supporter in the deck.

A controlled illustration uses H=7, D=30, P=6 and 17 known public cards. The other 16 known cards are assumed to be non-outs:

| Public state | 29-list mean, non-Basic undamaged | Regidrago mean |
|---|---:|---:|
| No modeled out among the 17 known cards | 36.7% | 41.0% |
| One Guzma in discard | 46.7% | 53.8% |
| One Pokémon Ranger in discard | 53.1% | 60.5% |

These are synthetic conditional states, not observed game-state frequencies. The increase when Ranger is in discard reflects VS Seeker access to a global effect reset.

## Hidden retreat access through Pokémon Tools

The attached-Tool retreat helper does not cover a Tool still in hand or one searched from the deck. A separate exact multivariate hypergeometric calculation now estimates Float Stone access, assuming the target's Tool slot is open, Tool effects are active, retreat is permitted, and the required search targets remain available.

| Rank | Search package | H=6 access | H=7 access |
|---|---|---:|---:|
| 3 Snorlax Stall | One Float Stone; four Arven | 38.5% | **43.4%** |
| 15 Lopunny/Vileplume | One Float Stone; three Guzma & Hala; two Stadiums and five Special Energy | 31.6% | **35.7%** |
| 19 Raging Bolt | One Float Stone; one Arven | 18.1% | **21.0%** |

The event includes Float Stone already in hand, Arven in hand with Float Stone in deck, or Guzma & Hala in hand with Float Stone, a Stadium and a Special Energy in deck. Guzma & Hala also needs two other cards to discard; H=6/7 satisfies the hand-size prerequisite. Arven's result assumes a legal Item/Tool search target remains in deck. These probabilities are separate from the effect-clear table and must not be added to it without accounting for overlaps.

Float Stone appears in 12 lists (24 copies). **U-Turn Board** appears in ranks 4 and 17. If the target's effective retreat cost is exactly one, its Tool slot is open and Tool effects are active, one U-Turn Board gives 10.0% (H=6) / 11.7% (H=7) direct hand access. This is conditional on the target's retreat cost; it is not included in the Float Stone table.

## Additional unmodeled switch route: Jet Energy

**Jet Energy (PAL 190; repository card identity `sv2-190`)** is a Special Energy with a switch effect when attached from hand to one of your Benched Pokémon: that Pokémon switches with your Active Pokémon. This is not a retreat, so a retreat prohibition does not prevent it. Under the Advanced Player's Manual C-02, a Pokémon that moves from Active to the Bench loses effects on it; attaching Jet Energy to a Benched Pokémon can therefore clear Pale Moon-GX's delayed attack effect.

The authenticated Aichi lists contain Jet Energy in **rank 2 (2 copies), rank 7 (1), and rank 15 (2)**. The rank-2 list also has **Pidgeot ex ×2**: if one is in play with Quick Search unused and a Jet Energy remains in deck, Quick Search can find Jet Energy directly before the Energy attachment. This Ability-based search is not blocked by Vileplume AOR's Item lock. It is a conditional deterministic access route once those public-board and hidden-deck conditions hold; it is not included in the static access calculations. Ranks 2 and 15 also contain Guzma & Hala (4 and 3 copies respectively), which can search Jet Energy as its Special Energy target. That is Supporter access, not Item access. Neither component is an Item: Jet Energy is a Special Energy and Guzma & Hala is a Supporter, so neither is blocked by Item-lock effects alone. **Rank-2 Supporter-lock qualification:** rank 2 also contains Stoutland BCR 122. Its Sentinel Ability prevents the opponent from playing Supporter cards from hand while Stoutland is Active. In this matchup, that restriction applies to the **candidate**, not to rank 2's own cards: rank 2 can still play its Guzma ×2, Cassius, and Guzma & Hala while Stoutland is Active. The candidate 60 contains no Wobbuffet, so do not assume Bide Barricade suppresses Sentinel; while Stoutland is Active, the candidate's Supporters are locked. This is a separate candidate-side matchup pressure, not a reduction in rank 2's escape routes. Direct Jet Energy attachment is an Energy play and is also unaffected by Sentinel. The rank-2 31.54%→47.46% direct-hand figures therefore remain applicable to rank 2's own outs under the same timing/Bench assumptions.

### Separate rank-2 candidate-side dual-lock pressure

Rank 2 also contains Vileplume AOR 3 (Irritating Pollen), which prevents **both players** from playing Item cards from hand while it is in play. With Vileplume in play and Stoutland Active, the candidate is therefore denied Items by Vileplume and Supporters by Sentinel. This is a distinct candidate-side matchup pressure; it does not restrict rank 2's own Supporters.

The candidate 60 has no Wobbuffet. Its Stealthy Hood Tools do not turn off Sentinel: Hood protects the attached Pokémon from effects of Abilities done to that Pokémon, whereas Sentinel restricts the opposing player from playing Supporters. The candidate can still use Pokémon Abilities, attach Energy, and attack; in particular, Shadow Rider Calyrex VMAX's Underworld Door remains an Ability-based Energy/draw engine under these two locks. This is a severe tempo constraint, **not proof of a hard lock or a matchup loss**. If Stoutland leaves the Active Spot, Sentinel stops applying and the candidate can play Supporters again, although Vileplume's Item lock remains while Vileplume is in play.

### PR #69 source-level policy risk: Pidgeot ex → Cassius / Jet Energy clears Pale Moon on Vileplume-GX

A prior synthetic Stoutland example in revision 2 is **withdrawn**. Agent11 independently checked the exact frozen policy blob and found that the three-Psychic Trevenant & Dusknoir-GX can use Night Watch for 150 damage, immediately Knocking Out 140-HP Stoutland. With the stated Latias/Skyliner free-retreat line, the powered Shadow Rider VMAX's Max Geist is scored even higher and the policy retreats into it. The old example therefore did not demonstrate a Pale Moon decision failure. See the Agent11 correction handoffs in `communications/agent13/2026-11/20261125T1540Z_agent11-pale-moon-score-correction.md` and `20261125T1542Z_agent11-night-watch-score-correction.md`.

A different, conditional state does expose a source-level decision risk in the frozen PR #69 candidate policy:

- Candidate Active: Trevenant & Dusknoir-GX SMP SM217 with three Psychic Energy; its GX attack is unused.
- Candidate has **no Shadow Rider Calyrex VMAX in play** (so there is no Underworld Door source), no live Latias ex / Skyliner, no live Float Stone on the Active, no other powered Benched attacker, and no higher-scored card play or usable Ability. Thus no free-retreat or Underworld Door line preempts the attack choice.
- Opponent Active: Vileplume-GX CEC 4, 240 HP, two-Colorless Retreat Cost, zero Energy, and no effective retreat Tool.
- Opponent Bench: Pidgeot ex OBF 164 with Quick Search available; the opponent's Vileplume AOR 3 remains in play to impose Item lock.
- Quick Search is unused. At least one out is accessible in hand or deck: **Cassius XY 115** with the Supporter play unused, or **Jet Energy PAL 190** with the manual Energy attachment unused. If an out is in deck, Pidgeot ex can search it; if it is in hand, it can be used directly. The synthetic state does **not** specify a candidate Bench, so the baseline three-out estimate excludes rank 2's two **Guzma** copies. If the candidate also has a Benched Pokémon, Guzma becomes an additional eligible Supporter switch route.

This is a possible state in authenticated Aichi rank 2 Takahiro Ando's original list: it contains Pidgey ×2, Pidgeotto ×2, Pidgeot ex ×2, Vileplume AOR ×2, Vileplume-GX ×1, Cassius ×1, Guzma ×2, Jet Energy ×2, and Guzma & Hala ×4. Vileplume AOR's Item lock does not suppress Pidgeot ex's Ability or prevent a Supporter or Energy play.

**Frozen-policy choice.** The exact PR #69 policy blob is `bfcd172de1f5bbbb10060e4391b127847adbb190` at PR #69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`.

The exact card-pool text for Trevenant & Dusknoir-GX SMP SM217 confirms the distinction: the delayed Knock Out at the end of the opponent's next turn is unconditional; the additional-Psychic clause only discards all Energy from the opponent's Active Pokémon. Thus zero target Energy does **not** remove the delayed-KO effect, but it does make the policy's separate +350 Energy-discard bonus valueless.

- `paleMoonExtraPsychicAvailable()` returns true with three Psychic Energy: Pale Moon-GX costs Psychic + Colorless and requires one additional Psychic Energy for its discard effect.
- `paleMoonScore()` sees zero target Energy and two-Prize liability. It still awards the full +350 extra-Psychic bonus, producing a base of 900 + 0×80 + 2×100 + 350 = 1,450. Because Vileplume-GX cannot retreat and the opponent has a Bench, it adds another 350, for **1,800**.
- Night Watch deals 150 to the 240-HP Vileplume-GX, so it does not Knock it Out. `attackScore()` assigns Night Watch 150×10 plus up to 120 hand-disruption points: **1,500–1,620**.
- With no higher-scored play, free-retreat line, or Underworld Door source, `chooseRoot()` therefore prefers Pale Moon at 1,800 over Night Watch at 1,500–1,620. The separate `chooseAttackPrompt()` comparison also prefers Pale Moon (1,800) over its lower Night Watch prompt score (150–270).

The extra-Psychic bonus is misplaced in this state: Pale Moon's extra effect discards all Energy from the opponent's Active Pokémon, but Vileplume-GX has zero Energy, so the effect has no Energy to discard. Without the +350 bonus, Pale Moon scores **1,450**, below Night Watch's minimum 1,500.

**Opponent's source-grounded escape.** Pidgeot ex can use Quick Search to find a switch/return out from the deck:

1. **Cassius route (does not require an Energy attachment):** play Cassius as the Supporter for the turn, shuffling the Active Vileplume-GX and all attached cards into its owner's deck. The Pokémon leaves play and the delayed Pale Moon effect is removed under Advanced Player's Manual C-02 (when a Pokémon in play is put into its owner's hand or deck, its effects are removed). Pidgeot ex can then be promoted.
2. **Jet Energy route:** attach Jet Energy from hand to Benched Pidgeot ex. Its printed effect switches that Pokémon with Active Vileplume-GX; Vileplume-GX moves to the Bench and loses effects under the manual's C-03 switch rule (lines 1077–1078).
3. Rank 2's two Guzma copies provide another Supporter switch route when both players have Benches; Guzma & Hala can search Jet Energy. These are separate routes, not probabilities to add without accounting for overlapping cards and action limits.

Quick Search is an Ability; Cassius and Guzma are Supporters; Jet Energy is an Energy card. None is an Item, so Vileplume AOR's Item lock does not stop these routes. Cassius requires its copy to remain in deck and the Supporter play to be unused; Jet Energy requires a copy to remain in deck and the manual attachment to be unused. The Pidgeot Ability must be live and no other rule effect may suppress the route.

**Conditional Pidgeot access prior (illustration, not a game probability).** In the report's synthetic public-zone shape, H=7, D=30, P=6, so N=43 cards remain unknown across hand, deck and Prizes. If k of the rank-2 outs (Cassius ×1, Jet Energy ×2) remain in that unknown pool, and Pidgeot ex is in play with Quick Search unused while both the Supporter and Energy-attachment actions remain available, any out in hand is directly usable and any out in deck is searchable. The probability of at least one out in hand or deck is therefore:

\[
P(\text{accessible})=1-\frac{\binom{6}{k}}{\binom{43}{k}}.
\]

| Remaining Cassius / Jet copies in unknown pool | Conditional access |
|---:|---:|
| 1 | 86.05% |
| 2 | 98.34% |
| 3 | 99.84% |

This assumes the listed remaining copies are not already in public discard or attached zones. Any publicly identified copy in discard, attached, or a revealed Prize must be removed from k and the unknown-pool sizes recomputed; unrevealed Prizes remain among P and are inaccessible. It is a conditional hand/deck access prior only, not the probability of reaching this board, the opponent choosing the out, or a game/match result. **Do not add these values to the existing 31.54% direct-hand prior**: the events overlap, and this calculation is a separate Pidgeot-enabled union under explicit action/zone assumptions.

**Guzma qualification and Quick Search sensitivity (revision 4).** Agent4 correctly noted that Guzma SM3 115 switches the opponent's Benched Pokémon with its Active Pokémon and then switches your own Active Pokémon with one of your Benched Pokémon. Therefore, Guzma requires **both players to have a Bench**. The opponent Bench is specified by Pidgeot ex in the synthetic state, but the candidate Bench is not; the original three-out Cassius + Jet Energy estimate is consequently the conservative state-as-written calculation. If the candidate also has a Benched Pokémon, both Guzma copies are additional eligible Supporter outs, provided the Supporter play remains unused. With both Benches present, Quick Search unused, and both the Supporter and manual Energy-attachment windows unused, the eligible set is Cassius ×1 + Guzma ×2 + Jet Energy ×2 (k=5).

| Eligible out set | k | Conditional access with Quick Search unused |
|---|---:|---:|
| Cassius ×1 | 1 | 86.05% |
| Jet Energy ×2 | 2 | 98.34% |
| Cassius + Jet Energy ×2 (candidate Bench absent; Guzma excluded) | 3 | 99.84% |
| Cassius + Guzma ×2 (both Benches; Energy attachment spent) | 3 | 99.84% |
| Cassius + Guzma ×2 + Jet Energy ×2 (both Benches and both action windows unused) | 5 | **99.9994%** |

The five-out result is \(1-\frac{\binom{6}{5}}{\binom{43}{5}}=99.9993767\%\). It is not applicable when the candidate has no Bench, the Supporter play is spent (exclude Cassius and Guzma), or the Energy attachment is spent (exclude Jet Energy). If the Supporter play is spent, only Jet Energy ×2 remain; if the attachment is spent, Cassius + Guzma ×2 remain only when both Benches are present.

If Quick Search has already been used or is suppressed, deck copies are no longer accessible through Pidgeot. The relevant event becomes “at least one eligible out is in hand”:

\[
P(\text{hand access})=1-\frac{\binom{D+P}{k}}{\binom{N}{k}}.
\]

For the same synthetic H=7, D=30, P=6, N=43 pool, the hand-only access is **42.14%** for the three-out no-candidate-Bench case and **60.84%** for the five-out both-Benches case. These sensitivities assume all relevant action windows remain unused and do not include other draw/search routes. The five-out estimate must not be read as a 99.9994% chance of escaping Pale Moon in a game: it is only the chance that at least one eligible card is in hand or searchable from deck under the stated hidden-zone and action-window assumptions.

**Selection-history qualification.** These hypergeometric values are *no-search-history priors*: they assume the eligible copies remain uniformly distributed across the stated hidden hand/deck/Prize pool. They are not posteriors after a known setup sequence. The supplied `resources/human_concepts.md` describes a rank-2 Vileplume Control line similar to `Tag Call → Guzma & Hala → Jet Energy + TM: Evolution → Bunnelby with Barrage`. This is a plausible archetype-specific setup line, not evidence that it occurred in the synthetic state. If public action history shows that a Jet Energy's attachment/switch effect has already been used, remove that copy from the eligible-out count; if a copy is known in hand and the attachment window remains, it is a known accessible out rather than a hidden draw. A known spent/discarded/revealed-Prize copy is unavailable. Public Guzma & Hala search choices may also change the posterior over remaining Jet Energy, so the remaining hidden pool must be reconstructed from the actual search result and action history rather than treated as a fresh uniform shuffle. The five-out calculation additionally assumes both Jet copies remain eligible; it must be reduced if the setup line has already consumed one.


This is a **conditional, source-derived policy-risk state**, not a played game, demonstrated matchup loss, or full-competence finding. It shows that the frozen heuristic treats “cannot retreat” as “cannot clear the delayed effect” and awards extra-Psychic value against a zero-Energy target. It does not show that an opponent will always find or choose an out, that the state is frequent, or that the candidate loses a matchup. The candidate actor view does not expose the opponent's hidden deck composition. Any future policy correction must therefore use an explicitly permitted public registered-deck prior or a conservative response to visible board information; it must not read hidden opponent zones or assume the worker already knows the rank-2 list.

The existing Pale Moon tests exercise score/retreat-status helpers but do not cover the zero-Energy extra-Psychic bonus or the Pidgeot ex Quick Search → Cassius / Jet Energy lines. A future authorized competence test should explicitly exclude Shadow Rider VMAX / Underworld Door and free-retreat sources, then instantiate this actor-visible state and verify the score/decision and effect-clear routes. **The current Critic freeze does not authorize adding that test or changing PR #69.** No code, test, PR, deck, workflow, fixture, or game was changed for this report correction.

## Policy implication and limits

The current PR #69 paleMoonScore path evaluates public retreat status but does not model Pokémon Ranger, Prime Catcher, Cassius/Penny, Jet Energy's hand-attachment switch, Pidgeot ex Quick Search to find Cassius or Jet Energy, the generalized VS Seeker/Battle Compressor lines, or hidden Float Stone/U-Turn Board access. Revision 3's conditional Pidgeot ex state shows why this matters: the frozen policy can value a delayed Knock Out over Night Watch while a known registered opponent list has visible Ability-based access to a Supporter return-to-deck or Energy switch out. The candidate actor view lacks the opponent's hidden deck composition, so this is a source-level risk requiring a permitted public-deck prior or a conservative visible-board policy, not an excuse to inspect hidden zones. The extra-Psychic bonus must also be tied to an actual Energy discard opportunity; zero target Energy provides no such value. The invalid Stoutland counterexample is withdrawn.

This report does not change PR #69, the fixed decklist, or any candidate ranking. The existing freeze remains in force. No game was run and no matchup or win-rate claim is made.

Remaining limitations: Jet Energy is not included in the aggregate or list-level access estimates (ranks 2/7/15); the Guzma & Hala → Jet Energy search route in ranks 2/15 is not modeled; nor are rank 2's conditional Pidgeot ex Quick Search → Cassius / Jet Energy routes (require Pidgeot ex in play, Quick Search unused, the relevant out remaining in deck, and an unused Supporter or Energy attachment respectively); VS Seeker/BC retrieval of Arven or Guzma & Hala is not modeled; U-Turn Board is only quantified for an effective retreat cost of one; the model does not estimate opponent choices or execution; and the Float Stone route is reported separately rather than unioned with the effect-clear routes. Channeler is absent from the Aichi field. The aggregate weights all 29 published lists equally and does not impute missing ranks 23, 25 and 28.

## Reproduction

- Source: [authenticated Aichi decklists](../full-decklists.json), 29 published 60-card lists.
- Original baseline: [Agent46 static prior](agent46-pale-moon-switch-out-prior-20261125.md).
- Prior policy audit: [Agent21 policy-gap audit](agent21-pale-moon-switch-out-policy-gap-20261125.md).
- Card text: [Jet Energy PAL 190](../../../resources/cards/en/sv2.json), [Pokémon Ranger XY 104](../../../resources/cards/en/xy11.json), [Prime Catcher TEF 157](../../../resources/cards/en/sv5.json), [Cassius XY 115](../../../resources/cards/en/xy1.json), [Guzma SM3 115](../../../resources/cards/en/sm3.json), [Pidgeot ex OBF 164](../../../resources/cards/en/sv3.json), [Penny SVI 183](../../../resources/cards/en/sv1.json), [Arven OBF 186](../../../resources/cards/en/sv3.json), [Guzma & Hala CEC 193](../../../resources/cards/en/sm12.json), [Float Stone BKT 137](../../../resources/cards/en/xy8.json).
- Effect-removal ruling: [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), C-02 and the attack-effect section. See also [Agent11's Jet Energy field correction](../../../communications/agent13/2026-11/20261125T1348Z_agent11-jet-energy-pale-moon-switchout.md). The rank-2 setup-line hypothesis is from [human concepts](../../../resources/human_concepts.md), not an observed game trace.
- Calculator: [agent13-pale-moon-switchout-model.cjs](../../../scripts/agent13-pale-moon-switchout-model.cjs).
- Focused tests: [agent13-pale-moon-switchout-model.test.cjs](../../../tests/2026-11/agent13-pale-moon-switchout-model.test.cjs). Local Node test run: 14 passed, 0 failed. No CI workflow was added or manually dispatched.
