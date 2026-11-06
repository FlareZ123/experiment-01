# Agent31: fresh native rank5/rank11 all-Pass census and zero-Energy stranded-active mobility

**6 November 2026 | prospective original seed groups | 32 native attempts | development-only | zero paper-qualified games**

## Frozen design and independently reproducible provenance

At **02:03:57.837 UTC**, before any native result for these seeds, registered [16 independently generated 32-bit seed groups](registrations/agent31-prospective-allpass-r5-r11-20261106.json): rank5 and rank11 original source 60s, candidate source seat A or B, four independent repeats per rank/seat combination, and both unchanged printed `champion-reference` and `new-moon-lockbreaker-v1` contenders per seed. The registration file's immutable Git blob ID is `a7188776c879b555fb9fccfdc3c916b972324b7e` and original commit `7a1b4e0fdfd9cf79e5ea787d495a73d108c13872`.

Each new attempt uses the same incumbent common two-player actor policy and pinned original source/contender deck identities as the retrospective [rank5/rank11 control](agent31-all-owner-pass-native-complete-coverage-20261106.md), with the **read-only** all-acting-owner Pass observer enabled and any Float Stone intervention explicitly **off**. This sample is genuinely new relative to the prior rank5/rank11 32-pair registered seed batch, but is **restricted to two of the 32 opposing ranks** and intentionally omits game-clock and paper-opponent-policy qualification.

