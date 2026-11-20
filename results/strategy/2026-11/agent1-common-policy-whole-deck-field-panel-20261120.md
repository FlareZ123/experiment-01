# From candidate architectures to a common-policy Aichi field panel

**Agent 1 · 20 November 2026 · cross-architecture synthesis and experimental design.**  
**Evidence class:** synthesis of existing source lists, card-text/rules research, exact resource calculations, and prior simulator diagnostics. This report adds **no new card-interaction result, native game, matchup estimate, or deck promotion**.

## Executive decision

The repository has several materially different fixed-60 hypotheses, but no evidence currently supports selecting one as the final deck. **Hood Shield Shadow Rider v1 remains the leading challenger hypothesis, not a proven best deck.** The Enamorus/Guardian arm is a separate, unvalidated whole-60 experiment. Iron Thorns Psychic Reserve v3 has the strongest current *developmental native differential* among the alternative fixed-60s, but its narrow, partially matched cohort is not paper-qualified evidence. Temple Shadow Rider, New Moon Lockbreaker, Exeggutor/Vileplume Blockade, Crustle Ascension, Archie/Baxcalibur, and the Sentinel/Vileplume variants remain distinct engines with materially different evidence and failure modes. They should not be collapsed into one hybrid package or ranked by opening-access percentages.

The highest-value next step is not another isolated card test. It is to finish the already-owned canonical V3 / first-natural-terminal-trace sequence, then evaluate whole decks under one shared, actor-relative, seat-symmetric policy. Preserve the existing ownership split: Agent49 owns canonical V3 acceptance/dispatch; Agent6 owns the first registered natural-terminal trace; Agent19 owns the recorder/worker boundary. This synthesis does not authorize changes to their branches, policies, fixtures, seeds, workflows, or Twinleaf.

Current hard limits remain:
- 29/32 original Aichi Top 32 lists have exact source transcriptions; ranks 23, 25 and 28 remain missing.
- The primary benchmark is the owner's custom cross-format challenge: an English paper Expanded-legal candidate against the **unchanged original Japanese Extra** opponent lists. It is not a sanctioned Expanded-vs-Expanded tournament result.
- Five authenticated original lists contain Japanese-only promotional identities and are not unchanged international-Expanded-legal opponents. The 24-list strict Expanded diagnostic is a separate estimand, not a replacement for the primary 32-rank challenge.
- No original physical-source opponent is paper-admitted; there are zero competitively paper-qualified games, no selected final 60, and no demonstrated 99.5% field win rate.

This document complements, rather than replaces, the existing [cross-rank candidate decision brief](../../aichi-2026/fixed-candidate-crossrank-decision.md), [lock-architecture field synthesis](../../aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md), and [Enamorus board-shield hypothesis](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md). It focuses on how those separate architectures should enter one comparable whole-deck evaluation.

## 1. The human concepts imply a stateful policy, not a card score

The repository's [human-developed strategic concepts](../../../resources/human_concepts.md) provide a useful common language, but the concepts are hypotheses to operationalize and validate—not an authoritative ranking of cards.

- **UDP (Undiscardable Due to Play):** preserve the minimum physical copies needed for a live plan. The same card name can move from protected to expendable when another copy is established or the plan becomes impossible.
- **DCI (Discard Capable Index):** discardability depends on the current matchup, turn, zones, Prize knowledge, intended line, and remaining copies. It is not a permanent property of a card name.
- **AMR (Active Move Realism):** a theoretically reachable action is not executable merely because a graph path exists. It must be payable from the actual hand, legal under current locks, compatible with the Active/Bench layout, and worth its opportunity cost.
- **K0/K1:** before the owner's first real deck search, the policy must not know exact Prize composition. After a genuine owner-deck search, the owner may infer its own Prize cards from the known 60 and visible zones. This is an information transition, not permission to inspect hidden game state.
- **ALS (Archetype-Line-Specifics):** a deck is a set of executable sequences and resource obligations, not an unordered collection of individually strong cards.
- **Connector domination:** every search, Supporter, draw effect, discard payment, and once-per-turn resource excludes competing uses. Reachability without opportunity cost systematically overstates strength.
- **Discrete tactical value and lock topology:** a low-frequency gust, lock-clear, attack-copy, or prevention effect may decide a game; Ability, Item, Supporter, Stadium, Tool, and attack-origin restrictions are not interchangeable.

