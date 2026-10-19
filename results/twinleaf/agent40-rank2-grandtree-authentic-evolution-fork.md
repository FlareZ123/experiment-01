# Authentic rank-2 Grand Tree evolution branch after Gladion: source-locked Store result

**Agent 40, 19 October 2026. Evidence class: retrospective original-deal, actual-engine prompt-controlled policy counterfactual.** This is a reproducible tactical regression and an exposed generic-bot decision-quality defect. It is excluded from every prospective sample and every competitive win-rate denominator.

## Exact question and evidence chain

The published Aichi runner-up rank-2 Vileplume control original 60, physical seat B (1), played a real Gladion CIN at global turn 5 against the unchanged published champion rank-1 Shadow Rider original 60, physical seat A (0). Fixed seed `20261024`; both original source cards 60/60; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source research policy `expanded-source-k0-stage-gh-v2`. The entire original 285-root action ledger SHA-256 was `0a4ff8e373a47d71a70699ace31ad409485850ad503f7949c1b26b4b73b39b40`.

The original, independently observed Gladion prompt showed a previously established, unused `Grand Tree SCR` Stadium, a Benched `Lillipup CEC` whose `playedThisTurn:false`, and original printed 60-card source counts of 2 Herdier SUM + 1 Stoutland BCR. One Herdier was among the actually revealed Prizes; neither the other Herdier nor Stoutland was in the owner's visible hand, public board, discard, Lost Zone, or revealed Prizes. The unprized cards were therefore inferred as searchable in the deck subject to correct source mapping. The prior source owner had already spent Gladion as its Supporter. [Agent24's third read-only source audit](https://github.com/FlareZ123/experiment-01/actions/runs/39313268416) artifact 12216957905 confirmed eligibility with no owner-visible or source-ledger perturbation. Its complete context was subsequently inspected independently by Agent40.

The generic source bot selected Relicanth TEF at actual Gladion `ChoosePrizePrompt` ordinal **47**, then put Relicanth onto the Bench. There had been no Grand Tree use during global turn5. The [pinned Grand Tree reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-stellar-crown/grand-tree.ts) allows one eligible Basic to evolve through an actual owner-deck Stage1 search and optionally Stage2 search. It does not permit a Basic newly played that turn.

## Frozen counterfactual and compiled evidence

The [research-owned reversible replay](../../simulation/twinleaf/agent40-rank2-grandtree-root-fork.cjs) executed the same complete original-source match twice, with identical seed, deck prints, headless flags, and Expanded source policy. The alternative let the original bot determine all choices **through and including Gladion Prize choice47**, then, at the next source-owned turn5 action, submitted `UseStadiumAction`. It selected real Benched Lillipup through the genuine Store `ChoosePokemonPrompt`, followed by a genuine owner-deck `ChooseCardsPrompt` for printed Herdier SUM and another for Stoutland BCR. The special target code only reads own deck-card objects during a matching live prompted search. It never peeks ahead to determine whether to spend Gladion, invoke the Stadium, or claim the option before owner-search information becomes available.

Assertions fail closed on any original-prefix mismatch, wrong source seat/starter, changed original-deck SHA, invalid prompt, missing legal Stage evolution, absent full Stoutland stack, or no subsequent authentic opponent root.

**Compiled run [39324885655](https://github.com/FlareZ123/experiment-01/actions/runs/39324885655) succeeded**, research head `377eac7e57f439cc6d05699390452c078666045c` and the pinned Twinleaf revision. Archive [12220878525](https://github.com/FlareZ123/experiment-01/actions/runs/39324885655/artifacts/12220878525) ZIP SHA-256 `ead22443122dabbd79cf526630c7542109b883053757f974d81ba5d9d944a25e`, inner JSON SHA-256 `328bee922fbfd323498bfd2d204370e708c461122747622c737d6bee39b6060c`. Three focused owner-search unit assertions, entire earlier pinned technical-machine/manual workflow and Store game passed.

- All **47 original pre-fork root Store actions** were identical. Their independent prefix digest was `46e3bde22657c937978c24da9cb2b4a9eaae6d64e98afb6bcf2a6f953626d86c`.
- The real Store prompt sequence was `original-gladion-choice → use-grand-tree → choose-lillipup → search-herdier → search-stoutland → post-effect-board`, all at global turn5. The resulting actual Benched stack was **Lillipup CEC / Herdier SUM / Stoutland BCR**, with `Fan Rotom SCR` still Active.
- Original continuation reached a true opposing `PlayCardAction` at ordinal **58** on turn6 (Psychic Energy). Alternative continuation reached true opposing `PlayCardAction` at ordinal **64** on turn6 (Psychic Energy).
- Original generic-bot, untimed engine reported **rank1 winner** after 285 root actions, final unclaimed Prizes physical seats `[0,5]`. Alternative generic-bot, untimed engine reported **rank2 winner** after 257 roots, Prizes `[6,0]`.

This is a genuine **single retrospectively selected policy-sensitive game-engine result**, and confirms that an original-source player had a mechanically available, previously unused Stage2 Stadium action. **The winner reversal does not establish causal gain from Stoutland's Active-only Sentinel Ability.** Immediately after the Stadium evolution, Stoutland was **on the Bench**, so its printed Supporter lock was not yet active. The Stadium search shuffles the owner's deck, and the weaker subsequent decision policies may choose different actions under changed board scores and random-state trajectories. Later engine wins and source pressure are not validated human performance.

## Required follow-up

1. Preserve this as a paper-legality/consequential-decision positive-control fixture, excluded from independent-seed denominators.
2. If testing `Stoutland BCR` **Sentinel**, independently dispatch a genuine legal Retreat or Switch from Fan Rotom into established Stoutland, verify it becomes Active and the opponent's Supporter options respond to the Active lock. Fan Rotom had attached `Jet Energy PAL`; available Retreat, attached-Energy payment and opponent ability interactions still require actual Store checks.
3. For causal inference compare matched physical initial deal with explicit post-fork randomization policy and independently competent adversarial continuation. A retained entire original source prefix alone does not identify why the terminal winner changed.
4. The canonical Agent41 bilateral reference-versus-New-Moon rank6/rank11 comparison remains the central candidate-discriminating study. This source-side rank2 diagnosis cannot replace it or qualify any competitive match.

**Field coverage still 29/32 exact 60s (ranks 23,25,28 missing), competitive-qualified games 0, target-qualified final 60 absent.** The 99.5% aspiration is unproven.


## Genuine paid Retreat to Active Sentinel: second controlled source fork

An additional opt-in `promoteStoutland:true` option extends the same original prefix and the already-verified owner-deck Stage2 Stadium line with a real `RetreatAction` targeting the newly evolved Stoutland on the same global turn5. The source's Active Fan Rotom had one attached **Jet Energy PAL** (one Colorless provided against Fan Rotom's printed one-Energy Retreat Cost), `retreatedTurn` did not equal the current turn, and Stoutland had become a legal Benched target. The option uses the existing pinned game's own Retreat reducer rather than directly changing Pokémon positions.

[Manual CI 39325625743](https://github.com/FlareZ123/experiment-01/actions/runs/39325625743) **succeeded** at head `e89d03d87d547225ac9cea95865ea9780fb898d3` and same pinned engine. [Archived complete packet 12222775157](https://github.com/FlareZ123/experiment-01/actions/runs/39325625743/artifacts/12222775157), ZIP SHA-256 `89fd242fc159fb61596482c60bbc9c96fccffc0e0fe5290f63ee644554e80527`, JSON SHA-256 `f08f3307e2aac476c589ab94a06dcb38b5d570fefcedb0852e3f68759ad45b70`.

- Verified **same original prefix through ordinal47**, identical original root digest and source deck hashes.
- Printed Stage2 stack Lillipup/Herdier/Stoutland was independently validated, then the genuine root retreat requested Bench index0, with source Active **Fan Rotom SCR** and attached **Jet Energy PAL**. The next real source decision showed **Stoutland BCR Active** and Fan Rotom returned to the Bench, on global turn5.
- Source opponent's next genuine action was ordinal64 on global turn6, `PlayCardAction` Psychic Energy. The branch was **action-capped at 300**, `finished:false`, `winner:null`, final remaining Prizes seats `[2,6]`. Its root ledger SHA-256 was `0de44fecc3ec34fdfbab8982b8b5a4c76031c66b05b4b96071c7ec8b6d02bed8`.
- Stoutland BCR's printed **Sentinel** prohibits the opponent from playing Supporters from hand while Stoutland is Active (see [printed card description](https://www.serebii.net/card/boundariescrossed/122.shtml) and the [pinned reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/06-black-and-white/set-boundaries-crossed/stoutland.ts)). This branch proves an actual source-dealt Active position, **without yet proving an actual opponent had a Supporter play rejected, or that any lock persisted or was used competently across the complete follow-up**.

**Critical causal distinction:** The earlier Stage2-Bench branch terminated in a rank2 engine win under the generic bot, while the now Active-Stoutland branch **did not terminate before the action cap**. Selecting among those engine outcomes would bias any field estimate. The common prefix verifies legality and reachability; observed divergent downstream states remain confounded by game-state and RNG differences, weak generic policies and absent tournament clock.

Immediate narrow follow-up: read-only capture of Active Stoutland at the first actual opposing decision, plus an independently cloned original-source opponent-hand Supporter legality probe or natural root rejection if one occurs. No crossfield wins or optimizations are supported until a frozen, robust two-sided policy is evaluated on fresh balanced physical deals.

