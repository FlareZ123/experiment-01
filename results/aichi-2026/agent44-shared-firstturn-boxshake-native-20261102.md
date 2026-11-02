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

## Executed canonical both-seat actor integration: positive witness

The [default-off canonical bridge](../../simulation/evaluation/agent44-canonical-boxshake-composition.cjs) installs the Box native continuation inside the existing Agent7 canonical actor chain without replacing its root, select, fog, attack and prompt components. The [three-source-deal original native pilot](../../simulation/evaluation/agent44-canonical-boxshake-native-pilot.cjs) compares baseline common canonical to the *same* common canonical with the flexible Box component switched on. Both real actors are given the same canonical policy and Box extension. The adapter explicitly labels common generic bot fallback as unqualified.

[Manual run 41407175159](https://github.com/FlareZ123/experiment-01/actions/runs/41407175159) **SUCCESS**, source commit `758eb0148b549af1ab71f2df88c451461d13ed0d`, includes:

| Original rank8 physical deal | Policy Box K0 offers | Actual opponent-turn Tool-Garbodor | Errors |
| --- | ---: | ---: | ---: |
| Retrospective known-positive seed `214648959` | 1 | **1** | 0 |
| New independent registered seed index `304` | 0 | 0 | 0 |
| New independent registered seed index `305` | 0 | 0 | 0 |

The printed headless experiment's canonical source K0 is identical between baseline and treatment, and it checks physical deck hashes and actual starting player. The original positive survives the more realistic bilateral common actor interceptors, and the next opponent actor receives the board after native Shake settlement. There are **still no competitive-qualified games** or demonstrations of general source response competence. Retrospective success and two fresh no-opportunity samples must not be pooled as a win rate. Raw artifact [13123623297](https://github.com/FlareZ123/experiment-01/actions/runs/41407175159/artifacts/13123623297), ZIP SHA-256 `8a59e023a78c26787977975e0be63bd54e121c1180784dfb772aa142176d9aac`.

## Exact printed60 theoretical opening sensitivity

The recovered source rank8 sixty has one Secret Box, one Boost Shake, two Trubbish, two Garbodor, four Quick Ball, two Ultra Ball, four Float Stone, one Muscle Band and seven Basic Energy. [The deterministic source60 hand-model](../../simulation/analytical/agent44-box-firstturn-handmodel.py) draws seven initial cards conditional on a Basic, places six random Prizes and draws one firstturn card. It compares extremes in the player's choice to Bench other Basic starters: **none** versus **all**. It tests only held-card K0 and whether Shake, Garbodor, Tool and Trubbish search targets remain in the unprized deck. This is an approximate resource model, not a native policy simulation. Seed `44110207`; 200,000 pre-mulligan attempts generated 148,137 valid opening hands.

| Assumed Basic Bench strategy | Strict v1 Box K0 | Flexible v2 Box K0 | Flexible K0 plus K1 targets live |
| --- | ---: | ---: | ---: |
| No other initial Basics Benched | 901 / 148,137 = **0.608%** | 10,620 / 148,137 = **7.169%** | 8,944 / 148,137 = **6.038%** |
| All other initial Basics Benched | 172 / 148,137 = **0.116%** | 9,620 / 148,137 = **6.494%** | 8,104 / 148,137 = **5.471%** |

These model frequencies depend strongly on Bench choices, especially whether Trubbish is kept in hand. They ignore opponent Item lock, card sequencing, stronger competing plays, actual opponent continuation, source prize-recovery tricks, mulligan compensation and any paper-match clock. Their nominal Wilson 95% intervals for the flexible physical K0 probability are **7.039–7.302%** with no other initial Basics Benched and **6.370–6.621%** with all other Basics Benched. Do not use these as game-win percentages or confident estimates of actual bot trigger rates.

The immediate priority is to run and retain a substantial disjoint original native flexible cohort and then assess the natural prompt-abort/settled frequency. [Run 41406786273](https://github.com/FlareZ123/experiment-01/actions/runs/41406786273) did not reach gameplay: its three new observer unit fixtures omitted the mandatory native Active Slot; the fixtures were fixed at `6c0855feaab8659db7cb19326ae7342a0ec63356`, while the original seven narrow K0 tests and all owner-K1 category tests passed in that failed run.

## Completed 32-original-deal flexible firstturn native cohort

[Manual native run 41407960444](https://github.com/FlareZ123/experiment-01/actions/runs/41407960444) at fixed original repo checkout `707f7bb53b6d78aa7d5604774b5b6e0ede4979cd` finished SUCCESS, with the three observer unit fixtures corrected and **all 33 scheduled pair records** persisted in [raw artifact 13124965916](https://github.com/FlareZ123/experiment-01/actions/runs/41407960444/artifacts/13124965916), ZIP SHA256 `c7da15b174dba1038e1c9e4c09a2aea12d6f2047efa8c3fee1a3642da90426a4`. No observed native Store execution error occurred; initial original source K0 state, deck hash and starter parity are checked per row.

| Cohort and original physical seed index | Original dealt source seat | Eligible K0 Box proposal | Actual firstturn native Tool-Garbodor and opposing-turn public-board witness | Incomplete |
| --- | ---: | --- | --- | --- |
| Previously selected seed `214648959` | 0 | 1 | **1** | 0 |
| Previously unobserved `272..303` (32 distinct scheduled physical seeds) | both alternate | **3 / 32** | **2 / 32** | **1 / 32** |
| Specific completed new original trial `286` | 0 | yes | yes | no |
| Specific incomplete new original trial `289` | 1 | yes | no | yes |
| Specific completed new original trial `299` | 1 | yes | yes | no |

Within the independently scheduled 32 seed indices: **29 had no eligible opening opportunity**, **two completed native firstturn equipped Garbodor**, **one offered and failed to complete**, **zero engine errors**. The previously selected original seed is excluded from that denominator. These are *conditional native action-sequence outcomes* and contain no paper win-rate estimate. Source prompt selectors use real only-own-deck revealed K1 cards after the real Secret Box owner search, and every comparator starts from the same physical cards with no research-zone replacement. The two new positive original physical deals support generality of the executable line on both actor seats within this limited source versus Hood pair. The incomplete seed `289` is retained as a first-class negative, with its reason under targeted post-hoc diagnosis; do not silently discard it.

The additional freedom raises opening opportunity compared to the narrow held-Trubbish-and-Tool rule, yet the resulting 3/32 rate must **not** be read as the precise target metagame probability. It is an unselected *original physical-deal cohort* under a particular native opponent, native initial game policy, public locks, available hand cards and setup timing. We still lack a whole-battle competent policy, 25-minute paper clock, all 32 fully identified original decks and any competitive-qualified game.

## Strict accepted-root chronology and post-hoc failed prompt

A stronger [public action-ledger proof module](../../simulation/evaluation/agent44-boxshake-opponent-reply-packet.cjs) now requires the *actual Store-accepted* source Secret Box root, Tool attachment and Boost Shake root in order, in the same source opening turn, plus a non-prompt opponent root on the immediately following global turn and a public Tool-Garbodor board. [Negative and reverse-seat tests](../../tests/agent44-boxshake-opponent-reply-packet.test.cjs) independently reject missing Tool, wrong turn, premature prompt and absent opposing root. It never reads concealed opponent cards.

[Manual canonical integration CI 41409207301](https://github.com/FlareZ123/experiment-01/actions/runs/41409207301), SHA `50afecd6a763b210d1dd0d198c0486abb0cd0fb9`, **SUCCESS**. The previously selected original rank8 seed `214648959` passed **all strict root chronology gates**, with two native opponent public roots immediately after the firstturn Box->Tool->Shake and real equipped Garbodor public board. Both independently registered fresh original source seed indices `304,305` produced no offer, no opponent-root proof and zero native errors. Exactly **one retrospectively selected strict positive**, two new zero-opportunity observations, zero competitively qualified games. The strict native public-root receipt confirms a real opponent action *opportunity*, without certifying whether the opponent's policy chose a good counter.

[Retrospective diagnostic CI 41409288722](https://github.com/FlareZ123/experiment-01/actions/runs/41409288722) at SHA `01355e0b1ae072b72e2aaeb7660d94fb176494ec` reproduced only the previously observed incomplete original source index **289**, plus known-positive control, both without engine error. The source's actual turn2 sequence accepted the three real Box discards, fetched owner-deck Shake plus Tool, and played its held Basic-search Item. It stopped at `basic-search-discard` with `LATER_BASIC_PAYMENT_REJECT`, before any Garbodor evolution; this failure is a **native physical prompt payment-resolution problem**, not a demonstrated tactical opponent counter or a game loss. A detailed owner-only native prompt/card-shape diagnostic is being tested before deciding whether the available resource plan was invalid or the adapter chose a wrong payment.

All of the above remains development evidence; the 99.5% field objective is unverified.