The appropriate shared representation is therefore a **state-indexed, physical-copy-aware line planner**:

1. Track each own physical copy by zone and, where relevant, its minimum reserved multiplicity for each live ALS.
2. Track the legitimate owner-knowledge epoch (K0/K1), without exposing opponent hidden zones, native internal state, or physical shuffle seeds to the decision worker.
3. Represent a candidate line by its prerequisites, timing, payments, Active/Bench footprint, Supporter use, Energy demands, lock dependencies, and opponent responses.
4. At each actual prompt, compare all legal physical choices and their downstream alternatives. A search target being available does not prove that it is the best use of the connector.
5. Recompute DCI/UDP when a copy is used, a line is completed or invalidated, a lock changes, a Prize is taken, or new public matchup information arrives.

Do not rebuild abstractions already developed elsewhere. Agent44's [discard-liquidity synthesis](../../als/discard-liquidity-and-copy-aware-payment-synthesis-20261107.md) already connects DCI/UDP/AMR to temporal, physical-copy-aware payment frontiers. Agent30's [K0/K1 replanning synthesis](../../als/agent30-k1-owned-search-replanning-synthesis.md) distinguishes stale-plan failure from bad prompt-local target selection. Agent50's [Hood DCI/AMR policy specification](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) is a concrete archetype-specific application, but explicitly not a validated pilot.

## 2. Whole-deck hypothesis portfolio

The following are distinct hypotheses, not a ranking. Their reported mathematics and staged tests answer narrow questions; none demonstrates completed-game strength.

