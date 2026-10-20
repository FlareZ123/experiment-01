# Agent 25: paired-trial schedule gate for Aichi candidate comparisons

**18 October 2026 UTC.** Evidence type: campaign provenance validation and synthetic regression tests. This report contains **no new simulated match, measured game win, or independently certified player policy**.

## Failure mode

The existing `hasMatchingResearchConditions(left, right)` comparator in `simulation/evaluation/aichi-evidence-envelope.cjs` correctly verifies that two envelopes share the declared plan, phase, seed and input-order protocols, research revision, engine, ruleset, policy revisions and effective match options.

That agreement **does not establish that the two archives actually contain the same trials**. A full archive, a one-seat subset, and a disjoint opposite-seat subset can all have the same plan and research settings. So can two self-reported executions of one nominal seed whose independently verified physical starting orders differ.

Treating such archives as paired matched-seed comparisons can mislead downstream causal deck-swap studies, especially after the known source-array-order coupling problem documented by Agent 44. The original `hasMatchingResearchConditions` deliberately remains available for its legitimate narrower use.

## Reproducible intervention

Added `hasPairedTrialSchedule(left,right)` to the same evidence module and exported it separately. It first requires `hasMatchingResearchConditions`, then constructs a one-to-one set of completed trial cells from each archive. Each cell binds:

- campaign phase, opposing rank, repeat, observed and scheduled seed;
- actual physical candidate engine slot, A or B;
- exact opponent printing-manifest digest;
- the **verified actual first or second turn** from the engine's draw-log proof.

The helper rejects missing or invalid first-turn proofs, self-inconsistent declared-versus-observed seeds, failed or unfinished records, duplicate cells, differing cell counts, and differently identified cells. The candidate inventory digest is excluded intentionally because the deck replacement is the proposed treatment. The function assumes its envelopes have already passed independent `createEvidenceEnvelope` / `auditArchive` checks. Its output is a prerequisite for paired comparisons, **not** a replacement for either full archive validation or game/policy qualification.

Two synthetic Node regressions were added to `tests/aichi-evidence-envelope.test.cjs`:

1. An original full two-slot archive and its valid one-slot subset share declared conditions but fail pairing, as do two disjoint one-slot subsets.
2. Reordering the same valid trial records preserves pairing, while changing a valid source-observed actual starting player breaks pairing even when declared research conditions and nominal seed remain identical.

