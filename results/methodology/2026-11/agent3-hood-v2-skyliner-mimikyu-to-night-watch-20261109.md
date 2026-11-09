# Same fixed sixty: Mimikyu → Skyliner retreat → Night Watch changes one native outcome

**Agent 3 | 9 November 2026 | actual pinned native run [42639770946](https://github.com/FlareZ123/experiment-01/actions/runs/42639770946) | artifact [13684393971](https://github.com/FlareZ123/experiment-01/actions/runs/42639770946/artifacts/13684393971)**

## Decision

**Activate owner-visible already-funded attacker mobility as an explicit candidate-policy hypothesis; retain Hood Shield v1 as the selected modified Shadow Rider developmental comparator and do not promote Hood Consistency v2 from this test.** The previously identified native Filch trap was genuine in one historical original-source deal: enabling the existing flexible retreat selector on an unchanged complete 60 caused one Store-accepted retreat, seven settled Night Watch attacks and a full candidate native victory in the *exact same physically dealt game* where the control used fifteen Filch attacks and lost natively. The eight fresh groups registered independently of this historical target had **zero root-policy effects and zero observed outcome reversals**. No field-strength generalization is supported.

### Frozen cards, causal treatment and denominator

- Candidate exact 60 unchanged: [Hood Consistency v2](../../aichi-2026/candidate-hood-consistency-v2.json), 4 Shadow Rider V, 4 VMAX, 2 Tapu Lele-GX, 1 Trevenant & Dusknoir-GX, 1 Mimikyu GRI 58, 1 Latias ex SSP 76, 11 Psychic Energy, full printed inventory in JSON. Both comparison arms used precisely the same file blob SHA-1 `16d8b3513b83b46477252fd05bc05852664f8972`.
- Original Aichi opponents exact source rank **5 (Mew Genesect)** and rank **6 (Iron Thorns)**, same original printed sixties and common actor policy in each arm. Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research `agent19-composed-paper-semantics-profile-v1` enabled the same three scoped semantics fixes in both arms.
- [Registration frozen before first native game](../../aichi-2026/registrations/2026-11/agent3-hood-v2-flexible-paid-retreat-20261109.json) fixed nine source rank/seat/repeat/seed groups, two exact sixty-card arms per group, **18 native attempts**, 260 accepted-root cap. One explicitly labeled previously observed **posthoc anchor** `rank5:8102:B:seed2143005893`; eight **fresh registered** groups, both candidate seats and two source ranks.
- The sole treatment difference was `actorFlexiblePaidRetreatRoot:true`, invoking existing `chooseFlexiblePaidRetreatToFundedBench` via the acting player's detached owner-visible hand/public board. Same bilateral natural-evolution, Mew/source, opponent policy and random isolation. [Runnable matched study](../../../simulation/evaluation/agent3/hood-v2-flexible-paid-retreat-native.cjs); [pure tests](../../../tests/2026-11/agent3-hood-v2-flexible-paid-retreat.test.cjs). The selected manual workflow passed all tests, compile and 18 native game attempts; no engine aborts.
- Every pair matched both **entire two-player physical opening fingerprint**, source opening fingerprint and actual starter seat: **9/9**. All nine original registered attempts retained; no source-mismatched exclusions.

### Complete native counts

| Observed measure | Baseline, same 60 | Flexible-retreat treatment, same 60 |
| --- | ---: | ---: |
| Native attempts | 9 | 9 |
| Natural native terminals | 8 | 8 |
| Candidate native wins | 4 | 5 |
| Root-260 censored games | 1 | 1 |
| Native errors | 0 | 0 |
| Candidate RetreatAction roots | 0 | 1 |
| Candidate Filch declarations | 16 | 6 |
| Candidate settled/declared Night Watch roots | 0 | 7 |
| Candidate Max Geist declarations | 8 | 8 |
| Independent paper-qualified competitive games | 0 | 0 |

Eight of the nine matched groups completed in both arms. **One posthoc-anchor winner reversal favored treatment**; no paired completed reversal favored control. All matched source-group sharp treatment-minus-control native-win-count envelope: **[0,+2]**, because one pair was action-capped in both arms. Crucially, excluding the retrospectively chosen anchor, the **eight preregistered fresh groups** include seven both-terminal zero-reversal pairs and one double-cap, with sharp native-win-count envelope **[-1,+1]**. This is a logical bound under unobserved censored outcomes, not a statistical confidence interval or win-rate projection.

### Exact game-state mechanism of the historical native reversal

**Original source rank 5, candidate physical seat B, repeat 8102, seed 2143005893.** Both arms have original starter seat **1**, source fingerprint `fdcea18f83ab6599a74400524dd61f5f4b57df05d607b5a6a5d2450070dcac75`, entire paired physical fingerprint `edf79c7553fcc8a3e14a3515f6a971537fdcb1011fdd055322791a23573437ab`.

- Baseline: native terminal after **153** roots, **15** candidate Filch declarations on global turns 3 through 31, zero Night Watch, native winner source seat **0**, final Prize counts **[6,6]** (native source win by a non-Prize end condition).
- Treatment: at genuine root **72**, candidate attached Psychic Energy. At native root **73**, candidate executed **RetreatAction** from Active Mimikyu GRI into the already-funded Benched Trevenant & Dusknoir-GX. At root **74** on global turn **13**, Store accepted **Night Watch**; its prompt chain settled, showed three Psychic Energy on the new Active, and dealt 150 to the opposing Genesect V. Subsequent candidate Night Watch declarations were native roots **84, 98, 111, 121, 139 and 153**, with seven settled attack chains and real Prize transitions. At root 84, opposing Genesect V was knocked out, yielding **two Prize cards** (`[6,6] → [6,4]`); at root 121, a 3-Prize Mew VMAX was knocked out (`[6,4] → [6,1]`); final root 153 knocked out another 1-Prize target (`[6,1] → [6,0]`). Native terminal after **158** roots, candidate winner seat **1**, original opponent's actual actions continued throughout. This is an *observed complete native winner reversal*, without independent paper/tournament admission.
- **Important mechanism correction:** the experimental switch selector is named *flexible paid retreat* because it screens a printed one-unit cost. Here **Latias ex SSP 76's Skyliner** was on the candidate Bench and makes **Basic Pokémon have no Retreat Cost**. Mimikyu GRI 58 has printed Retreat Cost one Colorless; the public state immediately after root 73 and before Night Watch shows Mimikyu on the Bench **still holding its earlier Psychic Energy**. Therefore the accepted RetreatAction was an **effectively zero-cost retreat**, with no demonstrated Psychic Energy discard payment. The original underlying policy was a useful *mobility trigger*, while the label `candidatePaidRetreats` in the generated aggregate is a count of **all RetreatAction roots**, not a paper-verified paid discard count. Do not cite this episode as proof of a successful paid retreat.
- The native game contains no public correction that makes this a Japanese Extra paper-qualified game. Independent review must still establish every target, Night Watch forced hand discard, hidden-information boundary, exact Japanese printing, clock and opponent policy competence.

### Practical implication

**The first concrete candidate action opportunity was mobility at global turn 13, following source-pressure and candidate resource accumulation.** The candidate had a funded 150-damage attacker on the Bench, a zero-effective-retreat Basic in the Active Spot, and kept using zero-damage Filch in control. The existing actor-only selector converted this one public-board opportunity into a settled attacking sequence and a native win, with no deck edit. This directly demonstrates that optimizing card counts or counting setup access can miss a game-deciding play-policy error.

**Next useful engineering step:** teach the shared bilateral actor to treat public Ability-modified *effective* retreat cost, funded Bench attack payoff and opponent Active position as one combined mobility decision, with explicit paid/free cost receipts. The current general `actorFlexiblePaidRetreatRoot` can provisionally serve as a **default-off** tactic while native + independent paper checks are extended. Do not silently change frozen v8, rerun large field comparisons or promote this one retrospectively selected win into a preference for a different fixed sixty.

Source of truth: all 18 attempts, full native action roots, retained opening fingerprints, attack/Prize settlement, error/cap statuses and paper profile audit are in [CI artifact 13684393971](https://github.com/FlareZ123/experiment-01/actions/runs/42639770946/artifacts/13684393971), ZIP SHA-256 `61bbf8cd3471c1ad3246aaa547f69d7874cada79d407c059264d6a0551891ee8`. No 99.5% claim, no 32-opponent coverage, **zero independently qualified competitive games**.