| Fixed 60 / family | Whole-deck thesis | Existing evidence and the decisive unresolved test |
|---|---|---|
| **Champion Shadow Rider reference** — 18 Pokémon / 31 Trainers / 11 Psychic Energy | The published rank-1 list is the reference engine for Psychic acceleration and VMAX pressure. It is useful as a stable benchmark, not as an automatic final choice. | It is an exact mirror of rank 1. Under identical policies and symmetric seat/deal sampling, that mirror has 50% expected wins, placing the equal-rank field mean at no more than 98.4375% if all other ranks are assumed guaranteed wins. This is a conditional mathematical ceiling, not a measured mirror result. See [reference 60](../../aichi-2026/benchmark-shadow-rider.md) and [field evidence](../../statistics/field-evidence.md). |
| **Hood Shield Shadow Rider v1** — 18 / 31 / 11 | Retain four Shadow Rider V and four VMAX, use two Stealthy Hood plus Arven to protect the Underworld Door engine, and retain matchup lines including Mimikyu Copycat → opponent Regidrago Apex Dragon → the deck's own Dialga-GX Timeless-GX. This is the current leading challenger hypothesis. | The exact 60, source/printing checks, restricted opening arithmetic, and staged Hood/lock tests exist. They do not show a competent full-game win. At least one named hard Tool answer appears in 20/29 published source lists; Hood also competes with Forest Seal Stone and Float Stone for Tool/Arven capacity. The Copycat line is conditional on the opponent's prior-turn attack, Dialga/Mimikyu access, Fairy Zone, Energy, and the unused GX allowance. See [Hood candidate](../../aichi-2026/candidate-hood-shadow-rider.md), [Dialga counter-ALS audit](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dialga-slot-audit-20261113.md), and [cross-rank decision brief](../../aichi-2026/fixed-candidate-crossrank-decision.md). |
| **Temple Shadow Rider v1** — 18 / 31 / 11 | Trade some consistency for two Temple of Sinnoh and Active Wobbuffet, aiming to disrupt Special Energy and certain opposing Abilities. | The 60 has exact opening/resource calculations and printed-text reasoning. The fourth VMAX cut lowers the restricted probability of retaining two fetchable VMAX for Radiant Eternatus from 50.65944% to 46.38691% in the documented model. Wobbuffet also suppresses the candidate's own non-Psychic Radiant Eternatus while Active, so its exit and the intended attack line must be evaluated together. See [Temple candidate](../../aichi-2026/candidate-temple-shadow-rider.md) and [cross-rank decision brief](../../aichi-2026/fixed-candidate-crossrank-decision.md). |
| **Hooded Guardian Shadow Rider v1** — 19 Pokémon / 30 Trainers / 11 Psychic Energy | Add Enamorus V and cut Quick Ball from Hood Shield v1. The hypothesis is a Hood-protected board-wide Ability shield for Psychic-Energy-attached Pokémon, rather than relying only on individual Hood targets. | The exact arm preserves Pokémon Ranger because Budew's attack-origin Item restriction is a different axis from Pokémon Ability suppression. The 60 is untested and not nominated. The Guardian line does not remove player-level restrictions: it does not clear Budew's attack-origin Item restriction, Vileplume AOR 3's Ability-origin Item lock, or Stoutland's Supporter lock; it also does not stop Stadium effects. It costs a two-Prize Basic, Bench space, Energy/attachment bandwidth, and the ninth search/discard connector. **Do not transfer access percentages from other Enamorus variants to this Quick Ball-cut 60.** Use Agent43's [canonical Enamorus report](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md) and Agent44's [exact slot addendum](../../aichi-2026/2026-11/agent44-enamorus-hood-boardwide-ability-shield-20261119.md), not a duplicate rules analysis. |
| **New Moon Lockbreaker v1** — 19 Pokémon / 35 Trainers / 6 Psychic Energy | A different Mewtwo & Mew-GX Perfection engine built around a turn-two hand-lock ALS, with two Field Blower and two Canceling Cologne as a proposed four-slot cross-lock package. | The base source is a first-person 52nd-place Aichi report (self-reported 6–2, including 4–0 Regidrago, with losses to Iron Thorns and Raichu/Electrode), not a Top 32 list. Staged Store tests verify narrow lock-removal mechanics, not games. The Secret Box access model is highly sensitive to whether three actual hand cards are strategically disposable; the earlier cost-free resource path is an upper bound. Item lock can strand both new counters. See [source/line report](../../als/new-moon-perfection-aichi-2026.md), [fixed Lockbreaker 60](../../als/new-moon-lockbreak-60-candidate.md), and [discardability frontier](../../als/new-moon-secret-box-discardability-frontier.md). |
| **Exeggutor / Vileplume Blockade v2** — 25 Pokémon / 28 Trainers / 7 Energy | Replace the rank-2 Stoutland Stage-2 Supporter-lock branch with a Stage-1 Exeggutor attack that imposes a next-turn Supporter restriction, while retaining the Vileplume Item-lock engine. | Exact Prize-stage presence improves in the specified model, but the candidate increases fragile-30-HP-only opening exposure and requires Exeggutor to become Active and attack. The native-preferred v2 exists because one v1 Exeggcute printing is absent from pinned Twinleaf; only a staged mechanic witness is planned. No native full game or competitive result exists. See [Exeggutor challenger](../../als/agent18-exeggutor-blockade-vileplume-challenger-20261102.md). |
| **Crustle Ascension** — 11 Pokémon / 37 Trainers / 12 Energy | A single-Prize Crustle/Mimikyu shell designed to challenge the three published all-Special-Energy Iron Thorns lists through a narrow defensive and Stadium/attack-cost plan. | Exact opening-resource enumeration and printing checks exist; the frozen candidate's narrowly defined Dwebble/Grass/Crustle event is 19.48739% unconditionally in its stated model. This is not an attack or win probability. The 70-HP Dwebble start, non-ex attackers, Ability denial, Energy disruption, Stadium replacement, and clock are unresolved. See [Crustle challenger](../../als/crustle-mimikyu-all-special-thorns-structural-challenger.md). |
| **Archie's Baxcalibur / Umi-Ex** — 16 Pokémon / 35 Trainers / 9 Energy | A combo architecture aiming to establish Baxcalibur with Archie's Ace in the Hole, accelerate Water Energy, and use Kyogre Aqua Storm with the Pidgeot V shuffle line. | The 60 is transcribed from a January first-person 5–2 primer and is not the distinct May Aichi 48th-place list. English proxy printings were checked against the supplied card pool; the candidate is competitively untested and not an authenticated Top 32 opponent. See [fixed proxy 60](../../als/agent2-archie-baxcalibur-umi2026-english-proxy-60.md). |
| **Iron Thorns ex / Mimikyu Psychic Reserve v3** — 5 Pokémon / 44 Trainers / 11 Energy | A lock-first single-Prize-pressure shell with four Iron Thorns ex and Mimikyu; v3 replaces one Player's Ceremony with a second Basic Psychic Energy to improve Mimikyu/Psychic access while retaining the original Iron Thorns, Mimikyu and Jet Energy core. | This has the strongest current *developmental native* comparison among the alternative fixed-60s: 24 attempts per arm across ranks 6/24/29/1/5/13; v1 recorded 9 natural wins, 14 losses, 1 engine error; v3 recorded 13 wins, 11 losses, 0 errors. Only 18/24 groups matched source-deal fingerprint and actual first player, with 17/18 matched pairs finishing in both arms; the sharp no-imputation interval on those matched deals is [+1,+2] v3-minus-v1 native wins. Rank 6 had more Ghost Eye actions but no added wins; rank 29 had fewer attacks and fewer wins. This is not a paper win-rate result: no independent paper qualification or official clock, and Japanese Palace Book printing/admission remains unresolved. See [fixed v3 60](../../aichi-2026/candidate-iron-thorns-psychic-reserve-v3.md) and [native comparison](../../methodology/2026-11/agent12-psychic-reserve-v3-native-20261109.md). |
| **Sentinel / Alolan Muk three-lock Vileplume** — rank-2-derived fixed 60 | Layer Active Stoutland Supporter lock, Benched Vileplume Item lock, and Alolan Muk Basic-Pokémon Ability suppression, with Hood protection on key pieces. | A fixed two-slot challenger removes Mr. Mime and Counter Gain for Alolan Grimer/Muk. In 12 bounded native attempts over ranks 5/6/10, the original rank-2 list had 3 natural terminals and 3 capped attempts; the Muk variant had 0 terminals and 6 capped attempts, with Muk on the final Bench in only 2/6 candidate attempts. This is a negative practical-access/tempo warning, not a 0% win rate or paper matchup. Muk also suppresses the owner's Basic Relicanth Memory Dive Ability, removing an original control line. See [three-lock candidate](../../methodology/2026-11/agent50-sentinel-alchemy-triplelock-candidate-20261110.md). |
| **Sentinel / Spiritomb-Relicanth Vileplume** — rank-2-derived fixed 60 | Replace one Mr. Mime with Spiritomb to suppress opposing Basic Pokémon V Abilities while preserving the owner's Relicanth and other non-V Basic Abilities. | In 12 bounded native attempts over ranks 5/6/10, the original rank-2 list had 3 terminals / 3 capped; Spiritomb had 2 terminals / 4 capped. Six source-deal fingerprints matched, but the finished/censored sample does not establish an ordering. The native lock interaction is real staged evidence, not a natural-game frequency or paper win-rate. See [Spiritomb fixed 60 and native cohort](../../methodology/2026-11/agent50-sentinel-spiritomb-basicv-lock-candidate-20261110.md). |

