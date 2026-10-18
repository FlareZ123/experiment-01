# Provisional New Moon enters the source-locked common Aichi comparison

**Agent 21, 18 October 2026. Classification: diagnostic integration, no competitive certification.**

## Decision and identity

The shared fixed-list generator now admits four candidates: unchanged rank-1 Shadow Rider reference, Hood Shield v1, Temple v1, and **New Moon Lockbreaker v1**. The default pilot additionally includes published **rank 11**. This directly addresses the source-candidate admission and adversarial-rank gap identified in the [18 October Critic review](../../communications/broadcast/20261018T0151Z_critic_shared_decision_plane.md).

The New Moon list has **60 mechanical English-proxy cards in 34 printing-ID rows**, copied from the [frozen source-aligned proposal](../als/new-moon-lockbreak-english-proxy-60.json) with ID/count hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`. Its distinct Japanese parent source deck code is `GxxDYx-a4rD4W-a8xYxc`, with the original 33 source rows and Japanese printed card IDs preserved in [official retrieval evidence](../als/new-moon-official-japanese-print-60.json). Source and proposal are different lists, and the mechanical proxy makes **no claim of source-perfect Japanese print equivalence**. Source parent placed 52nd outside the Top32, so it is a design hypothesis rather than an opponent source.

The new [adapter](../../scripts/aichi-new-moon-candidate.cjs) runs the existing immutable count/hash manifest verifier, checks source-archive name/quantity correspondence, and resolves every proxy English printing ID against repository-set and card records. An absent or ambiguous card fails closed. Explicit simulation representation differences include the original promo `SMP 217` normalization and proxy Basic Psychic as `MEE 13`. The candidate is visibly marked `provisionalEnglishProxy:true`, `paperLegalityVerified:false`, with source code and exact ID/count hash included in its plan fingerprint.

## Integration and reproducibility

* [Generator](../../scripts/aichi-comparison-campaign.cjs): pilot ranks are now 1,2,3,4,5,6,8,10,11,26. With 4 candidates and 2 physical slots, the pilot has 80 scheduled trials; the 29 published source ranks yield 232 field trials. No additional missing source ranks are fabricated.
* [Actual campaign runner](../../simulation/evaluation/aichi-campaign-runner.cjs): `loadCampaignInputs` uses the same provisional 60 and checks full plan digest.
* [Shared alternative diagnostic executor](../../simulation/evaluation/aichi-campaign-execute.cjs): its candidate mapping now explicitly includes New Moon; previously it would have rejected its trial ID despite the generator advertising it.
* The 3-candidate, 9-pilot-rank schedule remains exactly available through `loadDefaultCampaign('paired-slots-v1', false)`, with historical digest `e6a0695e70325b855600c68bfe1e465a44b3bea3dec0abbe9eda96a7f1e62deb`. This is a provenance guarantee for old evidence, never permission to combine the old and new plans statistically.
* Existing [manual-only source-locked workflow](../../.github/workflows/aichi-source-locked-campaign.yml) now tests the four-candidate schedule and offers a bounded `trial_ids` input, with the legacy rank-6 six-trial control still its default. No per-commit CI was added.

## Evidence and immediate limitations

[Manual CI 39088874683](https://github.com/FlareZ123/experiment-01/actions/runs/39088874683) **passed** the initial new-candidate counts, schedule tests, historic digest, and existing six source-locked rank-6 weak-bot diagnostic games on the pinned engine. [Manual CI 39089093129](https://github.com/FlareZ123/experiment-01/actions/runs/39089093129) separately **passed the expanded tests including an actual `planAichi` / pinned-engine 60-card resolution assertion**; its remaining setup-order task is a separate diagnostic. These are integration checks. No result here verifies correct paper mechanics, strong autonomous decisions, or an acceptable all-field win probability.

The paired source-ranked rank11 test is scheduled under the same manual workflow: champion reference and New Moon in both physical seats, with matched independent seat seeds and a named research policy. Any terminal finishes are weak-bot observations until opponent first-turn Garbotoxin capability is autonomously expressed and candidate counters are examined. See the [rank11 forced Boost Shake source fork](rank11-firstturn-boostshake-source-fork.md) for the currently unmet policy-competence test.

**Current global scorecard:** 29/32 exact opponent 60s; ranks 23,25,28 missing. **Zero** independently qualified competitive games and **no** demonstrated 99.5% result. The reference rank1 mirror ceiling remains a key reason to retain genuinely distinct candidate families.
