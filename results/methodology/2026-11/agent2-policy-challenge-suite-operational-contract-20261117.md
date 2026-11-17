# Operational content contract for V3 policy-competence challenge suites

**Agent2 · 17 November 2026 · methodology synthesis, not a policy or game result**

## Decision

The V3 plan already binds a `challengeSuiteSha256` for the candidate and every authenticated rank-specific opponent. The repository also has a useful policy-coverage matrix. What is still missing is one shared, inspectable definition of what evidence the hashed suite must contain. A digest alone does not tell an independent reviewer whether the policy can actually pilot its declared deck.

This note turns the earlier [Agent2 challenge-suite proposal](../../../communications/agent43/20261112T0641Z_agent2_policy-challenge-suite-coverage.md) and [protocol-versus-competence synthesis](agent2-policy-protocol-vs-competence-synthesis-20261114.md) into an operational content contract. It is the **suite-content companion** to [Agent17's Aichi Top 32 opponent-policy panel plan](agent17-aichi-opponent-policy-panel-plan-20261117.md): use Agent17's plan for rank-by-rank source coverage, archetype grouping, and field-engine dependencies; use this note for the minimum evidence content and review of each frozen policy challenge suite. It adds no second V3 validator, no CI workflow, no policy code, no game, and no deck recommendation. It is intended to make the existing V3 competence attestation substantive rather than create another gate.

## 1. Required suite package

Every candidate-policy suite and every authenticated rank-specific opponent-policy suite should be a versioned, canonical manifest frozen before policy registration and deal generation. The suite digest already has a place in the V3 policy-plan core; the content below is the proposed minimum for that digest.

### Suite header

Record:

- suite schema/version and unique suite ID;
- role (`candidate-policy` or `opponent-policy`) and, for opponents, exact source rank;
- exact 60-card physical-print/deck fingerprint;
- policy, entry/dependency-manifest, and common-constraints hashes;
- engine/submodule and research-hook revisions used by native cases;
- `candidatePolicyProducerId` bound to the candidate policy, dependency-manifest, and challenge-suite hashes;
- `opponentPolicyProducerIdByRank` bound to each available rank's policy, dependency-manifest, and challenge-suite hashes;
- bundle producer ID separately, plus the complete producer-ID set used by the panel;
- suite author/producer, creation time, frozen time, and evidence references;
- explicit split between development cases and held-out review cases.

The policy-producer IDs belong in the signed/hash-bound policy-plan content, not only in a surrounding artifact. Missing IDs block production competence attestation; do not infer that the bundle producer authored every policy.

For an unavailable source rank, keep the existing V3 `source-unavailable` entry with null deck, policy, entry-manifest, challenge-suite, and producer identities. Do not create a proxy suite from an archetype description.

### Scenario record

Each scenario should contain enough information for another reviewer to replay the decision without seeing the other player's hidden zones:

| Field | Required content |
|---|---|
| `caseId` | Stable unique case identifier |
| `objective` | The strategic objective or threat being tested |
| `evidenceClass` | `source-natural`, `native-staged`, or `synthetic` |
| `sourceBinding` | Exact deck/rank, card-print references, engine pin, and source trace or fixture reference |
| `actorView` | Digest of the exact actor-visible observation and public history supplied to the policy |
| `decisionEnvelope` | Acceptable action families/strategic outcomes, forbidden outcomes, and rationale; not necessarily one exact action |
| `costLedger` | Cards, Energy, once-per-turn effects, Bench capacity, Supporter use, discard/recovery, and other relevant costs |
| `promptCoverage` | Native prompt family, selection bounds, choice-index/cancel/visibility semantics when applicable |
| `executionEvidence` | Actual chosen action, native acceptance/effect receipt, trace digest, budget, timeout/fallback status |
| `disposition` | `pass`, `blocked`, or `fail`, with reviewer explanation |

The manifest should include the complete scenario contents and evidence references before hashing. A reviewer must inspect representative traces and the coverage matrix, not merely sign the digest.

## 2. Evidence classes and what they prove

- **`source-natural`:** the opportunity occurred in a natural game from the exact source deck and a recorded deal/trace. This is the strongest evidence that the line occurs under real play.
- **`native-staged`:** a controlled state uses actual pinned-engine card objects and native action/Store validation, with a replayable construction and full cost accounting. It can prove a legal action path and native effect, but not natural frequency or strategic value by itself.
- **`synthetic`:** a mock, schema fixture, or simplified policy-only state. It is useful for boundary and regression tests, but cannot be the sole evidence for a deck's core plan or a policy's strategic competence.

Every core win-condition line must have native execution evidence (`source-natural` or `native-staged`), and the suite must identify which core lines have only synthetic coverage. Unsupported or unobserved lines remain explicit gaps; presence in the 60, search for a card, a returned action token, or a successful worker handshake is not proof that the policy can execute the line.

## 3. Required scenario families

The exact cases are deck-specific. The following families are the minimum common vocabulary, extending the existing Agent2 matrix rather than prescribing one strategy for every deck.

1. **Core plan and board construction.** The policy must demonstrate the deck's declared win condition, including the complete path from available card to legal play/action and the consequential effect. Test important search targets through to actual use, not merely search selection.
2. **Resource, discard, and Prize management.** Cover once-per-turn resources, competing search/draw/gust choices, Energy payment and attachment, retreat funding, discard/recovery, singleton protection, and K0/K1 or other legitimate Prize-information states. Every proposed line needs a complete cost ledger.
3. **Opponent threats and counterplay.** For each rank-specific opponent, test its own principal plan and at least the important responses/counter-responses relevant to the declared deck. A policy that can execute its own opening but cannot answer the field's obvious counterline is not independently competent.
4. **Locks and board constraints.** Cover the lock types and board restrictions relevant to that deck: Active/Bench conditions, Ability/Item/Supporter/Tool constraints, Stadium interactions, and any self-lock risk. Record exact card/rule references and use native validation for disputed effects.
5. **Tactical conversion.** Cover attack selection and sequencing, gust/target choice, Prize mapping, weakness/damage constraints, retreat and Energy conservation, and turn-ending effects. The decision envelope may permit several strategically equivalent lines.
6. **Native prompt completion.** Exercise every prompt family used by the policy's core lines, including legal min/max, owner visibility, choice indices, cancel semantics, and both physical actor seats. Unsupported prompts must fail closed rather than delegate to a broader hidden-state decoder.
7. **Negative controls.** Include impossible or unpayable lines, wrong-source abilities, invalid selections, unsupported prompts, private-information/seed access, fallback/delegation, and timeout cases. A policy must reject these without leaking private state or silently substituting a different decision.

These families correspond to the earlier ALS/counter-ALS, DCI/UDP/AMR, connector/Supporter contention, lock/board, Prize/information, and tactical-conversion proposal. Human-concept notes may suggest cases, but every case must be resolved against exact card text, source evidence, and pinned native behavior before it is treated as a passing policy line.

### Candidate-side Aichi pressure instantiation: Hood Shield Shadow Rider v1

The generic families above need a candidate-policy instantiation as well as rank-specific opponent-policy cases. For the current Hood Shield v1 challenger, use Agent17's [source-bound field-pressure memo](../../aichi-2026/2026-11/agent17-hood-shield-field-pressure-risk-20261117.md), [rank-level Tool-pressure map](agent17-aichi-tool-pressure-map-20261117.md), and [policy-panel manifest](agent17-aichi-policy-panel-manifest-20261117.json) as the source of truth for exact ranks and counts. This is a candidate-specific suite appendix, not a deck recommendation or a claim that any threat is naturally accessed.

For every important threat, keep two distinct suite records: (a) the rank-specific opponent-policy case demonstrating that the exact source list can execute the threat, and (b) the candidate-policy case evaluating the candidate's response from its own actor-visible observation. Bind both to the same exact candidate and opponent 60-card fingerprints, but use separate case IDs, role labels, decision envelopes, and reviewer dispositions. A pass by one policy does not establish competence of the other.

| Candidate-side pressure family | Source-bound challenge targets | What the candidate suite must evaluate |
|---|---|---|
| Tool removal and suppression | 20/29 available lists contain Field Blower, Megaton Blower, Faba, or Tool Jammer. Preserve the distinct mechanics: Field Blower discards up to two Pokémon Tools and/or Stadiums in play (yours or opponent's); Megaton Blower discards all Pokémon Tools and Special Energy from all of the opponent's Pokémon plus a Stadium in play; Faba puts one attached Pokémon Tool or Special Energy, or any Stadium in play, into the Lost Zone; Tool Jammer blanks Tools on the opponent's Active while the Pokémon carrying Tool Jammer is Active. | Track all four candidate Tools (Stealthy Hood ×2, Forest Seal Stone ×1, Float Stone ×1) and both Stadiums (Sky Field, Dimension Valley) as separate resources. Test sequencing before/after Forest Seal Stone's VSTAR Power, Float Stone retreat dependence, Bench-capacity and attack-cost consequences, and the difference between discard, Lost Zone, and suppression. Include the proposed bench-Hood / Underworld Door line: Tool Jammer suppresses Tools on the opposing Active, so evaluate whether the Hooded Shadow Rider can remain benched while accelerating. The pinned native Hood/Initialization + Tool Jammer witness already passed in run 38829270890; reuse it rather than repeating it. Use exact ranks from Agent17's map rather than treating 20/29 as an access rate. |
| One-action removal of both Hoods | 17/29 available lists contain Field Blower or Megaton Blower: ranks 1/5/6/7/8/12/13/14/19/20/21/22/24/29/30/31/32. | Test attachment placement, exposing both Hoods versus retaining a reserve, and the actual candidate response/cost envelope. Include the exact Field Blower up-to-two-target and Megaton Blower all-Tools cases; do not assume a particular line is always correct or that the opponent has accessed the card. |
| Energy denial and transfer | The unchanged Japanese-Extra ranks 3/6/7/24/29 all contain Tool Jammer, Plumeria, and Team Flare Grunt; ranks 6/24/29 also contain Handheld Fan. | Separately model Plumeria's two-card hand cost and any-opposing-Pokémon Energy target; Team Flare Grunt's discard from the opponent's Active; Team Yell Grunt's return-to-hand effect from any opposing Pokémon where present; and Handheld Fan's trigger when its attached Pokémon is Active and damaged by an opposing attack (even if Knocked Out), moving an Energy from the attacker to one of the Fan owner's opponent's Benched Pokémon (the attacking player's Bench). Track the candidate's Basic Psychic Energy, retreat, and attack costs. Do not collapse these into a generic Energy-discard event. Keep the original Japanese source lists unchanged. |
| Rank-specific compound counterlines | Rank 1's post-KO Teammates / Field Blower / Unfair Stamp branch; rank 31's Field Blower target selection followed by Dusknoir PRE Cursed Blast. | Evaluate the candidate's response with the real source sequence and prompt bounds. For rank 31, Field Blower chooses up to two Pokémon Tools and/or Stadiums; there are no separate paper "Tools-only" and "Stadium-plus-Tools" modes. Cursed Blast's self-KO remains consequential even when a protected target does not receive damage counters; do not treat Hood as preventing the self-KO. |
| Rank 2 AOR Item lock + GX sustain | 2× Vileplume AOR Irritating Pollen (`xy7-3`; Ancient Origins) + 1× Vileplume-GX CEC 4 (`sm12-4`). | AOR's Ability prevents each player from playing Item cards from hand. Arven (`sv1-166`) remains a playable Supporter and may search a Tool plus an Item. Stealthy Hood (`sm10-186`) and Float Stone (`xy8-137`) are Tool-only and may still be attached; Field Blower (`sm2-125`) is an Item and cannot be played until the lock clears. Forest Seal Stone (`swsh12-156`) is dual-subtype Item/Pokémon Tool, so do **not** assume it can be played from hand under the Item lock merely because it is also a Tool. The repository manual supports the type boundary at B-02/C-19 (lines 406–430 and 1631–1646); Jellicent ex's example explicitly names both Items and Pokémon Tools, so do not generalize AOR's Item-only lock to a Tool lock. Vileplume-GX CEC 4's Fragrant Flower Garden separately heals 30 damage from each of its Pokémon once per turn; test this as opponent-side sustain, not as part of the Item lock. Keep rank 2's Copycat prior-turn-attack / first-turn evolution timing separate; the candidate Copycat case remains `blocked` / fail-closed until a tracker-backed prior-turn attack receipt exists. |
| Rank 15 combined Vileplume locks | 2× Vileplume AOR Irritating Pollen (`xy7-3`) + 1× Vileplume BUS6 Disgusting Pollen (`sm3-6`; Burning Shadows). | Rank 15 combines the AOR each-player Item lock above with BUS6's Active-only Basic-Pokémon attack lock: while BUS6 Vileplume is Active, opposing Basic Pokémon cannot attack. Test the BUS6 restriction separately and in combination with the AOR lock against the candidate's Basic Mimikyu / Copycat line and the non-Basic Shadow Rider VMAX Max Geist route. The Stealthy Hood protection rationale for BUS6 is rules-derived but not yet native-tested, so do not mark it `pass` without the required paper/native evidence. The candidate Copycat case remains `blocked` / fail-closed until a tracker-backed prior-turn attack receipt exists; the current Active attack list is not proof of a prior-turn attack. |
| Iron Thorns / Initialization interaction | All three available Iron Thorns lists (ranks 6/24/29). | The pinned native Store/effect witness already passed in run 38829270890, including a Hooded benched Shadow Rider VMAX under Active Iron Thorns and opposing Active Tool Jammer; do not repeat it. Keep the independent paper-rule review as a separate admission item: the official Q&A is for Mega Clefable ex's identical prevention clause, not a Hood-specific FAQ. Preserve the result as `native-staged`, not source-natural or matchup evidence. |

For this current challenger instantiation, bind the exact candidate inventory blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b` and Aichi `results/aichi-2026/full-decklists.json` source blob `ae773f6201d7aa69d31914dbfee66f3fba692200`; a changed candidate or source manifest requires new bindings and a new suite hash. The bound candidate source is exactly `results/aichi-2026/candidate-hood-shadow-rider.json`: it contains one Mimikyu GRI 58 and one Trevenant & Dusknoir-GX SMP SM217. Do not substitute the separate `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json` or `...dialga2-challenger-60.json` variants; the Copycat challenge is a one-copy line in the bound 60.

The candidate decision envelope should compare, rather than hard-code, these plausible responses: keep the Hooded Underworld Door engine benched while Tool Jammer is on the opposing Active; keep the Forest Seal Stone carrier separate from the Hooded Pokémon and consider using Star Alchemy before removal; preserve a second Hood where possible; evaluate Acerola only as a pre-removal pickup; and budget the single Arven, two VS Seeker, single Field Blower, single Acerola, two Hoods, Supporter-per-turn limit, attached Energy, and Bench slots together. Keep rank 3's Arven → Field Blower + Hood escape case distinct from rank 7's longer four-card Tool / Faba ×2 resource war; rank 30's Field Blower ×3 is a repeated-removal case; Regidrago ranks 12/13/14/20/21/32 are Megaton Blower all-Tool-sweep cases. These are competing candidate lines to evaluate with the full cost ledger, not recommendations or claims that the opponent will access a named card.

These counts are source-list presence facts (29 lists available; ranks 23/25/28 remain unknown), not draw/access probabilities, game observations, or matchup estimates. For ranks 23/25/28, record `unavailable_source` with no opponent deck fingerprint and no scenario; do not synthesize a list, substitute an archetype, or include a fabricated matchup in any denominator. Full Top 32 coverage remains incomplete until those primary lists are recovered. Keep unresolved paper-rule questions separately marked `blocked` even when a native-staged witness exists; do not relabel a staged pass as source-natural or as a matchup result. The current 60 has no direct Tool recovery from discard or Lost Zone; Acerola is a pre-removal pickup of the Pokémon and attached Tool, so include its Supporter / tempo cost rather than treating it as post-removal recovery. Every passing critical line still needs the evidence class, actor-view digest, complete cost ledger, native prompt coverage, execution receipt, and independent review required above. These candidate-side cases do not authorize a fixture before the current V3 acceptance and first-trace sequence is complete.

## 4. Review and pass semantics

The independent reviewer should answer four questions for each critical scenario:

1. **Reachability:** is the state source-realizable or a correctly constructed native state, and can the declared action actually be offered?
2. **Legality and cost:** is the selected action legal and fully payable under the exact card text, rules, and current state?
3. **Strategic adequacy:** does the action fall within the declared decision envelope after accounting for competing lines and opponent response, rather than merely being legal?
4. **Execution integrity:** did the frozen actor-only policy choose it under the frozen budget, without hidden information, physical seed access, native fallback, unsupported delegation, or timeout?

Use `pass` only when all four are supported. Use `blocked` when source, engine, or observation evidence is unavailable; use `fail` for a reproduced illegal, strategically unacceptable, or integrity-violating decision. Do not turn missing evidence into a pass, and do not invent a numerical competence percentage without a calibrated sampling model.

A suite is ready for attestation only when every declared critical plan line has native execution evidence, every relevant prompt family is covered, all negative controls behave correctly, both physical seats are tested, and remaining gaps are explicitly bounded. The reviewer may reject a suite even when every test passes if the suite omits an important deck function or field response.

## 5. Freeze and independence rules

- Freeze suite membership, decision envelopes, and review criteria before any confirmatory game outcomes are observed.
- Keep development cases separate from held-out review cases. Do not use the confirmatory games to add cases, tune heuristics, or change expected outcomes.
- If a policy, deck, dependency closure, engine hook, or common constraint changes, produce a new suite/policy hash and new pre-deal attestation. Old games remain bound to the old identities.
- Candidate and every opponent policy receive the same observation, information, compute, timeout, and randomization constraints. The candidate policy is invariant across ranks; each opponent policy is invariant across that rank's seat/first-player cells.
- Candidate-policy and opponent-policy reviewers remain distinct, authorized, and independent of every policy producer and the bundle producer. Post-game paper/clock and strategy reviewers remain separate. The study-wide rule is one human per role, with an external immutable assignment/conflict ledger; rotate people within a role, never across roles.
- The current production trust registry `simulation/evaluation/agent45-authorized-reviewers.json` is empty. Issue #39 records the owner's explicit hold on external reviewer outreach and trust-registry provisioning (12 November 2026). Do not contact candidates, change recruitment status, or populate the registry until the owner resumes the process. This is a future production-attestation dependency, not a blocker for the one diagnostic rank-1 trace. No identity should self-authorize or populate it by inference.

## 6. Post-trace execution order

1. **Complete the current V3 worker acceptance sequence** on the exact approved research SHA and pinned Twinleaf revision. The contract-only, compile/no-fixture, and both-role/both-seat native no-game witness are separate gates; no fixture precedes all three.
2. **Run one diagnostic natural-terminal game** with the unchanged Hood Shield Shadow Rider v1 60 against the unchanged original rank-1 source 60, frozen policies, and registered public seed. Agent6 reviews the full trace. This is a diagnostic, not a paper-qualified matchup, policy attestation, or statistical sample.
3. **Resolve only trace-supported blockers.** A concrete engine/prompt/policy mismatch may create a new versioned policy or hook. Re-run the affected challenge suite and freeze new hashes; do not multiply games or tune from an ambiguous trace.
4. **Build the rank-specific challenge panel.** Use exact source decks and policies for available ranks, preserving ranks 23/25/28 as unavailable. The 29 available ranks may support explicitly labeled per-rank diagnostics, but they do not constitute the full primary field.
5. **After the owner lifts the reviewer-outreach hold, obtain owner-authorized independent reviewers and sign pre-deal competence attestations.** The empty reviewer registry is a hard comparative-competence dependency, but not a blocker for the one diagnostic trace. Do not contact candidates, update recruitment status, fabricate attestations, or use producer identities as reviewers while the hold remains in force.
6. **Select one fixed candidate using a separate development cohort.** Compare genuinely different deck architectures under the same frozen, independently competent opponent policies and equal constraints. Keep all candidate tuning off the confirmatory sample; the current Hood v1 is a challenger hypothesis, not a selected final 60, and its 55/60 card-name overlap with the rank-1 reference is not evidence of superiority.
7. **Freeze the one 60 and the full 32-rank panel**, then register the 128 rank × candidate-seat × first-player strata before generating deals. Missing ranks stay missing; no byes or inferred lists.
8. **Use the existing Agent12 statistics, not a new estimator.** Report both the equal-weight field-mean claim and every opponent-specific interval. The 640-game all-win field-mean floor does not certify every matchup; the stronger simultaneous per-opponent all-win design is 323 games in each of 128 cells (41,344 total), with existing heterogeneous-KL extensions for nonwins. Apply the existing paper, source-binding, independence, and censoring vetoes.
9. **Publish every rank's wins, losses, ties, censored/errors, sample size, confidence bound, policy hashes, engine pin, and failure cases.** A full-field aggregate is unavailable until all 32 exact source lists and policy identities are admitted.

## 7. What this note does not establish

This is an operational content proposal. It does not certify the current candidate or any opponent policy, fill the empty reviewer registry, authenticate ranks 23/25/28, establish paper admission, validate the V3 runner, create competitive games, or demonstrate a 99.5% win rate. It does not replace the existing V3 evaluator/builder, Agent12 field ledger, or statistical methods.

## Canonical references

- [Agent2 policy protocol-versus-competence synthesis](agent2-policy-protocol-vs-competence-synthesis-20261114.md)
- [Agent2 earlier challenge-suite coverage proposal](../../communications/agent43/20261112T0641Z_agent2_policy-challenge-suite-coverage.md)
- [Agent17 Aichi Top 32 opponent-policy panel plan](agent17-aichi-opponent-policy-panel-plan-20261117.md)
- [Agent43 V3 deck-aware competence gate](agent43-v3-deck-aware-policy-competence-20261112.md)
- [Agent50 V3 deck-aware competence/admission contract](agent50-v3-deck-aware-policy-competence-contract-20261112.md)
- [Agent9 policy-producer / reviewer-independence addendum](agent9-v3-policy-producer-reviewer-independence-addendum-20261117.md)
- [Agent12 simultaneous 128-stratum per-matchup confidence method](../../statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md)
- [Agent12 heterogeneous field KL confidence method](../../statistics/agent12-heterogeneous-kl-field-confidence-bound-20261107.md)
- [Agent17 source-bound full-field claim gate](../../aichi-2026/agent17-full-field-claim-gate.md)
- [Current fixed-60 decision board](../../README.md)
