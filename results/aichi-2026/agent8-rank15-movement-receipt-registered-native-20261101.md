# Original Aichi rank15: genuine native development policy fork with public movement receipt

**Agent 8 | 1 November 2026 | Original source 60, 16 paired registered trial arms per policy, 0 competitively qualified games**

## Question and experimental provenance

Can an authenticated owner-public movement receipt change a shared two-seat native decision *in a naturally dealt game* with the source rank15 **Ryotaro Nozawa, Lopunny Vileplume**, beyond the already verified staged Mega Lopunny attack proof?

- **Preregistered independently drawn seeds:** `results/aichi-2026/registrations/agent8-rank15-movement-root-paired-native-20261101.json`, Git blob **`e72eeb19e4a7157f4533fc1ad6337a090ef94695`**, committed before the first native source game, eight physical rank15 source seed groups with no coin/start/hand selection.
- **Original complete printed source:** rank15 from `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3ba692200`; exactly two Mega Lopunny ex from PFL #84, which the native CardManager aliases to `Mega Lopunny ex M2`.
- **Two unchanged candidate 60s:** `champion-reference` and `new-moon-lockbreaker-v1`, both physical candidate seat orientations A/B, two candidate variants per original rank15 seed group.
- **Pinned native simulator:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Policy common to both arms:** native actor-only composition, same-root proposed action selection, symmetric public-context Energy evaluation, normal evolution of owner-visible hand/board, prior paper quota/physical setup audit switches and positive-attack-over-Pass option.
- **Only policy flag toggled:** `sameRootPublicEventReceipt=false` in control versus `true` in treatment. The existing read-only prior-KO offers gated by the receipt are `nativeDispatchImplemented:false`; do not attribute unrelated hypothetical offers to action improvements.
- **Two native executions:** [initial full 32-attempt run 41324592721](https://github.com/FlareZ123/experiment-01/actions/runs/41324592721), and [diagnostic replay run 41325012076](https://github.com/FlareZ123/experiment-01/actions/runs/41325012076) against exactly the original registered seeds. The replay was undertaken after seeing the original compact status report, and therefore provides diagnostic detail rather than new independent evidence. Both workflows completed **successfully**. The decisive expanded summary is in [run 41325012076 artifact 13091220554](https://github.com/FlareZ123/experiment-01/actions/runs/41325012076/artifacts/13091220554); raw and summary JSON include every attempt.

## Failure-inclusive observed outcomes

| Measurement | Control, receipt off | Treatment, receipt on |
| --- | ---: | ---: |
| Original rank15 native trial attempts | 16 | 16 |
| Native terminal outcomes | 10 | 10 |
| Native unfinished at the 260-root action cap | 2 | 2 |
| Engine-dispatch errors | 4 | 4 |
| Independently reported paper-competitive games | 0 | 0 |
| Same-root action changes versus the historical first-return baseline | 0 | 1 |
| Recorded rank15 payable attack alternatives in bounded owner-root samples | 0 | 1 |

**Initial physical-deal provenance:** the paired control and treatment source-deal SHA256 values agreed in **12/16** pairs and actual first-player receipts agreed as well. The remaining **4/16** have no trustworthy matched source-deal pair because both native arms aborted; do not silently classify their hands as matched. There were **0 observed mismatches among the 12 comparable** source-deal pairs. All 12 had consistent accepted native setup receipt.

**Engine errors, not wins:** the same four rank15 trial IDs in both arms were `15:0:A:champion-reference`, `15:0:A:new-moon-lockbreaker-v1`, `15:2:A:champion-reference`, `15:2:A:new-moon-lockbreaker-v1`. Each halted on a real `PlayCardAction` with `CANNOT_PLAY_THIS_CARD`, after 70–216 native actions depending on the candidate. This indicates an independent owner/prompt/legality problem requiring isolation. It cannot be retrospectively converted into a loss or win.

**One naturally observed changed source root:** `15:1:B:new-moon-lockbreaker-v1`, registered seed **1664089330**, exact original source owner in **physical seat 0**, native global turn **44**, original-source owner root ordinal **54**. The separate owner-public movement history reported stationary Mega Lopunny, and the treatment's same-root selector chose **Spiky Hopper** using the newly native-verified nominal **160 vs Gale Thrust 60** comparison. The control preserved the historical **Gale Thrust** baseline. This is a real naturally dealt source-game `selectedSource:'payable-printed-attack'` audit, with `changed:true`; it is distinct from the earlier staged positive/negative 2-seat attack test. The actual game reached a terminal in **189 accepted owner-root ledger actions** under both policies, and the reported **winner was physical seat 1 in both arms** (the New Moon candidate). No game-win improvement is demonstrated.

The other 11 source-deal-matched comparisons contained **zero recorded same-root changes**. All ten native terminal pairs returned the same winner, and the two unfinished pairs retained the same root count 260. These are repeated seed-conditioned observations, not a tournament win rate or an unbiased estimate of source-owner reachability; two candidate 60s reuse each physical rank15 seed group.

## Methodological significance

This distinguishes three separate evidence strengths:

1. **Printed mechanics**: both-seat physical Stage1 evolution from source PFL83 to PFL84 is valid in the native Store; the exact PFL84 attacks settle 160 stationary / 230 after public movement when selected.
2. **Native same-root action selection**: the default-off owner-public-event input can displace the historical first-listed attack in both staged physical seats.
3. **Natural original-source opportunity**: one of 12 comparable game-level source/candidate physical pairs actually reached the changed same-root attack decision. The result shows **one opportunity**, with terminal winner unchanged and no certified skill-level or paper-clock response.

The original development policy remains strategically incomplete: opponent hidden-information safety is not certified, native prompt legality is not universal, no 25-minute tournament clock has been applied, the original source-60 roster is still **29/32**, and the opposing automated actor is not a qualified high-skill source policy. The engine's full winner fields are therefore native-development observations only. **The 99.5% target remains entirely unverified.**

## Next actions and known limitation

A focused retrospective original-seed follow-up was prepared in `simulation/evaluation/agent8-rank15-observed-source-turn44-fork.cjs` to compare actual public post-Store action prefixes and opposing replies at the one observed turn44 root. It is **unexecuted**, so this report does not claim to have proven a precise damage/prize causal chain in the natural source game. A genuine same-deal first-divergence audit, opponent response, and independent prospectively registered holdout exposure are still necessary.

The four identical native `CANNOT_PLAY_THIS_CARD` cases require source-specific prompt/action legality diagnostics. Do not exclude them from a release denominator, substitute new favorable seeds, or call the 10 development terminals competitive wins.

**Reproduction:** manual GitHub Actions workflow `.github/workflows/agent8-rank15-movement-paired-native.yml`, runner `simulation/evaluation/agent8-rank15-movement-root-paired-development.cjs`, preregistration above; source files and source-dependent tests are committed, full run outputs in the CI artifact, pinned native revision fixed.
