# Aichi Top 32 opponent-policy panel: rank coverage and admission plan

**Agent 17 · 17 November 2026**

## Purpose and decision

The next competitive bottleneck after the canonical V3 acceptance and first rank-1 natural-terminal trace is not another generic bot or a larger 24-rank replay. It is a **rank-complete, independently competent opponent-policy panel** for the owner's unchanged original Aichi Top 32 field.

This note converts the source-field composition into a concrete coverage plan. It does not change the candidate 60, worker policies, seed, V3 branch, or acceptance sequence. It authorizes no fixture or gameplay before the existing gates and first-trace review.

## Benchmark and coverage facts

The primary estimand is the custom cross-format challenge selected by the owner: one English-language international-Expanded-legal candidate against the **unchanged original Japanese Extra Aichi lists**. Do not normalize, substitute, or exclude the five source lists containing Japanese-only promos. Strict Expanded-vs-Expanded is a separate secondary comparison.

Current source coverage:

- 29/32 exact source 60-card lists are transcribed; ranks **23, 25 and 28** remain unavailable.
- Five authenticated lists (ranks **3, 6, 7, 24 and 29**) are not international-Expanded-legal unchanged, but remain in the primary cross-format field.
- The 24 English Expanded-normalized reconstructions are a diagnostic secondary subset, not the primary 32-rank field.
- No original physical-source opponent is paper-admitted, no matchup game is competitively paper-qualified, and no final fixed 60 is selected.
- The current shared status identifies only three opponent-policy prototypes: ranks **1, 2 and 10**. That is 3/32 rank coverage, not a field panel.

Sources: [current fixed-60 decision board](../../README.md), [24-rank diagnostic field composition](../../aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md), [identity-normalized diagnostic field](../../aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md), and [Critic's 17 November field-evidence direction](../../../communications/broadcast/2026-11/20261117T170523Z_critic-stop-gate-drift-and-return-to-field-evidence.md).

The same rank/source/prototype inventory is available as a [machine-readable JSON manifest](agent17-aichi-policy-panel-manifest-20261117.json). It preserves all 32 source slots, marks the 29 exact lists and missing 23/25/28 explicitly, records the 24-rank English Expanded diagnostic subset separately, and encodes the four planned strata per rank. The manifest is an input/coverage contract, not evidence that any policy or game is ready.

**Prototype transfer boundary:** Agent35 independently computed every available rank's exact substitution distance to the current rank-1/2/10 prototypes. Only the Regidrago family is close to an existing prototype (rank10 to its eight other available Regidrago lists: 9–15 substitutions); rank1's nearest non-identical list is rank30 at 37, and rank2's is rank15 at 26. See [Agent35's full rank-to-prototype transfer map](agent35-prototype-transfer-distance-map-20261117.md). This confirms that 3/32 prototype coverage is not broad non-Regidrago policy coverage.

## Rank coverage map

"Prototype" below means the current shared status identifies a policy prototype for that source rank; it is not a claim that the policy is independently competent or competitively qualified. All other available ranks need an explicit policy owner, exact-list binding, and competence evidence before they enter the panel.

| Source rank(s) | Source archetype | Source-list status | Current panel status / required direction |
|---|---|---|---|
| 1 | Shadow Rider Calyrex | Exact list available | Prototype; preserve as the first post-acceptance trace opponent |
| 2 | Vileplume Control | Exact list available | Prototype; validate independently before field use |
| 3 | Snorlax Stall | Exact list; Japanese-Extra-incompatible | No prototype identified; preserve original promo identities and validate the lock/escape plan |
| 4, 17 | Raichu Electrode Combo | Exact lists available | No prototype identified; share a family core only if each exact list/config is bound and tested |
| 5 | Mew Genesect | Exact list available | No prototype identified; validate Fusion Strike setup, attack selection, and source response lines |
| 6, 24, 29 | Iron Thorns | Exact lists; Japanese-Extra-incompatible | No prototype identified; preserve Player's Ceremony / Palace Book / Palace Belt identities and implement only research-owned compatibility hooks required by the pinned engine |
| 7 | Snorlax Stall | Exact list; Japanese-Extra-incompatible | No prototype identified; separately cover the denser Tool-removal / recovery configuration |
| 8, 11, 16, 22 | Absol Garbodor | Exact lists available | No prototype identified; shared family core may be reused, with rank-specific counts and lock/attacker priorities |
| 9 | Absol Electrode | Exact list available | No prototype identified; do not collapse into Absol Garbodor without a demonstrated shared policy |
| 10, 12, 13, 14, 18, 20, 21, 27, 32 | Regidrago | Exact lists available | Rank 10 prototype only; remaining ranks need rank-specific deck binding and a validated shared Regidrago policy core |
| 15 | Lopunny Vileplume | Exact list available | No prototype identified; keep distinct from rank 2 Vileplume Control |
| 19 | Raging Bolt | Exact list available | No prototype identified; individual policy |
| 23, 28 | Regidrago | Exact lists unavailable | Blocked; do not synthesize a 60 or treat either as a bye |
| 25 | Raichu Electrode / Electric Rain | Exact list unavailable | Blocked; do not infer contents from rank 4 or 17 |
| 26 | Meloetta Donk | Exact list available | No prototype identified; individual policy |
| 30 | Lillie's Clefairy | Exact list available | No prototype identified; individual policy |
| 31 | Dusknoir Chimecho | Exact list available | No prototype identified; individual policy |

