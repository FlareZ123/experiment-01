# Agent9: paid post-Volt Guzma produces a two-Prize opponent-delay in one original native v7 case

**6 November 2026 | first reproducible A/B native treatment (A/B/A follow-up pending) | paper/competitive qualification: no**

## Answer from the first exact-deal experiment

On an original rank-6 Iron Thorns versus rank-6 opponent-board development cell, the native baseline policy ended source turn5 at **accepted Pass root32** while holding Guzma. Replacing only that proposal with a real native **Guzma BUS** Supporter action was accepted by the original pinned Twinleaf Store at **the same root ordinal32**. Both subsequent genuine **ChoosePokemonPrompt** replies settled, moving the opponent's sole Benched **Marshadow UNB** Active and the acting player's first Benched **Iron Thorns ex TWM** Active. Both physical recipient identities were verified in the Store. Original source and opposing fixed printed 60s, the entire opening physical deal, the first 32 accepted action sequence positions, and every other registered original case were preserved.

The changed game remained **unqualified** and stopped at the same 96-root cap without a winner. However, the source's strategic progress and opponent's Prize progress at one aligned later turn were materially different:

| Genuine source attack settlement | Control (native Pass) | Treatment (paid Guzma) |
| --- | --- | --- |
| Turn3, root22 Volt Cyclone | 140 damage to Tapu Lele-GX; Prize 6–6 | Identical |
| Turn5 source root32 | **Pass** | **Guzma** and both physical switches; source then Passes |
| Turn6 opponent attack | **Energy Drive** (Tapu Lele-GX) | **Red Knuckles** (Marshadow) |
| Turn8 opponent attack | **Energy Drive** | **Red Knuckles** |
| Turn10 opponent attack | **Energy Drive** | **Red Knuckles** |
| Just before turn11 source Volt Cyclone | Source Active Iron Thorns at **100 damage**; opponent Active Tapu Lele-GX at **140 damage**; remaining Prizes source/opponent **6/4** | Source Active Iron Thorns at **30 damage**; opponent Active Marshadow at **0 damage**; remaining Prizes **6/6** |
| Turn11 source Volt root60 | 140 to wounded Tapu Lele-GX, **2 Prizes**, remaining **4/4** | 140 to Marshadow, **1 Prize**, remaining **5/6** |
| Turn15 source Volt root78/80 | 140 to Marshadow, **1 Prize**, remaining **3/4** | 140 to wounded Tapu Lele-GX, **2 Prizes**, remaining **3/6** |

In this exact native policy and physical opening, the source has therefore taken **three Prize cards by turn15 in either case**, while the opponent has taken **two fewer Prize cards under the Guzma treatment**. The source's identity-matched active positional swap exposed its healthy Benched Iron Thorns while putting Marshadow in the opponent's Active Spot. The two-Prize difference is a retrospective native trajectory observation at turn15, **not a win-rate estimate, match victory, proven paper-correct Prize exchange under all effects, or evidence against a competent opponent**.

## The important counter-response caveat

A separate successful historical read-only owner-hand replay established that the opponent actually held **Float Stone BKT** on its preceding own turn4 and again at its next own turn6. The original target Marshadow has no Tool attached; printed Float Stone removes Retreat Cost. The opponent could potentially attach it to the newly Active Marshadow and retreat to Tapu Lele-GX in the same turn (the original source board shows no Item/Tool lock). This would bypass the apparent positional delay. **The treatment's unchanged opponent native bot did not play Float Stone**: it instead attached Psychic Energy and used Marshadow's `Red Knuckles` on turns6,8,10. Thus the reported two-Prize differential is contingent on an **unverified/possibly weak opposing decision policy**. It must not be promoted into a competitive claim. An adversarial Tool-aware response and its exact native Store receipt are the priority falsification test.

Also, the forced Guzma moves the source's own Active, thereby consuming the Supporter quota and potentially moving to an underfunded attacker. Which target to gust, whether to let the damaged opponent Active remain for a two-Prize KO, the timing of the next Energy attachment, and the opponent's ability to reposition are discrete tactical tradeoffs. Source/target printed card text was separately checked against the supplied database; physical native prompt acceptance establishes a game-engine action, not every current paper-ruling boundary.

## Preregistered treatment and control