Other lock branches—including Dhelmise/Hide 'n' Sneak and additional Sentinel/Vileplume variants—are documented in Agent35's [lock-architecture synthesis](../../aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md). Keep lock breadth, Active/Bench placement, self-suppression, Tool protection, player-level effects, and Stadium effects distinct. They are not a universal package to bolt onto Shadow Rider.

### The whole-deck lesson

The strongest current research is not a smooth card-value model. It is a portfolio of **conditional resource systems**. A candidate must establish its own line, keep the relevant copies and connectors available, pay real costs, and survive the opponent's best legal response. A one-card substitution can be a useful controlled hypothesis, but it is not a meaningful improvement until its gain and the displaced card's lost function are evaluated across the full deck and field.

## 3. A single common-policy architecture

Use one reusable actor-relative decision core, with role-relative observations and deck-aware line descriptions. The same core should pilot either physical seat, but opponent policies need **immutable rank-specific configurations** bound to each exact source 60. Do not create 32 unrelated hand-written engines, and do not pretend one generic bot or one archetype label is a competent policy for every rank.

### Required decision state

- Own hand, board, discard, deck-search knowledge epoch, Prizes when legitimately inferable, Energy attachments, used once-per-game/once-per-turn resources, and actual prompt choices.
- Public opponent board, Active/Bench positions, attached Tools/Energy, Stadium, public discard, attack/effect history, visible lock effects, and public archetype evidence from mulligans and early board.
- Candidate's current ALS state: prerequisites met, copies reserved, remaining payments, timing windows, and failure/alternative branches.
- A state-indexed DCI/UDP frontier for actual physical copies, not a single permanent value per card name.
- AMR checks for legality, actual payment, Active/Bench capacity, Supporter contention, lock restrictions, and competing uses of search/draw effects.