The full Top 32 skeleton is materially different from the 24-list diagnostic subset:

| Field family | Full Top 32 | Current 24-list diagnostic subset |
|---|---:|---:|
| Regidrago | 11 (34.4%) | 9 (37.5%) |
| Absol Garbodor | 4 (12.5%) | 4 (16.7%) |
| Raichu Electrode | 3 (9.4%) | 2 (8.3%) |
| Iron Thorns | 3 (9.4%) | 0 |
| Snorlax Stall | 2 (6.25%) | 0 |
| Singleton strategies | 9 (28.1%) | 9 (37.5%) |

A policy panel trained or evaluated only on the 24 normalized lists entirely omits the five Iron Thorns/Snorlax source lists and all three unavailable ranks. It cannot stand in for the primary field.

## Policy architecture: shared core, rank-specific contract

Avoid both extremes: 32 unrelated hand-written bots are wasteful, but one generic bot or one archetype label is not evidence of competent play.

Use a shared decision core with **rank-specific, immutable configuration**:

1. Exact source 60 identity and hash; original Japanese print identities remain distinct from any engine-only alias or hook.
2. Rank-specific setup and mulligan priorities, including the exact starting-Pokémon and first-turn constraints.
3. Archetype engine plan: resource acceleration, primary attacker/lock, key search/discard lines, and the conditions under which the deck should pivot.
4. Rank-specific counterplay priorities: gust, Tool/Stadium removal, Ability/Item lock, hand disruption, prize denial, and recovery where those cards actually occur in that list.
5. Explicit endgame and prize plan; avoid a policy that can set up but cannot convert its board into a terminal win.
6. Actor-only observation discipline. A policy must not receive opponent hidden zones, native engine state, or physical RNG/seed as decision inputs.

A shared archetype module is acceptable only when the exact list-specific differences are data/configuration and the same core passes rank-specific tests. Rank 2 and rank 15 must not be merged merely because both contain Vileplume; rank 9 must not be silently folded into Absol Garbodor; rank 3 and rank 7 need separate configurations despite both being Snorlax Stall.

**Regidrago family detail:** the nine available Regidrago lists share a 20-identity source core, but differ from rank 10 by 9–15 card substitutions in most cases; rank 18 is a larger outlier. Ranks 23 and 28 remain unavailable. A rank-10 prototype therefore cannot be treated as a competent policy for the other Regidrago ranks. See the [Regidrago source-list variance and policy-branch analysis](agent17-regidrago-policy-family-variance-20261117.md).

**Other multi-list family boundaries:** exact source-list distances show that archetype labels alone do not imply one policy: Snorlax ranks 3/7 differ by 34 substitutions; Absol Garbodor distances range 11–28; Raichu ranks 4/17 differ by 21; Iron Thorns ranks 6/29 differ by 5 while rank24 is 14–18 substitutions from them. See the [Aichi multi-list archetype variance report](agent17-aichi-multilist-policy-variance-20261117.md). Reuse shared code only with rank-specific configurations and competence witnesses.

## Strategic decision model for competent policies

A rank policy should model *realistic lines*, not merely card connectivity or whether an action is syntactically legal. The supplied [human-developed concepts](../../../resources/human_concepts.md) are useful hypotheses for this layer, but remain non-authoritative and should be checked against the local rules manual, pinned source, and actual native traces.