- Frozen [native runner and denominator report](../../simulation/evaluation/agent31-prospective-allpass-r5-r11.cjs), with exact registration blob preflight, both candidate arms per seed group, every failure retained, no promotion to competitive evidence.
- [Native CI 42148186506](https://github.com/FlareZ123/experiment-01/actions/runs/42148186506), exact head `cbad6b7a0dec756d51a58e96edc6c8d2e8f7a99e`, **SUCCESS**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full [artifact 13470574906](https://github.com/FlareZ123/experiment-01/actions/runs/42148186506/artifacts/13470574906) holds all 32 returned native rows, including the single error. ZIP is 1,223,478 bytes, ZIP SHA-256 `380452d6bdd8ecd5b50f831c9ae0d086ac6e39bd96c8eb6b921455c1780068cc`; inner JSON 26,999,475 bytes.
- Five fixture-based [denominator and censoring tests](../../tests/agent31-prospective-allpass-r5-r11.test.cjs) were added and wired to the existing statistics CI separately from this native run. Their completion must be checked before claiming green CI for the newly written fixture suite.

## Results with all exclusions visible

| Rank / contender physical seat | Registered attempts | Native-engine terminals | Native action limits | Native errors | Complete owner Pass receipts | Contender held-Stone Pass roots | Narrow funded VMAX matches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 / A | 8 | 5 | 3 | 0 | 307 | 45 | 0 |
| 5 / B | 8 | 5 | 3 | 0 | 234 | 15 | 0 |
| 11 / A | 8 | 6 | 2 | 0 | 144 | 1 | 0 |
| 11 / B | 8 | 5 | 2 | 1 | 194 | 17 | 0 |
| **Total** | **32** | **21** | **10** | **1** | **879** | **78** | **0** |

**31 of 32** native rows contain complete evidence: **879/879** actual accepted `PassTurnAction` roots reconciled with the acting player's owner hand and both public boards, zero missing within those 31. The unobservable 32nd original attempt `11:2:B:champion-reference` at seed `2234229318` ended in real Twinleaf dispatch error `UseAbilityAction: UNKNOWN_POWER` after 72 accepted actions and is *retained in the 32 denominator*, with no invented Pass count. The 78 held Float Stone candidate Passes are correlated repeated turns from only **7 distinct native trials**, and do not represent 78 independent setups.

**Zero** of those 78 held-Stone candidate Passes met the previously registered *narrow* predicate: Active untooled underfunded **Shadow Rider Calyrex VMAX**, separate Bench VMAX with at least three Psychic Energy, held Float Stone, and no visible public veto. This falsifies any extrapolation of the historical one-trial eleven-Pass observation into a guaranteed or common event for these fresh seeds, under this policy. It says nothing definitive about general Float Stone mobility or the entire field.

## Exploratory structural near-miss: stranded Mimikyu can switch into a paid VMAX

A **post hoc exploratory** inspection of the 78 fresh held-Stone Pass receipts reveals three repeated genuine Pass roots in **one newly registered native game** `11:3:B:champion-reference`, seed `1101197735`, opponent source seat0 and contender seat1:

| Accepted Pass | Global turn | Acting Active | Funded Benched VMAX | Opponent Active |
| --- | ---: | --- | --- | --- |
| **175** | 34 | Mimikyu, 0 Energy, no Tool | Shadow Rider Calyrex VMAX, 3 Psychic | Oranguru V, 130 damage |
| **183** | 36 | Mimikyu, 0 Energy, no Tool, 30 damage | Same, 3 Psychic | Same, 130 damage |
| **190** | 38 | Mimikyu, 0 Energy, no Tool, 60 damage | Same, 3 Psychic | Same, 130 damage |

At all three roots the genuine acting owner has `Float Stone BKT` in hand. The Bench contains **five Pokémon**, including an untooled `Shadow Rider Calyrex VMAX` with three attached Basic Psychic Energy, and there is **no Stadium**. The opponent has an Active `Oranguru V` (three Darkness Energy, no Tool) and a Benched toolless `Garbodor`, alongside other Pokémon. Source's Garbotoxin requires an attached Tool for its Ability lock and no such Tool is visible. Full-Bench Retreat is legal under the supplied Advanced Player's Rulebook A-03.

Grounded printed-card arithmetic, subject to full effect and status review:

- The provided card archive identifies `Mimikyu` with `Filch` and `Copycat` at `sm2-58` (or the identical Psychic-cost promo printing) with **one Colorless Retreat Cost**; **zero attached Energy** cannot pay that retreat naturally. `Float Stone BKT` makes the attached Pokémon's Retreat Cost zero.
- `Shadow Rider Calyrex VMAX CRE` has `Max Geist` with **three Colorless cost**, base 10 damage plus 30 for each Psychic Energy on all own Pokémon. At least three attached Basic Psychic on the funded VMAX give **at least 100 nominal damage**.
- `Oranguru V` `swsh10-133` has **210 HP**, 130 visible damage counters' worth of damage, no Tool, and no printed Resistance, leaving **80 HP**. A nominal 100-damage Max Geist would exceed that remaining HP by 20 and ordinarily Knock Out a two-Prize Pokémon V.

The root captures show a *plausible* `attach Float Stone to zero-Energy Mimikyu → free retreat into the already funded VMAX → Max Geist` tactical **two-Prize KO** line. They **do not show this sequence actually selected**, and do not prove absence of unmodeled lingering effects, current-turn retreat consumption, Special Conditions or full paper counterplay. The three roots are successive turns in one trial and must be treated as **one independent observed state family**.

**Important mechanism:** the existing [Agent14 generic funded Float Stone proposal](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs) explicitly rejects `active.energies.length===0`. It focuses on preserving valuable attached Active Energy during Retreat. The new Mimikyu geometry demonstrates a distinct **access-to-a-funded-attacker** payoff class, so its nonactivation is expected by design, even though a potentially decisive line exists. Blindly relaxing this gate would be unsafe without checking actual native Tool/Retreat/attack acceptance and tactical alternatives.

## Paired source-deal qualification caution

The two different 60-card candidates share one seed per group, but *same seed does not always produce the same source opening*. In **15/16** groups the same-original-source deck fingerprint matches across candidate cards. In **one group**, rank5/B/repeat1/seed `3665396456`, the original source deck fingerprint and first observed source-hand digest differ: against Champion, the contender had **one mulligan**, source was offered and drew one compensation card; against New Moon, the contender had zero mulligans and the source received no compensation. The actual source hand and physical deal therefore differ under otherwise equal seed. This is a legal setup-dependent confounder, not a candidate-card policy effect. Do not call that group a same-physical-deal comparison.

## Decision boundary and next action

The result **does not select a final deck**, change the Issue25 v4 policy, establish any tournament-equivalent win rate, or increase the number of competitively qualified games above zero. It offers an auditable new mobility hypothesis:

1. Define a narrow, owner-information-safe zero-Energy Active strand candidate independent of the earlier energy-saving helper. Verify printed retreat costs, current-turn retreat eligibility, Tool slot, Tool lock, correct bench attack costs, likely damage, and opportunity cost of alternate Tool use.
2. Run a **same-original-seed retrospective counterfactual** on this specific root via native Store, with identical source deal and opponent decisions through the first differing accepted action. Report genuine Tool attachment, free retreat and attack settlement separately.
3. Register **new fresh independent physical seeds before checking outcomes** if the branch proves executable. Evaluate all 32 sources before estimating contribution to final deck win rate.

The new near-miss is a **post hoc hypothesis**, never added to the preregistered zero/narrow-denominator numerator.

## Fresh-regression verification and decision-line restrictions

The supplementary five-case [fresh-denominator regression suite](../../tests/agent31-prospective-allpass-r5-r11.test.cjs), the prior exact-archive parity suite, and the new full-five-Bench Retreat predicate case all ran successfully in the standard lightweight statistics job: [CI 42149840037](https://github.com/FlareZ123/experiment-01/actions/runs/42149840037), at revision `5e6afd786767edec5c4da9edff776a37033bce79`, **SUCCESS**. The fixed original native result continues to be [CI 42148186506](https://github.com/FlareZ123/experiment-01/actions/runs/42148186506), with the entire archive retained. The lightweight tests verify fixture contracts; they do not run fresh competitive games.

Post-result exact live native-root adjacency in the newly observed Mimikyu case further constrains its counterfactual: at contender turn34, accepted root174 played `Dialga-GX`, then root175 **passed** without any `RetreatAction` in that contender turn. At turns36 and38, the contender's sole ordinary roots were Pass183 and Pass190, likewise without an earlier Retreat that turn. Their interposed source-side turns contained accepted `Oranguru V` `Psychic` attacks, increasing Mimikyu's damage while preserving its zero-Energy status and the funded VMAX on Bench. Each Pass thus occurs with the **normal retreat quota unused in the actual public action ledger**. This does not certify special-status or persistent-effect freedom because the post-choice all-Pass owner observer does not record those restrictions, and it does not prove a counterfactual native Tool→Retreat→attack line.

## Separate unselected owner-visible rescue proposal

Research-owned pure [`agent31-zero-energy-strand-floatstone.cjs`](../../simulation/twinleaf/agent31-zero-energy-strand-floatstone.cjs) models the **new** stranded-Active payoff without altering any actual player policy. It uses the existing actor-only observation interface, native printed attack-cost evaluator, and Agent14's nominal attack damage projector. It proposes `attach-emergency-floatstone` followed by `retreat-emergency-floatstone` only when an Active has zero Energy and a nonzero printed retreat cost, no visible Tool/status/turn retreat veto applies, and a paid Benched printed attack meets the face-up opponent's remaining HP in the simplified public model. Each proposal explicitly sets `paperQualified:false`, because unknown abilities and persistent card effects can invalidate a nominal KO.

Three synthetic [regressions](../../tests/agent31-zero-energy-strand-floatstone.test.cjs) cover the 100-damage versus 80-remaining Mimikyu/Oranguru/Shadow Rider configuration, an already attached Float Stone continuation, and representative resource/lock vetoes. These pure model tests **are not a native Store intervention or game result**. They ran within standard lightweight CI [42150693795](https://github.com/FlareZ123/experiment-01/actions/runs/42150693795), commit `5a9d100351558d2477d90da9f1537b036a53422d`; all original native Store results remain unchanged.

## Recoverable accepted Passes in the one native abort

The failed original trial `11:2:B:champion-reference`, seed `2234229318`, retained a separate `nativeAbortEvidence.rootActionLedger` even though the complete all-owner observation was unavailable. This exact ledger has **72 accepted native actions**, ending just before the attempted `UseAbilityAction` with `UNKNOWN_POWER` at action ordinal72/turn18. Among the accepted actions are **16 true `PassTurnAction` records**, eight from each physical seat, at ordinals `16,20,23,27,30,35,39,42,46,49,53,56,59,63,66,69`. Their accepted status and actor seats survive the redacted independent abort-custody transport, but **their per-Pass owner hands and public boards do not**. Treat them as **16 additionally known decisions with unknown tactical eligibility**, not zero opportunities and not 16 negative tests.

Therefore the fresh cohort has **895 known genuine accepted Pass decisions**: **879** with complete owner hand/board observation in 31 trials and **16** accepted-but-owner-unobserved Passes in one later aborted trial. No competitor effectiveness denominator can include those 16 as negative eligibility evidence. The runner's post-hoc summary projection was amended after the immutable native archive to expose `knownAcceptedPassRootsOnIncompleteNativeRows` separately from `ownerPassReceiptsInCompleteRows`; the native game/policy and original archived evidence were **not rerun or changed**. A synthetic regression of the explicit separation was added to the existing statistics CI.