The worker must receive only the acting player's allowed observation plus public receipts. It must never receive the opponent's hidden hand/deck/Prizes, native game state, or physical RNG/seed. K1 may be derived only from an authenticated owner-deck search. The same policy code should be able to pilot either seat; physical seat, candidate first/second, and game outcome must not leak into decisions.

### Adapter boundary to reuse after the trace

Do not implement a parallel player or observation protocol. Agent5's existing post-trace contract already identifies the six required seams for the shared actor-relative PUCT adapter: actor-relative re-determinization; preservation of the acting seat's own K1 ledger; physical-seat-keyed decklist priors; authenticated public attack history attached before observation hashing; injective JSON canonicalization; and settlement of the complete prompt chain before PUCT advances. These are important because the Copycat/Dialga ALS depends on a public prior-turn attack receipt, while a shared tree alternates actors and must not reverse candidate/source priors or leak the other player's private ledger. Reuse [Agent5's consolidated six-seam contract](../../../communications/broadcast/2026-11/20261120T0111Z_agent5-posttrace-shared-puct-integration-contract.md) and its [actor-relative redeterminizing PUCT report](../../methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md); do not expand this into another pre-trace adapter task.

### Shared policy capability tests

Use the existing frozen rank-12 challenge cases as regression seeds for reusable capabilities, not as training labels or a new corpus. They already cover attack choice, Noivern discard opportunity cost, Prize-aware gust, conditional removal, self-lock timing, prior-turn attack receipt, hidden-Prize boundaries, unsupported Phantom Dive allocation, and Crispin/VS Seeker contention. Keep the four held-out cases sealed.

Before field comparison, the common policy must also execute representative source-dealt ALS continuations for distinct opponent families: rank-2 Bunnelby/TM: Evolution; rank-5 Mew/Genesect's multi-prompt Guzma → target/promotion → free-retreat → Techno Blast reset; rank-6 Iron Thorns/Guzma & Hala; rank-11 Tool-Garbodor; rank-10 Regidrago/Apex Dragon; and rank-26 Meloetta's fast attack threat. The rank-5 branch must score the fully settled composite action and reject an illegal second retreat when a Block effect makes the promoted Pokémon unable to retreat. These are capability requirements, not separate rank-specific policy branches. A common policy may use a public opponent-archetype posterior and generic card/line semantics, but it must not know hidden zones or receive a hand-authored action script keyed to the opponent's rank.

The policy must record both **opportunity** and **execution**: no-opportunity, unavailable source, illegal action, rejected prompt, payment failure, missed target, action pass, capped turn, and genuine completed effect must be distinct. A missing action opportunity is not a strategic failure, but it is not a successful counterline either.

### Opponent-policy readiness is a separate admission gate

A shared core does not eliminate the need for a competent, exact-list-bound opponent policy at each rank. Reuse code only where source-list differences are configuration; keep each rank's deck hash, setup/mulligan priorities, ALS, counterplay, endgame, dependency manifest, challenge suite, and competence witness distinct. Agent17's exact multiset comparison demonstrates why archetype labels are insufficient: Snorlax ranks 3/7 differ by 34 substitutions; Iron Thorns ranks 6/29 differ by 5 while rank 24 is 14–18 away; Absol Garbodor pairwise distances range 11–28; Raichu/Electrode ranks 4/17 differ by 21. These are code-reuse boundaries, not strategic-strength scores.

The latest published opponent-panel inventory I found (Agent17, 17 November) identifies prototypes for only ranks 1, 2, 3 and 10. **None is independently competent or competitively admitted**: rank 1 has direct V8-harness coverage but no current-head Node/Actions pass; rank 2's worker tests pass but five strategic-policy gaps remain; rank 3's tests are synthetic and its suite is not bound; rank 10 has local tests but no Actions/native game and deliberately abstains on Phantom Dive allocation. No prototype has a native complete-game result or independent competence attestation. Recheck the live inventory after the first trace; do not treat 4/32 prototypes as 4/32 ready opponents.

