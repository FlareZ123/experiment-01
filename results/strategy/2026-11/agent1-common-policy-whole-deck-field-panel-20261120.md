# From candidate architectures to a common-policy Aichi field panel

**Agent 1 · 20 November 2026 · cross-architecture synthesis and experimental design.**  
**Evidence class:** synthesis of existing source lists, card-text/rules research, exact resource calculations, and prior simulator diagnostics. This report adds **no new card-interaction result, native game, matchup estimate, or deck promotion**.

## Executive decision

The repository has several materially different fixed-60 hypotheses, but no evidence currently supports selecting one as the final deck. **Hood Shield Shadow Rider v1 remains the leading challenger hypothesis, not a proven best deck.** The Enamorus/Guardian arm is a separate, unvalidated whole-60 experiment; Temple Shadow Rider, New Moon Lockbreaker, Exeggutor/Vileplume Blockade, Crustle Ascension, and Archie/Baxcalibur represent other distinct strategic engines. They should not be collapsed into one hybrid package or ranked by opening-access percentages.

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
| **Hooded Guardian Shadow Rider v1** — 19 Pokémon / 30 Trainers / 11 Psychic Energy | Add Enamorus V and cut Quick Ball from Hood Shield v1. The hypothesis is a Hood-protected board-wide Ability shield for Psychic-Energy-attached Pokémon, rather than relying only on individual Hood targets. | The exact arm preserves Pokémon Ranger because Budew's attack-origin Item restriction is a different axis from Pokémon Ability suppression. The 60 is untested and not nominated. The Guardian line does not answer player-level Supporter locks, attack-origin Item restrictions, or Stadium effects; it costs a two-Prize Basic, Bench space, Energy/attachment bandwidth, and the ninth search/discard connector. **Do not transfer access percentages from other Enamorus variants to this Quick Ball-cut 60.** Use Agent43's [canonical Enamorus report](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md) and Agent44's [exact slot addendum](../../aichi-2026/2026-11/agent44-enamorus-hood-boardwide-ability-shield-20261119.md), not a duplicate rules analysis. |
| **New Moon Lockbreaker v1** — 19 Pokémon / 35 Trainers / 6 Psychic Energy | A different Mewtwo & Mew-GX Perfection engine built around a turn-two hand-lock ALS, with two Field Blower and two Canceling Cologne as a proposed four-slot cross-lock package. | The base source is a first-person 52nd-place Aichi report (self-reported 6–2, including 4–0 Regidrago, with losses to Iron Thorns and Raichu/Electrode), not a Top 32 list. Staged Store tests verify narrow lock-removal mechanics, not games. The Secret Box access model is highly sensitive to whether three actual hand cards are strategically disposable; the earlier cost-free resource path is an upper bound. Item lock can strand both new counters. See [source/line report](../../als/new-moon-perfection-aichi-2026.md), [fixed Lockbreaker 60](../../als/new-moon-lockbreak-60-candidate.md), and [discardability frontier](../../als/new-moon-secret-box-discardability-frontier.md). |
| **Exeggutor / Vileplume Blockade v2** — 25 Pokémon / 28 Trainers / 7 Energy | Replace the rank-2 Stoutland Stage-2 Supporter-lock branch with a Stage-1 Exeggutor attack that imposes a next-turn Supporter restriction, while retaining the Vileplume Item-lock engine. | Exact Prize-stage presence improves in the specified model, but the candidate increases fragile-30-HP-only opening exposure and requires Exeggutor to become Active and attack. The native-preferred v2 exists because one v1 Exeggcute printing is absent from pinned Twinleaf; only a staged mechanic witness is planned. No native full game or competitive result exists. See [Exeggutor challenger](../../als/agent18-exeggutor-blockade-vileplume-challenger-20261102.md). |
| **Crustle Ascension** — 11 Pokémon / 37 Trainers / 12 Energy | A single-Prize Crustle/Mimikyu shell designed to challenge the three published all-Special-Energy Iron Thorns lists through a narrow defensive and Stadium/attack-cost plan. | Exact opening-resource enumeration and printing checks exist; the frozen candidate's narrowly defined Dwebble/Grass/Crustle event is 19.48739% unconditionally in its stated model. This is not an attack or win probability. The 70-HP Dwebble start, non-ex attackers, Ability denial, Energy disruption, Stadium replacement, and clock are unresolved. See [Crustle challenger](../../als/crustle-mimikyu-all-special-thorns-structural-challenger.md). |
| **Archie's Baxcalibur / Umi-Ex** — 16 Pokémon / 35 Trainers / 9 Energy | A combo architecture aiming to establish Baxcalibur with Archie's Ace in the Hole, accelerate Water Energy, and use Kyogre Aqua Storm with the Pidgeot V shuffle line. | The 60 is transcribed from a January first-person 5–2 primer and is not the distinct May Aichi 48th-place list. English proxy printings were checked against the supplied card pool; the candidate is competitively untested and not an authenticated Top 32 opponent. See [fixed proxy 60](../../als/agent2-archie-baxcalibur-umi2026-english-proxy-60.md). |

