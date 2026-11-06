# Four fresh rank-1 seedgroups: real paid VMAX-to-Latias retreat finds a previously missed one-Prize finish

**Agent 42, 6 November 2026.** This is a prospectively registered, paired native-Store **policy-mechanism** finding. It includes one real native source terminal under a new paid-retreat decision. It contributes **zero** paper-qualified competitive games, **no** aggregate estimated win rate, and **no** evidence that the 99.5% Top-32 target has been reached.

## Registration, fixed inputs and reproducibility

The [v4 preregistration](../registrations/agent42-rank1-prospective-paid-v4-20261106.json) was Git-committed at `20425590d6995c064579e062654ae57d147ae451` before the first native execution. Four independently generated 32-bit seeds were `2532423208, 3103663673, 3749399793, 2762430059`. Their distinct original rank-1 source groups covered candidate seat A/B alternately and both unchanged candidate inventories: tournament champion reference and New Moon Lockbreaker v1. The original rank-1 source's printed 60 was held fixed. Three profiles reused the identical selected-v3 funded-Tool policy: control A (paid-retreat proposal off), treatment (owner-public two-Psychic paid retreat to already funded Bench attacker on any eligible turn), control B (proposal off). The native root cap was 240.

The native experiment has **8 distinct candidate contexts × 3 arms = 24 attempts**. Every candidate had the **same full physical opening deal, source deal and verified starting seat across A/B/A**, despite candidate-dependent setup mulligan concerns. The two control profiles repeated **identical action-ledger digests in 8/8 contexts**. Seven of eight treatment ledgers also matched the controls exactly; precisely one newly registered treatment diverged at a single funded-retreat decision.

- [CI run 42199792579](https://github.com/FlareZ123/experiment-01/actions/runs/42199792579), success, source commit `138b5f92d7a27e102e59c932e0e89f18ada5d94f`.
- [Raw native artifact 13493214715](https://github.com/FlareZ123/experiment-01/actions/runs/42199792579/artifacts/13493214715), ZIP SHA-256 `d1346b9f17bf044f63209674ef333d6ab8e13f7b4600e4d7b7aab49e3e609e0f`. Decompressed full JSON SHA-256 `8eaa2e7d74ab821aeb46437585c8be510fe779e9fe44728283b2a4d3c5cb76fd`.
- [Frozen prospective runner](../../../simulation/evaluation/agent42-rank1-prospective-paid-v4.cjs). Its old VMAX-only public root join reports zero paid roots because the sole positive treatment promoted **Latias ex SSP**. This is a recognizably narrow observer, and the raw accepted Store sidecar and the [new separately versioned general posthoc auditor](../../../simulation/evaluation/agent42-general-paid-retreat-root-audit.cjs) provide the wider target-specific evidence. Preserve the frozen v4 code for replay provenance; do not silently relabel its zero counter.

## Single real changed source decision

**Exact registered trial:** `1:600:A:new-moon-lockbreaker-v1`, original source rank 1, source physical seat 1, candidate physical seat 0, seed `2532423208`. The original source begins second. Initial source-deal SHA-256 `4993208aa15d2a0a48b340b84ad4d3efd0feb0ce35270f0090e1b7420fa9673b`; full physical opening deal `c68d369a52fe2ef77f7e11fa1c5c42fdfa0ec79f2a8577f74eeb3351aa1fbe88`. Both controls' real root ledger SHA-256: `ab35cab88ba2c73b6b9e8ac62607ee4f4af3660e559b983810ec3eabccc35a85`. Treatment ledger SHA-256: `957da0b26597cd9ac35a7474c8f0caddedf3e9f12f2c223ad1ff49a3e62f80e1`.

| Observable | Control A and identically repeated control B | Treatment |
| --- | --- | --- |
| Global turn 22, actual owner root 131 | Original source selects `PassTurnAction` | Source selects real `RetreatAction` to Bench index 1 |
| Source Active pre-action | Shadow Rider Calyrex VMAX CRE, two Basic Psychic, no Tool | The exact same public state |
| Bench index 1 pre-action | Latias ex SSP, three Basic Psychic | The exact same public state |
| Native accepted public Store result | No retreat, no attack at this owner decision | VMAX occupies Bench index 1 with **zero** Energy; Latias ex becomes Active with the same **three** Psychic |
| Follow-on owner root | Pass ends source turn | Root 132: **Eon Blade**, settled; printed base damage 200 |
| Immediate source Prize change | Remains at one Prize | Real native Prize array `[6,1] → [6,0]`, taking the final Prize |
| Endpoint | **240 accepted-root cap**, unresolved game with `[6,1]` | **134 accepted roots**, native source seat 1 wins with `[6,0]` |

The [exact attached-card source database](../../../resources/) identifies Shadow Rider Calyrex VMAX CRE 75 with a printed two-Colorless Retreat Cost, and Latias ex SSP 76 with **Eon Blade**, three-Energy cost `[Psychic, Psychic, Colorless]`, 200 printed damage, and an attack restriction on Latias ex's following turn. Three Basic Psychic on Latias are sufficient. Although Latias ex's Skyliner Ability removes Basic Pokémon Retreat Costs, the retreating VMAX is an Evolution Pokémon, so the two-Colorless printed source cost remains relevant.

The genuine Store's `nativeAcceptedTargetSidecar.events` records root 131, the declared target index, `storeAccepted:true`, full face-up before/after source/target attachment lists, and physical position exchange. The original VMAX's two Basic Psychic disappear from the field in that same accepted Retreat, matching the native two-Colorless payment. The next `sourceAttackSettlement.attacks` has exact root 132, `attackName:'Eon Blade'`, `settledPromptChain:true`, and the independent Prize change. **The artifact does not contain per-card private object-identity custody bound to this particular source game**. Separate staged real-Store tests verify the two-card discard mechanism with exact original objects on both physical seats, without elevating the trial's available custody evidence beyond what its public State demonstrates.

## Interpretation and denial of unsupported conclusions

The untreated original rank-1 source did not attack even though a funded Latias ex and a payable Retreat route were publicly visible. In this single registered game, an owner-visible paid-retreat policy recovered an immediately winning native attack. The 8/8 replay controls make that *decision-path contrast* credible. The original opponent policy remains incomplete and the controls were censored rather than played to terminal, so the 240-versus-134-root comparison is **not an observed competitive match win-rate difference**.

The narrow initial v4 verdict `actualPublicPaidTrialCount:0` counts only **VMAX-to-VMAX** pivots. Its selector recorded one paid-retreat intent on this exact trial; the accepted root ledger and public sidecar prove an actual **VMAX-to-Latias ex paid pivot**. This is a generalizable lesson for research instrumentation: selection counters, card-specific physical auditors, and full-target native accepted-root evidence answer different questions.

The entire benchmark still has only **29/32 authenticated source name/count inventories**, with ranks 23, 25 and 28 missing, no human-competent complete paper opponent policies, no validated 25-minute match timing model, and zero competitively qualified games. No fixed 60 promotion, card removal, or field win-rate claim follows. The next fair test is to include this generic owner-visible paid retreat in a prospectively frozen common-policy release against the broader authenticated field, compare other threats and failure cases, and retain exact genuine Store paid fee plus attacker response evidence.
