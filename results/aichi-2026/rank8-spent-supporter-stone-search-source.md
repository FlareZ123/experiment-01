# Rank 8 Forest Seal Stone search: spent-Supporter scoring changes a live decision

**Agent 31, 19 October 2026. Evidence class: one retrospectively selected, actual pinned-Store policy counterfactual; no competitive-strength inference.** This reports a genuine root-card selection difference under a narrow search-policy change. It is separate from Agent 41's prospective equal-policy bilateral v2 integration.

## Falsifiable defect hypothesis

The pinned Twinleaf `ChooseCardsPromptResolver` ranks legal selections with `StateScore.getCardScore`. In `HandScore`, a Supporter adds the fixed `hasSupporter` bonus of **5** whenever the existing hand has no Supporter, even if `player.supporterTurn > 0` records that the normal one-Supporter-per-turn action has already been consumed. A search after an Arven can therefore favor an unplayable-this-turn Supporter over an otherwise higher-scored card. Keeping a Supporter for a later turn may still be best; removing the immediate-turn bonus is only a one-ply heuristic correction.

Upstream pinned sources, inspected at commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts`: sorts own-deck search choices by marginal `getCardScore`.
- `ptcg-server/src/simple-bot/state-score/hand-score.ts`: additive first-Supporter bonus without spent-turn gating.
- `ptcg-server/src/simple-bot/simple-bot-definitions.ts`: default `hasSupporter: 5`, `itemScore: 2`, `cardScore: 1`, `hasEnergy: 5`.
- `ptcg-server/src/game/store/reducers/setup-reducer.ts`: assigns unique physical card IDs from `state.cardNames`. Duplicate-physical-ID inference is specifically rejected.

The attached Advanced Player's Rulebook section B-03 permits only one ordinary Supporter per turn. The human-developed [Supporter contention and connector domination hypotheses](../../resources/human_concepts.md) motivate this test but are not treated as authority.

## Frozen historical pair

The replay uses exactly the archived [rank-8 Tool-Power study](rank8-stone-acerola-unused-search.md): source rank-8 published Absol/Garbodor 60 in physical A, Hood Shield v1 60 in physical B, genuine A-first/B-second start, fixed seed **1260748957**, max **800** root actions, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both arms retain identical deck printings, original general bot, Tool-Power enumeration, rules/compatibility flags and randomness settings. The changed arm adds only the candidate-B owner search adapter `simulation/twinleaf/spent-supporter-search-policy.cjs`; no opponent-specific exception or proposed deck swap.

The opt-in adapter reranks only unrestricted, one-card, noncancellable searches of the acting candidate's own deck when the turn's Supporter was spent and the current hand has no Supporter. It removes precisely the generic first-Supporter bonus from each Supporter candidate score. It leaves the full legal card inventory and tie ordering intact, and restores the pinned resolver method in `finally`. It does not force a particular card. The generic bot's other choices remain unqualified.

## Genuine pinned replay observation

[Manual compiled CI 39270873233](https://github.com/FlareZ123/experiment-01/actions/runs/39270873233) **passed**, on research head `7c1c4018a54e4c99b7c91edcb3863626ff6882d0`; all replay and existing Hood mechanical checks were successful. The archived [full JSON artifact 12195671923](https://github.com/FlareZ123/experiment-01/actions/runs/39270873233/artifacts/12195671923) has artifact ZIP SHA-256 `1830456410f8410e66ee14b17b7c0eaeda54df884226270d90f2f8873a33ce22`, retained 14 days. The direct test and replay sources are [here](../../simulation/twinleaf/rank8-spent-supporter-stone-source.cjs) and [here](../../tests/spent-supporter-search-policy.test.cjs).

| Observed channel | Original native ranking | Candidate-only corrected ranking |
| --- | --- | --- |
| Actual candidate Star Alchemy root | Ordinal 172, global turn 16 | Same ordinal 172, global turn 16 |
| Actual following owner-deck selection root | Ordinal 174, `Acerola BUS` | Ordinal 174, `Psychic Energy MEE` |
| Root action count at engine terminal | 221 | 234 |
| Untimed engine final Prize counts, physical A/B | [6,0] | [6,0] |
| Retrospective accepted game win samples | **0** | **0** |

The recorded **real Store root** selection changes from Acerola to Psychic Energy. Both arms retain the same untimed engine terminal Prize counts. It is therefore a verified behavioral intervention, without demonstrated terminal-outcome improvement.

The candidate algorithm emitted six ranking-audit events on global turn 16, with native candidate counts `9,9,18,18,7,7`. Two events at the 18-card menu switch the highest ranked card from Acerola to Psychic. **Those six proposals must not be counted as six real deck searches or six independent counterfactual opportunities**: the scoring hook has no independent live-root attribution, and speculative/resolution traces can be conflated. The real `decisionTrace` supplies the substantive selected-card evidence. Its first differing *decision-signature index* is **84**; that index is not a Store action ordinal or separate sample. A second later deck selection within twelve roots in the corrected arm is only temporally adjacent, so the report never attributes it to the single Star Alchemy activation.

The native arm reproduces the prior archived fact that Acerola was selected after Arven, remained unplayed, and disappeared from hand after a later opposing Roxanne. The corrected Energy selection does **not** establish that it could be attached immediately: the ordinary Energy attachment was already consumed on turn 16. Energy may still matter for subsequent turns and Underworld Door, but those claims require action-specific verification. Conversely, a future-use Acerola might have been strategically sound under another reply. The visible equal engine outcome cannot rank the broader policies.

## Status, tests and handoff

The six pure functional tests passed in [manual statistical CI 39270045303](https://github.com/FlareZ123/experiment-01/actions/runs/39270045303). Two additional source-chronology tests passed in compiled CI 39270873233. A separate constructed [pinned real-card scoring regression](../../tests/spent-supporter-search-pinned.test.cjs) was added after that first compiled replay and requires its own compiled CI verification. This source test does not modify the pinned vendor submodule and runs under manual-only CI.

**Next evidence gate:** maintain this adapter as an experimental scoring correction, independent of Agent41's already frozen common v0 profile. If incorporated into a future bilateral policy, freeze a new policy hash, apply the *same algorithm* to both 60s, and preserve every prospectively registered rank6/rank11 true-start arm in the unconditional paired census. Independently audit source pressure, candidate reply, copied attacks and opponent continuation. The broad bot remains hidden-information unsafe and tournament-time uncalibrated; there is still no qualified fixed 60 or validated 99.5% win rate. Exact public benchmark coverage remains **29/32**.
