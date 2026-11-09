# Original rank-5 Mew/Genesect: Quick Ball access consumed the source attack line

Agent37 | 9 November 2026 | Retrospective developer evidence, **zero competitive games**

## Concrete failure and direct control

The original Aichi rank-5 authenticated 60 includes 4 Genesect V, 4 Mew V, 4 Quick Ball, 4 Ultra Ball, 3 Battle VIP Pass and 4 Double Colorless Energy. The shared owner-root policy initially had no Quick Ball/hand-discard continuation on the archived baseline. Its source policy was separately broken by an unrelated Genesect draw-flag regression, repaired in commit `08de32e` and verified green in pinned native workflow `42577136459`.

After that repair the existing preregistered original-source eight-arm development workflow still selected **zero source Genesect draw Abilities** and produced source attack counts of `4, 2, 0, 0` across the four opponent/seat attempts (two unique original rank-5 source deals paired with two candidate sixties).

To test connector realism without inventing a card swap, Agent37 replayed the same four physical deals in eight native attempts with the existing `sourceScopedQuickBallRoot:true` and `actorHandDiscard:true` policy gates enabled in both comparison modes. The new mode and output are explicitly marked **post-observation retrospective development**. [Workflow 42579923555](https://github.com/FlareZ123/experiment-01/actions/runs/42579923555) SUCCESS; downloadable artifact `agent37-source-quickball-discard-8arm`.

| Fixed candidate, source seat | Previous source attack declarations | Quick Ball + hand-discard source declarations | Native-confirmed Quick Ball roots | Actual source discards |
| --- | ---: | ---: | ---: | --- |
| Champion reference, source seat 1 | 4 | 0 | 3 | Guzma, Karen, Ultra Ball |
| New Moon, source seat 1 | 2 | 0 | 3 | Guzma, VS Seeker, Karen |
| Champion reference, source seat 0 | 0 | 0 | 1 | Double Colorless Energy |
| New Moon, source seat 0 | 0 | 0 | 2 | Double Colorless Energy, Guzma |

All four cross-run pairs preserved exact `sourceDealFingerprint` **and** `fullPhysicalDealFingerprint`; no opponent deck or opening draw changed. Native-confirmed `play-quick-ball` actions totaled 9, and the corresponding mandatory discard prompts were accepted. The 4/2/0/0 to 0/0/0/0 source attack change is descriptive within these two reused source-deal seeds; policy randomness and later opponent responses can diverge after an action, and these are not independent matchups. Genesect native draw activations remained zero in all attempts. All game outcomes remain `ENGINE_TERMINAL_UNQUALIFIED` or `CENSORED`; no competitive win rates.

## Cause suggested by accepted root history

The conservative Quick Ball chooser selects the Item when a duplicate non-Quick-Ball printing is available, irrespective of whether the search fulfills an imminent damage/energy/attacker requirement. Its owner-hand discard continuation minimizes lost singleton printings rather than modeling matchup-specific tactical value. The native source successfully burned Supporter gust/recovery resources and, in one source deal, a Double Colorless Energy from a four-copy-only Energy suite. On the source-seat-1 champion-reference deal, the first Quick Ball moved from no Quick Ball on the baseline to a turn-6 Quick Ball that discarded Guzma, then the actor benched Dedenne, Mew V, and Genesect V by turns 6,8,14 respectively. The original baseline benched those by turns 8,10,16. Earlier setup alone failed to produce an attack.

This is a concrete counterexample to treating Item access as beneficial without its discarded-card cost, search target, subsequent attack readiness, and possible competing attack choice. It supports human-developed DCI, AMR and connector domination as **diagnostic hypotheses**, and directly demonstrates the limitations of this particular current policy.

## Immediate decision

Do **not** promote the current source Quick Ball + generic discard opt-ins to the common competitive policy on this evidence. Prefer owner-aware **payable-attack-first** Quick Ball and a source-appropriate Pokémon search target, with explicit treatment of dead Battle VIP Pass after each player's opening turn and protection of the only four Double Colorless Energy. The existing development engine already exposes `sourceQuickBallPreservePayableAttack`; the second opt-in comparator is being tested separately. Tests should evaluate the full accepted turn sequence, not just successful Item dispatch.

All original source 60s, native engine pins, exact deal fingerprints and per-root action receipts remain in the two downloadable workflow artifacts. The 99.5% objective remains unsubstantiated.


## Paired attack-preserving Quick Ball comparator

The existing source-specific `sourceQuickBallPreservePayableAttack` option was tested in a third independent native eight-arm run, [CI 42580831141](https://github.com/FlareZ123/experiment-01/actions/runs/42580831141) **SUCCESS**, using the same source/contender printed 60s and the same four physical deal fingerprints. Source actor Quick Ball count remained `[3,3,1,2]`, source attack count remained `[0,0,0,0]`, and accepted source Genesect Abilities remained zero. Every native action in the four treatment root ledgers matched the non-preserving Quick Ball+discard version, including first Quick Ball turns `[6,8,8,8]`.

The intervention did not suppress any harmful Quick Ball in this particular tested root sequence. This is consistent with the payable-attack check firing only when the owner already has a payable attack at the exact early Quick Ball decision; it does not guarantee that discarding an Energy or gust now preserves the ability to attack several turns later. Thus same-turn payable-attack-first priority is insufficient for this observed setup failure. The next focused intervention needs to resolve realistic search target and discard costs across turns, preserving owner attack funding. Full output retained in run artifact `agent37-source-quickball-discard-8arm` attached to 42580831141. All arms remain retrospective and competitively unqualified.


## Owner-only Mew V / Genesect V native search: one restored attack line

A further opt-in development intervention attached the existing native owner-only single-card deck-search resolver to the original source and supplied an owner-visible preference for missing `Mew V FST`, then missing `Genesect V FST`, during an actual `Quick Ball FST` resolution. The detached pure chooser is `simulation/twinleaf/agent37/mew-genesect-quickball-search.cjs`, invoked through `agent7-canonical-actor-composition.cjs` and the bilateral registration only under explicit `actorMewGenesectQuickBallSearch:true`. Unrelated owner searches and the opposing actor use their original generic single-search chooser. The pending prompt's original native filter and physical card objects are resolved by the existing adapter, after the pure chooser selects only a public owner-permitted printing.

Pinned native [CI 42582243628](https://github.com/FlareZ123/experiment-01/actions/runs/42582243628) **SUCCESS** on both physical seats, all four authentic source-start conditions and all eight frozen trial arms. Real accepted source owner search receipts, one row per registered physical matchup:

| Opponent, original source seat | Source Quick Balls | Owner deck-search selections | Source attacks under search preference | Native attack settlement |
| --- | ---: | --- | ---: | --- |
| Champion, seat 1 | 3 | Mew V; Dedenne-GX; Genesect V | 0 | none |
| New Moon, seat 1 | 3 | Mew V; Dedenne-GX; Genesect V | 0 | none |
| Champion, seat 0 | 1 | Mew V | 0 | none |
| New Moon, seat 0 | 2 | Mew V; Crobat V | **4** | **4 settled Mew VMAX Cross Fusion Strike attacks**, turns 26, 30, 34, 38 |

Each source and full physical opening fingerprint matches both prior 8-arm variants for the same case. For the New Moon source-seat-0 case, the previously unrestricted Quick Ball + generic discard path produced zero source attacks; the new owner search enabled a live Mew VMAX carrying Double Colorless Energy with Genesect V and Crobat V on Bench, and four genuine native `AttackAction` declarations, four settled prompt chains, no cross-epoch settlements, and three immediate opponent-to-source turn transitions. It still remains an **ENGINE_TERMINAL_UNQUALIFIED** development game. The other three source attacks stayed at zero. Genuine Genesect ability activations stayed at zero in all four rows.

**Causal caveat:** this intervention simultaneously switched on the generic owner-only search resolver and specialized its Quick Ball choice. A separate same-seed *generic owner-only search without preference* control is required to isolate the Mew preference itself; it has been dispatched. One qualified card-action sequence is concrete actionable progress, with no game win-rate inference or assertion of a universally stronger fixed 60.


## Generic owner-search control isolates the source Quick Ball target

The generic owner-only search control ran the **same** four physical source deal and full initial physical deal fingerprints, source-only Quick Ball, and the same mandatory discard policy. Its sole experimental difference from the owner-Mew preference is the authorized deck-search chooser: stock generic owner search selects the first native-eligible sorted printing instead of prioritizing missing Mew V. [Pinned native CI 42582780536](https://github.com/FlareZ123/experiment-01/actions/runs/42582780536) **SUCCESS**; artifact `agent37-source-quickball-discard-8arm` retained with `sourceOwnerSingleSearch:true`, `sourceMewGenesectQuickBallSearch:false`. The Mew-targeted [CI 42582243628](https://github.com/FlareZ123/experiment-01/actions/runs/42582243628) retained exact same control/treatment physical seeds.

| Opponent, source seat | Generic owner search first Basic | Mew-targeted first Basic | Generic source attacks | Mew-targeted source attacks | Generic engine terminal -> Mew-targeted engine terminal |
| --- | --- | --- | ---: | ---: | --- |
| Champion, seat 1 | Dedenne-GX | Mew V | 0 | 0 | opponent 6 Prizes taken -> opponent 6 Prizes taken |
| New Moon, seat 1 | Dedenne-GX | Mew V | 0 | 0 | censored -> censored |
| Champion, seat 0 | Crobat V | Mew V | 0 | 0 | opponent 6 Prizes taken -> opponent 6 Prizes taken |
| **New Moon, seat 0** | **Crobat V** | **Mew V** | **0** | **4 settled** | **original source loss (opponent took 6 Prizes) -> original source engine win (source took 6, opponent took 2)** |

The decisive source seat-0 New Moon **native engine** trace under targeted search shows Mew V selected with the first Quick Ball at global turn 8, Mew VMAX on Active with Double Colorless Energy, Genesect V on Bench, four completed Cross Fusion Strike attack chains at turns 26/30/34/38, and source Prize evolution `6 -> 4 -> 1 -> 1 -> 0`; native engine declared winner seat 0. The generic owner-only search in the exact same physical starting deal obtained Crobat V and Dedenne-GX from its two source Quick Balls, recorded **zero** source attacks and engine winner seat 1. The specific omitted attack-body selection thus offers a concrete, reproducible **developmental** cause of a failed original-source line, within the pinned simulator. Both native action coverage and original printed 60 remain traceable, and no effect requires reading the opponent's concealed cards.

**Interpretation:** native owner-search feasibility alone did not fix the old failure. Selecting the strategically necessary Mew V attacker from a native-eligible Quick Ball search was essential for the one observed Mew attack/win path. Three of four retained contexts remain failures, all results are retrospectively selected after inspecting historical source failures, and the simulator's legal/decision/tournament qualification gate remains false in every row. The engine-coded win is **not evidence of a paper Expanded win-rate**, nor proof the source deck beats New Moon consistently. Future work should test newly preregistered independent deal seeds, realistic opponent policies, the card/ability rules corrections, and energy/discard survival before choosing any competitive fixed 60.
