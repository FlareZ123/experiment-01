# Original rank-5 Energy Mix under isolated physical and policy RNG: two native paper-shuffle opportunities with real opponent replies

**Agent 19 | 5 November 2026 | paper Expanded, Black & White onward | developmental source-dealt native experiment.** All eight pre-registered fixed-60 physical games were played under each of two policy-correction modes. This is a *retrospective* mechanism-sensitive test, never a competitive sample.

## Registered intervention and provenance

The independently committed [registration](../aichi-2026/registrations/agent19-rank5-energy-mix-independent-seat-rng-retrospective-20261105.json) fixes four historical outcome-selected rank-5 Mew/Genesect physical seed groups, both original source positions and both existing fixed candidate 60s: **champion-reference** and **new-moon-lockbreaker-v1**. The exact original rank-5 printed source 60 is held unchanged and needs **zero** simulator substitutions. The old comparison's paper target guard applies in **both** arms:

- **A, guard-only control:** original pinned Mew V Fusion Strike **Energy Mix** implementation, which omits its printed final shuffle.
- **B, guard + printed shuffle:** default-off [Mew V paper shuffle hook](../../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs) requests and settles a genuine native `ShuffleDeckPrompt` after the Energy Mix Energy attachment.
  
**Crucial new protocol, identical in A and B:** the [reversible independent-seat RNG wrapper](../../simulation/twinleaf/agent19-independent-seat-rng.cjs) sets `isolatePhysicalShuffleRandomness:true` and `isolatePolicyRandomness:true` for every actual headless match. This gives each seat its own deterministic physical-deck-shuffle and speculative-policy random stream. It removes the specific *cross-seat physical-shuffle RNG cursor* coupling identified by [Agent 4](../methodology/agent4-native-shared-shuffle-rng-coupling-20261105.md); global native coin flips and all state-dependent decision effects are **not** independently isolated.

**Native source:** pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; [replay entrypoint](../../simulation/evaluation/agent19-rank5-independent-seat-rng-paired-native.cjs) checks exact Git blob SHA1s for the registered source roster, common-policy profile, existing runner, RNG wrapper and headless implementation. The 16 real `runMatch` calls were observed by the wrapper. Every native row and the complete raw action ledger are preserved in a locked, atomically replaced JSON archive.

**Compiled original CI:** [run 42103271407](https://github.com/FlareZ123/experiment-01/actions/runs/42103271407), head `c000c120b8ddd5c9e8b5e00eb5e012b07d969099`, targeted step **17 succeeded**, including three pure wrapper tests, syntax preflight, exact registration/hash check and all native attempts. The whole shared workflow is **red** because subsequent unrelated historical Snorlax-Arceus `INVALID_TARGET` test step 18 failed; archive step 22 succeeded. [Artifact 13451245659](https://github.com/FlareZ123/experiment-01/actions/runs/42103271407/artifacts/13451245659), ZIP SHA-256 `3f8eca659ceac5f6fb1fa5215045071dff8999f51a53d3f215f6a13deeb40e6a`, contains the full `agent19-rank5-independent-seat-rng-paired-native.json` and a short JSON summary.

## Actual original source two-seat observations

| Native observation | Guard-only A | Guard + printed shuffle B |
| --- | ---: | ---: |
| Registered native original-source attempts executed | **8 / 8** | **8 / 8** |
| Original-source settled `Cross Fusion Strike` copies | 30 | 19 |
| Source-owned copied **Energy Mix** selections | **2** | **2** |
| Genuine same-root Energy Mix `AttachEnergyPrompt` | **2** | **2** |
| Same-root **printed final shuffle settled** | **0** | **2** |
| Original-source missing printed shuffles | **2** | **0** |
| Independent blocked-recipient guard rejections | 0 | 0 |
| Native terminal / native action-cap | **4 / 4** | **4 / 4** |
| Competitively qualified games | **0** | **0** |

The **8/8** A/B pairs matched the complete physical initial deal fingerprints, original-source deal fingerprints, and actual starting-player seats. The six pairs without a source-owned Energy Mix choice remained **exactly identical in complete native root-action digests**. Precisely two pairs diverged, with the **very first** difference on the printed final shuffle:

| Source `rank:repeat:seat:candidate` | Initial source seat | First mismatch root action ordinal | Prior identical chain | A at mismatch / B at mismatch |
| --- | ---: | ---: | --- | --- |
| `5:0:B:champion-reference` | 0 | **45**, global turn 7 | Source `Cross Fusion Strike` root 42; copied `Energy Mix` 43; Energy attachment 44 | `WaitPrompt` / `ShuffleDeckPrompt` |
| `5:0:B:new-moon-lockbreaker-v1` | 0 | **44**, global turn 7 | Source `Cross Fusion Strike` root 41; copied `Energy Mix` 42; Energy attachment 43 | `WaitPrompt` / `ShuffleDeckPrompt` |

Both cases have an actual **Store-accepted original-source physical transfer of Double Colorless Energy SUM onto Benched Mew V FST**. The independent native public-attachment sidecar observes the same target, source Energy identity and before/after zone transition across both A/B modes. The treatment's shuffle settles *after* that attachment, as printed. No unrelated attachment or candidate-seat Energy event was counted toward the two original-source copies.

**Genuine subsequent opponent actions:** in both A/B modes, on the next global turn **8**, the champion-reference opponent played an ordinary native root and used settled **Full Moon Rondo**, increasing damage on Active Mew VMAX from **140 to 260**. The New Moon opponent made a real turn-8 root and used settled **Motivate**, increasing damage on Active Mew VMAX from **60 to 80**. Thus the two registered source-Energy-Mix paths have observable physical payment, real source board payoff, and a responding opponent attack. These remain unqualified *developmental* decisions by automated players; there is no human-quality opponent policy or official Aichi clock.

The modes differ in subsequent recorded copies and action histories for the two positive pairs. The final native winner in each matched pair happens to be the same, but **native winners are not paper-tournament winners**. Do not attribute the 30-versus-19 total copied attacks to an improvement or regression: it is a *post-treatment* total with feedback, differing game horizons, and decisions. The six untouched pairs provide negative controls for the conditional hook.

## What this resolves and what it leaves open

1. With the new protocol, an extra source-owned physical shuffle **cannot directly advance the opposite seat's physical-shuffle RNG stream**, unlike historical shared-stream tests. The new matched two-pair root witness establishes the missing required paper shuffle as the first observed root-action change; both pairs retain a genuine next-opponent attack.
2. The **same numeric seeds are not the same initial physical deals across old and new RNG protocols**. The 3 November historical shared-RNG replay observed 15 baseline and 21 corrected Energy Mix choices, but under this independent physical+policy RNG protocol only two occur in each arm. Therefore older 15/21 totals and current 2/2 totals must **never** be pooled, compared as matched games, or interpreted as independent event-rate estimates.
3. The global coin stream, printed legality of all other game effects, full owner-information noninterference, multi-card target/cost semantics, source strength of the decision policy, official event time limit and three unavailable Aichi exact originals are still unresolved. The present experiment does not certify an entire match.
4. For meaningful follow-up, establish a fully accountable source-owner payoff/opponent decision in the **steward-selected Issue #25** two-seat release, ideally with an opportunity denominator rather than retrospectively chosen positive seed groups. The rank-5 Energy Mix witness is a regression case for source-to-payoff-to-reply custody; it does not itself promote a fixed 60.

**Field and claim boundary:** **29/32** original Aichi deck name/count inventories authenticated, ranks **23, 25, 28** missing; **zero competitively qualified games**, **no selected single final 60**, **no demonstrated 99.5% game win rate**.
