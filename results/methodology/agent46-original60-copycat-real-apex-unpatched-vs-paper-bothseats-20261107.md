# Original rank-1/rank-10 fixed-60 native A/B: genuine Apex, unpatched Copycat versus paper correction

**Agent 46, 7 November 2026.** Manual native [GitHub Actions run 42336534060](https://github.com/FlareZ123/experiment-01/actions/runs/42336534060) completed **SUCCESS** at commit `51ca0992276c601f47c05cb6cf4ede6d690bcbbc`. Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## What was compared

The same exact **original Aichi rank1 Yasunori Kato Shadow Rider Calyrex printed 60** and **original rank10 Regidrago printed 60**, resolved with the existing documented Basic Energy-number equivalences, were instantiated anew for each branch in each physical player-seat orientation. Their physical deck, hand, discard, Prize, Active and Bench source-name/count manifests and all original-card-object conservation checks agreed through the previous real native Apex turn. The original rank1 native ordered SHA was `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311` in every branch and seat.

Both arms started with the **same deliberately staged** original-source physical resources: mature funded Regidrago VSTAR with original discarded Dialga-GX UPR, Mimikyu GRI funded with two original Basic Psychic, Clefairy ex JTG on Bench, and owner-discarded original Dialga-GX UPR + Radiant Eternatus CRZ; a second Regidrago VSTAR and original Budew ASC were on the opponent Bench. All 60 physical objects per owner occupied exactly one original-owner game zone. These cards were placed directly in the intended midgame positions, so this is a controlled engine-fidelity fixture, **not an original shuffled 60-card game**.

**Source action in both arms:** Actual Regidrago printed `Apex Dragon` was announced through native `AttackAction` at global turn 4, and the real native `ChooseAttackPrompt` selected discarded Dragon Dialga-GX's printed **Overclock** Attack object. Regidrago's six-card draw was identical: its physical deck **46 → 40**, hand **0 → 6**. The opponent's preceding attack was genuinely executed and settled; **no synthetic previous-attack record** was inserted.

## Both physical seat outcomes

| Observation | Raw pinned Twinleaf | Existing reversible default-off research compatibility hooks |
| --- | --- | --- |
| Last Regidrago attack stored after true Apex -> Overclock | **Overclock** (incorrect declared name) | **Apex Dragon** (printed declaration) |
| Mimikyu's subsequent genuine native Copycat | No damage or draw; hand **1 → 1**, deck **47 → 47** | Copied original discard Dialga-GX's **Timeless-GX** |
| After first Mimikyu action | 0 damage, 0 Prizes, GX unused | **300 damage, one Regidrago VSTAR KO, 2 Prizes, GX used, extra turn** |
| Bonus-turn followup | Not earned | Copied original discarded Radiant Eternatus's **Power Beam**; **400 damage, second VSTAR KO, 2 further Prizes** |
| Total Prize progression | **0** | **4 physical distinct originally Prized card objects** |
| Physical custody | **12** 60-of-60 distinct-owner zone checks across 2 seats | **16** 60-of-60 distinct-owner zone checks across 2 seats |
| Both owner seat orientations | Identical outcomes | Identical outcomes |
| Competitively qualified full games | **0** | **0** |

The unpatched Mimikyu source had one card in hand and 47 in its deck just before Copycat. After the attempted native copied attack, hand and deck remained at those exact sizes. Three waiting prompts settled, with no attack damage, GX use, KO, Prize, or exception. This is a concrete absence of the hoped-for Dragon payload effect, despite the genuine previous native Apex turn. The treatment's Attack-object prompts, turn skip, 300/400 damage calculations, full original Regidrago V/VSTAR stacks and attached Double Dragon Energies, KO processing, promotion, distinct Prize object pickup, and source conservation were all native Store events.

## Attribution and limitations

The treatment composes **two already-existing** opt-in, reversible research-side corrections: `simulation/twinleaf/copycat-declared-history-hook.cjs` restores the printed **Apex Dragon** attack name after the asynchronous source prompt selected Overclock; `simulation/twinleaf/copycat-compat.cjs` permits Mimikyu's printed Copycat to select a **non-GX** Apex Dragon despite Twinleaf's overly broad `copycatAttack` internal filter. Neither changes the upstream vendor submodule. The A/B isolates **their joint effect**; it does not apportion the four-Prize difference between them individually.

The paper grounds are the printed Mimikyu GRI Copycat non-GX restriction, the printed Regidrago VSTAR SIT Apex Dragon choice of own discarded Dragon attacks, and the supplied Advanced Player's Rulebook II.C-18 explaining that copied attacks retain their originally announced attack name. A same-source `ResolvePromptAction` must be passed the actual validated Attack object, never an unrelated serialized network wrapper. Earlier Agent46 negative results based on serialized attack answers are explicitly retracted.

**Reproduction:** [`simulation/twinleaf/agent46-original60-unpatched-vs-paper-copycat-native.cjs`](../../simulation/twinleaf/agent46-original60-unpatched-vs-paper-copycat-native.cjs) drives [`agent46-real-apex-champion-two-ko-native.cjs`](../../simulation/twinleaf/agent46-real-apex-champion-two-ko-native.cjs) with `{useOriginal60:true,rawControl:true|false,ownerSeat:0|1}`. The same focused [GitHub Actions workflow](../../.github/workflows/agent46-copy-delegation.yml) builds the pinned source and runs the native A/B. The companion [original-60 physical ledger](agent46-original60-rank1-rank10-copycat-apex-physical-ledger-20261107.md) retains source zone details, exact print substitutions and detailed two-Knock-Out receipts.

**Strict boundary:** Full printed 60-card inventories and a real previous attack are necessary fidelity evidence, but constructing a favorable attacker board directly bypasses natural search, attachment and evolution actions, 6-Prize uncertainty, Bench and Supporter contention, opponent response, decision policy, full game completion, and official 25-minute time adjudication. This example cannot estimate the probability of reaching the line or a win-rate change from the correction. Do not add the four Prizes to any benchmark winner statistic.

The independent [exact rank1 legal-opening four-Basic Prize frontier](agent46-champion-four-basic-heavyball-legal-opening-prize-frontier-20261107.md) shows a **4.6811456582%** necessary location obstacle for this exact named counterline before Prize-taking, even with optimistic perfect one-Ball recovery. Neither result shows 99.5% competitive strength. Source benchmark remains **29/32 original inventories**, ranks23/25/28 missing and **zero competitively qualified games**.
