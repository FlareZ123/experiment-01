# Original rank-26 Meloetta Donk creates a pre-turn Bench-survival requirement for the proposed Jellicent list

**Agent 3 | 30 October 2026 | strict setup combinatorics and a printed-card opponent hypothesis, not an observed donk win rate.**

## An adversarial axis preceding every Item or Stage-1 lock

The authenticated original rank **26, Hibiki Yamada, Meloetta Donk** plays **one Meloetta ex BLK44**, four **Risky Ruins MEG127**, two **Exeggcute PLF4**, four **Damage Pump LOR156**, two **Technical Machine: Crisis Punch PAF90**, **Tapu Koko Prism Star TEU51** and energy including **Double Colorless**. Its Pokémon composition contains **exactly 12 Basics** (four Unown, two Exeggcute, one each Meloetta ex, Tapu Koko ◇, Bunnelby, Squawkabilly ex, Crobat V and Dedenne-GX), with no Evolutions.

Relevant printed effects: Meloetta's **Debut Performance** permits it to use attacks on its first turn while going first. **Crisis Punch** is a 280-damage Tool attack usable when the opponent has exactly **one Prize card remaining**. **Risky Ruins** places two damage counters on any Basic non-Darkness Pokémon placed onto a Bench during a player's turn, and **Damage Pump** can move existing damage counters. Exeggcute's Propagation can return it from discard to hand and, when it leaves the discard pile then returns, its once-per-zone ability-use status resets per the supplied Advanced Player's Rulebook §E-18 and TPCi Plasma Freeze FAQ. The opponent's original list has the needed card *types* to aim for repeated self-Knock Outs (giving the other player Prize cards) followed by a Meloetta-ex TM attack. The complete five-Prize setup, Energy and Active promotion sequence is **not yet native verified**; do not count a donk as guaranteed.

**Conditional structural fact:** if the candidate has **one Pokémon in play**, and the opponent legally Knocks Out that only Active Pokémon before the candidate's first turn, the candidate loses immediately because there is no Pokémon left to promote, regardless of Secret Box, Boost Shake, Wally or later Item/Ability lock in the candidate's deck. An additional Basic on the starting Bench prevents that single-Knock-Out immediate-loss condition, though it does not guarantee winning the remaining game.

## Exact seven-card Basic composition, then opponent mulligans

The [exact BigInt structural evaluator](../../scripts/agent3-meloetta-lone-basic-mulligan-risk.cjs) and [pure regressions](../../tests/agent3-meloetta-lone-basic-mulligan-risk.test.cjs) compute the candidate setup event. The candidate's original opening seven is conditioned **Basic-valid**. Of those seven, **exactly one Basic** is selected Active. The source has 12 Basics, so its each-seven success is `p=1-C(48,7)/C(60,7)=0.8093533072892635`, and its failed starting hands before a valid one are geometrically distributed. Candidate accepts **all permitted optional source-mulligan bonus cards** before the game begins and can Bench any other Basic found. Six Prizes are implicitly integrated using the exchangeability of uniformly random disjoint cards. No normal turn draw is credited because source going first can hypothetically attack before candidate's first turn.

| Candidate total Basics | Exactly one Basic among valid original sevens | Still one Basic after original rank26 source mulligan bonuses | Original-seven chance to contain Frillish among valid candidate openings |
| ---: | ---: | ---: | ---: |
| 8 | 64.522081% | 62.568060% | 61.123555% |
| **12** | **47.110870%** | **44.907837%** | **49.360350%** |
| 16 | 32.466014% | 30.431087% | 44.350553% |
| 20 | 20.885542% | 19.255191% | 41.976306% |
| 22 | 16.257267% | 14.866279% | 41.299526% |
| 24 | 12.371540% | 11.221762% | 40.832539% |

All scenarios fix **four Frillish** of the candidate total Basics. For a 12-Basic candidate, **15.703623% of Basic-valid original sevens contain Frillish as the only Basic** and, even after source rank26's expected **0.235554** mulligans and any resulting bonus Bench access, **14.969279%** of all Basic-valid setups have *only* Frillish in play at game start. This is not the probability that a Frillish actually starts Active when several Basics are available; it is the compulsory Frillish Active when no others exist.

The source `M>=48` omitted bonus tail has probability below **2.825×10^-35** when the source has 12 Basics. This minute bound applies to the geometric model, not engine behavior.

## Basic-density versus targeted Active evolution

For a fixed four-Frillish line, increasing candidate Basic count reduces the opening probability that it has only one Basic, making a source-first one-attack donk less catastrophic. But the same additional Basics dilute the fraction of valid starts that can naturally begin Active Frillish, and consume slots needed for Stage1 search, Secret Box discards, anti-Stadium counterplay, attackers and Energy. A candidate with 12 Basics and four Frillish cannot be evaluated solely by a **24.450935%** physical two-layer search-availability model that presupposes the candidate gets its first normal turn.

The source's own mulligans lower the candidate solo risk by only **2.203033 percentage points** at 12 Basics. This is much smaller than the earlier **Iron Thorns four-Basic source** mulligan boost because rank26's 12 Basics produce far fewer mulligans.

**Critical qualification:** none of these setup probabilities is an actual Meloetta donk execution probability. The source must assemble repeatable self-Knock Outs, the exact one-Prize condition, a legal TM attack, its attack cost, and its Active Meloetta (potentially involving Tapu Koko and switching). There may be counterlines, Prize collapse, finite Bench places, card-use resets and unavailable targets. Source decision policy, native game legality and owner actions have yet to be demonstrated.

## Next high-value native control

In Agent41's two-seat framework, preserve a source-first **rank26 original print-specific opening** with an authentically single-Basic candidate seven; test whether the original source genuinely achieves a legal first-turn Crisis Punch and Knock Out using its owned resources. Repeat the same source opportunity with one extra Basic Bench on candidate setup, without changing any later deck card. If a single attack KOs the Active but the Benched Pokémon is still in play, the game should continue; if the source cannot reach the required one-Prize condition and Energy, report the first resource blocker. Retain source mulligan count and candidate actual pregame bonus cards separately.

This is an additional cross-field survival gate for any single fixed deck, not a recommendation to put 24 Basics into the Jellicent shell or a finding that rank26 always wins. Shared benchmark remains **29/32 authenticated originals, zero competitively qualified games and no demonstrated 99.5% rate**.
