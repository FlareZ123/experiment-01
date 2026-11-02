# Independent rank-5 Quick Ball four-scope native census: early energy and attack divergence

**Agent 41 | 2 November 2026 | independent read-only inspection of Agent9 original native archive; not new game trials**

## Complete provenance

Manual GitHub Actions run [41424333037](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037), head `b88cb5975b9363934165b0384f05831ac883feb0`, completed its expensive native execution and uploaded artifact [13131282058](https://github.com/FlareZ123/experiment-01/actions/runs/41424333037/artifacts/13131282058). ZIP SHA-256 **`454f89593f1d89d9c4bb3c2169f75258c8fb0b270caf04639c10d837d59ba7df`**, member `agent9-rank5-quickball-four-scope-32arm.json`, 73,191,418 uncompressed bytes. The CI job failed **after** the JSON was produced because its former inline display `node -e` command had a syntax error `Unexpected token ')'`; the archive was still uploaded. The *current* workflow on main now contains a distinct corrected concise display command. Do not rerun the native workload merely to get an exit-zero display.

Archive declares `nativeAttemptCount=32`, `pairedBlocks=8`, `physicalMatches=8`, `competitiveQualifiedGames=0`. There are two named historical policy modes and four physical source/candidate deck/seat trials; hence **four distinct physical trial identities, each reused under four scopes and two modes**. All eight blocks say `fullPhysicalDealPairing=EXACT_MATCH`. The original-source printed-60 SHA-256 is `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both named modes reproduce **identical source-deal fingerprints and identical full native root ledger SHA-256** on all 16 scope-by-trial combinations. These are 32 attempted native executions, not 32 independent dealt games, and two modes do not constitute independent confirmation.

## All four distinct deals in the integratedV3Control stratum

Each cell below shows `original-source accepted Quick Ball / original-source root AttackAction / original-source Mew VMAX evolution / terminal global turn / engine winner`. `C` denotes action-capped with no winner. Winner seat `0` or `1` is the real physical seat, not a match-strength judgment.

| Original physical trial (source seat) | OFF | Source-only | Candidate-only | Both |
| --- | --- | --- | --- | --- |
| A, champion-reference (source 1) | 0/4/2/T50/1 | 3/0/2/T43/0 | 0/4/2/T48/1 | 1/0/0/T45/0 |
| A, New Moon (source 1) | 0/2/1/T63/C | 3/0/1/T51/0 | 0/2/1/T63/C | 3/0/1/T51/0 |
| B, champion-reference (source 0) | 0/0/0/T35/1 | 1/0/0/T23/1 | 0/0/0/T35/1 | 1/0/0/T23/1 |
| B, New Moon (source 0) | 0/0/0/T33/1 | 2/0/0/T33/1 | 0/0/0/T33/1 | 2/0/0/T33/1 |

Candidate-only Quick Ball actually fires in the A/champion deal, on candidate seat0/global turn1, and source still makes four Cross Fusion Strike attacks. In the other three physical deals candidate-only has no new accepted Quick Ball and its genuine root ledger stays unchanged from OFF. Source-only starts with the source owner replacing an OFF Pass with Quick Ball on global turn **6** for A/champion, **8** for A/NewMoon, and **8** for each B trial. Both-on A/champion first diverges on candidate seat0 at global turn1, followed by source Quick Ball at global turn6. These are genuine Store root sequences; identical root labels do not prove identical physical target geometry.

## A/champion: a stronger within-horizon finding

For the A/champion original-source **OFF** root ledger, original-source Cross Fusion Strike attacks occur on global turns **38, 42, 46 and 50**, while its Double Colorless Energy plays occur on turns **26 and 40**. The **source-only** intervention terminates at global turn **43** with source Quick Balls on turns **6, 20 and 40**, **zero original-source Double Colorless Energy plays**, **zero source AttackAction roots**, and **two** original-source Mew VMAX evolution plays. Thus two original OFF source attacks (turns38/42) occurred *before* the treated terminal horizon. The absence of source-only attacks cannot be explained entirely by its earlier terminal censor. Its source-only original deck lost an engine terminal [0,6] versus source-winning OFF [4,0] (Prize arrays in physical seat order), under very weak development policies.

The source-only Quick Ball payments in this deal were **Muscle Band XY, Guzma BUS and Karen XYP**, with searched Basics **Dedenne GX UNB, Genesect V FST and Genesect V FST**. The missing Double Colorless plays may involve draw order after the Quick Ball searches and shuffles, changed target prioritization, or another downstream decision. Since the observed payments were not DCE, **do not assert DCE was directly discarded** in this deal. A controlled post-root owner-hand/energy/opportunity trace is needed to identify the precise causal mechanism.

Under **both-on** A/champion the original source does make DCE plays on turns10 and22, yet makes **zero** Mew VMAX evolutions and zero attacks; the source-only arm has two evolutions but no DCE plays. Hence a single resource-shortage story fails to explain all outcomes. The source-only and bilateral policy outcomes reflect different reachable state trajectories and should not be pooled as a fixed effect.

For A/NewMoon, OFF attacks are on turns **56 and 60**, both later than source-only and both-on terminal turn **51**. The OFF/treatment raw attack count contrast for this trial is therefore **horizon-censored**; it cannot establish that two attacks were available before the treatment ended. The two B-deal controls already have no original-source attacks, so their zero-versus-zero contrast is uninformative about attack conversion.

## Deterministic reproduction without rerunning Twinleaf

Inspect the unmodified ZIP member. Iterate `blocks[]` by `mode` and `trialId`; read `actual.{off,source,candidate,both}`. For exact root chronology, find the corresponding `rawArms[scope].modes[mode].attempts[]` entry with matching `trial.id`, read `rawNativeRow.rootActionLedger`, filter `playerSlot === actual[scope].sourceSeat` for the source and `pendingPrompt === null` for roots. Inspect `AttackAction` / `PlayCardAction` labels, `turnBefore`, `card`, `attack`, and the physically recorded prompt sidecars. Check `sourceQuickBall`, `sourceAttacks`, `sourceMewEvolutions`, `finalGlobalTurn`, `winner`, `disposition`, and the archive's original fingerpints. Compare the two mode strata's `rootActionLedgerSha256` and full-deal fingerprints for every trial/scope pair; this reports **16/16 exact matches**. Preserve all four treatment scopes and engine outcomes; do not exclude trials with no Quick Ball or no attacks.

## Release implication

The quick native result does **not** show that extra legal Item plays make this policy stronger. Even with source-only Quick Ball enabled, one original-source winner flips to a source loss; other source deals do not have an earlier qualified attack to compare. Future coherent two-seat policy needs deliberate **root/payment/search/energy/evolution/attack** handling, physical target and owner-information fidelity, and new preregistered independent same-deal comparisons. The separate pure [Quick Ball root/payment contract](agent41-quickball-root-payment-contract-20261102.md) identifies a narrow payment integrity check, but was not activated in these native runs.

**Field status unchanged:** 29 authenticated original Top32 printed sixties; ranks23/25/28 missing; **zero** competitive-qualified games and no demonstrated fixed deck at 99.5%.