- **State-dependent discardability (DCI):** estimate whether each held card should be preserved, discarded, or actively sent to the discard pile under the current matchup, turn, Prize knowledge, and intended line. A card's value changes after a one-use ability is spent, an attack payload becomes accessible, or a key resource becomes Lost-Zone vulnerable. Do not hard-code a card as always disposable or always protected.
- **Active Move Realism (AMR):** evaluate whether a theoretical line can actually be paid for now. Include Supporter-per-turn contention, discard costs, searcher consumption, Bench occupancy, retreat/attachment requirements, lock timing, and whether a card is in a playable zone. A high-connectivity path is not an available line if its discard or Supporter costs cannot be paid.
- **State-dependent UDP:** treat important singleton/ACE SPEC/support Pokémon as protected only while the game plan still needs them; once their function is exhausted, their discard value may change.
- **K0/K1 Prize knowledge:** distinguish decisions made before the first deck search from decisions after the player has searched and can infer the exact Prize composition. The policy must not use hidden Prize information before it has legitimately learned it.
- **Archetype-Line-Specifics (ALS):** encode the source deck's actual multi-card sequence, not just its unordered card counts. For example, a Tag Call → Guzma & Hala → Special Energy/Tool/TM: Evolution line is a different policy problem from a generic "play Supporters and search" heuristic.
- **Discrete tactical value:** preserve the value of conditional but decisive effects such as gust, disruption, lock, and prize denial. Do not let a setup-probability, draw-volume, or graph-connectivity proxy delete a card whose value is concentrated in winning states.

These concepts suggest a concrete policy review question: for each important decision, can the policy explain the intended line, its realistic costs, the cards it is willing to spend, and the information it is allowed to use? A high legal-action rate without those properties is not independent opponent competence.

## Archetype-specific challenge-suite minimums

The suite-content contract belongs to Agent2's note; the table below only maps its scenario families onto the source field. For each rank, convert these objectives into exact source-bound scenarios and decision envelopes. A family label is not itself a passing scenario.

| Rank group | Minimum source-specific policy challenges |
|---|---|
| Regidrago: 10, 12, 13, 14, 18, 20, 21, 27, 32; missing 23, 28 | Establish Regidrago V/VSTAR; manage the exact source list's Energy and discard costs; put the required attack payload in the correct zone; choose the attack payload for the current board; preserve resources against Lost Zone/Prize constraints; execute the rank's unique attacker/tech branch. Do not assume rank10's Faba/Wobbuffet/VIP package is universal. |
| Absol Garbodor: 8, 11, 16, 22 | Demonstrate the source list's Mega Absol / Garbodor / Dark Patch engine, including exact list-specific search/recovery and Stadium/Tool package. Test each rank's unique tech and its different VS Seeker / Energy counts rather than treating the four lists as one 60. |
| Raichu Electrode: 4, 17; missing 25 | Demonstrate Electrode-GX / Alolan Raichu source lines; exercise the actual multi-target energy-attachment, discard-energy, and damage-placement prompts used by that list; preserve rank-specific draw, Bench and recovery packages. Rank25 remains blocked until its exact 60 exists. |
| Iron Thorns: 6, 24, 29 | Demonstrate the Iron Thorns ex plan and the exact Supporter / Energy / Stadium / Tool-denial package. Preserve Player's Ceremony and other original Japanese-Extra identities. Rank6 and rank29 may share more core logic; rank24 requires its own variant tests. |
| Snorlax Stall: 3, 7 | Demonstrate Snorlax's Active/retreat-control plan, resource denial and recovery. Keep rank3's Arven → Field Blower + Hood escape branch distinct from rank7's Megaton Blower / repeated Faba resource war; they differ by 34 substitutions. |
| Singleton ranks: 1, 2, 5, 9, 15, 19, 26, 30, 31 | Give each list its own source-specific engine, attack/lock, resource and endgame challenge set. Do not group a singleton by superficial card overlap; derive its declared line from the exact 60 and card text. |

For every family, include both a positive core-line case and a counter-ALS / adverse-board case. The policy must recognize when its preferred line is no longer realistic and choose a legal alternative, not blindly execute a memorized opening. The exact scenario state, cost ledger, evidence class and reviewer disposition belong in Agent2's challenge-suite schema.

## Known field-execution dependencies after the current gate

The rank-policy panel cannot be made competent by adding policy code alone. The current decision board records several engine/projection gaps that intersect multiple source ranks. These are **post-acceptance field-readiness dependencies**, not reasons to widen the current PR #58 acceptance gate.

