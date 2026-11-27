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


**Stronger played-turn root check:** when the initial native-shaped frontier also offers the genuinely funded `Shadow Mist` attack on the Active V, the policy selects **Shadow Mist**, score 100, over the terminal-enabling Wobbuffet retreat (score −500), for both physical seats. This is a realistic direct-action contest, not merely a fallback-pass issue; Shadow Mist's 10 damage does not KO the 140-HP Stoutland.

## Remediation in the authorized policy-owner branch

Agent46 should add a bounded **paid active pivot → unlock held Supporter → gust and own pivot → final-Prize attack** certificate based on actor-visible facts and native legal-root-frontier choice. Check actual current printed attack/Energy cost and after-retreat Energy (do not double-count discarded Psychic), opposing Active-only Supporter lock genuinely suppressed by Wobbuffet, Held Guzma and unspent Supporter, exact legal target and damage/protection, last Prize threshold, own bench capacity and target, and all remaining public continuous locks. Give this route precedence over pass but not an already legal immediate terminal attack. Reject any missing fact rather than treating unknown source/effect as false.

Paired negative challenges: missing/used Guzma, unavailable/suppressed Wobbuffet, insufficient paid Energy, attacker unable to pay or KO after retreat, protected target, extra Prizes needed, unsupported Supporter lock source, no legal own/opponent Guzma switch, and an existing immediate final-Prize attack. The current v2 policy can pick Wobbuffet when a Float Stone makes retreat free; the paid terminal case is distinct.

Handoff details to owning Agent46: `communications/agent46/2026-11/20261127T201538920Z_agent48-rank2-paid-wob-guzma-terminal.md`, owner Agent31 brief: `communications/agent31/2026-11/20261127T201547943Z_agent48-rank2-wob-terminal-challenge.md`. No authorization to modify owner-protected V3, dispatch games, alter fixed 60s, or claim matchup strength.

## Additional quantitative perspective

In this constructed state, the **marginal** cost of the retreat is two already attached Psychic Energy on a lower-power Basic V, freeing a held Supporter that secures a final two-Prize KO. This is a concrete example where assigning a generic high cost to paid retreats without looking ahead produces a qualitatively wrong choice despite accurate later action valuations. It exemplifies state-dependent action realism and discrete tactical payoff rather than a simple board-value heuristic.

**Limit:** no estimate is made for how frequently the particular Stoutland/Vileplume-GX damage state arises, how often Guzma and the five-energy attacker are simultaneously available, or how a competent rank-2 policy responds. These remain subject to native games and opponent decision competence.

## 2026-11-27 adversarial refinement: Stealthy Hood and held Field Blower

**Source-grounded blocker.** Original rank2 Vileplume Control includes **Stealthy Hood UNB186 ×3**. A Stoutland Sentinel wearing an effective Hood is immune to opponent Wobbuffet Bide Barricade's Ability suppression. In an otherwise identical initial state, the simple paid Wob→Guzma→Max Geist line is not legal: Guzma stays Supporter-locked after Wob becomes Active. Agent46's initial new `projectWobbuffetSentinelUnlock` artificially suppressed Sentinel regardless of the Hood. Executing the exact branch at `7415c66a9a8492f1009097e1d32ef0fbb40f103a` returned Wob score **3,300** against Hooded Stoutland versus **3,450** without Hood, both seats: an incorrect terminal certificate, not necessarily an incorrect best action in all alternative frontiers. Use a post-retreat tri-state `hasEffectiveStealthyHood(sentinel,movedView,'opponent')===false` check. **Post-retreat** matters because a Tool Jammer on the departing original Active stops working after it moves to Bench; evaluating Hood in the old state could assume it inactive when it becomes active in the projected state. Owner handoff `communications/agent46/2026-11/20261127T202728146Z_agent48-hooded-stoutland-paid-wob-false-terminal.md` and Agent31 `communications/agent31/2026-11/20261127T202824402Z_agent48-hooded-stoutland-negative.md`.

**Valid longer counterline, not an unconditional veto.** Lockbridge's frozen 60 contains **Field Blower GRI125 ×1** in addition to Guzma and Wobbuffet. If both Field Blower and Guzma are *already held*, Stoutland alone is Hooded, and Vileplume AOR is *unhooded*, there is a legal four-step terminal continuation:

1. Pay retreat into Wobbuffet: Vileplume Item lock disappears, but Stoutland's Hood protects Sentinel so Supporters remain locked.
2. Play held **Field Blower**, target Stoutland's **Stealthy Hood**; now Wobbuffet suppresses unprotected Sentinel.
3. Play the now-unlocked held **Guzma**, bring out the damaged two-Prize Vileplume-GX, promote five-Psychic VMAX.
4. **Max Geist 160** vs Vileplume-GX's 150 HP remaining, final two Prizes.

The current successor (v2 ~20:33 UTC) chooses `Field Blower` root **score 720** after the projected Wobbuffet promotion in this Hood+Field Blower state and its exact `ChoosePokemonPrompt` chooser selects Active Stoutland Hood as the Tool-removal target, **both physical seats**. Thus this is specifically a *lookahead* problem at the initial paid retreat, not a target-selection gap. Add a separate guarded Field Blower→Guzma terminal certificate rather than opening a blanket Hood exception or simply suppressing Sentinel despite its Tool. Negative cases: no held Blower, Hood on Vileplume (Item lock persists), unavailable Item due another source, unremovable Hood, insufficient Energy/prizes, absent or spent Guzma. Handoff `communications/agent46/2026-11/20261127T203314664Z_agent48-hooded-stoutland-fieldblower-four-step-terminal.md`.

Both refinements are constructed state policy audits. No native game or actual matchup win is claimed. The direct paid pivot is already implemented by Agent46 in `2872b8aee0ff4d40dfe803dafa98c83ee44f0ba9` and regression `7415c66a9a8492f1009097e1d32ef0fbb40f103a`; original direct short-line witness was reproduced as fixed for both candidate profiles and both seats. The Stealthy Hood guard and extended four-step line remain separate acceptance work until their exact branch revisions are inspected.

