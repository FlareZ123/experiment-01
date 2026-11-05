# Agent 1: eight original-source Wonder Tag native receipt and role-attribution boundary

**5 November 2026 | Research status: developmental, zero competitively qualified games.**

## Evidence and precise execution revision

[Manual native run 42078654479](https://github.com/FlareZ123/experiment-01/actions/runs/42078654479) completed **successfully** at research commit `877b48581587d02a79279b3a18e2796104ae60b8`. The compiled pinned-Twinleaf job passed its pure prechoice gate, the historical 16-Store experiment, its first Wonder Tag unit gate, its exact frozen eight-ID A/B native stage, and upload steps.

Actual [Wonder Tag artifact 13438334115](https://github.com/FlareZ123/experiment-01/actions/runs/42078654479/artifacts/13438334115) contains `agent1-issue25-protected-wondertag-v10.json` (8,106 bytes); recomputed SHA-256 **`b8b2166d08776caa65158c07b3818cca1920c24e9e35906ec82df1f6c7c265a1`**, matching its archived checksum sidecar. All eight registration IDs and both player seats were retained. Initial real Store input/request HMAC and native first-player parity: **16/16**; actual sixty-printing equality with each native configuration: true; common vendor and source revision: true. All eight after-setup source deal fingerprints match between these same-contender experimental arms. Initial equality does not certify later opponent strategy or a deck-versus-deck causal comparison.

## Actual native A/B dispositions

| Registered ID | Protected baseline | Wonder Tag treatment | Interpretation |
| --- | --- | --- | --- |
| `6:100:A:champion-reference` | capped after 48 roots | capped after 48 roots | Unqualified |
| `6:100:A:new-moon-lockbreaker-v1` | capped 48 | capped 48 | Unqualified |
| `6:101:B:champion-reference` | capped 48 | capped 48 | Unqualified |
| `6:101:B:new-moon-lockbreaker-v1` | capped 48 | capped 48 | Unqualified |
| `11:102:A:champion-reference` | engine error after 25 roots | engine error after 25 roots | Unqualified |
| `11:102:A:new-moon-lockbreaker-v1` | capped 48 | capped 48 | Unqualified |
| `11:103:B:champion-reference` | engine error after 11 roots | capped 48 | Error avoided; outcome censored |
| `11:103:B:new-moon-lockbreaker-v1` | engine error after 17 roots | capped 48 | Error avoided; outcome censored |

Baseline: **five capped, three errors**. Treatment: **seven capped, one error**. No accepted gameplay beyond an action cap is inferred; no game was certified.

Within the treatment, the real owner-specific Wonder Tag native handler observed **two native affirmative confirmation prompts, two legal owner-deck Supporter search prompts, and two exact physical Supporter-to-hand transfers**, with **four accepted prompt actions, zero rejections, zero unsettled prompts and zero custody failures**. All four accepted handler actions were recorded at native player seat 0. The separate printed-zero-selection shuffle wrapper saw two nonempty searches and **zero actual empty searches**; the empty-selection branch was therefore not exercised in this archived run. These are card-interaction witnesses, not source attack or payoff/reply witnesses.

## Attribution limit and next gate

**The archived revision cannot certify which registered trial and opponent/contender role owned each of the two successful searches.** Its sanitized JSON has aggregate `bySeat` counts, but lacks a trial-ID-to-prompt join. Physical seat 0 is an original-source seat for registration `B` and a contender seat for `A`. Therefore this archive does not authorize claiming two *original-source* Wonder Tags or a game outcome.

After that compiled run, Agent1 added `simulation/twinleaf/agent1-wondertag-registered-actor-witness.cjs` and a new comparison output `registeredWonderTagActorWitness` to bind genuine search decisions to the active native trial ID and physical actor seat without publishing concealed deck choices. A further source-side audit now requires consistency among native confirmation and search counts, actual Store settlement, exact Supporter transfer counts, both-seat action totals, and zero-selection shuffle obligations before emitting an `original-source` versus `contender` settled-role census. Synthetic positive, mixed-role, rejection and missing-shuffle tests were committed after this archive. **These post-run changes have not yet been validated in a new compiled run and cannot be retroactively assigned to the old artifact.**

Suggested next reproducible check: rerun the existing manually dispatched `issue25_v8_only: true` job at the new source commit, check the native source-role census and all fail-closed gates, and publish the new actual archived trial-to-role decisions. Only then connect an original-source Supporter transfer to a legally paid attack or characteristic control effect and an opponent reply in the selected steward policy. Preserve the shared-physical-shuffle RNG-coupling caveat from Agent4's 5 November A/B/A work. **No final fixed 60 is selected and the 99.5% target remains unproven.**

## Subsequent pure-logic verification and further limitation

The new comparator source and 13 associated pure regression callbacks were executed synchronously in an isolated JavaScript V8 harness with mocked native engine imports; **13/13 passed** for registered-role attribution, mixed source/contender role, count and seat contradictions, invalid trial ID, privacy, and missing shuffle-audit evidence. This is a functional check of the committed comparator with substitute dependencies; **it is not a Node CI run or a compiled native Store integration**.

A successful native owner-deck Supporter-to-hand transfer occurs before any later required deck shuffle is independently proved completed. The revised receipt therefore explicitly sets `nativeShufflePromptCompletionIndependentlyCertified: false`. The source/contender `settledRoleCensus`, when later backed by native execution, must be interpreted as authenticated **Supporter transfer custody**, not as proof that the whole printed Wonder Tag effect and its shuffle finished in a paper-valid state. This limitation is especially relevant to action-capped or aborted runs.

## 21:24 UTC further evidence-gate hardening and new opt-in callback observer

Further inspection of the pinned Twinleaf `tapu-lele-gx.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` confirms that selecting a nonempty Supporter from Wonder Tag schedules a separate `ShuffleDeckPrompt`; a zero selection omits the printed shuffle in the pinned engine. The prior native receipt counts the Supporter move and prompt decision but **does not establish that the subsequent ShuffleDeckPrompt callback executed**.

Added a narrowly scoped read-only observer [`agent1-wondertag-native-shuffle-completion.cjs`](../../simulation/twinleaf/agent1-wondertag-native-shuffle-completion.cjs), with [five independent simulated native callback tests](../../tests/agent1-wondertag-native-shuffle-completion.test.cjs). It intercepts only the exact printed `Tapu Lele-GX GRI` instance's own shuffle prompt under `PlayPokemonEffect`, observes the callback returning successfully, and records the physical owner seat. Unresolved callbacks and thrown callback failures stay separate. It never selects an action, inspects the private deck contents or modifies the upstream implementation.

The v10 experimental wrapper now places this native shuffle observer outside the existing zero-selection correction and Wonder Tag owner prompt wrappers. The comparison requires **actual native ShuffleDeckPrompt completions and matching owner-seat counts** before setting `nativeShufflePromptCompletionIndependentlyCertified=true`. It continues to expose incomplete transfers and shuffles rather than automatically certifying them. [19 comparator test callbacks](../../tests/agent1-issue25-protected-wondertag-v10.test.cjs) and **5 callback observer test callbacks** passed in isolated pure JavaScript harnesses with synthetic native-class dependencies; these do not certify execution in the compiled native engine. The comparison additionally rejects absent private HMAC session identifiers, duplicate cross-trial physical Store ordinals, contradictory same-Store first-player assignments and mismatched owner-side request identity.

This implementation is a future native instrumentation candidate. **The successful historical 42078654479 artifact predates all these additions and cannot be reclassified**. A newly dispatched compiled native experiment remains necessary for actual owner-trial-specific printed shuffle callback evidence, source action and opponent reply; preserve unqualified status until then.

## Trial-local native shuffle callback join, 21:32 UTC

The initial callback observer could prove shuffle callback counts by seat but would not distinguish two trials played in the same physical seat. The stricter version now receives a read-only **registered native trial ID getter** from the existing `headless.runMatch` witness, captures each offered and completed printed shuffle as `{id, seat}`, and refuses callbacks that settle under a different trial identity or replay an already-settled callback. Only IDs and seats are recorded. Concealed deck cards, their order and raw hand details remain unavailable to the report.

The paired comparison now requires the exact multiset of **registered trial/actor pairs** with selected Supporters to equal both the native shuffle-offer multiset and the native shuffle-completion multiset. Same-seat shuffles from another game cannot substitute for missing paper shuffle completion. Additional synthetic tests specifically forge this cross-trial substitution and verify the shuffle flag remains false.

**Fresh isolated pure-JavaScript results:** 20/20 current comparator tests and 8/8 current native-shuffle observer tests passed in an executable V8 harness with mocked engine dependencies, alongside earlier separate actor-identity tests. These tests are useful source-level regression evidence, with the same native compiled-execution limitation as above. The historical archive contains no trial-local shuffle receipt, and remains unchanged.

The correctly scoped future receipt has three distinct evidence levels: physical Supporter reaching its owner hand; registered-trial native shuffle callback completion; and a later paper-legal source attack or lock consequence followed by the actual opposing decision. The third remains unobserved.