1. **AttachEnergyPrompt coverage is much broader than Underworld Door.** Pinned-source review found 13 distinct Aichi AttachEnergyPrompt source shapes across 25/29 available source lists (22/24 of the strict Expanded diagnostic subset). The current V3 path is deliberately limited to Underworld Door provenance and a hand source. The field panel will need one shared typed projection/decoder that preserves each prompt's source zone, energy/target filters, min/max, cancellation, same-target/different-target rules, blocked indices and follow-up effects. Do not create a separate worker protocol per card. See [Agent3's source-origin field audit](../../aichi-2026/2026-11/agent3-energy-attach-trigger-field-exposure-20261115.md) and the current decision board's AttachEnergyPrompt matrix.
2. **The five Japanese-Extra lists need original promo identities.** Ranks 3, 6, 7, 24 and 29 remain unchanged in the primary cross-format benchmark. The pinned engine already implements Palace Book and Palace Belt; Player's Ceremony requires a research-owned hook. Keep this adapter work outside the upstream submodule and retain exact source-print identity. See [Agent43's Japanese-promo engine feasibility note](../../aichi-2026/2026-11/agent43-japanese-promo-engine-feasibility.md).
3. **Raichu/Electrode policies need more than a generic attack selector.** The existing ranks 4, 9 and 17 source audit identifies Extra Energy Bomb's multi-assignment AttachEnergyPrompt, Crash and Burn-GX's DiscardEnergyPrompt, and Alolan Raichu Electro Rain's numeric PutDamagePrompt as separate V3 coverage requirements. Rank 25 is also labeled Raichu/Electrode but its exact list is missing; do not assume it shares the known lists. See [Agent44's ranks 4/9/17 prompt and damage audit](../../aichi-2026/2026-11/agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md).
4. **Copycat/Apex requires prior-turn attack-history provenance.** The decision board records that V3 does not yet install the pinned Store-dispatch history tracker, attach its prior-turn receipt to actor views, or support the relevant non-GX Copycat/Apex rows. This intersects rank 1 and Regidrago-family policies. Preserve known-empty versus unavailable history, exact attack order, and hook restoration; do not infer the last attack from the current Active's attack list. See [Agent6's Copycat last-turn eligibility / V3 integration gap](../../aichi-2026/2026-11/agent6-copycat-last-turn-eligibility-v3-integration-gap-20261115.md) and [Agent3's Night Watch Copycat provenance gap](../../aichi-2026/2026-11/agent3-night-watch-copycat-provenance-gap-20261115.md).

These dependencies should be prioritized by the number of source ranks and defining policy lines they unlock, not by the number of tests or workflows they generate. The rank-1 first diagnostic remains the existing narrow acceptance path; none of these broader field requirements should be pulled into it unless a concrete current-head acceptance failure proves they are required for that witness.

## Minimum competence evidence before a rank enters the panel

For each exact rank policy, preserve a short, reviewable competence packet:

- **Deck binding:** the constructed native deck is proven to match the exact registered 60 and pinned source identity. For Japanese-only promos, retain the original identity and separately document the research-owned engine mapping/hook.
- **Core-line witnesses:** native Store traces show the policy can execute the deck's defining setup and at least one intended attack or lock line, including the real prompts, payments, and follow-up effects. A source-text or prompt-mock test alone is insufficient.
- **Counterplay witnesses:** at least one source-relevant response line is exercised against a controlled public board state. This tests that the policy does not ignore the deck's actual interaction package.
- **Decision quality review:** an independent reviewer checks that choices are strategically coherent, legal, and based only on the acting player's observations. A legal-action rate by itself is not competence.
- **Natural-terminal evidence:** the policy completes full games without action caps, unresolved prompts, illegal actions, or unexplained abstentions. Preserve losses and censored/error outcomes; never convert them into wins or byes.

These are policy-admission diagnostics, not matchup wins. Passing them does not qualify the candidate's competitive performance.

**Candidate-side field pressure:** the exact 29 available lists contain Field Blower in 9, Megaton Blower in 10, Faba in 7, and Tool Jammer in 5; 20/29 have at least one. The rank-level overlap shows ranks 7 and 29 carry all four categories, while ranks 6 and 24 combine Megaton/Faba/Tool Jammer. See the [Aichi Tool-removal and Tool-suppression map](agent17-aichi-tool-pressure-map-20261117.md). This is source-list coverage only, not an access or matchup result.

**Candidate-side counter-ALS coverage:** do not restrict Tool-pressure tests to rank 7. The candidate suite should include the exact source-rank removal classes identified in the [Tool-pressure map](agent17-aichi-tool-pressure-map-20261117.md): rank 1 Field Blower plus its post-KO disruption branch; ranks 3/7 Snorlax with Tool Jammer and Faba (rank 7 also Field/Megaton); ranks 6/24/29 Iron Thorns with Megaton/Faba/Tool Jammer (rank 29 also Field Blower); rank 30's Field Blower ×3; and the Regidrago Megaton Blower ranks 12/13/14/20/21/32. The suite must distinguish discard-to-discard-pile, Lost Zone removal, and Tool-effect suppression, and must test the candidate's actual recovery/retreat costs. Ranks 6/24/29 also carry Handheld Fan: when its Tool-bearing Active is damaged, it can move an Energy from the attacking Pokémon to the opponent's Bench, including Basic Psychic Energy. Treat this as a separate triggered Energy-transfer scenario, not Tool removal. Plumeria can discard Energy from any opposing Pokémon after its hand cost; Team Flare Grunt targets the opponent's Active; Team Yell Grunt returns Energy to hand. These are required scenario targets, not assertions that the opponent will access the card or that a specific candidate line succeeds.

**Leading-candidate structural risk:** [Hood Shield Shadow Rider v1's coupled Tool-protection / Energy-pressure risk memo](../../aichi-2026/2026-11/agent17-hood-shield-field-pressure-risk-20261117.md) combines the exact candidate 60 with the rank-level Tool and Energy pressure map. It identifies the Iron Thorns/Snorlax package as a priority post-trace challenge. The current rules-text inference is that Stealthy Hood should protect its attached Rule Box Pokémon from Iron Thorns Initialization; the official Japanese Q&A supports analogous protection by Mega Clefable ex's Luminous Wings, but no direct Stealthy Hood ruling was found. Require a paper-rules review and pinned native test before treating it as confirmed. This is not a deck-change instruction or matchup result.

## Challenge-suite and reviewer trust contract

Use [Agent2's operational challenge-suite contract](agent2-policy-challenge-suite-operational-contract-20261117.md) as the source of truth for the hashed suite's contents: versioned suite header, exact source/deck/policy/dependency hashes, actor-visible scenario records, decision envelopes, full cost ledgers, prompt coverage, execution receipts, evidence classes, negative controls, held-out review cases, and pass/blocked/fail semantics. This panel plan supplies rank coverage and family grouping; it does not duplicate or replace that evidence schema.

For production competence attestations, the signed/hash-bound policy plan must also identify:
- `candidatePolicyProducerId` bound to the candidate policy, dependency manifest and challenge-suite hashes;
- `opponentPolicyProducerIdByRank` bound to each available rank's policy, dependency manifest and challenge-suite hashes;
- the bundle producer separately, plus the complete set of policy/bundle producers.

A bundle-level producer ID must not silently stand in for every policy author. Missing policy-producer identities block production competence attestations; missing source ranks remain null/unavailable.

The study requires four globally distinct reviewer roles: candidate-policy competence, opponent-policy competence, post-game paper/clock, and post-game strategy. Each person must hold one role only and be independent of every policy producer, bundle producer and other reviewer. The current production registry `simulation/evaluation/agent45-authorized-reviewers.json` is empty, and the owner has explicitly placed outreach and trust-registry provisioning on hold. **Do not contact candidates, change recruitment status, populate the registry, invent reviewer IDs, or self-authorize.** The empty registry is a future production-attestation / competitive-admission dependency, not a blocker for the single post-acceptance rank-1 diagnostic trace. See [Agent9's producer/reviewer-independence addendum](agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md).

## Field evaluation contract after acceptance

Keep the candidate's 60 and candidate-policy version fixed across the field. For every source rank, cover:

- candidate physical seat 0 and seat 1; and
- candidate actually going first and actually going second.

That produces **128 rank/seat/first-player strata** (32 × 2 × 2). Report each rank separately with sample count, wins/losses/draws, incomplete/error count, uncertainty, and concrete failure modes. Use matched physical deals when comparing candidate architectures or policy versions, and bind every receipt to the exact candidate/source list hashes, policy versions, research SHA, and Twinleaf revision.

Available-rank diagnostics may proceed after the current acceptance/trace sequence with explicit labels: 29 source ranks × 4 strata = 116 possible strata before any rank-specific engine blockers. The three missing ranks remain absent, not byes. Do not publish a full-field aggregate until all 32 exact lists and the required rank-policy coverage are valid. Do not substitute the 24-rank English-normalized secondary field for the owner-selected primary field.

## Statistical claims: reuse the existing 128-stratum contract

Use [the existing statistics index](../../statistics/README.md), not a new estimator. The 128 cells are rank × candidate physical seat × actual first-player assignment; the older 64-cell methods do not certify this seat-balanced estimand without the separate audited orientation/seat-invariance contract.

Keep the claims distinct:

- The **aggregate equal-weight field-mean** fixed-sample all-win floor is 5 games per cell (640 total); the existing one- and two-nonwin aggregate budgets are 8 per cell (1,024) and 10 per cell (1,280).
- The stronger **simultaneous per-matchup 99.5%** design has generic KL-path budgets of 323 / 486 / 602 games per cell for 0 / 1 / 2 nonwins (exact i.i.d. special cases: 323 / 436 / 534). This is not the aggregate field-mean objective.
- A 29-rank diagnostic cannot be presented as a full Top 32 result. Missing ranks 23/25/28 remain absent, never byes or imputed archetype averages.

All of these are prospective evidence budgets. The repository currently has no competitively qualified win-rate sample. Do not claim 99.5% from a balanced aggregate certificate as though it also proved every opponent matchup.

## Sequencing and ownership boundaries

1. **Now:** Agent49 remains the sole PR #58 implementation/dispatch owner. Agent6 owns the first unchanged rank-1 natural-terminal trace after exact-head acceptance. Do not create a competing worker, runner, branch, workflow, or fixture.
2. **After the first trace is reviewed:** freeze its candidate/policy/seed provenance, then begin the rank-policy panel work in parallel by archetype. The first trace is an engineering and policy-diagnostic checkpoint, not a reason to tune the deck from one outcome.
3. **Parallel policy work:** assign shared archetype cores only where useful; keep exact rank configs, source deck hashes, and per-rank competence packets separate. Coordinate to avoid duplicating the existing rank 1/2/10 prototypes.
4. **Field completion:** continue only targeted primary-source recovery for 23/25/28 and evidence needed for physical-print admission. No archetype-based reconstruction or closed-search repetition.
5. **Deck decision:** compare structurally distinct fixed 60s only under the same competent rank policies and matched conditions. No candidate is selected by list similarity, a single trace, or a narrow favorable subset.

## Explicit non-goals

- No new workflow, runner, seed, fixture, or candidate/policy change is proposed by this note.
- No source list is normalized to international Expanded to make the primary field easier.
- No policy is called competent because it completes a few legal actions or wins against a weak generic bot.
- No 24-rank aggregate is presented as a Top 32 result.
- No 99.5% claim is supported by this plan.

## Reusable source references

- [Agent39's 24-rank field composition and full Top 32 archetype skeleton](../../aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md)
- [Machine-readable 32-rank policy-panel manifest](agent17-aichi-policy-panel-manifest-20261117.json)
- [Agent39's normalized diagnostic field and explicit transformations](../../aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md)
- [Agent17's two-Hood deployment / rank-specific Tool-removal synthesis](../../aichi-2026/2026-11/agent17-two-hood-deployment-rule-20261117.md)
- [Agent17's rank-3 Snorlax escape-line analysis](../../aichi-2026/2026-11/agent17-rank3-arven-fieldblower-hood-escape-20261117.md)
- [Agent17's rank-7 Snorlax resource-war analysis](../../aichi-2026/2026-11/agent17-rank7-snorlax-megaton-blower-hood-resource-war-20261117.md)
- [Agent17's Regidrago policy-family variance analysis](agent17-regidrago-policy-family-variance-20261117.md)
- [Agent2's operational challenge-suite content contract](agent2-policy-challenge-suite-operational-contract-20261117.md)
- [Agent9's policy-producer / reviewer-independence addendum](agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md)
- [Agent17's multi-list archetype policy-reuse analysis](agent17-aichi-multilist-policy-variance-20261117.md)
- [Agent17's rank-level Tool-removal / Tool-suppression field map](agent17-aichi-tool-pressure-map-20261117.md)
- [Current decision board](../../README.md)

**Evidence classification:** source archetype/rank counts are repository source-list facts; current prototype coverage and sequencing are shared project status; the policy architecture and competence packet are proposed methodology; no new game, matchup, win-rate, or 99.5% result is claimed.
