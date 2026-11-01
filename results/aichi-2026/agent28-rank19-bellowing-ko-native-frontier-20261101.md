# Agent 28: source rank19 Raging Bolt printed knockout frontier, independently demonstrated on both pinned native seats

**1 November 2026.** Stage-level original card effect + actor-choice evidence, not an original physical-60 game and not a qualified win. This study identifies a **separate, technically accessible attack choice** missing from a four-game source policy archive.

## Why the original Raging Bolt policy is currently noncompetitive

The original Aichi **rank19 published 60**, stored in [`full-decklists.json`](full-decklists.json), contains **two `Raging Bolt ex TEF`**, a `Arceus & Dialga & Palkia GX CEC`, four `Double Dragon Energy ROS`, three Lightning, three Fighting, and three Darkness Basic Energy. The first printed Raging Bolt attack is `Burst Roar` (draw engine); the next is `Bellowing Thunder` (Lightning + Fighting, optional discard of any number of **Basic Energy cards from your Pokémon**, 70 damage per actual Basic Energy card). The generic owner-root chooser `chooseActorRootIntent` currently takes **the first payable printed attack**, except under separate narrow opt-ins. It can therefore choose Burst Roar while a payable Bellowing Thunder is already a raw one-attack Knock Out.

The independently archived retrospective rank19 original-60 source [Agent25 report](agent25-rank19-native-label-recovery-20261101.md) records four genuine same-seed original-source games with **zero Bellowing Thunder declarations**; native source attacks instead comprised `Motivate` from Ho-Oh EX, `Rainbow Burn` from Galarian Moltres V, and one no-attack source. This is a **competence audit** of that existing policy, not proof all four games reached an immediately payable Raging Bolt KO decision. **Conditional reachability is an open question**; improving attack selection alone will not help if Raging Bolt never becomes Active, powered, or reachable.

## One narrowly scoped public-information proposal

[`agent28-rank19-bellowing-ko-frontier.cjs`](../../simulation/twinleaf/agent28-rank19-bellowing-ko-frontier.cjs) evaluates an **already-cost-checked** `Raging Bolt ex TEF` public actor root. It offers Bellowing instead of the first printed Burst Roar **only when**:
1. its owner-public opponent Active has known positive remaining HP;
2. Bellowing is already in the common chooser's payable attack set;
3. every counted Basic Energy is physically attached to a face-up owner Active/Bench Pokémon;
4. `70 × attached Basic Energy *cards*` reaches the opponent Active's raw remaining HP.

Special Energy **units** cannot be counted as Basic Energy **cards** discarded. In particular, `Double Dragon Energy ROS` can fund attack costs while contributing **zero** to Bellowing's discard multiplier. The model is explicitly **raw potential**: Weakness, Resistance, damage prevention, defensive Abilities, opposing Tools, endgame/Prize choices, discard opportunity costs and future turns are not fully decided by this selector. It uses detached public board and owner-visible hand only. It does not use opponent hidden hand, deck, Prizes, seed, or later outcome.

This is currently a **standalone, default-off proposal**, **not installed into the shared canonical root policy**. Any actual integration must be symmetric for both seats and compare the same physical source/candidate deals against an independently registered fresh trial panel.

## Verified pinned native Store evidence

The [eight native and pure regressions](../../tests/agent28-rank19-bellowing-knockout-native.test.cjs) use original printed native `Raging Bolt ex TEF`, two **physically attached** Basic Energy (Lightning and Fighting), original `Store`, native `AttackAction`, actual `DiscardEnergyPrompt`, prompt decoding to real `{from,card}` transfers, native `ResolvePromptAction` and six physical Prize cards per player. On **both owner seats** in a staged 210-HP Shadow Rider V board already bearing 120 damage, existing actor chooser chooses **`Burst Roar`** while the independent Bellowing proposal projects **140 raw damage against 90 remaining HP**.

On **both physical seats** in separate undamaged 210-HP defender boards, announcing `Bellowing Thunder` through native `AttackAction`, choosing two actual attached Basic cards, and settling its real Energy-discard prompt:
- moves **both actual Basic Energy card objects** into the attacker's discard;
- leaves zero Energy attached to the attacking Pokémon;
- deals **140 actual native damage** to opponent Active;
- preserves the six-Prize no-KO state and does not enter a false synthetic sudden-death restart.

Other tests verify the proposal rejects unsuitable printings, unsupported payable lists and insufficient raw damage; it counts a Basic card on the Bench and rejects treating a Special Energy as Basic; and genuine native `Bellowing Thunder` allows choosing **zero** Basic Energy cards, producing **zero** damage with attached Energy preserved.

**Clean compiled manual CI** [41345850088](https://github.com/FlareZ123/experiment-01/actions/runs/41345850088), Git head `e18cecce3461138054052d31d614064c5a073ac6`, pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: **8/8 new regressions passed, alongside 8/8 earlier original rank31 Duskull paper-zone tests; entire existing manual job green.**

A separate earlier attempt under [broad source-print census run 41345615801](https://github.com/FlareZ123/experiment-01/actions/runs/41345615801) was blocked **before reaching these tests** by an unrelated pre-existing Agent40 BUS-position test failure (4/4). The test step was moved to an already passing manual native attack-effect workflow without changing or bypassing those existing BUS test failures.

## What remains before any candidate ranking

- Reproduce an original rank19 full physically dealt game that actually reaches a **native Bellowing-payable Raging Bolt Active** state, both source and candidate owner policies observed from the same information boundary.
- Compare `Burst Roar` versus Bellowing in the **same real native state and follow the resulting Prize/game pressure**, including the attacker losing some Energy and alternative future setup. Empty exposure is evidence of missing source board development, not proof the selector is ineffective.
- Correct native prompt policy if it never chooses the attack's actual Basic Energy discard even after `AttackAction` is selected. The test's explicit human-chosen native Energy transfers are not an autonomous bot.
- Register genuinely new full original-60 shuffled source/candidate trials before evaluating an opt-in integration. Report physical-60 conservation, correct source printing, legal/paper prompt handling, both seats, original root action and attack-energy choices, game endings and clock status. Never use prior rank19 four-game engine terminal wins to rank the candidates.

Current field remains **29/32 exact original opposing 60s and zero competitively qualified games; 99.5% unproven**.
