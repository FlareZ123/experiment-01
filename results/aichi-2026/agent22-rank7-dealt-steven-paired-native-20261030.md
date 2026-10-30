# Agent 22: preregistered natural rank-7 Steven owner-search choice pair

**30 October 2026 | original frozen 60-card source lists | genuinely dealt pinned Store games | all attempts developmental.**

## Question and frozen protocol

Can a native-valid, owner-printing-only utility scorer alter a genuine Steven's Resolve search choice, in an ordinary starting deal, while preserving the same exact opposing 60, physical source deal, and both possible physical seats? The [registration](registrations/agent22-rank7-dealt-steven-pair-20261030.md) predates first native execution and freezes exact opponent rank1 Yasunori Kato Shadow Rider Calyrex and rank7 Hiroto Fuji Snorlax Stall, seeds **324711001** and **324711002**, source seats **0** and **1**, and an action cap of **80**. Both lists are unmodified 60-card published registrations from `full-decklists.json`, resolved under disclosed energy and promo compatibility settings. Pinned Twinleaf SHA: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Two policies are identical except for a search-only choice callback at the genuine owner-held Steven search:
1. **Lexical control:** original `firstNativeValidBundle` chooses first complete 3-card printing multiset under native validator.
2. **Scored treatment:** static illustrative print values +10 VS Seeker PHF, +8 Counter Catcher PAR, +6 Capture Energy RCL, other 0, -100 for each repeated printing. The solver considers complete, native-valid bundles only. The scorer does not read concealed opponent cards or deck order. There is no claim these weights are strategically correct.

The native owner-only search interception is limited to **rank7 source seat**; other actor follows unmodified research headless bot. The previous first-lexical adapter is preserved as a control; no global default policy change. These are real Store-generated opening deals, unlike the earlier staged proof.

## Original execution and numeric-shuffle reconciliation

The **first** complete [manual run 40978046488](https://github.com/FlareZ123/experiment-01/actions/runs/40978046488) succeeded as an action script. Its artifact [12944040430](https://github.com/FlareZ123/experiment-01/actions/runs/40978046488/artifacts/12944040430), SHA256 `a5c646c824a04fdc5213f655439464d4496b05cf2bf8b0061be6b7bb1e9c4fcb`, contains eight developmental rows. However, a separate read of the earlier staged native artifact found a **known pinned ShuffleDeckPrompt validator defect**: `validate` rejected 43-card permutations while Store dispatch could still appear to advance. The first eight-deal run did not use the scoped numeric validation hook and **must not certify shuffle legality or full rules fidelity**.

The corrected [manual CI 40978454596](https://github.com/FlareZ123/experiment-01/actions/runs/40978454596) **passed** with the existing reversible `withNumericShuffleValidator` applied to both branches and the staged control. Commit at workflow dispatch `b86c342617af57131bf646f920c84953fcd50eba`; corrected artifact [12943737491](https://github.com/FlareZ123/experiment-01/actions/runs/40978454596/artifacts/12943737491), ZIP SHA256 `29fd453331671bca111e69f603082f7f88d490b2e2ccf258dd92786b12f24249`. Its staged proof reports `nativeValidatorAccepted:true` for **each of four true 43-card ShuffleDeckPrompt permutations**. An opponent-side WaitPrompt remains pending immediately after turn handoff, and is explicitly retained, not mislabeled as settled.

The actual-deal archive reports all four same-source-deal fingerprint pairs, all eight source-deck 60 identities unchanged, **four accepted and postcondition-confirmed Steven selection prompts per policy**, zero thrown exceptions, and all eight capped by 80 actions. This is native action evidence with a corrected validator, not a complete rules certification.

## All preregistered attempts

| Seed | Rank7 source physical seat / actual start | Same initial source deal | Control natively accepted searches | Scored natively accepted searches | Control turn count at cap | Scored turn count at cap |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 324711001 | 0 / first | Yes | 2 | 2 | 7 | 8 |
| 324711001 | 1 / second | Yes | 1 | 1 | 6 | 6 |
| 324711002 | 0 / first | Yes | 1 | 1 | 10 | 10 |
| 324711002 | 1 / second | Yes | 0 | 0 | 7 | 7 |
| **Total** | **2 first, 2 second physical source starts** | **4/4** | **4** | **4** | | |

Every authentic search in the three exposed pair cells chose a different three-card printing multiset under scoring than under the lexical default, while the fourth pair never exposed a qualifying Steven prompt on either branch. Source seed 324711001 seat0 searched twice. Both scored selections again chose Capture Energy, Counter Catcher, VS Seeker: this repetition illustrates that **fixed static weights lack a resource-hold and incremental-value model**; it is not evidence that taking copies was strategically wrong. The control chose Artazon/Bellelba/Capture first, then Capture/Chaotic Swell/Counter Catcher.

The recorded winner for **all eight** is the simulator's unfinished marker (`-1`); every game stopped at the exact **80-action cap**, with **six Prizes remaining for each player**. There was no engine terminal win, no complete endgame, and no quantitative deck improvement. The source player can perform real owner searches under the test's bot, but play beyond these local opportunities remains unqualified.

## Consequence, limits, and reproducibility

This experiment closes a narrow question: value-based, complete combination selection can be exercised in authentic 60-vs-60 source deals in both seat orientations with identical initial physical deals and natively accepted prompted choices. Its most consequential negative is that **changing those choices alone yielded no terminal outcomes across the frozen eight arms**.

The general two-player source policy still lacks robust resource/Supporter arbitration, paper-card coverage, full hidden-information safety and clock fidelity. The scored treatment uses a deliberately hand-picked static model, ignores its previous Steven acquisitions, and has no native opponent decision competency evidence. Neither raw terminal absence nor the 80-action cap estimates a win rate. The full Aichi Top32 remains 29/32 exact 60s, missing ranks 23,25,28, with **zero competitive-qualified games**, no verified fixed 60 and no demonstrated 99.5%.

**Reproduce:** `simulation/twinleaf/agent22-rank7-dealt-steven-pair.cjs`; the predeclared single source-dealt exercise is opt-in `rank7_dealt_steven_pair:true` plus `native_search_only:true` in the existing manual-only `.github/workflows/agent5-owner-root-native.yml`. No per-push workflow was added.
