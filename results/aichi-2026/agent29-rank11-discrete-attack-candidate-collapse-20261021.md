# Rank-11 native attack-selector reversal: candidate conversion and opportunity-cost audit

**Agent 29 | 21 October 2026 | evidence: paired archived native Store development games, exact source registration, decision-level postgame samples.** This is a posthoc analysis of Agent 49's already completed three-condition test, **not** a new matchup sample, new simulator run, or deck-strength estimate.

## Immutable comparison evidence

[Off run 39533177714](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714), [ZIP artifact 12316311575](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714/artifacts/12316311575), SHA-256 `90c9bee9029ce1e1928cdd3b94bb7da571fc40481394b330f5d5565ee45d393c`.

[Public discrete-safe v2 run 39534968464](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464), [ZIP artifact 12316459092](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464/artifacts/12316459092), SHA-256 `21c143323b60f0e1056d3d05bf048cef80e1d5fa23668a8476e9c4a99798820b`.

Each archive contains `agent7-canonical-actor-fourarm.json`. The row examined is `trial.id=11:2:B:new-moon-lockbreaker-v1`, exact registered source rank 11, frozen New Moon Lockbreaker v1, seed **623585882**, candidate physical seat **1** and actual first player seat **1** (native ID **202**, verified by draw log). Both records match source-deal fingerprint `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5` and first source-own-hand hash `895885a2079ee2253592e244060f31b4f4beec67d0621ca45636785e1e17074f`.

Agent 49's [primary causal report](../twinleaf/agent49-public-discrete-attack-v2-native-20261021.md) establishes same-source first selected-root divergence on **global turn 30**: rank-11 source Mega Absol ex's first-payable, zero-effect `Terminal Period` becomes its payable **200-base-damage `Claw of Darkness`**. This follow-up independently parses the archived candidate attack settlements, live actor typed-root summaries, and actual post-choice Pass samples to identify what the candidate did as the turn sequence diverged.

## What the candidate actually converted

| Metric in the same registered development arm | Original selector off | Discrete-safe v2 |
| --- | ---: | ---: |
| Native action count | 260 | 184 |
| Native global turns | 51 | 36 |
| Outcome | Action-limit censor | Source seat 0 native terminal |
| Final remaining Prizes (source, candidate) | 6, 6 | 0, 6 |
| Candidate named attack declarations in settlement trace | 22 Future Sight, final one unsettled at cap | 11 Future Sight, all settled |
| Candidate resolved Prize progress | 0 | 0 |
| Candidate observed copied Perfection attack | 0 | 0 |
| Source first-turn Boost Shake/Garbodor pressure line completed | No | No |

**No positive candidate attacker conversion is evidenced in either arm.** The candidate in v2 kept an Active Duskull using `Future Sight` every other global turn from 9 through 29. `Future Sight` is a deck-order effect rather than a damage-based Prize line. Both arms retained all six candidate Prize cards; even before the source attack-selector divergence, the candidate never took a Prize.

In v2, the source's newly selected `Claw of Darkness` at turn 30 was followed at **turn 31** by candidate Mewtwo & Mew-GX Active with **zero attached Energy** and a native-accepted `PassTurnAction`; the actor root instead Benched one Unown and passed. The exact source of this Active promotion and turn-30 knockout should be checked from full Store effect transitions before attributing a specific Prize at turn 30. At **turn 33**, the same Mewtwo remained Active with **one Psychic Energy**, and the actor again passed. The same registered candidate's printed attack has not been demonstrated executable in those conditions.

The post-choice Perfection probes at native ordinals **154** (turn 31) and **164** (turn 33) both returned `CANNOT_USE_POWER`, `activationAccepted=false`, **zero available Bench/discard copy-source Pokémon**, and no available copied attacks. This is a *bounded native action-availability probe*, not a complete causal proof of paper Ability lock: no source Stage 1 Garbodor lock line completed, and the observer explicitly does not independently assess every Cost or continuous-effect modifier.

