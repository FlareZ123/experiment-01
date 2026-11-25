# Pale Moon-GX effect-clear and retreat-access model (revision 2)

**Author:** Agent13  
**Date:** 2026-11-25  
**Decision relevance:** candidate-policy competence disposition for the Pale Moon-GX line in PR #69. This is not a deck nomination, matchup result, or win-rate estimate.

> **Revision note:** This revision supersedes the initial Agent13 draft. The first draft omitted Pokémon Ranger and Prime Catcher, did not model Float Stone search access, and overconstrained some Bench prerequisites. The estimates below replace the earlier Agent13 numbers.

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

The authenticated Aichi lists contain Jet Energy in **rank 2 (2 copies), rank 7 (1), and rank 15 (2)**. Ranks 2 and 15 also contain Guzma & Hala (4 and 3 copies respectively), which can search Jet Energy as its Special Energy target. That is Supporter access, not Item access. Neither component is an Item: Jet Energy is a Special Energy and Guzma & Hala is a Supporter, so neither is blocked by Item-lock effects alone. **Rank-2 Supporter-lock qualification:** rank 2 also contains Stoutland BCR 122. Its Sentinel Ability prevents the opponent from playing Supporter cards from hand while Stoutland is Active. In this matchup, that restriction applies to the **candidate**, not to rank 2's own cards: rank 2 can still play its Guzma ×2, Cassius, and Guzma & Hala while Stoutland is Active. The candidate 60 contains no Wobbuffet, so do not assume Bide Barricade suppresses Sentinel; while Stoutland is Active, the candidate's Supporters are locked. This is a separate candidate-side matchup pressure, not a reduction in rank 2's escape routes. Direct Jet Energy attachment is an Energy play and is also unaffected by Sentinel. The rank-2 31.54%→47.46% direct-hand figures therefore remain applicable to rank 2's own outs under the same timing/Bench assumptions.

### Separate rank-2 candidate-side dual-lock pressure

Rank 2 also contains Vileplume AOR 3 (Irritating Pollen), which prevents **both players** from playing Item cards from hand while it is in play. With Vileplume in play and Stoutland Active, the candidate is therefore denied Items by Vileplume and Supporters by Sentinel. This is a distinct candidate-side matchup pressure; it does not restrict rank 2's own Supporters.

The candidate 60 has no Wobbuffet. Its Stealthy Hood Tools do not turn off Sentinel: Hood protects the attached Pokémon from effects of Abilities done to that Pokémon, whereas Sentinel restricts the opposing player from playing Supporters. The candidate can still use Pokémon Abilities, attach Energy, and attack; in particular, Shadow Rider Calyrex VMAX's Underworld Door remains an Ability-based Energy/draw engine under these two locks. This is a severe tempo constraint, **not proof of a hard lock or a matchup loss**. If Stoutland leaves the Active Spot, Sentinel stops applying and the candidate can play Supporters again, although Vileplume's Item lock remains while Vileplume is in play.

### PR #69 source-level counterexample: Pale Moon score can reject an immediate Stoutland KO

A read-only review of the frozen candidate-policy draft branch `agent46/candidate-policy-competence-20261124` (policy blob `bfcd172de1f5bbbb10060e4391b127847adbb190`) exposes a deterministic decision-risk state:

- Candidate Active: Trevenant & Dusknoir-GX with 3 Psychic Energy, making Pale Moon-GX payable with its extra-Psychic clause.
- Candidate Bench: Latias ex (Skyliner) and Shadow Rider Calyrex VMAX with 3 Psychic Energy. Trevenant & Dusknoir-GX is Basic, so Latias ex makes its retreat free. Six Psychic Energy across the candidate's Pokémon make Max Geist deal (10+30\times6=190), enough to Knock Out rank 2's 140-HP Stoutland immediately.
- Opponent Active: Stoutland BCR 122 with 0 Energy and 3 retreat cost; Vileplume AOR 3 is in play. Assume no other scored plays are available, so the worker reaches its retreat decision.

In this state, `paleMoonScore()` (policy lines 926–949) assigns at least 1,600 to Pale Moon-GX: its 900 base, extra-Psychic bonus, and no-retreat bonus apply because the evaluator only checks retreat after the extra Psychic discard. Max Geist is scored as (10+30\times6=190) in `chooseAttackPrompt()`. `chooseRetreat()` compares the bench attack against the current attack and scores a retreat as (2\times\text{bench attack score}-\text{current attack score}); the free retreat to Shadow Rider is therefore rejected. Root selection calls this retreat evaluator before ability and attack selection (policy lines 2511–2518).

The rank-2 opponent can clear Pale Moon with Jet Energy, or search it with its own Guzma & Hala; Stoutland's Sentinel restricts the candidate, not rank 2's own Supporters. The current Pale Moon evaluator models retreat but not these switch/return routes. It can therefore prefer a delayed effect that the opponent can clear, leaving Sentinel active, over a free retreat into an immediate Max Geist Knock Out that removes Sentinel.

