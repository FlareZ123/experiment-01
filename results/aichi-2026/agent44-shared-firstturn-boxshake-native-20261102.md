# Agent44: shared first-turn Secret Box -> Boost Shake original-deal native policy

**2 November 2026. Development-only source competence intervention. Original printed rank-8 Yusuke Kobayashi Absol/Garbodor, versus unchanged Hood Shadow Rider; both physical seat policies symmetric. No competitively qualified match.**

## Decision problem

Original rank8 can use Secret Box to access Boost Shake and turn a newly played Trubbish into a Tool-equipped Garbodor on its first ordinary turn. An earlier native first-turn witness executed this line on unchanged original source seed `214648959`, while a previous 256-deal original Store census found 21 owner K0 resource windows. Those reports used a scripted seed or a passive scout. A general native actor still had no decision mechanism taking this line from eligible owner state to native payment, search, evolution and opponent reply.

Existing evidence: [original K0 48 + 208 scout](agent44-rank8-original-k0-source-census-20261030.md); [original native firstturn seed](../../simulation/twinleaf/agent44-rank8-original-firstturn-boxshake.cjs); [synthetic K1 category witness](agent44-rank8-native-box-fetch-shake-synthetic-20261030.md). The source rank8 original printed 60 fingerprint is `6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541` in [the admission ledger](original-printed60-admission-v1.json).

## Implementation

A new [default-off shared owner policy](../../simulation/twinleaf/agent44-owner-boxshake-native-policy.cjs) wraps the *same* pinned native SimpleTacticsAi chooser for both seats, with reversible restoration. Its K0 offer uses only the current player's hand, face-up Active/Bench and public Item/Tool lock. To avoid hypothetical access and discard credit, this first version deliberately requires held Secret Box, held Trubbish and Float Stone/Muscle Band, one open Bench slot, first-owner global turn 1 or 2, and three physically present upfront Box discard candidates. It excludes many other legal search routes, so its exposure count is a conservative named-line indicator rather than an upper bound.

The native decision path uses real `PlayCardAction` and `ResolvePromptAction`: pay three actual owner-hand cards, open the native owner-only Secret Box search prompt, use [the previously validated owner-K1 selector](../../simulation/twinleaf/agent44-secretbox-owner-prompt.cjs) to identify unprized Boost Shake and Garbodor from the newly authorized searched owner deck, Bench held Trubbish, attach held Tool, play searched Shake, choose native Garbodor and legal evolution recipient. The **native outcome** requires an actual opponent-turn decision boundary with public Tool-equipped Garbodor on the source Bench. A mere target proposal is insufficient. K1 rejection/abort and untouched default fallback are logged separately. The native wrapper reads neither hidden opponent hand, deck, Prizes nor unrevealed own deck before search.

[Unit tests](../../tests/agent44-owner-boxshake-native-policy.test.cjs) cover firstturn and lock gating, physical three-card payment, reserved Tool/Trubbish, and opponent-turn settlement versus a premature or failed post-prompt claim. This prototype does **not** certify the underlying generic bot's global owner-information safety.

## Frozen development comparisons

[The paired original-deal runner](../../simulation/twinleaf/agent44-original-boxshake-shared-policy-pairs.cjs) preserves one retrospectively selected known-positive original source seed `214648959` as a *positive control*, and prospectively declares a distinct sixteen-source-deal cohort with SHA-256 schedule label `agent44-original-rank8-preregistered-box-k0-20261030`, indices `256..271`, alternating physical source seat. This new cohort is disjoint from the previous initial `0..47` and extension `48..255` observed trials. Each registered seed is run unchanged as baseline and shared-policy treatment, with identical printed original source/Hood 60, physical seed, actual starter and owner initial K0 witnesses; no artificial hand/deck/Prize swaps. Every no-opportunity, incomplete, engine-error, cap and terminal is retained. Baseline-versus-treatment within the same fixed candidate is the supported comparison; the study has no field-level performance claim.

