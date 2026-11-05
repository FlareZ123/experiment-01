# Symmetric Basic Energy routing changes real native outcomes in original rank1 vs rank3

**Agent 6, 5 November 2026. Developmental matched Store execution only; competitively qualified games: 0.** The primary field objective remains one fixed 60 against all 32 Aichi opponents. Neither a deck candidate nor a win-rate estimate is selected here.

## Prior evidence and frozen experiment

The preregistered comparison is [here](../registrations/agent6-rank1-rank3-bilateral-energy-recipient-aba-20261105.md). We independently rehashed and reused Agent2's **four previously seen seeds × both source seats**, original **rank3 Snorlax Stall** exact 60 against unchanged original **rank1 Shadow Rider Calyrex** exact 60. This is intentionally *retrospective* matched policy research, not a fresh randomized sample. Both physical players receive the same generic decision policy in each arm. Controls A/A' preserve `energyRecipientFrontier:false`; treatment B changes only `energyRecipientFrontier:true`. Original Agent2 paid-retreat treatment stays **off** in all three arms. The same public-owner adapter, exact native card pool and baseline prompts remain in each arm.

**Compiled source evidence:**
- [Existing manual CI run 42057676767](https://github.com/FlareZ123/experiment-01/actions/runs/42057676767), checkout `dc3fbe15b3478d7f38d7c50587ee3b13c1fe348f` (includes Agent6 implementation and the corrected pure fixture), Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Job **passed**, pure preflight **25/25**, native A/B/A **24/24** all authentic Store terminals, **0 errors and 0 caps**.
- [Raw native artifact 13430273146](https://github.com/FlareZ123/experiment-01/actions/runs/42057676767/artifacts/13430273146), independently downloaded ZIP SHA256 `7d3d511ed635781d4d89fd2a03f6625d0707a6abc624bf238a88677a2addc6ac`, matches Actions artifact digest. Contained `agent6-rank1-rank3-energy-recipient-aba.json` SHA256 `16a20a3737ec37115060b3ef590e576f50970467d51192a3638b8355a875fb89`. Includes **all 24 attempts**, full original root ledgers, initial physical-deal and source-deal digests, native target-sidecar and final public boards.
- [Earlier historical original-control artifact 13420591771](https://github.com/FlareZ123/experiment-01/actions/runs/42039697740/artifacts/13420591771), independently downloaded ZIP SHA256 `fc32e629b3d1d796db58e1b08da2aec8bc6863edf066ddddd1a9fc6c7ef5ec0e`. **All 8 new A roots match exactly the earlier A root digest, source deal, full deal, attack totals and terminal Bench-Energy count**, demonstrating the new read-only physical target observer did not alter these controls.
- Implementation: [paired actual Store runner](../../../simulation/evaluation/agent6-rank1-rank3-energy-recipient-aba.cjs), existing [Agent2 original-sixty runner default-off seam](../../../simulation/evaluation/agent2-fresh-rank1-rank3-multibasic-panel.cjs), and [pure tests](../../../tests/agent6-rank1-rank3-energy-recipient-aba.test.cjs). Reuses existing manual `agent2-fss-float-rank3-native.yml` with opt-in boolean `agent6_energy_recipient_aba`; no additional workflow file and no upstream edits.

**Immutable original 60 digest labels:** rank3 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`; rank1 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. All 8 physical source deals, complete two-player setups and actual first seats matched A/B/A; all 8 A/A' root-ledger hashes, terminal metadata and boards matched. All accepted target-sidecars in this cohort report successful root ordinal linkage. Root hashes alone cannot establish target identity, so the separate native public pre/post Board deltas certify the listed Basic Energy recipients.

## Measured native differences

| Metric, 8 original seed-seat groups | A: generic Active-target Basic | B: owner-public Basic recipient |
| --- | ---: | ---: |
| Actual two-player native game attempts | 8 | 8 |
| Native terminals; errors; caps | 8; 0; 0 | 8; 0; 0 |
| **Rank1 actual Basic attachments to Bench** | **0** | **41** |
| Rank3 actual Basic attachments to Bench | 0 | 4 |
| Rank1 `AttackAction` declarations | 115 | 130 |
| Rank3 `AttackAction` declarations | 13 | 7 |
| Rank1 final board with zero attached Bench Energy | 8/8 | 1/8 |
| Rank1 final Active Dialga with nine Psychic, zero Bench Energy and zero attacks | 2/8 | 0/8 |
| Distinct paired initial setups | 8/8 identical | 8/8 identical |
| First actual target-bearing Store action differs between A and B | baseline | 7/8 |
| Competitively qualified games | **0** | **0** |

Exact per-group outcomes, including the nonresponsive and adversarial rows:

| Seed | Rank3 seat | First differed linked root ordinal | Rank1 Bench Basic attachments A→B | Rank1 attacks A→B | Rank3 attacks A→B | Native winner A→B |
| --- | --- | --- | --- | --- | --- | --- |
| 3565472974 | 0 | 24 | 0→7 | 0→0 | 0→0 | Rank3→Rank3 |
| 3565472974 | 1 | 31 | 0→6 | 8→15 | 1→1 | Rank1→Rank1 |
| 130758722 | 0 | 116 | 0→3 | 13→15 | 0→0 | Rank1→Rank1 |
| 130758722 | 1 | 91 | 0→9 | 44→44 | 0→0 | Rank3→Rank3 |
| 3792360798 | 0 | 45 | 0→7 | 0→0 | 0→0 | Rank3→Rank3 |
| 3792360798 | 1 | 57 | 0→2 | 18→18 | 2→0 | Rank1→Rank1 |
| 1654918696 | 0 | No difference in observed targets | 0→0 | 1→1 | 3→3 | Rank1→Rank1 |
| **1654918696** | **1** | **127** | **0→7** | **31→37** | **7→3** | **Rank3→Rank1** |

**A physically consequential single-deal reversal.** In the final row rank3 physically sat in seat1 and rank1 in seat0. The A/A' native line ended at global turn78 after rank3 seat1's actual `Collapse` `AttackAction` root ordinal374 and its `WaitPrompt` continuation; rank3 Prize count **1→0**, while rank1 still had six Prizes, native winner seat1. In B, original rank1 seat0 made **seven actually verified Bench-directed Basic Psychic Energy attachments**, beginning at linked native root ordinal127, global turn27. Its subsequent native attack declarations include **six `Full Moon Rondo`** beyond the unchanged thirty-one `Get Lost` declarations. B ends at global turn81 after rank1 seat0's `Full Moon Rondo` native `AttackAction` ordinal388 and `WaitPrompt` continuation, rank1 Prizes **1→0**, rank3 remaining Prizes **3**, native winner seat0. This is a genuine engine causal divergence under the same physical opening, and still does not make either native outcome a paper-qualified tournament game.

**Negative Dialga cases remain:** rank3 seat0 with seeds `3565472974` and `3792360798` each formerly had nine Psychic Energy on rank1 Active Dialga, zero on every rank1 Bench Pokémon and no rank1 attacks. Under B, each ends with **two Psychic Energy on Dialga, seven on the Bench, and still zero attacks**. Energy can reach the Bench, but the present policy still has no effective positioning/attack conversion in these specific source-control states.

### Positional bottleneck: printed Dialga retreat requires three Energy cards

Both zero-attack rank3-seat0 treatment games finish with the original rank1 Dialga-GX UPR 100 Active retaining **two Basic Psychic Energy cards**, while seven Basic Psychic cards sit across the Bench. The original [Dialga-GX UPR #100 printed retreat fee is three Colorless units](https://limitlesstcg.com/cards/UPR/100), corroborated by [The Pokémon Company's official card entry](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm5/164). At those exact final boards, **ordinary retreat cannot be paid with only two Basic Psychic cards** in the absence of a cost modifier. The original generic Active-target control finishes with nine Psychic Energy, more than enough for the printed Retreat fee, but no Energy invested on the Bench. This is a concrete resource-allocation/positioning tradeoff: a greedy attack-deficit recipient decision may strand the Active with inadequate retreat payment even after funding an attacker.

This is specifically a **terminal board geometry observation**, not proof that an alternative retreat was legal at every earlier owner Pass or that it would have won. Tools, switching effects, Active lock, Supporter contention and energy attachment timing can alter eligibility earlier. Follow-up recipient-plus-paid-retreat experiment is separately preregistered to test actual owner-visible opportunities and physical Store payments, and must preserve an explicit no-offer negative outcome when the fee is unpayable.

## Methodological interpretation

The default canonical actor root produces `attach-basic-energy` without a recipient slot, which the PlayCardAction builder targets to **Active**. The preexisting opt-in `agent44-actor-energy-recipient.cjs` uses publicly observed owner hand/board and known printed attack deficits. This explains the observed changed target paths and reinforces [Agent44's prior rank11 registration](../agent44-actor-energy-recipient-joint-contrast-registration-20261021.md), [Agent48's native comparison](../agent48-energy-recipient-paired-fourarm-20261021.md), and [Agent2's independently registered rank11 recipient contrast](../agent2-rank11-basic-energy-recipient-matched-development-20261102.md). These predecessor studies also found that rerouting Energy alone does not reliably win games. **The 41 Bench attachments are not 41 independent trials** and the eight games share four seed values across two seat orders.

**What remains missing:** A qualified playing policy requires real owner-visible switch/retreat choice, evolution and Ability acceleration, proper Trainer opportunity/cost, strategic damage comparison, opponent competence and genuinely settled paper effects. In the two nonattacking Dialga games, nominal Bench Energy never becomes an actual attack. The 25-minute Aichi clock cannot be reconstructed from these 81-turn untimed native games. No opponent beyond the original ranks1 and3 is tested; Aichi original ranks23/25/28 remain unadmitted. The 99.5% objective is unverified, and there is no justification to select a final fixed60 or weight these native winners as competitive wins.

**Next test:** use an unchanged same-deal treatment with the **existing symmetric paid-retreat owner-only hook** simultaneously enabled, against this published B arm, to test whether energy recipient and positioning jointly unlock a paper-payable actual attack in the two failed Dialga groups. Preserve all negative rows and exact paid-retreat opportunity denominators. If no offers exist, inspect its narrow fixed printed-damage and owner-deck-race restrictions before changing the game policy.
