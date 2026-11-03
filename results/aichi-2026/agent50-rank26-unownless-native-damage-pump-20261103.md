# Rank26 original Meloetta: six native Damage Pump / opponent-Prize witnesses for Unown-free donors

**Agent 50, 3 November 2026. Compiled pinned Twinleaf Store six-case mechanical verification; no natural-game qualification.**

## Resolved paper-source mechanism

The [Unown-free original rank26 conditional paper line](agent50-rank26-unownless-crisis-punch-ledger-20261103.md) replaces three distinct Unown counter donors in the older witness with original **Meloetta ex**, **Tapu Koko Prism Star**, and the **second Exeggcute**.

This is now corroborated for the **three physical Damage Pump transitions** by actual Store dispatches on the pinned Twinleaf engine (commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`), with all genuine `MoveDamagePrompt` and **opponent-owned `ChoosePrizePrompt`** selections settled. The test obtains original rank26 printed card identities from the source-authenticated 60 via `planAichi(26)`, then instantiates a deliberately staged owner board and actual printed Item in a small physical fixture. It never substitutes a different donor printing or assumes a KO on a simplified scratch board.

| Staged original donor | Native counter transfers | Source physical self-KOs | Opponent Prizes remaining | Surviving 20-damage Egg |
| --- | --- | ---: | ---: | --- |
| Meloetta ex on Bench, 20 damage | Meloetta -> Egg A; Meloetta -> Egg B | 2 | 6 -> 4 | none |
| Tapu Koko Prism Star on Bench, 20 damage | Koko -> Egg A; Koko -> Egg B | 2 | 4 -> 2 | none |
| Egg B on Bench, 20 damage | Egg B -> Egg A | 1 | 2 -> **1** | Egg B at **10** |

Every 30-HP recipient Egg is physically removed to the source discard, with the same card object found there; each used Damage Pump enters source discard. In double-KO cases the native Store emits one `ChoosePrizePrompt` requiring **two real Prize slots** selected by the actual opposing owner. In the final case one opponent-owned Prize slot is selected. All six checks pass across both actual owner seats 0 and 1, with the expected physical source card zones and exact opponent Prize counts.

## Reproducibility and CI

- Native executable: [`tests/agent50-rank26-egg-donor-damage-pump.native.test.cjs`](../../tests/agent50-rank26-egg-donor-damage-pump.native.test.cjs).
- Native test is included in the existing manually dispatched [`agent50-rank26-unlocked-fifth-candidate.yml`](../../.github/workflows/agent50-rank26-unlocked-fifth-candidate.yml), using pinned submodule checkout, npm CI and compile.
- **Successful compiled [GitHub Actions run 41567863410](https://github.com/FlareZ123/experiment-01/actions/runs/41567863410), head `00416368f4e393eb91916c2366921ad6dab5e40f`, 6/6 native tests passed, 0 failed**. Its emitted six `AGENT50_RANK26_NATIVE_PUMP` JSON records show both seats, source physical transfer coordinates, Prize outcomes and source discard presence.
- Earlier runs [41566803327](https://github.com/FlareZ123/experiment-01/actions/runs/41566803327) and [41567179655](https://github.com/FlareZ123/experiment-01/actions/runs/41567179655) failed for **fixture harness issues**: assuming a literal `Meloetta ex BLK` native fullName instead of the real original-print resolver, and failing to settle/choose both physical Prize cards after simultaneous KOs. These were repaired before the successful run. The errors are not claimed as pinned-engine card faults.
- The preceding [paper-only six-Prize/Bench ledger SFT](../../tests/agent50-rank26-unownless-crisis-paper-ledger.test.cjs) passes [manual field gate run 41566343476](https://github.com/FlareZ123/experiment-01/actions/runs/41566343476), head `e31e8b3569f145061014f77886594479fe7b9ab1`. A subsequent exact static Unown Prize-collision regression was added after this run and has separate verification pending.

## Qualification boundary

These are **three distinct, precisely staged short Store transactions**; the test does not reproduce one continuous native turn. Initial Prize counts and each donor's damage are deliberately constructed in physical public zones. It does not yet demonstrate repeated Propagation and Risky Ruins rebenching, natural original-source hand/search assembly, two discarded Lightning available, Tapu Koko's dual Bench attachments, DCE and Float Stone payment, first-turn TM permission, final opponent damage/terminal, full sixty-card source game or opponent reply.

Therefore: **six tested mechanical substeps passed**, full conditional attack chain **not yet native proven**, actual card acquisition frequency **unknown**, and **zero competitively qualified wins**. The exact opponent field still has 29/32 authenticated original 60s. This new line should be tested with a versioned opt-in source owner policy, constrained by actual public opponent Bench and a full future win condition. The default frozen policy must remain untouched pending prospectively registered independent games.
