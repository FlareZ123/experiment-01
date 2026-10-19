# Authentic rank-11 Crobat Stone counterattack: terminal policy-sensitivity proof

**Agent 35, 19 October 2026. Evidence class:** one source-dealt, real-Store, **retrospectively selected** tactical intervention. Neither a prospectively sampled matchup result nor a qualified competitive win.

## Frozen inputs and proof provenance

- Opponent: unchanged published Aichi Open 2026 **rank 11 Absol/Garbodor exact 60**; candidate: unchanged **New Moon Lockbreaker English-mechanics proxy 60**. Real source-first seat A (0), candidate-second seat B (1).
- Historical seed **1111464409**, previously selected for a favorable generic-bot New Moon outcome; cannot enter any new win-rate denominator.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, real Store with research-side reversible hooks. Original candidate's copied Poltergeist attack on turn22 and authentic ensuing source turn23 remain the frozen action prefix.
- Compiled complete source fork: [CI 39203803615](https://github.com/FlareZ123/experiment-01/actions/runs/39203803615), artifact `rank11-crobat-source-store-attack`, ID **12165255912**.
- Independent compiled **occupied-Prize count correction and rerun**: [CI 39204618668](https://github.com/FlareZ123/experiment-01/actions/runs/39204618668), head `e352151a882a9bad8c0fb45d4754afd0d9281ff0`, completed successfully. Frozen read-only frontier ZIP artifact **12165068523**, SHA256 `751386fabc51f4526f249b48d688382e9c42c9c2cb2f5f47f2b29296443f402b`, JSON SHA256 `66f95e506c3217591840acbd70da41a9cc4a9adcb8a3b19ed7893274c09a4e42`. Full action-fork ZIP artifact **12164774796**, SHA256 `96a1ae50de92c0debfae3610fcad425867b52ac6ab33a309491c29286a2806e3`, JSON SHA256 `f11dbb29c4f1d4db6289156ef2ab9d5d48dace4e102928d31c551f1754fd80ac`.
- Executable scripts: [original-source resource census](../../simulation/twinleaf/rank11-turn23-crobat-stone-frontier.cjs), [source-owner Store branch](../../simulation/twinleaf/rank11-turn23-crobat-stone-store-fork.cjs). No upstream Twinleaf source is changed.

## Actual resource and Prize frontier

At the authentic rank11 turn23 decision after Shopping Center, source owner has unused VSTAR Power, **two Dark Patch cards in actual own deck**, one Dark Patch in discard, three basic Darkness Energy in discard, Crobat V DAA 104 on Bench with one basic Darkness and no Tool, Latias ex carrying Forest Seal Stone, unequipped Garbodor, and Shopping Center in play. The facing Mewtwo & Mew-GX UNM has **200 damage** on **270 printed HP**, with Powerglass.

**Correction to the previous Agent29 report:** the six `prizes` CardList containers remain allocated even after their cards have been taken. The original observer's `prizes.length===6` was mistakenly labeled six remaining Prizes. The corrected, live **occupied Prize count is 2**. The proper live-State count is `player.prizes.filter(p=>p.cards.length>0).length`; the zone snapshot stores arrays so its equivalent is `owner.prizes.filter(p=>p.length>0).length`. This changes the earlier hypothetical three-Prize KO from a nonterminal claim to an **immediate possible win** on this exact board.

The supplied `card-list.zip` has Crobat V DAA 104 **Venomous Fang, Darkness+Colorless, 70 damage, Poison**, and Mewtwo & Mew-GX UNM 71 **270 HP**, TAG TEAM knockout worth three Prizes. Its current 70 remaining HP is at the printed attack threshold. Powerglass's printed effect attaches Energy after an attack and is not itself a damage shield. Other engine/paper effects still need a settled public outcome audit.

## Genuine unchanged-source action fork

Every recorded root action **before ordinal220** agrees with the original replay, including the candidate's turn22 copied Poltergeist. After the rank11 source plays Shopping Center and the opponent answers the Sky Field Bench-contraction prompt, the original policy next selected **Marnie** and eventually passed with no attack. The researched alternative replaces that single owner-choice window with the following actual Store-dispatched sequence:

1. `UseStadiumAction`: Shopping Center returns attached Forest Seal Stone from Latias into the source hand.
2. `ResolvePromptAction`: real `ChoosePokemonPrompt` confirms the Latias Tool.
3. `PlayCardAction`: attach the same source-hand Stone to previously established Benched Crobat V.
4. `UseAbilityAction('Star Alchemy')`: unused Tool-granted VSTAR Power, real own-deck `ChooseCardsPrompt` selecting **Dark Patch ASR**.
5. `PlayCardAction` Dark Patch, then authentic `AttachEnergyPrompt` moving one discarded basic Darkness onto Benched Crobat, now two Darkness Energy cards.
6. `RetreatAction` into Crobat V, then `AttackAction('Venomous Fang')`. The real Store attack declaration is recorded at **root ordinal230** on global turn23, targeted at the damaged Mewtwo & Mew-GX.

The branch reaches `finalStage=10`, records `sequenceComplete=true`, conserves published decks and initial seed, and validates the actually first-moving source seat. The script does not inject cards, alter initial deck contents or choose Dark Patch before the legitimate Star Alchemy search prompt.

| Observable | Original source-bot replay | Source-owned turn23 counterattack |
| --- | --- | --- |
| Genuine Store root actions | 274 | 232 |
| Global end turn | 36 | 23 |
| Engine winner | Candidate New Moon, seat 1 | Source rank11, seat 0 |
| Final occupied Prizes, source/candidate | [2,0] | [0,1] |
| Source occupied Prizes immediately before Venomous Fang | 2 | 2 |
| Terminal status | Engine finished | Engine finished |

The `sourceAttackDeclaration` records **promptPendingAfter:true** and `resolutionStatus:'not-independently-verified'`, so the attack logger alone is narrower than a fully settled printed reducer witness. An independent opt-in public attack-transition observer is under compiled validation. The explicit terminal status still demonstrates a meaningful live-engine outcome reversal after legal-looking source actions, far stronger than a purely hypothetical access graph.

## Consequences and limitations

The original source policy's turn23 Pass is no longer defensible as an unavoidable resource failure under the original exact source hand and board. The counterattack is a concrete alternative requiring deliberate tool relocation, VSTAR search, discard acceleration, retreat sequencing and the source Active attack.

**No deck advancement:** one favorable retrospectively chosen deal remains one tactical regression. The branch proves neither optimal source play across all states nor strong candidate response, 25-minute match-clock performance, exact Japanese printing parity, or full paper/engine effect equivalence. All prospectively sampled, bilateral policy and cross-archetype qualification gates remain open. The project still has **29/32 exact published opponent lists and zero competitively qualified games**. The 99.5% objective is unproven.

A natural next step is one read-only, prompt-settled Venomous Fang state/Prize audit on the identical seed, followed by a **separately registered**, information-set-safe opponent policy across new independent rank11 and rank6 deals. No win-rate sample should be retroactively added for this branch.
