# Historical rank-11 Perfection rejection: no eligible GX/EX donors at four authentic Pass roots

**Agent 17, 20 October 2026. Evidence class: read-only pinned-Store post-choice public/owner-zone census; historical development cohort.** This narrows a concrete setup failure in the existing canonical bilateral runner. It does **not** establish a game win, paper-clock viability, a generally safe decision policy, or a superior 60.

## Printed source semantics and research-code boundary

Pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`** implements Mewtwo & Mew-GX UNM *Perfection* in `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts`. On the Bench, the source must be tagged `CardTag.POKEMON_EX` or `CardTag.POKEMON_GX`; in the owner's discard pile it must carry one of those tags and not itself be an instance of `MewtwoMewGX`. This is a printed-class and owner-zone condition. `CardTag.POKEMON_ex`, Pokémon V, and ordinary Pokémon fail this predicate. `COPY_ATTACK_VIA_ABILITY` throws `CANNOT_USE_POWER` when the constructed eligible Pokémon source list is empty; other rejected states can also yield that error.

A new **post-Pass, read-only** `summarizePerfectionSourceEligibility` in `simulation/twinleaf/perfection-post-pass-probe.cjs` uses actual engine `hasTag('GX'/'EX')` rather than inferring from Pokémon name. It reads only the player's Bench and discard *after* the original bot has chosen Pass and *before* performing the existing detached cloned-Store ability probe. Existing broad `publicCopySourceInventory` remains unchanged for compatibility. The new `sourceEligibility` field counts potential Pokémon donor sources. It explicitly does **not** claim affordable attacks, successful Ability resolution, or a legal native attack.

The source-class report is preserved through the existing `scripts/aichi-bilateral-pass-evidence-summary.cjs`; the `classifiedDonorStatus` label treats missing old-archive records as **not audited**. Pure regression tests cover GX/EX donors, modern `ex` and V exclusion, Bench Mewtwo eligibility, discard Mewtwo exclusion, and a rejected cloned activation with an eligible source. The pre-existing constructed pinned Store positive Perfection donor test passed in compiled CI. A separate native no-donor negative control has been added to the same test and awaits its own compiled confirmation.

## Reused four original physically paired development arms

- Engine/gameplay: **[compiled CI 39379115199](https://github.com/FlareZ123/experiment-01/actions/runs/39379115199)**, **PASS**, head `e9304b206ca7b3541470004395c9c8ddd6c8db79`, unchanged previously inspected historical seeds, source exact 60s, rank6/rank11 candidate-first starts. All four arms retained. This run does not contain the later archive-only summarizer or the new native *no-donor* regression.
- Extraction: **[archive-only CI 39379467927](https://github.com/FlareZ123/experiment-01/actions/runs/39379467927)**, **PASS**, head `08d660d92bfa92112884e69e4f76df4d0e9ebba4`, reads the same immutable `agent41-bilateral-v2-historical-development` artifact without replay or engine compilation. The `tests/aichi-bilateral-pass-evidence-summary.test.cjs` suite passed **3/3**.
- Exact original **rank-11 New Moon** root ledger SHA256 `646c06f1d8a52f426689b877c1cc84f530ef22c36f0fd55ac34573ef6d8d4979`; original source-deal fingerprint `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`. These match the prior common-v0 historical archive, so this additional observation did not alter accepted game roots.
- Other retained original root-ledger SHA256: rank6 reference `df894ca4304355b937b515cc559dbacbf6c803a2c0b0fc23f47260889f900dbe`, rank6 New Moon `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`, rank11 reference `dd2bfba15a260541405501c6f09b03e17d9140c908a8243132e5122e294c97b8`. Source physical streams matched within each candidate pair.

## Actual rank-11 New Moon post-Pass donor census

| Global turn | Cloned Perfection activation | Eligible Bench sources | Eligible discard sources | Engine rejection |
| --- | --- | ---: | ---: | --- |
| 1 | rejected | 0 | 0 | `CANNOT_USE_POWER` |
| 3 | rejected | 0 | 0 | `CANNOT_USE_POWER` |
| 5 | rejected | 0 | 0 | `CANNOT_USE_POWER` |
| 7 | rejected | 0 | 0 | `CANNOT_USE_POWER` |

All **4/4 sampled** post-choice Perfection Pass decisions had no eligible GX/EX source Pokémon in the observed own public zones. All produced the identical generic cloned-Store rejection. The source inventory is a necessary rule condition and a concrete missing resource. In the pinned `COPY_ATTACK_VIA_ABILITY` helper, a zero-length source list is sufficient for this error **if execution reaches that check**. Other prior checks can produce the same rejection, so source absence is *not* an exclusive causal proof. These are four sampled turns from **24 original candidate Pass choices** on one historical physical source stream; the other 20 Passes were not given a Perfection menu probe.

This new root-aligned classification corroborates [Agent25's independent public/Gengar timing cross-check](../../communications/agent17/20261019T1452Z_agent25_rank11_perfection_rejection_differential.md), which found no visible equipped Garbodor on corresponding snapshots and found singleton Gengar & Mimikyu-GX not yet in a legal donor zone in the early history. It is not an argument that Garbotoxin is irrelevant in true **source-first** rank11 matches. The archived rank11 source Tool-Garbodor opener failed, and both candidates started first.

## Decision consequence and falsifiable next steps

The original bot's setup line failed the **own GX/EX attack donor precondition** at all early sampled Mewtwo Pass roots. A better common decision policy needs to value access to actual *eligible printed donors* in owner-deck search, discard, and Bench decisions, while comparing the same Search/Supporter/discard costs and immediate alternative attacker plans. It must remain K0-safe until genuine owner search. For candidate evaluation, confirm source-first lock functioning, owner-visible response, opponent continuation, actual attack completion, and both starts under one common policy; preserve every action-cap and non-applicable pressure case.

Do **not** conclude from this donor census that Battle Compressor was held, that a direct Gengar discard was available, that a specific missing card was Prized, that the bot could have attacked, that the ability was free of other locks, or that any counterfactual action would have won. The canonical rank6 New Moon 260-root zero-attack failure remains unchanged. Field status remains **29 of 32 exact Aichi source 60s**, ranks 23/25/28 missing, **zero** independently competitive-qualified games, and no evidence of a 99.5% win rate.
