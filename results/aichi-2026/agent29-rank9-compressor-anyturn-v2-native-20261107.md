# Original rank9 late Battle Compressor v2: pinned native Store result and causal limits

**Agent29 | 7 November 2026 | Original physical rank9 and two fixed historical contenders | source-policy development only; ZERO qualified competitive games.**

## Registration and reproducible run

The unmodified [default-off v2 policy](../../simulation/twinleaf/agent29-rank9-compressor-owner-bridge.cjs), [comparison entry](../../simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs) and [existing manual workflow](../../.github/workflows/agent45-electrode-bomb-native-store.yml) were dispatched with `rank9_source_compressor_anyturn=true`. Genuine native [GitHub Actions run 42336670889](https://github.com/FlareZ123/experiment-01/actions/runs/42336670889) succeeded at repository head `cc319651c426b03af489acf04d96e016a85d6c93`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its separate real-Store CES48 regression section passed **56/56** tests. Native archived [artifact 13560305641](https://github.com/FlareZ123/experiment-01/actions/runs/42336670889/artifacts/13560305641) contains all eight original registered A/B attempts. Downloaded ZIP SHA256 is `8120eb4f32791c822416cae88d071431ebfd0db4fef62beeed0b9e1363684911`. The source/deck/candidate inventories and physical setup fingerprints matched exactly in all **four pairs**.

The treatment's research-only source root policy permits `Battle Compressor PHF` after global turn 12, after its owner-only board and hand prerequisites are met. Both arms used the same pinned paper-minimum intervention for Battle Compressor selection. Both have the `agent33-native-shuffle-numeric-validation-hook-v1` wrapper registered; that distinction matters below.

## Native paired results

| Original source / candidate | Source physical seat | Accepted Battle Compressor in treatment | Physical source deck → discard | Native control → treatment |
| --- | ---: | --- | ---: | --- |
| `9:0:A:champion-reference` | 1 | **Turn16, root78** | 3 Energy | finished winner seat0 at root149 → finished winner seat0 at root160 |
| `9:0:A:new-moon-lockbreaker-v1` | 1 | **Turn16, root77** | 3 Energy | finished winner seat1 at root248 → capped unfinished at root260 |
| `9:0:B:champion-reference` | 0 | None; public Mega+Voltorb prerequisites absent | 0 | finished winner seat1 at root103 → identical control |
| `9:0:B:new-moon-lockbreaker-v1` | 0 | None; public Mega+Voltorb prerequisites absent | 0 | capped unfinished at root260 → identical control |

**Totals:** four matched physical deals, eight native attempts, **two genuinely accepted source Battle Compressor Items**, **two authenticated own-deck `ChooseCardsPrompt` decisions**, **six actual physical Energy card moves into the source discard**, **two separately resolved native shuffle prompts**, **zero rejected source Compressor actions**, **zero non-Energy emergency selections**, and **zero qualified games**. Each positive event reports exact source-card identity, `nativeAccepted=true`, `ownerPromptUsed=true`, `physicalEnergyMoved=3`, and `shufflePromptResolved=true`. Each source on turn16 then made a normal Pass. On both treatment positive rows, genuine source attacks only resumed later (`Terminal Period` from turn22 or turn48); **no accepted `Extra Energy Bomb` Ability appears in the actual root tape**. The Compressor's physical setup was achieved, while the intended accelerated payoff was *not* demonstrated.

The historical report of 19 late owner-held eligible Passes comprised repeated decisions while the Item was still held across four dependent trajectories. The actual intervention consumed the singleton Battle Compressor at the **first** eligible turn16 root in each of two trajectories; it is correct that this produces two accepted Items, not nineteen independent plays.

## Crucial causal and paper-validation caveats

1. **RNG non-isolation:** both arms explicitly record `randomnessProtocol=legacy-shared-prng`, `policyRandomIsolation=false`, `physicalShuffleRandomIsolation=false`, `physicalShuffleRandomIsolationAfterSetup=false`. Equal initial deal fingerprints establish a same-start counterfactual. Playing and shuffling the deck can change the subsequent random stream. Therefore later native winner/cap differences cannot be confidently interpreted as a pure card-strength benefit or cost; no randomized inference about competitive wins follows.
2. **Shuffle-validation exposure zero:** treatment and control independently return `numericShufflePaperAdapter.checked=0` and `correctedAccepted=0`, despite the source hook recording **two dispatched and resolved `ShuffleDeckPrompt` instances**. The wrapper was installed, but these actual shuffles did not exercise its numeric `validate` audit. Real Store dispatch and source-card lineage are evidence of shuffle *resolution*, not independent verification of the order's numeric-permutation validity. This discrepancy should be investigated before paper-qualifying the transaction.
3. **Report schema defect:** `pairs[].baselineStatus` and `pairs[].treatmentStatus` are null because the comparison entry reads nonexistent row field `status`. Actual native row has `finished`, `winner`, `rootActionCount`, `error`; the disposition table above was reconstituted from those actual fields. Null in the old summary is **missing reporting metadata**, not negative or positive competitive status.
4. **No realized Electrodes or strategic inference:** no source `Extra Energy Bomb` is observed after the two newly paid Compressor Items, and the opponent policies are developmental. Native source `Terminal Period` attacks at later turns, an engine winner, or a 260-root cap are not comparable paper tournament outcomes. All benchmark 32 original matchups and the original 25-minute clock remain unqualified.

## Next discriminator

Preserve this v2 archive unchanged. For a **new separately registered** v3 A/B/A, require (a) own-deck shuffle permutation receipt on each actual source shuffle, (b) isolated PRNG streams for policy and shuffled physical decks with exact first-deal and control replay proof, (c) actual source `Extra Energy Bomb` availability, physical recipient constraints and source attacker payoff after turn16, (d) opponent's real tactical reply, and (e) complete-game plus official event time adjudication if attempting a competitive qualification. Check why the source policy passes after discarding Energy rather than continuing into a legal acceleration line. Do not promote the two real paid Items into a win-rate effect.

**Field status:** 29/32 authenticated original 60 name/count lists, missing ranks23/25/28; no selected final fixed60; no evidence for 99.5%.
