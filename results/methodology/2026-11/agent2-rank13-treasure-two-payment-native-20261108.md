# Rank-13 Regidrago: two first-turn Treasure payments, one native payoff

**Status (8 November 2026):** Four isolated, genuinely dispatched pinned-Twinleaf Store fixtures passed. Two payment policies were tested in both physical seats. These are paper-prompt and native resource-chain witnesses; there are **zero qualified competitive games**.

## Concrete source decision

The selected-v8 original rank-13 Regidrago versus rank-3 Snorlax first-owner-root canary ([report](agent2-v8-common-first-owner-root-canary-20261108.md), run [42442029797](https://github.com/FlareZ123/experiment-01/actions/runs/42442029797)) exposes this exact five-card owner hand on the Regidrago turn-1 root: **Crispin SCR, Muscle Band XY, VS Seeker PHF, Battle Compressor PHF, Mysterious Treasure FLI**. Regidrago V SIT is Benched. The selected common actor-only policy currently falls back to Pass on that root.

The staged follow-up reproduces those five held printings and fixes four owner-deck cards for conditional card-effect testing: Regidrago VSTAR SIT, Noivern ex PAL, Dragapult ex TWM and Dialga-GX UPR. It does not reconstruct the entire original 60-card deck, Prize configuration, opponent board, subsequent draws, or an actual registered match. The target and donors are deliberately present in the accessible deck.

## Native execution and observed alternatives

The test uses the real pinned Store and the underlying native actions, owner-matched ChooseCardsPrompt responses, prompt validation, physical card-object identity and Zone transitions. The same sequence was executed from physical seat 0 and seat 1.

| Native sequence | Final held resources | Final discarded resources |
| --- | --- | --- |
| Treasure pays **Crispin**; search Regidrago VSTAR; VS Seeker recovers the same Crispin; Battle Compressor discards three donors | Crispin, Muscle Band, Regidrago VSTAR | Treasure, VS Seeker, Battle Compressor, Noivern ex, Dragapult ex, Dialga-GX |
| Treasure pays **Muscle Band**; search Regidrago VSTAR; conserve VS Seeker; Battle Compressor discards three donors | Crispin, VS Seeker, Regidrago VSTAR | Treasure, Muscle Band, Battle Compressor, Noivern ex, Dragapult ex, Dialga-GX |

Both payment branches accepted the printed one-card Treasure payment. Both Battle Compressor prompts had native min=0/max=3, matched the actual owner deck container, accepted exactly three distinct physical donor objects, and moved those objects into the owner's discard. Both branches retained the selected Regidrago VSTAR in hand. No PAPER_PROMPT_INVALID event occurred in any of the four staged branches.

The **physical resource tradeoff** is exact in this staged environment: playing VS Seeker immediately preserves Muscle Band; discarding Muscle Band preserves VS Seeker. Both protect Crispin for a later turn. This identifies a competing resource path omitted by the current first-turn Crispin recovery preference in [Agent49's narrow Treasure root](../../../simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs).

The tactical preference remains undetermined. It depends on future Supporter recovery, Muscle Band damage breakpoints, remaining copies and Prize state, the matchup, locks, and further turn sequencing. No claim of dominance or better win rate follows from the equivalent staged setup payoff.

## Reproduction and evidence

- Native engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, submodule `vendor/twinleaf`.
- Research fixture: [`simulation/twinleaf/agent2-mysterious-treasure-crispin-vs-seeker-native.cjs`](../../../simulation/twinleaf/agent2-mysterious-treasure-crispin-vs-seeker-native.cjs). It reuses Agent41's paper-prompt portfolio and Agent46's native Item cleanup helper.
- Shared CI workflow: `.github/workflows/agent36-bilateral-competence-v9.yml`, input `agent2_crispin_vs_seeker_treasure_native=true`. Redundant standalone Agent2 native workflow was removed following successful shared-gate execution.
- Original two-seat baseline run: [42517177027](https://github.com/FlareZ123/experiment-01/actions/runs/42517177027), commit `68511f21e245b89ff70c531fae6feb3db49c6470`, artifact 13630979905.
- Four-branch v3 run: [42517736922](https://github.com/FlareZ123/experiment-01/actions/runs/42517736922), commit `28a88d200fed1328987b95c5311afad6faed8be6`, artifact 13631749631, archive SHA-256 `b940d1c3518c02fa187a1582ccc2bbe5e8f4805550ea34db15495f7ec429b7a6`.
- V3 report schema: `agent2-crispin-vs-seeker-treasure-battle-compressor-report-v3`. All four receipt rows retain source/policy hashes, pinned revision, physical card IDs, chosen payment print, native prompt flags and final zones.

## Boundaries and immediate next integration

The cleanup helper uses a deterministic identity deck-order permutation only for engine cleanup. **Paper shuffling is unverified.** This test cannot establish Prize accessibility, live match sequencing, permission to evolve on the initial turn, a complete game, an opponent response, or competitive match strength.

A useful next prospective test is the registered selected-v8 rank13/rank3 native owner root using the existing default-off `mysteriousTreasureRoot` option. Record physical payment, Regidrago VSTAR search, next owner root, subsequent VS Seeker access and Battle Compressor donor zones. Keep a separate frozen A/B registration for the two payment policies, and compare future tactical value under owner-only information. Preserve source ranks, physical seats, the full native ledger, failed paths, and the existing quarantine. Assign no win-rate estimate until a full paper-valid match with meaningful opposition is completed.

**Field decision:** no selected fixed 60, no qualified competitive game, no evidence for 99.5% against the full Top 32.
