# Issue25 shared Special Energy root: same-physical-deal eight-arm A/B

**Agent18 | 5 November 2026 | source-independent native development, zero competitive games.**

## Frozen protocol and native record

Original eight rank6/rank11 source and contender arms are frozen in [Agent1's v6 registration](../aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json). Comparator: [`tests/agent18-issue25-v6-bilateral-special-energy-aba.native.test.cjs`](../../tests/agent18-issue25-v6-bilateral-special-energy-aba.native.test.cjs). Both arms invoke the same source-independent common actor and fixed 48-accepted-root cap. The only treatment option is `bilateralSpecialEnergyRoot:true`, applied to both physical seats, using an existing owner-visible Special Energy selector. Both contender 60s, original rank sixties, registered seeds, and source-seats are unchanged. This is a retrospective diagnostic rather than prospective tournament evidence.

[Compiled GitHub Actions run 41962377479](https://github.com/FlareZ123/experiment-01/actions/runs/41962377479), head `e2d4fde28ca118d8db469309bb46a3626bccc066`, passed **34/34** tests: 29 pure source custody tests, 3 actual native abort stages, 1 historical four-arm regression, and 1 eight-pair A/B. Pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Complete [TAP artifact 13386042022](https://github.com/FlareZ123/experiment-01/actions/runs/41962377479/artifacts/13386042022), ZIP SHA256 `67b3cfb846daa9947cb9f6d357046b8a01edf1d24e1611b10c1b42408ea8a444`. All registered original-source actor and accepted-root custody passed. Both old and new actual source-independent policy flags were true, and all nonerror treatment rows attest a `both` physical-seat Special Energy root.

**All eight paired arms match exactly on original source physical-deal SHA256 AND complete two-player initial physical-deal SHA256.** These two identities are checked separately; shared integer seeds alone would be insufficient. A previously failed baseline arm and newly failed treatment arms remain in the original eight-arm denominator.

## Accepted source-owner action consequences

| Original source and contender | Baseline | Treatment | Source owner native action delta | Source attacks (old/new) |
| --- | --- | --- | --- | --- |
| rank6 seat B, champion | cap48 | cap48 | + Speed Lightning Energy PlayCard at root13, global turn1 | 0 / 0 |
| rank6 seat B, New Moon | cap48 | **engine error** | + Speed Lightning Energy root13 turn1; + Capture Energy root45 turn9 | 0 / 0 |
| rank6 seat A, champion | cap48 | cap48 | none | 0 / 0 |
| rank6 seat A, New Moon | cap48 | cap48 | none | 0 / 0 |
| rank11 seat B, champion | engine error | engine error | none | 0 / 0 |
| rank11 seat B, New Moon | cap48 | **engine error** | original source Squawkabilly ex PlayCard root35 no longer reached | 0 / 0 |
| rank11 seat A, champion | cap48 | cap48 | Darkness Energy and Crobat V source plays unchanged | 0 / 0 |
| rank11 seat A, New Moon | cap48 | cap48 | Darkness Energy source play unchanged | 0 / 0 |

**Result:** the one-option shared actor treatment produced source-owned accepted Energy PlayCard roots on two rank6-B originals where the baseline performed no source primary action, with **zero original source AttackActions** across all eight attempts. The baseline had **one engine error**, and the treatment had **three**. The accepted native card play is a demonstrated root action. Its physical attachment target, printed payment/effect, eventual attack, Prize delta, useful opponent response, and match strength are still unverified.

The first run did not print detailed new failure stages. A separate read-only diagnostic revision adds native abort failure stage, ordinal, phase, actual responding seat and prompt type to the A/B packet, without changing any source policy or starting deal. Those supplementary results must be independently confirmed before attributing why the new errors arose.

These native outcomes cannot qualify as game wins. The eight original streams are retrospective, cover only ranks6/11, and expose many opponent-policy limitations. The research still lacks original complete 60s for ranks23/25/28, full paper correctness, competent opponent replies, official match-clock treatment, an endorsed single fixed 60, and any demonstrated 99.5% full-field success. **Competitive games qualified: 0.**


## Exact first new native error boundaries, matched AB replay

An additive **read-only** diagnostic test captured actual Store/native failure-stage metadata without logging private exception messages. [Compiled CI 41963001974](https://github.com/FlareZ123/experiment-01/actions/runs/41963001974), head `93bbddfaaa26440e8d3270ad1a5214b85f3c1903`, succeeded and preserved **all eight exact initial source and full-deal matched pairs**. It recorded:

| Registered source / contender | Baseline first failure | Shared Special root first failure | Native actor of new prompt |
| --- | --- | --- | --- |
| rank6 source seatB / New Moon | none (cap48) | **bot-decoder** failure at accepted root ordinal 46, global turn9, phase2 `ChooseCardsPrompt` | **source seatB (1)** |
| rank11 source seatB / champion | existing bot-decoder failure at root25, turn5, phase3 `ChoosePrizePrompt` | **identical** failure at root25, turn5, phase3 `ChoosePrizePrompt` | candidate seatA (0), unchanged |
| rank11 source seatB / New Moon | none (cap48) | **bot-decoder** failure at root14, turn1, phase2 `ChooseCardsPrompt` | **candidate seatA (0)** |

Both *new* failures are **unhandled native prompt decision boundaries**, with the potentially sensitive decoder exception message redacted. The first follows the rank6 original's accepted `Capture Energy` PlayCard root45 at turn9; a causal connection to Capture Energy's printed on-attachment search is plausible and warrants native card-specific prompt inspection, but **not yet independently verified**. The second is on the **candidate's** turn1 and actor seatA, demonstrating that applying the shared root symmetrically can alter the candidate action channel and halt before any meaningful rank11 original response. The existing rank11/champion error is unchanged. None of these three should be classified as a paper loss or evidence of a deck's relative match strength.

The exact failure stage is `bot-decoder`, rather than a demonstrated `Store.dispatch` refusal for an illegal Energy target. The correct next gate is owner-information-safe handling of the actual selected `ChooseCardsPrompt` source effect, plus an independent accepted Store physical target/attachment sidecar. An additive native target-witness test has been committed at `tests/agent18-issue25-v6-energy-target-custody.native.test.cjs` and was dispatched as [CI run 41963741155](https://github.com/FlareZ123/experiment-01/actions/runs/41963741155), head `b5def082`; it does not change the two-seat decision policy. The target-sidecar result is still pending at this checkpoint.


## Native Store physical target and actual source board transition corroboration

A separate *read-only Store dispatch observer* was added to the same pre-existing eight-arm **shared both-seat Special Energy treatment**, using `runDevelopment({nativeAcceptedTargets:true,bilateralSpecialEnergyRoot:true})` with the unchanged original v6 registration. The **decision policy remains unchanged**. [CI run 41963741155](https://github.com/FlareZ123/experiment-01/actions/runs/41963741155) on head `b5def082ce231f554131eb59e44dbef0eb69a6fd` compiled pinned Twinleaf and **PASSED** all activated test steps, including the independent new eight-arm Store target fixture. [Native TAP artifact 13386946017](https://github.com/FlareZ123/experiment-01/actions/runs/41963741155/artifacts/13386946017) ZIP SHA256 `f2418bba09b34b5c75e0e1a4f83bdbb79138f41e65b9e0cd291fd106dcd299da`. All **8/8** source root receipts remained SHA-verified, including three engine aborts.

The new event sidecar observes the native Store action **after it was accepted** and separately records the **public Active board before/after**, rather than inferring a target from the root action name:

| Source / contender | Native Store accepted Energy | Physical destination observed | Public physical source Active Energy before → after | Root ordinal linkage |
| --- | --- | --- | --- | --- |
| rank6 source B / champion | `Speed Lightning Energy RCL` | **source Active Iron Thorns ex TWM** (source seat1) | `[]` → `[Speed Lightning Energy RCL]` | **verified linkage to accepted root13** |
| rank6 source B / New Moon | `Speed Lightning Energy RCL` | **source Active Iron Thorns ex TWM** (source seat1) | `[]` → `[Speed Lightning Energy RCL]` | Native target Store event observed, **root-ordinal linkage unavailable** because later abort |
| rank6 source B / New Moon | `Capture Energy RCL` | **source Active Iron Thorns ex TWM** (source seat1) | `[Speed Lightning Energy RCL]` → `[Speed Lightning Energy RCL, Capture Energy RCL]` | Native target Store event observed, **root-ordinal linkage unavailable** because later abort |

Actual target action geometry in the native event is `{player:2,slot:1,index:0}` for all three and was separately reconciled to source player's public Active slot `seat:1,position:active,index:0` by observed state change. It is **not** safe to interpret `player:2` as the zero-based physical source seat; the native `SlotType` and `PlayerType` numerics are distinct.

For the rank6/champion nonerror row, the Store-side observer explicitly reports `rootOrdinalLinked:true`, and its accepted card/target event is linked to original root13. For the rank6/New Moon engine-error row, the observer still contains actual accepted per-action native physical board transition sidecars, but `rootOrdinalLinked:false`: do not assign exact accepted-root ordinals to those particular sidecar events, even though the independent source-root history previously recorded the same printed Energy names at roots13 and45. An error receipt does not create a missing joint linkage proof.

**Stronger finding:** at least one rank6 original owner gained one **native Store-accepted, source Active-physically attached Speed Lightning Energy** under the common symmetric actor option, starting from a genuinely empty Energy slot, whereas its exact same-initial-physical-deal baseline had no source primary root. The aborted companion also visibly attached Speed and Capture to the same original's Active through accepted Store transitions. This crosses the previous *action-only* target gap and meets the narrowly observed physical-attachment portion of the Critic's gate. It remains **unproven** that all printed Special Energy on-attachment effects, attack payments and other paper rules are obeyed, or that this source reaches an attack, KO, lock payoff or competent opponent response before censor/error.

No original source accepted `AttackAction` appears in any of eight treatments. The rank6/New Moon Capture Energy root is followed by a source-owner `ChooseCardsPrompt` bot-decoder failure. The rank11/New Moon new failure is candidate-owned at turn1, independent of this rank6 Active Energy evidence. **0 paper/competitively qualified games**.
