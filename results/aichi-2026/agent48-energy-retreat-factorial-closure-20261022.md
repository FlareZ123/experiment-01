# Agent 48: completed historical Energy-recipient × paid-retreat factorial

**Date:** 22 October 2026 UTC. **Scope:** frozen original-Store development diagnostics. **Result:** the previously unexamined fourth cell has now been retrieved, and all four archived cells independently compared. No games here are competitive-qualified.

## Fixed inputs and source of evidence

The existing [prospective registration for the fourth cell](agent48-energy-retreat-factorial-missing-cell-registration-20261021.md) fixed the checkout **`cbb2474be15a9a9e07da5b9a0c37e56d812657f0`**, Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, unchanged historical rank-6 and rank-11 source print lists, champion and New Moon challenger print lists, four trial IDs and seeds, and all policy controls except the two binary flags. This is a retrospective historical seed protocol (`historical v1 selection; not v2 preregistration`); the last arm was registered only after the other three had been observed. The shared real engine was compiled in the original manually dispatched jobs.

| Energy recipient | Paid retreat | CI run and artifact | ZIP SHA-256 |
| --- | --- | --- | --- |
| OFF | OFF | [39619187219](https://github.com/FlareZ123/experiment-01/actions/runs/39619187219), artifact **12353683804** | `5365969e597adc5068d1511f99a26f10935f2afb4e58bd617b0145eb98c7b9c7` |
| ON | OFF | [39619220430](https://github.com/FlareZ123/experiment-01/actions/runs/39619220430), artifact **12354178065** | `7dcf0bf589f7759784f7494bbf23f22825be06437484d800e05dce3105ee765a` |
| OFF | ON | [39621997731](https://github.com/FlareZ123/experiment-01/actions/runs/39621997731), artifact **12354549813** | `ea09090cb41fd2708cef3c25cdda4695aa85934956bf86ad82e989c580c0477d` |
| ON | ON | [39621273158](https://github.com/FlareZ123/experiment-01/actions/runs/39621273158), artifact **12355460785** | `f7f20e2ce822f9f224c345895b9b7e4a32510007e3921cba89f1c8b3c944b41b` |

Each ZIP contained `agent7-canonical-actor-fourarm.json`. I downloaded all four original artifacts on 22 October, parsed their JSON and checked all 16 row records. All top-level report contract fields outside `rows` and row-derived summary fields matched exactly; each report recorded `attempted:4`, `errors:1`, `actorOnlyCellsWithAudits:3`, `competitiveQualifiedGames:0`. The fourth-cell workflow is marked **failed**, specifically because its deliberately strict gate rejected 3/4 audited rows; its underlying four-arm producer step succeeded, preserving its archive. This is not a green campaign.

## Native row-by-row result matrix

Legend: `source` and `candidate` identify the two unchanged 60s; `[x,y]` gives remaining Prizes in **source seat 0, candidate seat 1** for rank 11 (rank 6 reverses seats). The historical candidate started first at rank 11.

| Opponent / candidate | OFF/OFF | ON/OFF | OFF/ON | ON/ON |
| --- | --- | --- | --- | --- |
| rank 6 / champion | 116 roots, **engine/epoch assertion**, no declared winner | same | same | same |
| rank 6 / New Moon | 94 roots, **source wins**, [6,0] in candidate-seat-0/source-seat-1 order | same | same | same |
| rank 11 / champion | 260-root **censor**, [6,6] | same | same | **94-root terminal**, candidate took six Prizes, [6,0] in source/candidate order |
| rank 11 / New Moon | 260-root **censor**, [6,6] | same | same | same |

For the three completely unchanged rows, the complete root ledgers matched across the four cells by byte-level decoded JSON equality and SHA-256; the rank-6 champion failure row also preserved the same 116-root ledger, although it lacks a complete source-deal fingerprint after its exception. In all four rank-11 champion cells, the captured source opening fingerprint is `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`, seed **623585882**, actual starter candidate seat **1**, verified candidate-first. The rank-11 New Moon and rank-6 New Moon opening fingerprints also match across all cells.

**Crucial physical non-equivalence:** the rank-11 champion **OFF/OFF, ON/OFF and OFF/ON root ledgers are exactly identical** (SHA `6916275be93b1e69...`), but ON/OFF distributed Psychic Energy onto Benched attackers while OFF/OFF and OFF/ON left them on Active Girafarig. Thus a root-ledger hash alone demonstrably fails to attest physical gameplay parity. This is consistent with the separate [Agent 8 target-geometry audit](../twinleaf/agent8-root-target-nonidentifiability-20261021.md). In the ON/OFF 260-root endpoint, Girafarig had one Psychic and the two Benched Lillie's Clefairy ex had two Psychic each; OFF/OFF's Girafarig held eight Psychic and its Clefairy ex had none. The Energy-recipient flag applies to both seats, so this historical factorial does not isolate candidate-only recipient policy.

## Exact decisive action divergence, rank 11 / champion

Root actions through **ordinal 47** were identical in all four policies, by direct ledger-array comparison. At `turnBefore=9`, candidate seat 1:

- **OFF/OFF, ON/OFF, OFF/ON:** ordinal **48** = `AttackAction: Get Lost`. The same loop continued, eventually 22 Get Lost and 18 source Terminal Period attack declarations, no Prizes, 260-root cap.
- **ON/ON:** ordinal **48** = a native `RetreatAction`, followed immediately by ordinal **49** = `AttackAction: Full Moon Rondo`. Terminal at root 94, with **six** Full Moon Rondo, **three** earlier Get Lost and one source Terminal Period; engine-reported winner seat 1, remaining Prizes `[6,0]` (source/candidate). The final candidate Active is Lillie's Clefairy ex carrying two Psychic Energy; Girafarig is Benched carrying one.

The ON/ON row's root-ledger SHA is `5db70047ef64ff9e...`; other three are `6916275be93b1e69...`. Same source physical opening and same visible root prefix establish a sharply localized **policy-dependent divergence at the first paid-retreat opportunity**. Since ON/OFF had funded Clefairy but did not retreat, and OFF/ON enabled retreat but had not funded Clefairy, the combined options appear **jointly necessary for this particular conversion**. This conclusion is conditional on the unmodified companion policy and exact historical deal. It does not prove a general statistical interaction or that these are the only possible winning actions.

## Fail-closed errors and scope limits

1. **Rank 6 / champion** in all four cells reached root 38 after a public turn-clock reset `4→0`; `buildBilateralReplyPacket` rejected the reconstructed chronology (116 recorded roots, sudden-death boundary), so the row is **engine-error**, not a loss, win or ordinary draw. It has no retained source fingerprint after the exception. Do not claim complete four-of-four physical source-deal parity.
2. Rank-11's source-first Garbodor-lock opening did not occur; all four rank-11 candidate scenarios actually began **candidate-first**. The source policy made weak attacks and passed repeatedly. The 94-root terminal is an untimed simulator result, not a tournament-clock result or a strong-opponent win.
3. Three combinations censor at 260 roots with no Prize change; censoring is a missing outcome, and cannot be encoded as a zero win rate or as losses. The historical seed was selected retrospectively; the four factorial cells are one physical deal, not four independent matchup games.
4. Both flags act on a **shared both-seat** policy; opponent effects and recipient geometry could confound naive candidate-policy attribution. In particular, root-label SHA agreement in ON/OFF versus OFF/OFF does **not** mean matched physical attachment decisions.
5. All 16 row records are development evidence. **Zero competitively qualified games**, no match-wide effect size, no 32-deck field result, and no 99.5% claim.

## Consequence for the shared research program

The fourth-cell experiment is **closed**; there is no need to dispatch another factorial replay at this historical seed. The evidence supports integrating a meaningful **recipient-plus-mobility decision test** into the **one existing canonical two-player, owner-information-safe policy**, while retaining exact target receipts and action acceptance. The next qualifying step remains a small, fresh, physically paired, both-actual-start source-frozen campaign with all failed/censored arms and independent strict witness gate. [Agent 50's source-policy reversal](agent50-guzma-energy-staging-native-reversal-20261021.md) and [four-seed failure census](agent50-four-new-source-energy-seeds-20261021.md) remain more relevant to robust opponent competence than an extra retrospective win-looking replay.

### Reproduction guide

Download the **four listed artifact ZIPs** from their GitHub CI links; verify the listed archive SHA-256 digests. In each `agent7-canonical-actor-fourarm.json`, compare `rows` keyed by `trial.id`; verify the `trial.seed`, `sourceDealFingerprint`, `sourceSeat`, `candidateSeat`, `sourceActuallyFirst`, `rootActionLedgerSha256`, `rootActionCount`, `winner`, `endReason`, `finalPrizes`, `attackDeclarations`, `finalBoard`, `actorOnlyDecisionCoverage`. Locate `rootActionLedger` ordinal 48 in rank 11 / champion. Do not use the SHA of `rootActionLedger` as a proxy for attached-Energy destinations. The archived ZIP digests are over the GitHub-produced compressed artifacts and are time-bounded by GitHub's retention policy.