Other control branches—including Sentinel/Vileplume, Alolan Muk, Spiritomb, Dhelmise/Hide 'n' Sneak, and Iron Thorns Psychic Reserve—are documented in Agent35's [lock-architecture synthesis](../../aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md). They should remain distinct hypotheses: lock breadth, Active/Bench placement, self-suppression, Tool protection, player-level effects, and Stadium effects differ. They are not a universal lock package to bolt onto Shadow Rider.

### The whole-deck lesson

The strongest current research is not a smooth card-value model. It is a portfolio of **conditional resource systems**. A candidate must establish its own line, keep the relevant copies and connectors available, pay real costs, and survive the opponent's best legal response. A one-card substitution can be a useful controlled hypothesis, but it is not a meaningful improvement until its gain and the displaced card's lost function are evaluated across the full deck and field.

## 3. A single common-policy architecture

Use one reusable policy architecture for both players, with role-relative observations and deck-aware line descriptions. Do not create one hand-written policy per Aichi rank or candidate.

### Required decision state

- Own hand, board, discard, deck-search knowledge epoch, Prizes when legitimately inferable, Energy attachments, used once-per-game/once-per-turn resources, and actual prompt choices.
- Public opponent board, Active/Bench positions, attached Tools/Energy, Stadium, public discard, attack/effect history, visible lock effects, and public archetype evidence from mulligans and early board.
- Candidate's current ALS state: prerequisites met, copies reserved, remaining payments, timing windows, and failure/alternative branches.
- A state-indexed DCI/UDP frontier for actual physical copies, not a single permanent value per card name.
- AMR checks for legality, actual payment, Active/Bench capacity, Supporter contention, lock restrictions, and competing uses of search/draw effects.

The worker must receive only the acting player's allowed observation plus public receipts. It must never receive the opponent's hidden hand/deck/Prizes, native game state, or physical RNG/seed. K1 may be derived only from an authenticated owner-deck search. The same policy code should be able to pilot either seat; physical seat, candidate first/second, and game outcome must not leak into decisions.

### Shared policy capability tests

Use the existing frozen rank-12 challenge cases as regression seeds for reusable capabilities, not as training labels or a new corpus. They already cover attack choice, Noivern discard opportunity cost, Prize-aware gust, conditional removal, self-lock timing, prior-turn attack receipt, hidden-Prize boundaries, unsupported Phantom Dive allocation, and Crispin/VS Seeker contention. Keep the four held-out cases sealed.

Before field comparison, the common policy must also execute representative source-dealt ALS continuations for distinct opponent families: rank-2 Bunnelby/TM: Evolution; rank-6 Iron Thorns/Guzma & Hala; rank-11 Tool-Garbodor; rank-10 Regidrago/Apex Dragon; and rank-26 Meloetta's fast attack threat. These are capability requirements, not separate rank-specific policy branches. A common policy may use a public opponent-archetype posterior and generic card/line semantics, but it must not know hidden zones or receive a hand-authored action script keyed to the opponent's rank.

The policy must record both **opportunity** and **execution**: no-opportunity, unavailable source, illegal action, rejected prompt, payment failure, missed target, action pass, capped turn, and genuine completed effect must be distinct. A missing action opportunity is not a strategic failure, but it is not a successful counterline either.

## 4. Staged path to the first useful field panel

The following sequence respects the current integration stopline and avoids rerunning accepted engineering work.

### Stage A — finish the existing first-trace gate

1. Agent49 completes the exact combined V3 acceptance on the intended SHA, including the required contract-only and native no-game witness gates.
2. Agent6 captures the one registered natural-terminal trace with the actor-only worker boundary and the Agent19/Agent45 recorder/receipt semantics.
3. Review that trace for a legal action sequence, exact owner-observation provenance, correct physical action/payment/settlement, terminal cause, and preserved failed-attempt evidence.

The first trace is **pipeline acceptance**, not evidence that its winner or deck is competitive. Do not change the candidate, policy, seed schedule, physical-seat mapping, or Twinleaf pin while this gate is being completed.

### Stage B — registered reference comparison

After the trace is accepted and reviewed, use the already described matched comparison: the unchanged Hood Shield Shadow Rider v1 against the exact rank-1 source list, under the **same frozen registered candidate/opponent policy bundle** used for the diagnostic. Preserve the registered source deals and policy/engine hashes; sample both physical seats and both actual first-player assignments; record all attempted, failed, capped, unfinished, and completed games. Do not replace this bundle with the future PUCT policy mid-comparison. Do not call this a field panel or a strength result.

