# Original frozen 32-arm source/candidate native VIP coverage: 21 actual Item roots with physical effects

**Agent 9 | 29 October 2026 | pinned real Store + 32 paired unchanged-source historical game arms, **not** competitive inference.**

## Frozen inputs and verified compiled output

The experimental registration `results/aichi-2026/registrations/agent9-existing-32-vip-coverage-20261029.json` was committed **before** its matched control/treatment CI run. It explicitly reuses Agent41's original registered seeds, exact original Aichi rank6/rank11 opposing 60s, both candidate 60s (rank1 reference and New Moon), each physical candidate slot, unchanged engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and all Store errors/censored trials. This cohort was chosen before the VIP treatment for an **earlier research objective**, yet native original held-VIP opportunities had already been observed; it is thus a **retrospective enriched mechanism evaluation**, not a prospective random all-field sample.

Manual compiled [CI 40959290027](https://github.com/FlareZ123/experiment-01/actions/runs/40959290027) at code commit `c353d5f11ff205c4effcbe382d6806073d359595` completed successfully. Complete JSON controls, treatments and independent paired checker are archived in artifact [12936000597](https://github.com/FlareZ123/experiment-01/actions/runs/40959290027/artifacts/12936000597), ZIP SHA256 `90a2f558695c24fccf9dac5011b78dfb98a517ab9502509fdc50cd08b6b5d945`. **93/93** pure tests passed; the original 32-arm all-attempt control, 32-arm owner-VIP treatment, and failure-inclusive paired checker each exited successfully.

| Native original-store measure | Control (bridge OFF) | Same-checkout treatment (bridge ON) |
| --- | ---: | ---: |
| Original registered game attempts | 32 | 32 |
| Matched physical initial setups and actual starting-order parity | 32/32 | 32/32 |
| Native game-engine exceptions | 0 | 0 |
| Native action-capped games | **12** | **13** |
| Source-player accepted Battle VIP Pass Item roots | 0 from bridge | **12** |
| Source-player original owner-deck search resolutions | 0 from bridge | **12** |
| Source-player physically confirmed Bench effects | 0 from bridge | **12** |
| Candidate-player accepted VIP Item roots | 0 from bridge | **9** |
| Candidate-player physically confirmed Bench effects | 0 from bridge | **9** |
| Competitively qualified games | **0** | **0** |

All **21** opt-in native VIP Item actions across both physical actor roles had original native owner-deck prompt settlements with verified actual selected physical cards moving to Bench, correct source deck cardinality decrements and Bench occupancy changes. The initial paired verification retained every one of 32 arms and found no engine errors, prompt rejections, unresolved search or unverified physical placements. The source and candidate Item roots are by **game arm**, which may reuse the same source physical deal for the two different candidate sixty treatments; **12 should not be read as 12 independent source deals**.

**Game success is unqualified.** The control's 12 capped roots rose to 13 after more realistic early actions. This is evidence that one additional available tactic can change the game-state rollout or action budget, not evidence that the tactic is strategically better or that either deck got stronger or weaker. Every game is excluded from the 99.5% win-rate denominator.

## Independent strict archive recheck and physical-source denominators

Manual compiled **[read-only CI 40960334634](https://github.com/FlareZ123/experiment-01/actions/runs/40960334634) PASSED 93/93 pure tests**, downloaded the **immutable** prior artifact by original run ID, and verified downloaded artifact SHA256 exactly `90a2f558695c24fccf9dac5011b78dfb98a517ab9502509fdc50cd08b6b5d945`. It reran the **strengthened fail-closed source and candidate native Item→original owner search→physically confirmed Bench ledger checker** without replaying any game and obtained **32/32 matched complete setups**, 0 Store errors and 0 unpaired native Items, prompt rejections or unresolved searches. The new summarized JSON artifact is attached to that read-only CI run. Its GitHub artifact ZIP digest is `7d3ed8c06bef3c170feb25cc0cdadafc0caa346948fd18ecd7b5cee56a90957e`.

Crucially, the 32 game arms are only **17 independent source physical deals** after actual native setup and mulligans. One expected candidate pair differed in source deal and is **preserved**, never silently equated. The original field-wide seed list covers two ranks, not all 32 opposing decks:

| Original opponent rank | Native game arms | Distinct source physical deals | Source actually starts first, game arms | Source native VIP plays / physical Bench effects | Distinct source deals with VIP play | Candidate VIP plays / physical effects |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6, Iron Thorns | 16 | 9 | 14 | 0 / 0 | 0 | 5 / 5 |
| 11, Absol/Garbodor | 16 | 8 | 12 | **12 / 12** | **6** | 4 / 4 |
| **Total** | **32** | **17** | **26** | **12 / 12** | **6** | **9 / 9** |

The source rank-11 T1 opportunities and native accepted Item search-to-Bench effects occurred in all **12 actual source-first game arms**; these collapse to **six distinct original source physical deal** events after paired candidate repetitions. The pilot's opt-in policy remained default-off otherwise. Only eight of 32 candidate game arms played VIP (one arm played more than one, giving **nine** candidate Item instances). All such effects were native-verified. There were no source rank6 VIP Item plays, consistent with the source deck's printed inventory and restricted action channel.

One paired arm's game-cap classification changed: `11:3:A:new-moon-lockbreaker-v1` was a native terminal under the original basic actor policy and became action-capped after both source and candidate VIP actions. This is evidence of materially changed game rollout and the importance of **policy arbitration and terminal/cap accounting**; it establishes neither an improved deck nor a harmful VIP tactic. The other 31 paired game arms retained their terminal/cap classification, although their internal actions may still have diverged.
## Owner information and methodology

The common hook `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs` is **default OFF**. On either actual player's owner-root after the canonical policy otherwise Passes during opening turns, it inspects only that player's permitted own hand, public deck count, Bench space and item-lock attributes. Once the pinned native engine issues the original **owner-deck** `ChooseCardsPrompt`, it may inspect eligible Basics within that search as authorized. It returns exact original physical native card objects and uses the original prompt validator; the Store's accepted native Item and prompt dispatch are captured with physical Bench/deck postconditions. The generic fallback and all other action families remain incompletely qualified. Search target selection is an explicit heuristic and has not been optimized.

## Next falsification boundary

The immutable archived results **passed** a second **no-game-replay** strict native effect checker and source-deal denominator count. Newer `simulation/evaluation/agent9-registered-original-32-vip-census.cjs` requires not only native Item settlement but each source and candidate search/Bennch effect, no Store errors, and no unmatched attempt. `simulation/evaluation/agent9-original-32-vip-archive-brief.cjs` groups unique source physical fingerprints and actual starting orders to avoid pseudo-replication. Until this check is complete, these findings are restricted to 32 structurally matched game arms.

The exact tournament Top32 source population remains **29/32** (missing ranks 23, 25, 28), **0 competitively qualified games**; there is no demonstrated 99.5% fixed deck. No new broader source-policy competence or paper-clock qualification is claimed.
