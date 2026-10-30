# Agent 41: same-original-deal bilateral Special Energy root converts rank-6 source into a genuine attacker

**30 October 2026 | Agent 41 | Development evidence, zero competitively qualified games.**

## Question and motivating defect

An authenticated original rank-6 Iron Thorns ex source-first versus New Moon game previously ran 62 global turns with **zero** source Energy attachments and **zero** source attacks under the generic actor policy. The original 60 includes Speed Lightning, Capture, Spiky and Double Colorless Special Energy. Was the missing Special Energy root a causally important **both-seat** action-policy defect, rather than a property of the Iron Thorns deck?

This intervention changes neither candidate nor opponent 60. It enables one common Special Energy root chooser on **both physical seats** using the already present `agent3-special-energy-frontier.cjs` and `agent34-actor-only-root-policy.cjs`. No source-only energy privilege is used. The profile `agent41-bilateral-special-energy-root-profile-v1` sets `specialEnergyRoot:true` and `specialEnergyRootOwnerSeat:null` for both actors. Default remains OFF.

## Method and frozen native provenance

- [Compiled manual CI run 41121802071](https://github.com/FlareZ123/experiment-01/actions/runs/41121802071), original runner checkout **`52cd248845d10a1bff44f291aead9c5f39520631`**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, Node 22.
- [Complete raw artifact 13008488741](https://github.com/FlareZ123/experiment-01/actions/runs/41121802071/artifacts/13008488741): control, treatment and initial audit, ZIP SHA-256 `f6ae90a6fc80366d53ddd874e9e54cc7c2bbaa9b6e96bbb07f122209b7c5b957`. Preserve all 8 original Store attempts, including engine action caps.
- Exact four historical **source-first** rank-6/rank-11 initial physically dealt matchups, both candidate 60s, fixed seeds, physical source seat 0/candidate seat 1. These starts are **retrospectively selected**, including rank-11 after a favorable Tool-Garbodor exposure. No prospective or full-field inference.
- Both control and treatment used identical paper Supporter quota, same-target prompt correction, source pressure observability and canonical actor composition.
- Pure profile and audit tests passed in pinned CI; both native four-arm executions and archive upload passed. The native Store itself accepted and settled the recorded Energy roots.

## Results

| Original source / candidate | Control engine result | Both-seat Special Energy engine result | Source settled attacks, control→treatment | Native sampled Special Energy roots in treatment (source / candidate) |
|---|---|---|---|---|
| Rank 6 Iron Thorns / champion reference | Candidate engine win, 54 actions | Candidate engine win, 93 actions | 0→0 | 1 / 0 |
| Rank 6 Iron Thorns / New Moon | 260-action cap | **Source engine win**, 255 actions | **0→5** | 4 / 2 |
| Rank 11 Absol-Garbodor / champion reference | Candidate engine win, 89 actions | Candidate engine win, 89 actions | 0→0 | 0 / 0 |
| Rank 11 Absol-Garbodor / New Moon | Source engine win, 225 actions | 260-action cap | 18→20 | 0 / 1 |

All **4/4 original source-deal fingerprints, 4/4 actual first-player identities, and 4/4 complete initial both-player physical-deal SHA-256 strings match** between control and treatment. Each of the **eight sampled selected Special Energy roots** was genuinely Store accepted, with an immediate physically confirmed public effect: **5 source, 3 candidate**. The original root sample is limited to the first 64 accepted actor-only roots *per game*. One row has nine total Special Energy intents but only six sampled, so eight is a certified lower bound, not a complete aggregate count.

**Audit schema correction:** The CI-run initial `agent41-special-audit.json` incorrectly reports `matchedFullPhysicalStarts:0` because the first audit version assumed `fullPhysicalDealFingerprint.digestSha256` when the canonical runner exports the digest as a **64-character string**. The fix is [commit `bb7cbc1`](https://github.com/FlareZ123/experiment-01/commit/bb7cbc109b850a9c394192e3d3e037c1a0e3e2f3), with the corrected regression [`ac29e53`](https://github.com/FlareZ123/experiment-01/commit/ac29e5392a4e3dec82348f22b08d08ab490f1763). Reading the untouched raw control/treatment JSON shows all four string digests identical, with protocol `initial-full-physical-deal-sha256-v1`. The original uploaded audit must be interpreted through this erratum. All root acceptance counts above were unaffected.

The source's newly funded rank-6 New Moon line settled real `Volt Cyclone` attacks at global turns **13, 15, 17, 59, 63**. The real native attack packets show Prize counts for source/candidate **[6,6] before turn-13 attack → [5,6] afterward → [2,6] after turn-17 attack → [0,6] after turn-63 attack**. Four attack packets have a verified same-epoch following opposing root; the final attack ended the game. The first attack physically moved Capture Energy from the source's active Iron Thorns to its Benched Iron Thorns and KO'd the opponent's Active Unown. The opponent's next own turn contained Fog Crystal, search prompts, Mewtwo & Mew-GX Bench admission and Pass, showing genuine opposing continuation rather than a synthetic proposal. These are **one selected engine game's actual public transitions**, not evidence of human opponent competence.

## Interpretations and failures

1. **A materially consequential policy defect has been reproduced and causally repaired in one matched original-source setup.** It was possible for an original rank-6 source to attack and take all Prizes once both actors had a legal native Special Energy attachment policy. That overturns any conclusion about the viability of a fixed 60 based on the original 260-action cap versus zero-attack source.
2. The same treatment made one previous rank-11 source-winning engine game **censor at 260 actions**, so these effects cannot be reduced to an across-matchup improvement. The generic opponent/action/prompt policy remains incapable of competitive qualification. Both changed treatments still lack a trusted real tournament clock.
3. The rank-6 champion-reference game retained a candidate engine win even after one confirmed source Capture Energy attachment; a single attachment does not prove that the source will establish a full attack.
4. The intervention does **not** implement root contest between Basic and Special Energy. The older first-choice policy can spend its one-per-turn attachment on a Basic while a Special could fund an immediate attack. [A separately opt-in public-cost chooser](../../simulation/twinleaf/agent41-energy-attachment-contest.cjs) now addresses that narrower contention; its native competitive and strategy outcomes were not tested by this frozen run.
5. The full chooser still needs competing Supporter, Item, Energy and attack decisions, real owner-visible hold alternatives, native prompt chains, exact physical recipients and a competent both-player policy. The 25-minute Swiss/Top32 event-clock treatment remains unqualified. **29/32** exact original Top32 60s; ranks **23,25,28** missing. **0** competitive-qualified games, no 99.5% evidence.

## Next falsification

Run one frozen **same-deal three-arm** profile (baseline, bilateral Special root, bilateral Special root plus immediate Basic/Special contention), then move to fresh independently preregistered seeds after the chooser's native positive action and negative hold gates pass. Maintain identical source/candidate 60s, original physical deal, both actual starters and all errors/caps. Audit native accepted target and settled attack/Prize transitions; do not promote selected engine winners to performance estimates.
