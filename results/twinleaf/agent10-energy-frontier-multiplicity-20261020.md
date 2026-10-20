# Agent 10: multiplicity-aware Basic Energy frontier for actor-only roots

**20 October 2026 UTC. Evidence class: source-level counterexample and eight passing local Node 22 pure tests.** This is a helper for the existing canonical actor-only composition, **not another runner or certified opponent-playing policy**.

## Reproducible problem

The current actor-only root helper in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` chooses the first Basic Energy in the acting player's own hand when the turn's manual attachment remains available. Its native numeric cost matcher was separately repaired by Agent 2, but the attachment choice is still independent of colored cost. Agent 5's `selectOwnerRootIntent` has a more targeted approach, yet its `deficits` logic tests each requested colored symbol **independently** against the same already-attached pool. It therefore loses **multiplicity**.

A minimal detached actor-view counterexample, using the pinned numeric `CardType` values documented in [Agent 2's stop-gate](../../communications/broadcast/20261020T1915Z_agent2_actor_numeric_attack_cost_stopgate.md):

- Visible Active attack cost is `[5, 5]` (two Psychic).
- Visible attached Basic Energy type is `[5]` (one Psychic).
- Owner hand contains `[Darkness Energy MEE, Psychic Energy MEE]`.
- The manual Energy attachment is still available and no search or other effects alter attack cost.

Independently checking either `5` against the attached `[5]` incorrectly reports each as satisfied. Selecting first-in-hand Darkness still leaves one unsatisfied Psychic symbol. Selecting Psychic makes the printed cost payable with known Basic Energy. This is a **formal one-step resource comparison**, not a claim about native attack acceptance or whether attaching before other actions is strategically optimal.

## Implemented research code

- [Multiplicity-aware chooser](../../simulation/twinleaf/agent10-basic-energy-frontier.cjs) exports `remainingBasicAttachments(cost, attached, colorless)` and `chooseBasicEnergyFrontier(actorView, catalog)`.
- [Eight independent pure regression cases](../../tests/agent10-basic-energy-frontier.test.cjs) cover repeated colored symbols, mixed typed/Colorless deficits, matching-versus-first hand order, two printed attacks, spent GX exclusion, fallback, visible restrictions, and invariance to arbitrary opponent concealed cards.

For a single-unit Basic-Energy-only model, the minimal further-attachment count for a printed attack is `max(unmatched colored symbols after one-to-one matching, attack cost length - known attached Basic Energy count, 0)`. The chooser evaluates every eligible Basic Energy printing in the owner's visible hand against every still-plausible printed attack, and uses an immediate reduction in that lower-level resource deficit as its proxy. It breaks ties deterministically by earlier hand/attack order. When none can reduce a deficit it preserves the existing first-Basic behavior. **The helper has no raw State, deck identity, Prize identity, or opposing private-hand input.**

## Local verification

I executed `node --test tests/agent10-basic-energy-frontier.test.cjs` using Node v22.16.0 in the repository-relative test layout: **8 tests passed, 0 failed**. Both files were committed to the shared GitHub repository and should receive independent CI/pinned-engine verification before changing canonical gameplay behavior. The pure fixtures contain invented but type-faithful costs and printings; they do not test real game turns.

## Integration direction and limitations

The smallest useful integration is a reversible, opt-in replacement of only the **Basic Energy hand-index choice** in Agent 34's root policy, retaining the canonical actor-only composition and its both-seat evidence ledger. Include the exact same physical frozen rank-6/rank-11 source-first trial arms, all action rejects, public Energy-zone transitions and source continuations. Test one accepted newly selected Energy against an untouched control with a genuine payable attack declaration, or preserve the earliest failure. Agent 34/Agent 41/Agent 7 can integrate without another parallel comparison runner.

The helper deliberately **does not** model Special Energy, modified attack costs, attack-copy delegation, Ability effects, Bench recipient choices, opportunity costs of preserving Energy, evolution requirements, weakness/resistance, lock impacts outside explicit visible prohibitions, or tactical prize pressure. Its conditional minimum is not a complete game-state optimum. A helper whose static deficit improves can still produce worse real play, so native Store and policy-quality trials are mandatory.

**Benchmark unchanged:** exact 29/32 Aichi Top 32 published 60s, zero competitively qualified games, no validated fixed deck reaching a 99.5% win rate.


## Executed native integration and paired historical control, 20 October 2026

The existing actor root was modified by [commit e78f8b1](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) to consult this helper at the Basic Energy hand-index decision **only** when `AGENT10_BASIC_ENERGY_FRONTIER_DEV=true`. The original first-Basic decision remains the default, and the existing canonical four-component policy retains all four original physical arms. Its preexisting GX declaration branch refuses every GX attack. The helper now correspondingly excludes GX attacks rather than steering an Energy attachment toward an action unavailable to this root policy.

A ninth pure test catches unspent GX diversion, bringing the current pure corpus to **nine helper tests plus four root-integration tests**. A first attempted revision failed at that new test in [control 39490534943](https://github.com/FlareZ123/experiment-01/actions/runs/39490534943) and [enabled 39490545221](https://github.com/FlareZ123/experiment-01/actions/runs/39490545221), because a literal `\\n` appeared inside an added comment and consumed the GX filter expression. The error was corrected in [commit 96f5d89](../../simulation/twinleaf/agent10-basic-energy-frontier.cjs), then the same manual-only workflow was executed twice at the **identical Git head `96f5d8989bf9f152d0317fda89786ecae3afecef`**.

| Canonical historical input | Basic Energy frontier | Manual compiled status | Raw ZIP SHA-256 |
| --- | --- | --- | --- |
| [Run 39490750682](https://github.com/FlareZ123/experiment-01/actions/runs/39490750682), artifact [12296156155](https://github.com/FlareZ123/experiment-01/actions/runs/39490750682/artifacts/12296156155) | Off | **Passed** | `f3e71252290bc2f2a8eaf9b269f7336546aaff66db2cf4a1de98560cef33faec` |
| [Run 39490756215](https://github.com/FlareZ123/experiment-01/actions/runs/39490756215), artifact [12296231424](https://github.com/FlareZ123/experiment-01/actions/runs/39490756215/artifacts/12296231424) | On | **Passed** | `bbeb1c0e74a085037c411082c8cb56e97682dc1a3f2760cb20e65ac1f51484ec` |

Both were compiled against the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both passed their pure adapter regressions, all four required actor-audit records, native zero-rejected-root assertions and paper Supporter opt-in. The complete JSON artifacts were downloaded, parsed and compared field-by-field, preserving all attempted rows, including caps and errors.

**Negative matched observation:** In the four historical arms, one for each champion/New Moon candidate against rank6 and rank11, the *only* changed field inside each complete JSON result row was `actorOnlyDecisionCoverage`. Every remaining top-level field, each result row's physical source fingerprint, actual starting seat, action count, accepted roots, attack-settlement count, terminal status, winner or censor state, and source follow-up metadata were identical. For the root decisions, the first up-to-64 recorded native accepted intents and the complete per-arm intent-frequency totals were also identical. When deleting only `actorOnlyDecisionCoverage` in both parsed JSONs, the **entire output objects were structurally equal**; compact, sorted JSON of that common normalized packet has SHA-256 `2f4a559c868fd8b6ab3a9484d24ec057790e2aa225d11d28559d12ed72b24328`.

| Historical rank/candidate | Root actions accepted | Root actions rejected | Generic fallback prompt observations |
| --- | ---: | ---: | ---: |
| Rank6 champion reference | 5 | 0 | 17 |
| Rank6 New Moon | 56 | 0 | 119 |
| Rank11 champion reference | 68 | 0 | 177 |
| Rank11 New Moon | 63 | 0 | 188 |

These four source-deal streams were previously selected and cannot form a fresh opponent-win denominator. **The tested policy toggling caused zero observed difference in these historical streams**, even though the pure counterexample establishes a meaningful distinct decision on another owner-visible state. The ranking of final 60s is unchanged. Neither root `AttackAction` acceptance nor a native terminal automatically qualifies a competitive game. This work establishes both compatibility and a narrow empirical negative, with a well-defined next falsification: find a genuinely occurring owner-root state where both Psychic and Darkness Basic Energy are in hand, a payable cost has a repeated colored deficit, and the two policies produce distinguishable, Store-accepted next actions with complete downstream source continuation.

The native integration report supersedes the earlier paragraphs which describe CI and policy wiring as pending. **Qualified games remain zero**.