Therefore, the 29-rank smoke panel below is a **target**, not currently executable. A rank enters only after its exact source list, rank-specific immutable configuration, challenge suite/dependencies, required engine prompt support, and independent competence evidence are admitted. If any gate is missing, mark that rank blocked/unsupported and do not silently run a weak generic fallback. The production policy plan must bind candidatePolicyProducerId, opponentPolicyProducerIdByRank, and the bundle producer separately; one bundle author must not stand in for every policy producer. Candidate-policy competence, opponent-policy competence, paper/clock, and post-game strategy reviewers must be distinct from one another and independent of every producer. The current production reviewer registry is reported empty, with outreach on hold; do not self-authorize competence or paper/clock reviews. These future production-admission dependencies do not block the already registered rank-1 trace.

See [Agent17's rank-complete opponent-policy plan](../../methodology/2026-11/agent17-aichi-opponent-policy-panel-plan-20261117.md), [multi-list policy-reuse boundaries](../../methodology/2026-11/agent17-aichi-multilist-policy-variance-20261117.md), [Agent42's readiness veto map](../../methodology/2026-11/agent42-posttrace-opponent-policy-readiness-veto-map-20261117.md), and [reviewer-independence requirements](../../methodology/2026-11/agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md).

## 4. Staged path to the first useful field panel

The following sequence respects the current integration stopline and avoids rerunning accepted engineering work.

### Stage A — finish the existing first-trace gate

1. Agent49 completes the exact combined V3 acceptance on the intended SHA, including the required contract-only and native no-game witness gates.
2. Before dispatch, require the owner-controlled public-seed authorization and valid `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` prerequisite; require actual `encrypted-full` mode (sanitized-only success is not acceptance). Agent6 captures the one registered natural-terminal trace with the actor-only worker boundary and the Agent19/Agent45 recorder/receipt semantics. Keep raw owner-only observations and hidden zones encrypted-only; never publish plaintext.
3. Review that trace for a legal action sequence, exact owner-observation provenance, correct physical action/payment/settlement, terminal cause, and preserved failed-attempt evidence.

The first trace is **pipeline acceptance**, not evidence that its winner or deck is competitive. Do not change the candidate, policy, seed schedule, physical-seat mapping, or Twinleaf pin while this gate is being completed.

### Stage B — registered reference comparison

After the trace is accepted and reviewed, use the already described matched comparison: the unchanged Hood Shield Shadow Rider v1 against the exact rank-1 source list, under the **same frozen registered candidate/opponent policy bundle** used for the diagnostic. Preserve the registered source deals and policy/engine hashes; sample both physical seats and both actual first-player assignments; record all attempted, failed, capped, unfinished, and completed games. Do not replace this bundle with the future PUCT policy mid-comparison. Do not call this a field panel or a strength result.

This step establishes whether the end-to-end runner can produce comparable whole-game outcomes under a fixed policy. It does not validate every candidate architecture.

### Stage C — 29-list smoke panel

Only after Stage B is reviewed, Agent5's post-trace shared actor-relative PUCT adapter has been integrated and passed its bounded regressions, **and each included rank has passed the separate opponent-policy readiness gate above**, run a prospectively frozen **four-game smoke panel against each of the 29 available source lists**: one game in each cell of candidate physical seat 0/1 × candidate actually first/non-first. This is 116 games total, with a unique independent public seed per game. Freeze the candidate 60 and shared candidate-policy hash across all ranks; use one independently assessed, exact-list-bound opponent policy per rank, frozen across that rank's four strata, with common information and decision-compute limits. If only a subset of rank policies is ready, report a blocked coverage matrix rather than treating missing policy coverage as a game result.

This panel is for coverage and gross-failure detection, **not** a win-rate estimate. It should expose unsupported mechanics, opponent-policy failures, seat/start asymmetries, missing source-specific ALS, action caps, and candidate lines that never become realistically payable. A rank-specific opponent policy may encode that opponent's deck-level ALS; the candidate must not receive a rank-specific action script or change its 60. Keep the following capability stressors visible in the per-rank failure taxonomy:

- **Rank 6 Iron Thorns:** Active Rule-Box Ability suppression and the source's Special-Energy/Stadium pressure.
- **Rank 11 Tool-Garbodor:** Tool-conditioned global Ability suppression, Tool targeting/removal, and the candidate's Hood/Arven response.
- **Rank 2 or 15 Vileplume control:** distinguish Item denial, attack-origin Item restriction, and Supporter denial; test actual source ALS rather than a static lock flag.
- **A Regidrago source rank (e.g. rank 10):** test the 11-placement family and the candidate's Copycat/Dialga counter-ALS under actual prior-turn attack history.
- **Rank 5 Mew/Genesect and rank 26 Meloetta:** test a composite multi-prompt reset line and a fast-attack / fragile-start failure family, so the smoke panel is not only a lock test.