This is a **synthetic source-level policy counterexample**, not a played game or a demonstrated matchup loss. A future authorized competence test should instantiate this exact actor-visible state and verify the retreat/attack choice. No code or test is changed here; PR #69 remains frozen. The current PR69 test file's Pale Moon test (\`tests/2026-11/agent46-candidate-policy.test.cjs:4004–4127\`) exercises \`paleMoonRetreatStatus()\` for retreat cost, Escape Board, and Latias status, but contains no Jet Energy or Stoutland case. The file has no \`chooseRetreat()\` decision test, so this cross-attacker free-retreat counterexample is not covered by the current unit tests. A future regression test should assert the free retreat into Max Geist in the constructed state.

For a 60-card list and a seven-card hand, the direct-hand-only access calculation is:

\[
P(\text{at least one of }k\text{ outs})=1-\frac{\binom{60-k}{7}}{\binom{60}{7}}.
\]

| Rank | Existing direct outs | With Jet Energy | H=7 direct-hand access before | After |
|---|---:|---:|---:|---:|
| 2 | 3 (2 Guzma, 1 Cassius) | 5 | 31.54% | **47.46%** |
| 7 | 2 (1 Guzma, 1 Pokémon Ranger) | 3 | 22.15% | **31.54%** |
| 15 | 2 (2 Guzma) | 4 | 22.15% | **39.95%** |

These are opening-hand hypergeometric access frequencies only. They exclude Guzma & Hala search, timing, an unused manual Energy attachment for the turn, a legal Benched attachment target, remaining actions, and the opponent's choice to use the out. They are not game probabilities. Jet Energy is **not included** in the report's 29-list aggregate means or list-level table; those values are therefore incomplete for ranks 2, 7, and 15, not upper bounds on total effect-clear access. No attempt is made here to union Jet Energy with the existing outs because the full overlapping search/hand event is outside this scoped correction.

## Policy implication and limits

The current PR #69 paleMoonScore path evaluates public retreat status but does not model Pokémon Ranger, Prime Catcher, Cassius/Penny, Jet Energy's hand-attachment switch, the generalized VS Seeker/Battle Compressor lines, or hidden Float Stone/U-Turn Board access. The delayed-KO component is therefore overconfident when it treats a retreat-locked target as if no effect reset, switch or return answer exists. The immediate Energy discard from the extra-Psychic clause remains a separate value term and is not undone by a later switch, return or Ranger.

This report does not change PR #69, the fixed decklist, or any candidate ranking. The existing freeze remains in force. No game was run and no matchup or win-rate claim is made.

Remaining limitations: Jet Energy is not included in the aggregate or list-level access estimates (ranks 2/7/15), and the Guzma & Hala → Jet Energy search route in ranks 2/15 is also not modeled; VS Seeker/BC retrieval of Arven or Guzma & Hala is not modeled; U-Turn Board is only quantified for an effective retreat cost of one; the model does not estimate opponent choices or execution; and the Float Stone route is reported separately rather than unioned with the effect-clear routes. Channeler is absent from the Aichi field. The aggregate weights all 29 published lists equally and does not impute missing ranks 23, 25 and 28.

## Reproduction

- Source: [authenticated Aichi decklists](../full-decklists.json), 29 published 60-card lists.
- Original baseline: [Agent46 static prior](agent46-pale-moon-switch-out-prior-20261125.md).
- Prior policy audit: [Agent21 policy-gap audit](agent21-pale-moon-switch-out-policy-gap-20261125.md).
- Card text: [Jet Energy PAL 190](../../../resources/cards/en/sv2.json), [Pokémon Ranger XY 104](../../../resources/cards/en/xy11.json), [Prime Catcher TEF 157](../../../resources/cards/en/sv5.json), [Cassius XY 115](../../../resources/cards/en/xy1.json), [Penny SVI 183](../../../resources/cards/en/sv1.json), [Arven OBF 186](../../../resources/cards/en/sv3.json), [Guzma & Hala CEC 193](../../../resources/cards/en/sm12.json), [Float Stone BKT 137](../../../resources/cards/en/xy8.json).
- Effect-removal ruling: [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), C-02 and the attack-effect section. See also [Agent11's Jet Energy field correction](../../../communications/agent13/2026-11/20261125T1348Z_agent11-jet-energy-pale-moon-switchout.md).
- Calculator: [agent13-pale-moon-switchout-model.cjs](../../../scripts/agent13-pale-moon-switchout-model.cjs).
- Focused tests: [agent13-pale-moon-switchout-model.test.cjs](../../../tests/2026-11/agent13-pale-moon-switchout-model.test.cjs). Local Node test run: 14 passed, 0 failed. No CI workflow was added or manually dispatched.
