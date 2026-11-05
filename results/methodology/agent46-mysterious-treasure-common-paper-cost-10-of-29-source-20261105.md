# Mysterious Treasure original FLI payment in the shared paper contract: verified two-seat native physical cost and owner search

**Agent 46 | 5 November 2026 | paper Expanded native research | 0 competitively qualified games**

## Original-field relevance and printed contract

The original authenticated Aichi 2026 [source name/count decklists](../aichi-2026/full-decklists.json) contain **37 copies of Mysterious Treasure FLI 113 in 10 of 29 known original 60s**. The pinned upstream [Mysterious Treasure implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-forbidden-light/mysterious-treasure.ts) requires discarding exactly one other card from your hand to search for a Psychic or Dragon Pokémon. The physical discard is the price for accessing an **optional** separate own-deck search and is therefore a strategically state-dependent constraint; a card being theoretically searchable does not make a payment necessarily wise.

The genuine pinned `Store.prompt` [source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) itself stamps `sourceCard` on the prompts from `this.resolvingTrainer`. Consequently a Treasure payment prompt can be recognized with the authentic `prompt.sourceCard.fullName==='Mysterious Treasure FLI'` **and** `prompt.message==='CHOOSE_CARD_TO_DISCARD'`; the separate later `CHOOSE_CARD_TO_HAND` own-deck search stays outside this mandatory cost contract. No prompt source label is guessed or fabricated.

## Shared implementation

In [Agent41's common Store paper portfolio](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) v14 `agent41-unified-paper-prompt-contract-portfolio-v14-treasure-one-discard`, the new independent `independentMysteriousTreasurePaymentNegative(prompt,answer,owner)` establishes only source-specific printed **negative** constraints:

- Authentic held FLI `PlayCardAction` needs another physical card in the acting owner's hand before native dispatch. If absent, veto `PAPER_ROOT_INVALID:MYSTERIOUS_TREASURE_REQUIRES_ANOTHER_CARD`.
- An actual native FLI source-stamped `ChooseCardsPrompt` with mandatory discard message needs **exactly one** physically offered, currently own-hand card; selecting the played Item itself cannot pay its cost. The existing generic physical-source validator may reject some answers first, so source-specific counters measure only cases that reach them.
- Native acceptance of a one-card answer still reads `PAPER_PROMPT_UNVERIFIED`. It does not certify the subsequent item cleanup, actual full printed opponent effects, strategic opportunity cost, or any complete paper-legal game. The later optional deck search is intentionally distinct.
- All v13 original source Quick Ball FST/SSH, earlier Roxie, Spoons, Ultra Ball and Secret Box clauses remain in place.

[Eight pure adversarial regression tests](../../tests/agent46-mysterious-treasure-common-paper-portfolio.test.cjs) validate insufficient-root veto before mutation, exact-one physical hand choice, foreign card, optional search noninterference, unverified positive, and original printing separation. The [two-seat genuine native probe](../../simulation/twinleaf/agent46-mysterious-treasure-unified-native.cjs) wraps Agent49's previously working [actual real Store owner-first Treasure native source probe](../../simulation/twinleaf/agent49-mysterious-treasure-native-probe.cjs). It tests actual paper-payable owner-card discard followed by native own-deck selection of Regidrago V. Both tested physical seats remain prepared **staged board states**, never natural source-dealt full games. No vendor source or selected policy was edited.

## Verified compiled output and important cleanup uncertainty

**[GitHub Actions 42113569751](https://github.com/FlareZ123/experiment-01/actions/runs/42113569751) SUCCEEDED**. The existing opt-in full native Electro Rain workflow compiled the pinned Twinleaf revision, passed **8/8 new Treasure pure tests**, **7/7 prior Quick Ball pure tests**, both-seat actual Quick Ball native, both-seat actual Mysterious Treasure physical-payment-plus-search, and the pre-existing Roxie/Spoons/other workflow stages. Tests assert that the genuine Treasure Item root exists, printed cost is paid by a different actual owner-hand card, the deck target reaches physical own hand, and no shared source-stamped paper veto misclassifies the positive payment. **Zero paper-verified game completions**.

An earlier attempt [CI 42111925953](https://github.com/FlareZ123/experiment-01/actions/runs/42111925953) had **all pure tests green** but its two-seat native stage failed because the probe originally asserted `row.nativeEffect.itemDiscarded===true`. The real pinned probe returned **false** at its sampled endpoint, despite having paid the actual cost and moved the search target to hand. The native engine's [play-trainer-effect reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) may hold the Item in a temporary `supporter` play zone until queued post-prompt cleanup. The item-location proof had not been captured. I replaced this unobserved assumption with explicit `itemPhysicallyInDiscardAtProbeEnd` and `itemCleanupPaperCertified:false`, preserving the true negative and treating Item cleanup as unresolved rather than claiming a fully paper-legal Item resolution.

An additional [read-only genuine native physical Item zone observer](../../simulation/twinleaf/agent46-treasure-cleanup-native-observer.cjs) was added to record whether the same object appears in hand, play zone, discard, Lost Zone or deck at each real accepted Store root in both seats, without altering decisions. Its separate compiled workflow verification must be reported before inferring whether the absence of discarded Item is transient or persistent. Code from Agent49 is reused rather than changed.

## Limitations and next decisions

The source mandatory payment can now be independently screened in a shared policy-level paper contract and has passed genuine staged native tests. The observed anomaly in printed Item cleanup is potentially broader engine fidelity work, but until the physical zone observer settles it, **do not claim the complete Item effect is paper-valid**.

No implication for deck strength or full original-source matches is established: still **29/32** authenticated opposing 60s (ranks23/25/28 missing), **zero competitively qualified games**, **no fixed best 60**, and no 99.5% win-rate evidence. The tactical research priority remains a playable, same-deal opponent/source attack/control payoff with meaningful return and full continuation, especially after original Iron Thorns first-turn DCE-to-Bench migration.

## Subsequent genuine physical-zone observation (21:38 UTC)

The no-policy-modification, two-seat [native zone observer](../../simulation/twinleaf/agent46-treasure-cleanup-native-observer.cjs) **passed** in [GitHub Actions 42114145538](https://github.com/FlareZ123/experiment-01/actions/runs/42114145538) after actual pinned compilation and all paper tests. It tracked the *same actual physical Item object* through three native accepted actions for each source seat:

| Genuine Store event, both seats | Original Item in hand? | In temporary Supporter/Trainer play zone? | In discard? | Unresolved native prompts |
|---|---|---|---|---|
| Before source FLI `PlayCardAction` | yes | no | no | 0 |
| After accepted source Item root | no | **yes** | no | 1 |
| After accepted mandatory payment `ResolvePromptAction` | no | **yes** | no | 1 |
| After accepted owner-deck selection `ResolvePromptAction` | no | **yes** | no | **2** |

The zone sequence is **identical in both physical source seats**. The native paid Energy is physically in the discard pile and the searched Regidrago V is in owner hand, but the sampled effect has **two outstanding prompts** and a still-temporary played Item. The previous `itemDiscarded=false` was therefore observed **before complete prompt closure** and must not be described as a proven persistent Item cleanup bug. The pinned engine's delayed `waitPrompt` cleanup is a plausible explanation; whether the Item reaches its proper discard pile after resolving *all remaining prompts* remains untested.

A second observer run with only additional **read-only pending prompt class metadata** is queued separately; it should identify what prevents cleanup, without deciding or resolving prompts for the player. All full-game, owner competence and paper-payment completeness gates remain unchanged.
