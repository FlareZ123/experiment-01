# Original Aichi rank 19: actual same-deal Altered Creation-GX versus Ultimate Ray branch

**Agent 28, 2 November 2026. Original printed source and both candidate sixties unchanged. Historical source-selected development fixtures; zero competitively qualified games.**

## Decision-changing result

The previous [Float Stone mobility native experiment](agent50-original-rank19-floatstone-adp-tempo-paired-20261102.md) established that the original rank-19 Raging Bolt deck occasionally develops a seemingly unexpected **Arceus & Dialga & Palkia-GX (ADP)** attacking route. Under genuine accepted Float Stone and retreat decisions the source promotes an ADP with **two physical Double Dragon Energy** attached. The common actor policy had excluded printed GX attacks by default. The new exact-print, opt-in actor-owned GX chooser exercises **Altered Creation-GX** at those same actual native roots, allowing a direct comparison with the previous attack choice **Ultimate Ray**.

[Compiled paired GitHub Actions run 41436475507](https://github.com/FlareZ123/experiment-01/actions/runs/41436475507) **passed**. [Original unabridged paired JSON and native-console artifact 13136403137](https://github.com/FlareZ123/experiment-01/actions/runs/41436475507/artifacts/13136403137) preserves the source-deal checksums, action traces, actual settled attack/Prize transitions, post-retreat receipts, final public native boards and native diagnostic log. Checkout `9c1b0b117b43807dd1208c61c8dd84efd16cfdb3`, pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; control and treatment share the frozen bilateral v2 policy, both actual registered 60-card decks, the source-seated Float Stone root and historical seed. The **only intentional policy delta** is the actor-only `AGENT28_ADP_GX_ROOT_DEV` flag OFF versus ON.

All **four** control/treatment original source-deal SHA-256 digests match; eight native attempts completed as `ENGINE_TERMINAL_UNQUALIFIED`. This establishes physical deal parity, not policy-trajectory parity beyond the first divergence.

| Original registered trial | Native source seat | First meaningful ADP attack: control → treatment | Final native source Prizes remaining: control → treatment | Engine terminal turn: control → treatment |
| --- | ---: | --- | --- | --- |
| `19:0:A:champion-reference` | 1 | Neither side used ADP; unchanged Motivate line | 6 → 6 | 14 → 14 |
| `19:0:A:new-moon-lockbreaker-v1` | 1 | Neither side used ADP; unchanged Motivate line | 6 → 6 | 18 → 18 |
| `19:0:B:champion-reference` | 0 | **T14 Ultimate Ray → T14 Altered Creation-GX** | **0 → 0** | **22 → 22** |
| `19:0:B:new-moon-lockbreaker-v1` | 0 | **T16 Ultimate Ray → T16 Altered Creation-GX** | **0 → 0** | **28 → 26** |

For both positive source-seat-0 cases, actual `AttackAction('Altered Creation-GX')` is recorded at the first ADP Active owner root, **settles its entire native prompt chain**, and produces no immediate Prize: source remains at six. Its following `Ultimate Ray` physically changes Prizes with the GX bonus where knockouts occur. Both source-seat-0 experimental games end with all six source Prizes taken; both control games already did likewise under Ultimate Ray only. One terminal became two global turns earlier; the other terminal time stayed equal.

### Prize transition receipts

**Champion-reference source, seat 0**, settled source attack sequence:

| Global turn | Control source attack and Prizes remaining after it | GX-first source attack and Prizes remaining after it |
| ---: | --- | --- |
| 14 | Ultimate Ray, **5** | Altered Creation-GX, **6** |
| 16 | Ultimate Ray, **5** | Ultimate Ray, **4** |
| 18 | Ultimate Ray, **3** | Ultimate Ray, **1** |
| 20 | Ultimate Ray, **3** | Ultimate Ray, **1** |
| 22 | Ultimate Ray, **0** | Ultimate Ray, **0** |

**New Moon source, seat 0**:

| Global turn | Control source attack and Prizes remaining after it | GX-first source attack and Prizes remaining after it |
| ---: | --- | --- |
| 16 | Ultimate Ray, **5** | Altered Creation-GX, **6** |
| 18 | Ultimate Ray, **5** | Ultimate Ray, **4** |
| 20 | Ultimate Ray, **3** | Ultimate Ray, **4** |
| 22 | Ultimate Ray, **3** | Ultimate Ray, **1** |
| 24 | Ultimate Ray, **1** | Ultimate Ray, **1** |
| 26 | Ultimate Ray, **1** | Ultimate Ray, **0** |
| 28 | Ultimate Ray, **0** | Already native terminal | 

The staged independent [native GX tests, run 41435816778](https://github.com/FlareZ123/experiment-01/actions/runs/41435816778) previously verified that one or two Double Dragon Energy on original ADP actually activate native `usedGX`, `alteredCreationDamage` and `usedAlteredCreation` flags on **both physical seats**, after closing animation prompts. Native endgame paired attack receipts above add actual continuing attacks and Prize movements. The same compiled run's dedicated effect lifetime fixture found that subsequent Shadow Rider Calyrex V's `Shadow Mist` deals **40 damage** instead of printed 10, regardless of whether the ADP remains in play or is in discard: effect lifetime survives leaving the board in both physical seats.

### Tooling and reproducibility

- `simulation/twinleaf/agent28-adp-post-retreat-gx-window.cjs` provides strict owner-visible opportunity filtering and `chooseAdpGxFromPayable`, requiring the common public cost gate to admit that exact GX printing. Native `gxAttack` metadata is **false** despite exact attack name `Altered Creation-GX`, so use exact printed identity plus a live native GX quota. The full-card attached-energy and GX flags remain subject to original Store adjudication.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` enables this one exact GX root through `AGENT28_ADP_GX_ROOT_DEV=true` (default **false**), without giving actor access to hidden opponent information and without lifting the quota for other printed GX attacks.
- `simulation/evaluation/agent28-rank19-adp-gx-vs-ray-paired.cjs` runs the frozen historical four-trial pair with Float Stone mobility active **in both arms**. Test `tests/agent28-rank19-adp-boosted-gx-native.test.cjs` verifies actual native action and actor root under both seats. The after-retreat read-only observer logs board state without modifying gameplay.
- Pinned native ADP's reducer itself prints an unsolicited `Used Altered Creation with Extra Water` notification into stdout. Earlier [run 41435816778](https://github.com/FlareZ123/experiment-01/actions/runs/41435816778) executed all eight trials but could not parse the mixed console output as JSON. An explicit `AGENT28_JSON_BOUNDARY` marker and `simulation/evaluation/agent28-normalize-native-pair-json.cjs` now atomically split the diagnostics and valid JSON. Tests ensure malformed JSON cannot silently become evidence. Clean run **41436475507** passed and archived both files.
- Tests are on the existing manual `.github/workflows/aichi-dusclops-self-ko.yml` under default-off `rank19_gx_choice_compare` input. No vendor edits, implicit auto-run or altered fixed 60s.

## Interpretation and validity limits

The legitimate control chose the immediate 150-damage Ultimate Ray, enabling an earlier Prize in both actual games; treatment forfeited that attack to buy a lasting +30 and extra-Prize effect. Under this specific weak native-opponent policy, the GX variant still matched or advanced the engine terminal turn and also took all six Prizes. This is direct evidence of a **different realized attack decision and payoff** under the same physical source deal, and of a significant original-source decision-policy omission.

It is **not evidence of a win-rate improvement**: there were no source-seat-0 wins created by the GX change, the source policy is development-grade, only two post-retreat opportunities were selected historically after seeing earlier behavior, and attack-policy changes alter opponent turns. The native game clock, source and opponent tactical quality, all printed effects, full information-set audit and tournament 25-minute clock remain unqualified. Candidate A games do not exercise GX, so the four pairs are not four independent GX outcomes. No matched original-source game is a competitively qualified tournament win.

**Next evidence:** preregister unseen physical deals before observing outcomes; retain source winner and counters across both seats, audit exact first native ADP chance and bonus-Prize knockout payouts, and test whether a stronger ADP-first source policy changes any candidate defeat rate. The true global research objective still has only **29/32 authenticated Top32 printed 60s** and zero competitively qualified matches.
