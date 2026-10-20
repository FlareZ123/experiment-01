# Agent 33: common-policy v2 bilateral archive intake gate

**19 October 2026 UTC. Evidence class:** new read-only archive validation and synthetic tests. No fresh matches or competitive-qualified results.

## Current acceptance ladder (20 October update)

**Current evidence outcome: no qualified competitive games, no 99.5% deck.** The existing `auditBilateralV2` reports two different pilot evidence standards: `MECHANICAL-PILOT-REVIEWABLE` is an explicitly weak owner-asserted action/response preflight, while `ROOT-ATTESTED-PILOT-REVIEWABLE` requires a raw complete native Store action ledger for both actual starting orders, paired same source physical deals and turn-one source-first pressure in both rank 6 and rank 11. The second tier still needs independent native card-effect, hidden-information-policy, exact Japanese printing/paper-rules and match-clock verification before any game-win evidence can qualify. Missing/contradicted data stay visible, including every action cap and engine error.

**Reproducibility:** pure gate/ledger tests passed **39/39** in an in-process V8 compatibility runner using exact GitHub-readback code. Compiled Twinleaf or official Node 22 CI was not rerun for these commits. [Current source](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs), [native ledger verifier](../../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs), and [regressions](../../tests/bilateral-v2-evidence-gate.test.cjs) remain traceable. The separately fixed printed-60 digest canonicalization is documented in Agent41's draft source and tests; it does not alter the five published draft input hashes used in this narrow rank6/rank11 comparison.

## Decision need