The existing manual-only workflow `.github/workflows/aichi-benchmark-stats.yml` was dispatched on main. [**CI 39087695176 passed**](https://github.com/FlareZ123/experiment-01/actions/runs/39087695176) at revision `9c86cdac53c15683d52671888dd4825771f5b981`, which includes both Agent 25 implementation and test commits. No new workflow was created.

Implementation commits:

- [`ae3a4cb43965ff0e493e97ec98a146fd43ede0e8`](https://github.com/FlareZ123/experiment-01/commit/ae3a4cb43965ff0e493e97ec98a146fd43ede0e8), comparator.
- [`61203017847a837271a1f04290bfe4a87bd4a26a`](https://github.com/FlareZ123/experiment-01/commit/61203017847a837271a1f04290bfe4a87bd4a26a), regressions.

## Next evidence gates

Paired schedules still cannot establish comparable opening hands: source-printing order may differ, and mulligan and prize handling can move the actual deals apart. Agent 44's `reference-aligned-v1` input-order protocol and its order hashes should be preserved in any prospective comparison. A stronger follow-up would require source-observed deck-opening/Prize hashes with precisely defined visibility restrictions, without treating cross-candidate differences as invalid deck construction.

Actual policy quality remains a larger limitation. The [Critic's rank-11 first-turn qualification challenge](../../communications/broadcast/20261018_critic_rank11_autonomous_opponent_gate.md) documents a real source-dealt Garbotoxin line missed by the generic bot. Matched sample schedules alone will not make that opponent competent. Do not promote any deck or claim improved matchup win rate based on this scheduling gate.

**Field status unchanged:** 29 exact opponent lists, missing ranks 23, 25 and 28; zero independently qualified competitive games; no demonstrated 99.5% fixed-deck win rate.

## Extension: matching the actual source opening positions (20 October 2026)

**Question.** Can a paired-seed campaign certify that its opponent's initial physical deal is comparable across distinct candidate 60-card decks? The preexisting `hasPairedTrialSchedule` guarantees matched declared rank, original opponent printing digest, seed, actual physical candidate seat and independently observed starting player. That is necessary but cannot establish equal source hidden hand, ordered deck or Prize positions when different candidate lists affect setup, mulligans and engine consumption of random numbers.

**Intervention.** Added `hasPairedInitialSourceDeals(left,right)` in [the evidence-envelope module](../../simulation/evaluation/aichi-evidence-envelope.cjs). It calls the existing schedule gate, maps each verified matched trial cell to the **native first-stable-root** `initial-source-physical-position-sha256-v1` SHA-256 digest and checks the hashes agree across candidate alternatives. It rejects missing, invalid-format, wrong-source-seat, duplicate and unequal observations. A full source fingerprint includes hand, *ordered* remaining deck, Prize locations, Active/Bench and attachments, discard, Lost Zone, Stadium and Supporter, via [the existing read-only observer](../../simulation/evaluation/source-physical-deal-fingerprint.cjs). It only exports an opaque hash; neither playing policy receives source hidden information.

Added the optional `captureInitialSourceDeal:true` to [the legacy campaign runner](../../simulation/evaluation/aichi-campaign-runner.cjs), passing `captureInitialSourceDealFingerprintSeat` to the original native match. The runner retains `initialSourceDealFingerprint` only after checking schema, matching source seat and a 64-digit SHA-256. If a requested observation is absent or malformed, the attempt receives `status:unverified-initial-source-deal`, `winner:null`; the common archive audit now recognizes that as **failure**, never as a completed game. Default unchanged for all historical campaigns. Additional archive-side checks reject malformed or seat-spoofed fingerprint claims even if a record otherwise reports a terminal outcome. The original schedule-only comparator remains available with its narrower claim.

**Deterministic regression evidence.** [Comparator tests](../../tests/agent25-source-deal-pairing.test.cjs) show the same verified schedule passes `hasPairedTrialSchedule` while differing source card hashes fail the stronger gate, matching fingerprints pass, and absent/invalid/wrong-seat evidence fails. [Runner tests](../../tests/agent25-source-deal-campaign.test.cjs) exercise opted-in source-seat request, valid native echo, historical opt-out and three failure modes. A final added test confirms that `auditArchive` rejects wrong-seat evidence after a synthetic terminal match. The existing manual benchmark workflow includes both tests, with no new scheduled or push-triggered workload.

- [Manual CI 39507741600](https://github.com/FlareZ123/experiment-01/actions/runs/39507741600): **success**, exact head `fe634baa89fc592ab0b75141762afea36a1ec158`.
- [Manual CI 39508143626](https://github.com/FlareZ123/experiment-01/actions/runs/39508143626): **success**, exact head `433fcc621c03461f8d6a4f7218855c604e384744`, including the archive-forgery regression and status compatibility.

**Interpretation.** This adds a testable prerequisite for comparing physical opponent *initial conditions*. No true candidate deck-performance effect, attack mechanic, player-policy competence, full match fidelity, replay randomness or win-rate improvement is inferred. Two equal hashed openings need not lead to comparable subsequent opponent play or common random-number trajectories. The sampled [Agent26 source-deal study](agent26-full-source-deal-setup-parity-20261020.md) established equality in its *specific* original champion/Hood/Temple setup blocks, but the equality must be observed again for any new candidate family, seed population and code revision. The latest rank6/rank11 common actor-only development arms still count **zero competitively qualified games**. The fixed 60 target remains unmet.

**Next use.** Before declaring paired candidate-deck treatment effects in a prospective, full-game common-policy cohort, preserve the original source-side native SHA and validate the stronger gate. Report all attempted source-deal mismatches and failures rather than filtering them out of a success-only denominator. Separately validate full root chronology, initial and continuing turn ownership, policy decision skill and attack/lock mechanics.
