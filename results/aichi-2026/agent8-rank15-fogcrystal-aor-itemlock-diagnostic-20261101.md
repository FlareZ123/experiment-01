# Original rank15: four native abort configurations identified as Fog Crystal under Vileplume AOR

**Agent 8 | 1 November 2026 | retrospective diagnostic, zero competitively qualified games**

## Result

The four original-source rank15 trial configurations that aborted with `PlayCardAction:CANNOT_PLAY_THIS_CARD` in both registered movement-receipt policies all attempted the **Item Fog Crystal CRE** from **candidate physical seat 0** while **original source Vileplume AOR** was on its Bench. Vileplume AOR's printed **Irritating Pollen** says that each player cannot play Item cards from hand. The pinned Twinleaf reducer for this exact card rejects `PlayItemEffect` with `GameMessage.CANNOT_PLAY_THIS_CARD` when its Ability is effective. Thus the rejected printing, board condition, and native reducer agree on a concrete Item-lock cause. We have **not** proved that no other effect was active or that the generic bot had a legal better alternative.

| Original registered ID | Source deal prefix | Global turn | Rejected Store ordinal | Rejected printing | Original source board |
| --- | --- | ---: | ---: | --- | --- |
| `15:0:A:champion-reference` | `1fc9942e2a00ad55` | 31 | 131 | Fog Crystal CRE | Vileplume AOR on Bench |
| `15:0:A:new-moon-lockbreaker-v1` | `1fc9942e2a00ad55` | 35 | 150 | Fog Crystal CRE | Vileplume AOR on Bench |
| `15:2:A:champion-reference` | `f414a5926a0990e0` | 55 | 216 | Fog Crystal CRE | Vileplume AOR on Bench |
| `15:2:A:new-moon-lockbreaker-v1` | `dae8b2e1cc7e4414` | 15 | 70 | Fog Crystal CRE | Vileplume AOR on Bench |

Each row occurred in both control and treatment, yielding **eight identical-category Store failures**. For each matched original ID the predispatch public board, entire accepted root ledger digest, turn, ordinal, rejection printing and source-deal digest agreed across the two policies. The digest is a physical source-setup observer's post-start fingerprint, preserved inside `nativeAbortEvidence`. The initial historical run reported only **12/16** source-deal matches because exception rows lacked top-level first-setup receipts. A later independent **post-failure setup-witness retention** replay, detailed below, now confirms **16/16 matching source-deal fingerprints, 0 mismatches, and 16/16 consistent accepted-native coin/choice/first-draw receipts** across original control/treatment pairs. These are the same original seed groups, not fresh games.

## Provenance and validation

- Original prospective rank15 seeds and fixed 60s remain exactly those in [the preregistration](registrations/agent8-rank15-movement-root-paired-native-20261101.json), Git blob `e72eeb19e4a7157f4533fc1ad6337a090ef94695`, originally committed ahead of native play. The retrospective diagnosis uses the same 16 original IDs per policy, with no seed selection.
- Baseline [native run 41325012076](https://github.com/FlareZ123/experiment-01/actions/runs/41325012076) had 10 terminals, two 260-root caps, four Store errors **per policy** but omitted the exact rejected Item.
- [Post-observed diagnostic native run 41340035710](https://github.com/FlareZ123/experiment-01/actions/runs/41340035710), artifact `13096607521`, completed successfully and preserved the same **10 terminals / 2 caps / 4 Store errors per policy**. This replay is **not an independent game-strength sample**.
- Research-owned opt-in addition in `simulation/evaluation/agent41-bilateral-v2-development.cjs`: `nativeRejectedActionEvidence` passes the existing headless `captureRejectedActionEvidence` to the postdispatch failure handler. The report archives only `playedCardPrinting`, ordinal, turn, actor, target, narrow owner play-lock flags and error. The underlying observer's complete owner hand is **not published** and the bot receives no new information. Default `false` leaves all other profiles unchanged.
- The exact retrospective rank15 executor `simulation/evaluation/agent8-rank15-movement-root-paired-development.cjs` enables that diagnostic. The raw and summary JSON are downloadable from the workflow artifact.
- [Native replay 41340960589](https://github.com/FlareZ123/experiment-01/actions/runs/41340960589), artifact `13097287809`, retained the actual originally accepted setup coin/chooser/first-draw receipt even on a later Store dispatch abort. The error receipt's `status` was `consistent-accepted-native-setup-and-first-draw` for **all eight** failed arms. Original full JSON cross-pair reduction (preferring the normal game result, otherwise using the aborted source-deal digest) yielded **16/16** fingerprint matches, **0/16** mismatches and **16/16** setup-confirmed pairs. This resolves the prior documentation's missing four pairs but leaves all four abort statuses unchanged. The error-side setup capture is guarded by the existing `captureSetupCoinChoiceReceipt` and remains purely postgame.
- Exact native revision remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source `ptcg-server/src/sets/07-x-and-y/set-ancient-origins/vileplume.ts` in that revision implements Vileplume AOR's Irritating Pollen by directly throwing on `PlayItemEffect`, subject to its `IS_ABILITY_BLOCKED` check. The research-side `simulation/twinleaf/player-play-lock-veto.cjs` only checks `player.cannotPlayItemCards` for Item prohibition; this flag does **not** by itself account for every in-play Ability that throws at native dispatch. The existing bilateral `enforceVisiblePlayLockBothSeats:true` therefore does not imply all legal Item selection is covered.

## Interpretation

The original movement-receipt treatment is not the cause of these four aborts: they reproduce identically in treatment and control. A policy capable of winning against a Vileplume control source must consider live, effective board Abilities when choosing to play Items, while allowing Item play if that lock is actually suppressed. A naive unconditional rule to never play Items whenever any Vileplume is physically present would itself create incorrect decisions under Ability lock. The next defensible test is a reversible both-seat, live-Store-gated Item proposal veto with an exact Ability-block state witness, a no-lock control, and a suppressed-lock control; only then rerun all original failed frames **with their original failures retained**.

## Limits

This diagnoses a single repeated failure family in a previously registered development frame. It does not validate paper prompt legality, action-policy competence, a 25-minute tournament-clock outcome, the 29/32 authenticated original opposing sixties, or a competitive win. **Zero competitively qualified games; no demonstrated fixed-60 99.5% result.**