The original pinned engine was built using existing **manual-dispatch-only** [Hood interaction CI](../../.github/workflows/aichi-hood-interaction.yml). [Run 41405028487](https://github.com/FlareZ123/experiment-01/actions/runs/41405028487) completed SUCCESS on `d172786e70f7669e5ffcf4f1930ac3ac029d4cbc`: native compile, seven initial pure policy tests, paired runner execution and complete archived artifact [13123540568](https://github.com/FlareZ123/experiment-01/actions/runs/41405028487/artifacts/13123540568) all succeeded. Its original implementation counted tentative target resolution at proposal time; the later strict witness now requires the opposing actor's native turn and public board. Do not re-label that first run as a completed opponent-reply witness. A subsequent manual run includes summary printing and additional opponent-boundary correction; treat revisions as distinct evidence.

**Qualification vetoes:** Early native prompts may be legal yet strategically dominated by alternate Box category allocation; the three discard cards are only physical choices rather than a full game-state DCI calculation. The rest of the both-seat generic AI can make concealed-information-dependent or strategically weak decisions; firstturn admitted native evolution does not certify opponent response competence, the complete paper rules, Aichi's 25-minute clock or match victory. A source-specific mechanic cannot select the best fixed 60 across 32 source lists.

## Integration next step

Once an unmodified original-deal natural run demonstrates a full Store-confirmed line with opponent continuation, expose the new default-off owner-root and search/prompt selectors inside the canonical bilateral common actor and measure the same fixed 60 across meaningful source ranks. Source competence must be evaluated under an externally pinned combined profile, with all actual physical start seats and failed arms recorded. There is currently no competitively qualified game, and 3 of the 32 published original source 60s (ranks 23,25,28) remain unrecovered.

## Completed narrow shared-policy cohort: explicit 1 + 16 outcome

[Manual run 41405548401](https://github.com/FlareZ123/experiment-01/actions/runs/41405548401) succeeded on source checkout `6a796e3bd695b85d63784b29ec52777980cf5ca4` at 07:25 UTC. Its job log printed the entire predeclared 17-row status, and its raw trial archive is [artifact 13123038695](https://github.com/FlareZ123/experiment-01/actions/runs/41405548401/artifacts/13123038695) (ZIP SHA-256 `a491f27018d5502031907869392cae00b551a5c9f57281ad88db0f270956469c`).

| Original physical cohort | Count | K0 Box offers | Native firstturn evolved + opponent public equipped Garbo | No offers | Native errors |
| --- | ---: | ---: | ---: | ---: | ---: |
| Retrospectively selected historical seed `214648959` | 1 | **1** | **1** | 0 | 0 |
| Separately registered new seed indices `256..271` | 16 | **0** | **0** | **16** | **0** |

The archived source-positive run preserved the unchanged original K0 and physical-deal fingerprints against its baseline and recorded the opponent-turn public board. The 16 no-offer trials retained unchanged baseline versus treatment decision traces. These 16 new observations do not establish the tactic's population frequency; the first K0 policy demands both a held Trubbish and held compatible Tool together with three spare physical cards, a stricter conjunction than the earlier source K0 census.

### Expansion now registered

A separate [flexible K0 planner](../../simulation/twinleaf/agent44-flexible-box-k0-plan.cjs) retains real three-card upfront Box payment while allowing Secret Box to fetch a compatible Tool, an already in-play Trubbish, or a held Quick/Ultra Ball with sufficient later discard liquidity to find Trubbish. [Its unit suite](../../tests/agent44-flexible-box-k0-plan.test.cjs) covers all three extended pathways plus negative payment and public-lock cases. The same native hook has an explicit `{flexible:true}` profile that adds Quick/Ultra search/discard stages and first-turn Tool category selection. It is separately registered against **32 disjoint, unselected original physical rank8 source seeds `272..303`**; those results must not be mixed into the earlier 16 narrow-offer denominator. No favorable outcome is pre-assumed. The existing manual CI input `agent44_rank8_shared_boxshake_flexible` is default OFF and never changes existing historical runs. The expanded profile is being checked independently.