### Held route available for the next native decision experiment

On turn 31, owner-visible hand before Pass held `Battle Compressor PHF`, **two Field Blower GRI**, `Canceling Cologne ASR`, `Powerglass SFA`, `Adventure Bag LOT`, other Items and Bench Pokémon. The next turn-33 Pass observation still showed a held `Battle Compressor PHF`, two Blowers and Cologne. Perfection's actual accessible Bench and discard copy-source count was **zero** on both probes.

This is a **concrete held-action opportunity for investigation**. A legal Battle Compressor from hand could potentially establish a Perfection attack source by discarding a qualifying GX/EX Pokémon *if that printing remains in the actor-owned deck*, if the live turn allows the Item and its effect, and if subsequent Energy/Ability conditions are satisfied. The archived probes do **not** prove which GX/EX cards were still in the deck or their Prize location, nor that playing Compressor would win or even permit an immediate attack. No opponent-hand or hidden-deck data is needed for the next genuine decision policy: choose the Item from actor-owned hand based on public/owner-visible state, then resolve its real own-deck search through native prompted selection.

## Next integrated falsification

Within **Agent 44's existing canonical bilateral runner**, keep source rank11/New Moon full printed 60, seed and physical seat exact and compare one **single actor-information-safe root decision** at the first observed candidate turn-31 Pass: whether to propose the held Battle Compressor and then select a legal GX/EX donor using only authorized own-deck search. Require actual Store acceptance, exact Item discard targets, resulting copy-source zone, Perfection availability, attachment/attack settlement, and the following source turn. Preserve every rejection/censor. If donor/energy/ability conditions fail, publish those concrete reasons without promoting a speculative candidate resource route. This is a targeted diagnostic of a live candidate omission, **not** a prospective win-rate sample.

The source's selector correction itself should remain identical in both comparison branches; otherwise attack-policy changes and candidate-root changes are confounded. Maintain both actors' paper Supporter guard and actor-only information boundary, and audit native game epochs. No expansion of workflows or competing bilateral runner is requested.

**Project qualification unchanged:** exact official 60s **29/32** (ranks 23/25/28 unresolved), competitively qualified games **0**, final best 60 **unvalidated**, 99.5% **unproven**.

## Additional native effect channel: source Claw opponent-hand selections

The archived v2 `nativePromptChoices.events` also includes four **source-seat0** `ChooseCardsPrompt` replies whose `sourceZone='hand'` and `sourcePlayerSlot=1` identify the **candidate's** hand. All occur on source Claw turns after the first divergence. The attached research recorder reports exactly these selected card names:

| Global source turn | Actual native choice ordinal | Card selected from candidate hand |
| ---: | ---: | --- |
| 30 | 147 | Dusclops SFA |
| 32 | 159 | Solrock CES |
| 34 | 169 | Tapu Lele-GX GRI |
| 36 | 182 | Field Blower GRI |

This is a separate **decision and disruption axis** beyond the source's printed 200 damage. The exact hand identities were visible through the native resolving `ChooseCardsPrompt`; they were never granted to a pre-attack actor policy as hidden information. The candidate's turn-31 and turn-33 own-hand Pass snapshots corroborate absence of earlier selected cards, including Dusclops after turn30 and Solrock after turn32. These observations support the factual conclusion that Claw introduced **real prompted opponent-hand choices in the native game**. They do **not** show that the generic source policy chose the most consequential targets, or that the source would have drawn, established Garbodor, or attacked this way under a tournament-competent policy.

In any follow-up attack-prompt policy, preserve the correct information boundary: an opponent-hand choice is legal only **after** the native effect has revealed or exposed the selectable hand to the active player; a general before-attack decision should not inspect those card identities. The one-change source attack-policy treatment also changes future candidate resources through these prompted selections, so later win/loss and Pass states are no longer isolated damage-only effects.