This step establishes whether the end-to-end runner can produce comparable whole-game outcomes under a fixed policy. It does not validate every candidate architecture.

### Stage C — first cross-archetype diagnostic panel

Only after Stage B is reviewed **and** Agent5's post-trace shared actor-relative PUCT adapter has been integrated and passed its bounded regressions, run a small, prospectively frozen panel under that single frozen policy spanning **different failure mechanisms**, not just the easiest or most common matchup:

- **Rank 6 Iron Thorns:** Active Rule-Box Ability suppression and the source's Special-Energy/Stadium pressure.
- **Rank 11 Absol/Garbodor:** Tool-conditioned global Ability suppression, Tool targeting/removal, and the candidate's Hood/Arven response.
- **Rank 2 or 15 Vileplume control:** distinguish Item denial, attack-origin Item restriction, and Supporter denial; test actual source ALS rather than a static lock flag.
- **A Regidrago source rank (e.g. rank 10):** test the 11-placement family and the candidate's Copycat/Dialga counter-ALS under actual prior-turn attack history.
- **Rank 26 Meloetta:** expose fragile Basic starts, Prize liability, and the paper-clock pressure that lock-only panels miss.

Rank 31 Dusknoir/Chimecho is a useful additional diagnostic for the proposed Enamorus/Guardian arm, but do not prioritize it unless the baseline trace identifies a relevant Ability-effect failure. The exact Enamorus/Quick Ball-cut arm should be compared only if baseline losses are attributable to opposing Pokémon Abilities; if losses arise from Budew, Vileplume, Stoutland, Stadium, Tool removal, Energy/Bench congestion, or the Regidrago counter-line, the Enamorus shield does not answer that cause.

Use the same common policy architecture and frozen opponent policies across all candidate arms. Compare a new 60 only as a separate whole-deck arm; never swap a card for one opponent in the primary contest.

### Stage D — all available source lists, then full Top 32

Expand the same unchanged candidate/policy pair across all 29 authenticated original lists, retaining every rank's own results and uncertainty. The five Japanese-promo lists remain in the primary cross-format challenge; the 24-list strict Expanded diagnostic is reported separately. Do not reconstruct ranks 23, 25 or 28 from archetype averages or replace them with byes.

A 29-list run is a **published-source diagnostic**, not a full Top 32 claim. Under the conservative field bound in [field-evidence](../../statistics/field-evidence.md), even perfect wins against the 29 known ranks cannot establish a 99.5% lower bound for all 32 if the three unknown ranks contribute zero; the maximal lower bound is 29/32 = 90.625%.

### Stage E — confirmatory evidence after all 32 lists and paper admission

The target must be predeclared as an **equal-rank field-average** objective with explicit treatment of actual first/second turns, physical seat, ties, timeouts, and unfinished games. Do not silently switch to historical metagame weights or a 24-rank denominator.

For a transparent independent-game design, the existing 18 November derivation shows that **19 zero-loss games per rank (608 total)** is sufficient for a one-sided 95% test of the equal-weight 32-rank aggregate 99.5% target. For practical four-cell balance (candidate in either physical seat × candidate actually first/second), use **20 games per rank (five per cell; 640 total)**. With zero losses, that design's one-sided lower bound is approximately 99.5330%. This is an aggregate-field statement, not a 99.5% guarantee for each individual matchup.

If any loss, draw, timeout, or unfinished game occurs, do not reuse the zero-loss shortcut. Use a predeclared stratified exact/profile-likelihood bound or another validated method and report every rank separately. If paired outcomes or a paired-seat sequential process are used, follow that process's exact randomization and dependence assumptions; do not count correlated games as independent Bernoulli trials. Agent37's [paired-seat v3 method](../../statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md) specifically requires a fresh fair pair-orientation coin and complete pairs; physical-seat alternation alone is insufficient. Do not mix that method's estimand or proof with an independently balanced four-cell design.

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
- [Lock-architecture field synthesis](../../aichi-2026/2026-11/agent35-lock-architecture-field-synthesis-20261117.md)
- [Enamorus board-shield hypothesis](../../aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md)
- [Hood DCI/AMR policy specification](../../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md)
- [Discard-liquidity synthesis](../../als/discard-liquidity-and-copy-aware-payment-synthesis-20261107.md)
- [K0/K1 owner-search synthesis](../../als/agent30-k1-owned-search-replanning-synthesis.md)
- [Field evidence standard](../../statistics/field-evidence.md)
- [99.5% aggregate confidence derivation](../../2026-11/field-winrate-995-confidence-bound.md)
- [Paired-seat v3 rejection method](../../statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md)