**Current first run** [GitHub Actions 42298305674](https://github.com/FlareZ123/experiment-01/actions/runs/42298305674), manual existing `twinleaf-completion.yml` inputs `abort_provenance_only=true`, `include_agent36_selected_v4=true`, repository checkout `e4c12d92fb331ff50107edc750837c880083ea12`, pinned original Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, 96-root limit. Relevant new native canary step37 and artifact archival step38 **passed**. The preceding exact original owner-hand replay step35 also passed.

- Registered native field: **8** original v7 attempts; 6 cap/unqualified and 2 preexisting engine-error attempts retained.
- **Source and full two-player physical opening fingerprints equal 8/8** between original A control and treated B.
- **7/7 non-target cases** have completely identical original accepted public-root histories and outcomes, including both engine errors. Every original source and candidate printed 60 remains unchanged.
- Target `6:201:B:champion-reference`: accepted roots 0–31 identical as JSON public-ledger records; first difference exactly original **root32**. A = `PassTurnAction`, B = `PlayCardAction` `Guzma`.
- Native target root: one genuine source-owned proposal, baseline bot first proposed Pass; genuine Store accepted **one** Guzma; native Supporter quota rose from 0 to **1** and the Store generated an actual `ChoosePokemonPrompt`.
- Native Agent43 target bridge: exactly one Guzma accepted, one owner physical hand consumption confirmed, one opposing target prompt accepted with physical ID **76 = 76**, and one own target prompt accepted with physical ID **3 = 3**. Both physical recipient confirmations **1**, both mismatches **0**.
- Full public root-ledger digests internally consistent: A `7595a416b33efe8d741de8efe2478473f714161ede1974ebb35d0b0073779466`; B `34f135b78b8189b37559354c84886eb28ab986c1a0f830636637b94238d1a4c7`.
- No source/actor paper-rule audit, entire opponent strategic competence audit, full-match completion, tournament-clock qualification, selected final deck, field-wide matchup result, or win-rate figure has been established.

### Raw reproducibility

Existing manual GitHub Actions run ID **42298305674**, artifact ID **13541364841**, name `agent9-v7-native-original-guzma-one-root-canary`. Downloaded ZIP SHA256 `d2baf099ca3724f15e090a7d29457ab64223cc1af922a2552a53860834f4540a`. Internal `agent9-v7-guzma-canary-control-treatment.json` **657,297 bytes**, SHA256 `2b9e3dcbfbf9d577a34c864271586a72bd56a817e39084e0652f4fd031cd8453`, verified against included SHA sidecar.

Treatment implementation: `simulation/twinleaf/agent9-v7-guzma-owner-canary.cjs`, a reversible exact-original owner-only action selector that requires a genuine actor root, source seat 0, turn5, the exact publicly visible Iron Thorns/Tapu Lele/Marshadow boards, held Guzma and no Supporter already spent. It first obtains the original bot Pass and then returns one native `PlayCardAction` for the physically owned Guzma. Accepted Store identity is independently verified. It composes `simulation/twinleaf/agent43-guzma-prompt-continuation.cjs` with forced exact visible opponent and own Bench indices 0, and the unchanged both-seat original `agent4-allturn-owner-volt-attach-energy.cjs` mandatory Volt handler. No hidden opponent cards or future draws drive the action.

Full A/B comparison and receipts: `simulation/evaluation/agent9-v7-guzma-causal-replay.cjs`; compiled native `tests/agent9-v7-guzma-causal.native.test.cjs`; pure native seam `tests/agent9-v7-guzma-owner-canary.test.cjs`. Results are archived unchanged rather than editing the tournament registration. The 2026-11-06 historical owner-hand frontier is in `results/methodology/agent9-v7-real-store-accepted-owner-hand-frontier-20261106.md`.

**Status:** No completed competitive games. Paper Expanded 29/32 original Aichi opponent inventories authenticated, ranks 23/25/28 missing, no nominated final fixed 60 and no demonstrated 99.5%. This remains one paired developmental state and limited opponent policy.

## Next falsification and integration

The immediate next step is a **same-deal, same-source-Guzma opponent Float Stone or natural-switch counter-response** with actual owner-prompt Tool payment and physical retreat, comparing the complete turn6 reply and its downstream source opportunity; a real opponent may select an even stronger line. Preserve the control and all seven unaffected attempts. The one-site wrapper should also undergo a control/treatment/control A/B/A provenance replication, proving prototype restoration and deterministic noninterference across identical registered deals; only A/B has been executed in this first run. The game outcome and the 99.5% objective remain unsupported.