The [Critic's 05:56 v2 direction](../../communications/broadcast/20261019T0556Z_critic_stop_mechanical_reaudits_start_bilateral_v2.md) calls for a prospectively registered common-candidate-policy comparison across rank-6 Iron Thorns and rank-11 Absol/Garbodor, with real starts on both sides, independently audited source pressure and bilateral replies. The original [24-arm v1 screen](agent41-crossrank-partition0-exploratory.md) recorded 13 weak engine terminals, 10 action caps and one Store rejection. It also mixed candidate-specific decision policies, so an apparent winning list cannot be isolated from bot behavior.

New general-purpose code:

- [bilateral-v2-evidence-gate.cjs](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs)
- [bilateral-v2-evidence-gate.test.cjs](../../tests/bilateral-v2-evidence-gate.test.cjs)

## Read-only contract

The exported `auditBilateralV2(plan,archive)` requires `aichi-bilateral-common-policy-plan-v2` and matching `aichi-bilateral-common-policy-observations-v2`. An externally frozen plan supplies its registration SHA-256, engine pin, research revision, seed protocol, root cap, common candidate policy digest, source policy digest, both complete physical-candidate print hashes, opponent-rank print hashes and all paired attempt IDs.

Every archived arm must echo the registered rank, seed, physical seat, candidate ID, both deck hashes and both policy hashes. Missing attempts remain explicit in the denominator, duplicates and additional unregistered arms raise an error, and errors/caps cannot supply winning outcomes. Terminal codes remain engine-only.

A *mechanical bilateral witness* requires an actual verified starting seat, the source actor's authenticated accepted pressure and prompt-closed public effect, the candidate's owner-visible legal reply, subsequent owner-visible legal source continuation, and correctly ordered action ordinals. The output preserves each paper-fidelity, full-policy information-set and tournament-clock veto.

A shared seed is insufficient to label two candidate arms paired. The audit compares separate postgame **source physical-deal fingerprints** and actual starter identity. Even two identical initial source deals do not establish a causal inventory effect or a valid strength estimate; later decisions and random events diverge.

The return value always includes `competitiveStrengthClaimPermitted:false` and `gameWinRateCertified:false`. Authentication flags in the input remain externally asserted until checked against the preserved raw Store action, prompt and public-board histories. This function is an **intake verifier**, not a source-policy optimizer, official paper-rules certificate, match clock, statistical estimator or preregistration itself.

## Validation and handoff

**11/11** new pure Node tests pass locally. Combined with four pure owner-play-lock tests: **15/15** tests passed on Node 22. They cover omitted, duplicated and unregistered arms; deck, policy and seed drift; mismatched source deals and actual starts; attack without response; capped/error outcomes; missing paired candidate arms; and false chronology or actor assignment.

Compiled-game integration and GitHub Actions have **not** yet been run for this module. It needs a future Agent 41-style common-policy runner to emit authenticated native evidence under an independently committed fresh v2 plan. Agent 8 is independently investigating the final-dispatch Shadow Mist legality interceptor; this module does not replace that work or alter the historical v1 archive.

**Field coverage: 29/32 exact published 60s. Competitive-qualified games: zero. No 99.5% claim.**

## 20 October 2026: source-first early-pressure pilot correction

The previous aggregate `MECHANICAL-PILOT-REVIEWABLE` condition accepted a generic paired bilateral source-pressure observation even when that source pressure arose only after the opponent had acted, or when all rank-specific paired pressure occurred in candidate-first games. Those observations are useful for later gameplay, but they do not answer the current earliest-source-lock qualification question. This was an **intake decision false positive**, independent of whether any archived historical game had actually been scored as a qualifying win.

The revised `simulation/evaluation/bilateral-v2-evidence-gate.cjs` preserves all original per-arm `mechanicalBilateralWitness` and `bothHardRanksHavePairedBilateralWitnesses` evidence. It adds `sourceFirstEarlyPressureWitness`, which requires a previously authenticated bilateral witness, a Store-verified actual source first player, and accepted pressure start/completion during **global turn 1**. New per-pair and pooled fields are `bothSourceFirstEarlyPressureWitnesses`, `sourceFirstEarlyPressurePairs` and `bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses`. The pilot-review verdict now requires a matched source-first, first-turn pressure-and-reply pair for **each** of ranks 6 and 11, alongside the existing exhaustive attempt and both-start requirements.

Adversarial regression checks cover a source-first pressure line delayed to turn 3 with every generic bilateral witness still passing, and rank-11 evidence confined to candidate-first conditions. Both correctly return `HOLD-OR-INCOMPLETE`. The complete **26/26** pure JavaScript tests passed in a V8-based synchronous compatibility harness after fetching the committed module and suite. This run is **not** evidence of Node 22 or compiled Twinleaf CI success; no new CI was dispatched. Module and suite were separately committed as `1f821e0` and `51fd592`.

**Remaining gate:** the producer's `sourcePressure.accepted/effectVerified/traceAuthenticated` booleans remain externally asserted. The new time-and-seat constraints do not independently establish that Iron Thorns Initialization or an equipped Garbodor actually suppressed a candidate Ability or restricted play during the candidate reply. The canonical runner still needs authentic source-first Store-root lineage, native active-effect measurements before response, trace linkage after response, unchanged candidate policies, full owner information-set checks and tournament-clock work. Do not register retrospective seeds as prospective evidence.

### Additional both-start pairing correction

An observed legal opening draw on each seat can coexist with a **failed** mechanical reply pair in one starting order. The previous `twoRealStartsPerCandidateAndRankObserved` test alone therefore permitted the aggregate pilot verdict to clear on a successful source-first pair, even if both candidate-first rank-11 replies lacked accepted source pressure. The added `bothHardRanksHaveBothStartPairedBilateralWitnesses` requires at least one aligned source-deal, genuinely bilateral pair in each actual starting order for **each** of ranks 6 and 11. The output preserves the weaker, informative two-start coverage field. Pair rows now expose `actualStarter` when both members' openings are authenticated and aligned.

Module commit `0a957c9`, test commits `3de8bbd` and `cdd4bb0`. The complete pure suite now passes **27/27** checks in a V8 compatibility harness; the earlier 26/26 count above records the preceding checkpoint. The new adversarial test retained verified draw logs and source-first evidence while making the rank-11 candidate-first pair fail. The aggregate correctly held. Node 22 and compiled GitHub Actions remain unverified for these commits.

## Postgame native Store root-claim attestation (20 October)

A third weakness was independently addressed: an archive could assert that source pressure, candidate reply and opponent continuation occurred at specified roots without supplying independent actor/turn proof for those roots. The research-owned pure helper [`bilateral-v2-root-ledger-attestation.cjs`](../../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs) checks the actual preserved `actual-store-root-action-ledger-v1` transcript for every consecutively numbered successful native Store root. It validates the action count, source/candidate physical actor, claimed source pressure start/completion, candidate response, source continuation, ordinal chronology and global-turn sequence. A genuine Timeless-GX bonus-turn claim also requires its own owner-bound grant/settlement/next-own-turn roots. It separately identifies source-first turn-one root evidence and keeps native-effect, paper-rule and hidden-policy certification false.

The existing [bilateral v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) now consumes the raw root transcript **when supplied**, enforces the exact protocol name, exposes per-arm `nativeRootClaimsAuthenticated` and `nativeSourceFirstRootClaimsAuthenticated`, counts `independentlyRootBoundBilateralWitnesses`, and applies the `actual-store-root-claims-unverified` veto to missing or contradicted transcripts. The earlier aggregate pilot verdict remains a separate mechanical preflight and is **not a root-attested certification**; a future trial qualification policy should explicitly require those attestation fields before accepting outcomes. Legacy development observations remain usable with the new veto visible.

Source module commits `1836b93` and `b71f5d4`, test commits `4b23be7` and `72a04a3`. The complete **36/36** tests across both suites passed on the exact GitHub-readback sources in a synchronous V8 compatibility harness. The new tests defeat falsified actor/turn claims despite asserted positive booleans, altered root ordinals, truncated transcripts, and unproven extra turns. This verifies pure logic under that harness. No compiled Twinleaf game or independent Node 22 CI run is claimed.

The root attestation still accepts the producer's *raw* ledger as a premise. Independent SHA-256 artifact verification, immutable source/policy revisions, prompt-closed effect traces, truly functioning lock conditions, information-set-safe policy and paper-clock certification remain external tasks. The code deliberately never exposes hidden card zones to live decision policies.

### Separate root-authenticated readiness (20 October)

`rootAttestedPilotVerdict` now requires matched authentic source-deal pairs with Store root actor/turn attestations for both starting orders of rank 6 and rank 11, plus first-turn source-first pressure root attestations for each rank. The older `opportunityAndPolicyVerdict` remains a weaker mechanical preflight. A missing native transcript returns `HOLD-OR-UNAUTHENTICATED`. Additional fields identify native-root paired witnesses by actual seat and source rank. Code `a61dfb7`, test `c18bfd7`; 37/37 pure V8 compatibility checks passed, including a false positive with a wrong actor that leaves the older verdict unchanged. Compiled Twinleaf CI, authentic native lock-effect checking, paper-rules fidelity, opponent-policy quality and match-clock certification remain outstanding.

### Store global-turn continuity hardening

The native-root helper now rejects full transcripts that reverse global turn numbers or jump over a turn between adjacent successful root dispatches. This closes an additional structurally impossible but previously accepted synthetic-ledger case. Code `8b7cfc7`; fixture corrections `0bd4a3a` and adversarial test `25923a9`. All **38/38** pure checks pass using the latest four GitHub-readback files in V8. This structural requirement does not authenticate the original producer or establish actual Pokémon effect resolution; native engine validation remains outstanding.

### Repeated physical-source deal deduplication

A pair that uses a new registration ID and numerical seed can still repeat exactly the same physical source hand/deck/Prize/board. When two aligned candidate pairs have identical source-deal fingerprints for the same source rank and candidate seat, the intake now rejects the repetition rather than counting a duplicate independent comparison. This is an attempt-accounting safeguard, not a claim that seed collisions occur regularly. Code `f38a1a5`, adversarial regression `ce73384`: **39/39** pure tests pass in the readback V8 harness. The full authentic Store transcript hash and external source-deal observer provenance still require independent audit. No newly qualified games.

### Native prompt-chain actors

The root verifier now authenticates an unowned shuffle prompt or defender-owned prompt closure when its `initiatingRootActionOrdinal` resolves to a source-owned initiating action. This avoids falsely rejecting valid source-pressure chains and rejects unrelated origins. Source `a958962`, tests `9f40458`; **41/41** pure readback regressions passed. Native compiled prompt-close validation remains necessary.

## 20 October 2026: rank-6 lock resistance no longer conflated with absent source pressure

**Cross-agent trigger:** [Agent 16's formal counterexample](agent16-rank6-applicability-vs-exposure-gate.md) established that a genuine Iron Thorns source-first lock can have zero candidate-side eligible Rule Box Powers to suppress. Exact-published rank-6, rank-24, and rank-29 Iron Thorns-only inventories are concrete deck examples. An all-target-positive matched pair requirement systematically rejects a deliberately immune candidate. [Agent41's native passive observer](../../simulation/evaluation/agent41-passive-rank6-pressure.cjs) already distinguishes `no-eligible-visible-power` from successful printed suppression.

**Research-owned repair** ([typed evidence source](../../simulation/evaluation/agent3-source-first-pressure-kind.cjs), [gate](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs)):

- Existing `sourceFirstNativePressureVerified`, `opportunityAndPolicyVerdict`, and `rootAttestedPilotVerdict` remain **strict positive-affected-target stress diagnostics** with unchanged semantics.
- New `sourceFirstNativeExposureKind` reports `native-blocked-eligible-power`, `no-eligible-power-present`, or `unverified`. The second classification requires the genuine rank-6 source turn-one Pass root, actor/seat/turn mapping, three native observation boundary indicators, uninterrupted Active Iron Thorns, root-backed candidate response and source return, zero inspected eligible Powers, null selected Power, and the exact no-target status. Source-observer assertions alone are never a competitive-game certificate.
- New `sourceFirstEarlyExposureWitness`, per-pair flags and `sourceFirstEarlyExposurePairs` retain all original registered attempts, including no-target arms and error/cap arms. Rank11 still requires its existing blocked printed Power and native Boost Shake setup evidence.
- New **separate** `exposureInclusivePilotVerdict` permits a source-first pair with one native-positive target and one well-attested no-target inventory, provided the same rank-six aligned cohort includes at least one source-first suppressed-Power positive control; it retains both hard ranks, both candidate starts, verified physical source alignment and actual bilateral mechanics requirements. Two no-target arms **without a positive control** cannot qualify. `rootAttestedExposureInclusivePilotVerdict` adds independent real Store root checks and requires the positive control itself to be native-root-bound. This latter tier is still an archive preflight and cannot certify paper rules, whole-policy owner-information safety, official timing, or wins.
- `source-first-native-exposure-unverified` is the failure label for missing/contradictory native target evidence. Genuine no-target inventories are no longer mislabeled as failed source pressure in this separate exposure diagnostic.

**Adversarial verification:** [Manual Node22 CI 39457075339](https://github.com/FlareZ123/experiment-01/actions/runs/39457075339), source head `ec74e8f3e5a4d24b8a126c05b98b5c071249dfac`, completed **success** on 20 October. This workflow runs the amended strict-intake, root-ledger and source-first mechanism tests alongside the repository's other benchmark checks. Direct new tests show: one blocked source-first reference + one eligible-Power-free candidate yields **strict stress HOLD / exposure pilot REVIEWABLE**; removal of its native turn-two snapshot returns exposure HOLD; both candidate arms with no eligible Power and no independent positive control remain HOLD. The root-attested exposure tier remains HOLD on the no-ledger fixture. This is synthetic-contract evidence, **not** an actual improved physical-deal game outcome.

**Important limitation:** the existing `rank6PassivePressure.status='no-eligible-visible-power'` is grounded in the candidate's native in-play board at turn two, and cannot by itself prove Initialization would suppress an eligible Pokémon. Therefore the positive-control requirement must remain. If a future trial compares only two lock-resistant candidate inventories, an **independently registered and audited** source-lock positive control must be added to the evaluation design; do not invent a hidden eligible target or drop those trials from the equal-rank denominator. Where that control is unavailable, the evidence tier must honestly stay HOLD while the physical game remains a valid recorded attempt.

**Competitive-qualified games: zero. Exact published opponent lists: 29/32. Fixed 99.5% claim: unproven.**

### Same source-first exemption also holds for Tool-Garbodor (rank 11)

The initial rank-6 repair has now been extended to **rank 11**, using the existing authentic, read-only candidate **Active plus all Bench** printed Power inventory in `garbotoxinWindowAudit.before.candidateInPlayPrintedPowerChecks`. The accepted `no-eligible-power-present` branch requires a genuine source turn-one Boost Shake root, a chronologically valid same-turn prompt-closed completion, source Tool-Garbodor publicly active when the candidate turn-two observation is made, and explicitly present **empty** in-play Power and legacy Active Power arrays. A missing array, missing source Tool, mismatched actor/seat, late turn, or mismatched root action stays `unverified`. Generic synthesized Ability-block results are insufficient.

Each of ranks **6 and 11** must now have a native actually-blocked-Power positive control among aligned source-first observations before the exposure-inclusive gate can clear. In particular, both rank-11 candidate arms having no Power yields HOLD, although both real games remain in the attempt census. A Tool-Garbodor source and an inherently non-Ability candidate should no longer be confused with a source setup failure. The positive-affected-target stress pilot remains unchanged.

The rank-11 tests initially exposed a mistake in the synthetic classifier: Boost Shake can initiate a multiple-root prompt sequence, so requiring `sourcePressure.completionOrdinal===rootActionOrdinal` was too strict. After correcting this to a verified, nonnegative **ordered root-to-completion sequence within turn one**, manual Node22 CI [39457998212](https://github.com/FlareZ123/experiment-01/actions/runs/39457998212) completed **success**, checking all existing benchmark suites and the new rank-6/rank-11 positive, no-target, missing-inventory, missing-Tool and missing-control regressions. The preceding failed development CI [39457750733](https://github.com/FlareZ123/experiment-01/actions/runs/39457750733) remains traceable. Neither run contains new native full games or qualified game wins. Actual prompt linkage and root authentication still depend on external canonical runner observations.

**Status remains unchanged:** 29/32 exact source lists and zero competitively qualified games. The target fixed-60 99.5% win rate is not demonstrated.
