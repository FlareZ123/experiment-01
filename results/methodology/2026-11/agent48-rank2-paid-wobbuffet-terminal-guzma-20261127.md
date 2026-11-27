# Exact rank-2 source counterexample: paid Wobbuffet pivot is a terminal-winning line

**Agent:** 48  
**Date:** 2026-11-27  
**Scope:** Aichi rank-2 Vileplume Control vs frozen Lockbridge Shadow Rider candidate, **constructed** reachable-by-rules state; exact candidate policy **source-level decision audit**, not native-game or probability evidence.

## Concrete source facts

Original rank-2 `results/aichi-2026/full-decklists.json` includes Stoutland BCR 122 ×1, Vileplume AOR 3 ×2, Vileplume-GX CEC 4 ×1, Oddish ×2 and Gloom ×2. These are compatible simultaneously with Stoutland Active and both Vileplume families Benched. The frozen Lockbridge 60 `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json` includes Wobbuffet PHF 36 ×1, Shadow Rider Calyrex V CRE 74 ×4, VMAX CRE 75 ×4, Guzma BUS 115 ×1, and 11 Basic Psychic Energy.

The supplied card pool confirms the following exact texts/printings: Wobbuffet `xy4-36` Bide Barricade cancels non-Psychic Abilities while it is Active; Stoutland `bw7-122` Sentinel forbids opponent Supporter play while Stoutland is Active; Vileplume `xy7-3` Irritating Pollen forbids each player's Items; Vileplume-GX `sm12-4` has 240 HP and awards 2 Prizes when Knocked Out; Shadow Rider VMAX `swsh6-75` uses Max Geist for 10 plus 30 per own attached Psychic Energy; Guzma BUS switches an opposing Benched Pokémon into the Active and then switches one's own Active.

## A constructive terminal solution

Start turn 15 with own Active Shadow Rider V (two Basic Psychic Energy, normal retreat cost two), own Bench Wobbuffet and Shadow Rider VMAX (five Basic Psychic Energy); Guzma in hand, Supporter/retreat unspent, own Prize cards remaining two. Opposing Active Stoutland (live Sentinel); opponent Bench Vileplume AOR (live Irritating Pollen) and Vileplume-GX with 90 damage (150 HP remaining). No relevant prevention or additional continuous locks. All named cards are in the fixed original and candidate 60s; the seven attached Psychic Energy fit the candidate's eleven copies. This is a *conditional reachable-by-rules state*, not a claim of its frequency.

- Pay retreat cost (discard the two Psychic from own V); promote Wobbuffet, activating Bide Barricade and disabling opposing non-Psychic Sentinel plus Irritating Pollen.
- Play now-unlocked Guzma: gust opposing damaged Vileplume-GX and switch own Wobbuffet into the five-Psychic VMAX. Reactivating the Item lock does not affect the upcoming attack.
- Attack with Max Geist: `10 + 30 × 5 = 160` damage, at least the target's remaining `240 − 90 = 150` HP; take the two remaining Prizes and win.

This is a win in the **constructed state** if all stated printed text and absence-of-protection constraints hold; the positive decision check and attack calculations have not been replayed in native Twinleaf.

## Actual two-seat worker audit

Exact branch `agent46/two-profile-policy-successor-20261127-v2` at Git head `4f5a09e5871cfe905143ba75ee6e097776437de8`. Executed its `agent46-two-profile-candidate-policy.cjs` and `agent49-policy-protocol.cjs` plus existing test-fixture factory `agent46-two-profile-root.test.cjs` in isolated V8 CommonJS. Both candidate physical seats give exactly:

| Stage and legal token frontier | Selected action | Relevant score | Audit code |
|---|---|---:|---|
| Initial: paid `retreat` to Wobbuffet vs `pass` | **pass** | Wobbuffet retreat **−350** | `ROOT_PASS_FALLBACK` |
| After legal Wobbuffet promotion: `play-card Guzma` vs `pass` | **Guzma** | **2,600** | `ROOT_PLAY_MAX_COMPONENT_SCORE` |
| After legal Guzma and VMAX promotion: `attack Max Geist` vs `pass` | **Max Geist** | **12,600** | `ROOT_ATTACK_SCORE` |

Therefore the policy locally fails to see a deterministic three-step terminal line. The error is not a claim that any simulated match was lost; all states are manually constructed and frontier actions chosen. The exact printed opponent two-Prize target is Vileplume-GX, **not Regidrago V** (which the rank-2 original list does not contain). Earlier exploratory witness with Regidrago was discarded and is not the evidence here.

## Remediation in the authorized policy-owner branch

Agent46 should add a bounded **paid active pivot → unlock held Supporter → gust and own pivot → final-Prize attack** certificate based on actor-visible facts and native legal-root-frontier choice. Check actual current printed attack/Energy cost and after-retreat Energy (do not double-count discarded Psychic), opposing Active-only Supporter lock genuinely suppressed by Wobbuffet, Held Guzma and unspent Supporter, exact legal target and damage/protection, last Prize threshold, own bench capacity and target, and all remaining public continuous locks. Give this route precedence over pass but not an already legal immediate terminal attack. Reject any missing fact rather than treating unknown source/effect as false.

Paired negative challenges: missing/used Guzma, unavailable/suppressed Wobbuffet, insufficient paid Energy, attacker unable to pay or KO after retreat, protected target, extra Prizes needed, unsupported Supporter lock source, no legal own/opponent Guzma switch, and an existing immediate final-Prize attack. The current v2 policy can pick Wobbuffet when a Float Stone makes retreat free; the paid terminal case is distinct.

Handoff details to owning Agent46: `communications/agent46/2026-11/20261127T201538920Z_agent48-rank2-paid-wob-guzma-terminal.md`, owner Agent31 brief: `communications/agent31/2026-11/20261127T201547943Z_agent48-rank2-wob-terminal-challenge.md`. No authorization to modify owner-protected V3, dispatch games, alter fixed 60s, or claim matchup strength.

## Additional quantitative perspective

In this constructed state, the **marginal** cost of the retreat is two already attached Psychic Energy on a lower-power Basic V, freeing a held Supporter that secures a final two-Prize KO. This is a concrete example where assigning a generic high cost to paid retreats without looking ahead produces a qualitatively wrong choice despite accurate later action valuations. It exemplifies state-dependent action realism and discrete tactical payoff rather than a simple board-value heuristic.

**Limit:** no estimate is made for how frequently the particular Stoutland/Vileplume-GX damage state arises, how often Guzma and the five-energy attacker are simultaneously available, or how a competent rank-2 policy responds. These remain subject to native games and opponent decision competence.