Rank 31 Dusknoir/Chimecho is a useful additional diagnostic for the proposed Enamorus/Guardian arm, but do not prioritize it unless the baseline exposes a relevant Ability-effect failure. The exact Enamorus/Quick Ball-cut 60 should be compared only if baseline losses are attributable to opposing Pokémon Abilities; if losses arise from Budew, Vileplume, Stoutland, Stadium, Tool removal, Energy/Bench congestion, or the Regidrago counter-line, the Enamorus shield does not answer that cause.

Record the coin result, chooser, actual starter, and physical-seat mapping separately. The paper setup procedure separates physical seat from the actual first player. A forced 50/50 equal-start design is a useful sensitivity estimand, but it is not automatically the authentic tournament-protocol estimand if the frozen chooser policy makes matchup-dependent first-player choices. Predeclare which estimand is primary; never infer play/draw from physical-seat alternation.

### Stage D — deepen the available field, then recover the missing ranks

If the 116-game smoke panel is clean enough to justify more compute, expand the same unchanged candidate/policy pair across the 29 authenticated original lists, retaining every rank's own outcomes, uncertainty, and censored/unsupported counts. A 20-game-per-rank four-cell allocation on 29 lists is 580 games, but remains a **published-source diagnostic**, not a full Top 32 confirmatory result. Do not substitute byes or reconstructed archetypes for ranks 23, 25, or 28. The five Japanese-promo lists remain in the primary cross-format challenge; the 24-list strict Expanded diagnostic is reported separately.

### Stage E — confirmatory evidence after all 32 lists and paper admission

The target must be predeclared as an **equal-rank field-average** objective with explicit treatment of actual first/second turns, physical seat, ties, timeouts, and unfinished games. The equal-start sensitivity and authentic tournament-protocol start distribution are distinct estimands if the coin-toss chooser's choice is matchup-dependent. Record coin result, chooser, actual starter, and physical seat independently, and state which weighting is primary. Do not silently switch to historical metagame weights or a 24-rank denominator.

For a transparent independent-game design, the existing 18 November derivation shows that **19 zero-loss games per rank (608 total)** is sufficient for a one-sided 95% test of the equal-weight 32-rank aggregate 99.5% target. For practical four-cell balance (candidate in either physical seat × candidate actually first/second), use **20 games per rank (five per cell; 640 total)**. With zero losses, that design's one-sided lower bound is approximately 99.5330%. This is an aggregate-field statement, not a 99.5% guarantee for each individual matchup.

If any loss, draw, timeout, or unfinished game occurs, do not reuse the zero-loss shortcut. For the same 128-stratum independent-game model, Agent17's existing exact designs give **8 games per cell (1,024 total) for at most one nonwin** and **10 games per cell (1,280 total) for at most two nonwins**. Those guarantees require fixed policies/engine, equal cell quotas, and independent Bernoulli games with fixed per-cell probabilities; they do not apply to matched-deal clusters, changing policies, or post-hoc sample allocation. Otherwise use a predeclared stratified exact/profile-likelihood bound or another validated method and report every rank separately. If paired outcomes or a paired-seat sequential process are used, follow that process's exact randomization and dependence assumptions; do not count correlated games as independent Bernoulli trials. Agent37's [paired-seat v3 method](../../statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md) specifically requires a fresh fair pair-orientation coin and complete pairs; physical-seat alternation alone is insufficient. Do not mix that method's estimand or proof with an independently balanced four-cell design.

The full confirmatory record must freeze and publish the exact candidate 60 and opponent 60 hashes, candidate/opponent policy hashes, Twinleaf commit, research revision, rules hooks, source-deal/seed registry, physical seat, actual first-player assignment, game clock/scoring, all outcomes, exclusions, and uncertainty calculation. Development runs select candidates; a separately seeded holdout cohort supports any final claim.

## 5. Promotion criteria and anti-patterns

A candidate may advance only when the **whole deck** demonstrates that it can:

1. execute its intended ALS under actual source-dealt conditions;
2. preserve the resources and connectors needed for later turns;
3. respond to at least two distinct hard matchup families with competent opponent replies;
4. avoid catastrophic self-lock, Bench/Active, Prize, Energy, Tool, Stadium, and Supporter-contestation failures;
5. produce completed, correctly scored, paper-clock-compatible games under the same policy standard as its competitors; and
6. retain acceptable per-rank outcomes across the entire available field, not just the matchup its tech was designed to beat.

Do not promote:
- raw access/visibility percentages as setup or win probabilities;
- a staged Store fixture or engine terminal as a competitive game;
- an opponent deck's inclusion of a counter as proof the counter was drawn or played;
- a candidate's inclusion of a response card as proof the response is usable under the current lock;
- a rank-specific scripted response as a shared competitive policy;
- a 24- or 29-list result as a full Top 32 result;
- an improved lock matchup as a field improvement without its losses against Regidrago, Meloetta, Item/Supporter lock, and other non-lock axes.

## 6. Immediate ownership and reuse

- **Agent49:** canonical V3 exact-SHA acceptance and dispatch.
- **Agent6:** the single registered natural-terminal trace and its review.
- **Agent19 / Agent45:** existing recorder, action-ordinal, actor-observation, and validation-receipt boundary.
- **Agent5:** post-trace shared PUCT integration contract; reuse the existing rank-12 challenge cases as regressions, not training labels.
- **Agent35 / Agent41 / Agent43 / Agent50:** existing lock, Enamorus, and Hood DCI/AMR syntheses. Reuse their canonical reports; do not create parallel card-level analyses.
- **Agent1:** this cross-architecture panel synthesis. No implementation or gate takeover.

No new card probe, candidate change, policy change, fixture, runner, workflow, CI dispatch, or submodule update is proposed here. The next useful work is to carry the already-defined whole-deck panel through the existing acceptance sequence without compromising its actor-only information boundary or evidence labels.

## References

- [Current decision board](../../README.md)
- [Human strategic concepts](../../../resources/human_concepts.md)
- [Cross-rank candidate decision](../../aichi-2026/fixed-candidate-crossrank-decision.md)
- [Iron Thorns Psychic Reserve v3 fixed 60](../../aichi-2026/candidate-iron-thorns-psychic-reserve-v3.md)
- [Iron Thorns Psychic Reserve v3 native comparison](../../methodology/2026-11/agent12-psychic-reserve-v3-native-20261109.md)
- [Sentinel / Alolan Muk three-lock candidate](../../methodology/2026-11/agent50-sentinel-alchemy-triplelock-candidate-20261110.md)
- [Sentinel / Spiritomb-Relicanth candidate](../../methodology/2026-11/agent50-sentinel-spiritomb-basicv-lock-candidate-20261110.md)
- [Agent12's overlapping whole-deck / panel synthesis](../../aichi-2026/2026-11/agent12-whole-deck-hypotheses-and-field-panel-20261120.md)
- [Agent17's rank-complete opponent-policy plan](../../methodology/2026-11/agent17-aichi-opponent-policy-panel-plan-20261117.md)
- [Agent17's multi-list policy-reuse boundaries](../../methodology/2026-11/agent17-aichi-multilist-policy-variance-20261117.md)
- [Agent42's opponent-policy readiness veto map](../../methodology/2026-11/agent42-posttrace-opponent-policy-readiness-veto-map-20261117.md)
- [Agent9's independent reviewer / producer requirements](../../methodology/2026-11/agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md)
- [Agent41's policy and estimand addendum](../../methodology/2026-11/agent41-first-common-policy-field-panel-plan-20261120.md)
- [Lock-architecture field synthesis](../../aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md)
- [Enamorus board-shield hypothesis](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md)
- [Hood DCI/AMR policy specification](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md)
- [Discard-liquidity synthesis](../../als/discard-liquidity-and-copy-aware-payment-synthesis-20261107.md)
- [K0/K1 owner-search synthesis](../../als/agent30-k1-owned-search-replanning-synthesis.md)
- [Field evidence standard](../../statistics/field-evidence.md)
- [99.5% aggregate confidence derivation](../../2026-11/field-winrate-995-confidence-bound.md)
- [Paired-seat v3 rejection method](../../statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md)
