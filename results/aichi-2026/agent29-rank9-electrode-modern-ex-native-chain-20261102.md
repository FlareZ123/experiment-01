# Rank-9 original Electrode-GX to modern Mega Absol ex: positive recipient and attack-chain study

**Agent 29, 2 November 2026. Evidence classification: original printed-card census, exact combinatorics, and staged native Store actions. Zero competitive game outcomes.**

## Decision-relevant question

The published rank-9 Shun Ito original Aichi 60 contains **one Voltorb ROS 21**, **two Electrode-GX CES 48**, **one Mega Absol ex MEG 86** and just **seven Energy**: four Prism Energy ASC, two Basic Darkness and one Telepathic Psychic Energy. Electrode-GX's printed Extra Energy Bomb attaches five discarded Energy cards to owned Pokémon *except Pokémon-GX or Pokémon-EX* before self-Knocking Out. Modern lowercase **Pokémon ex** is a distinct rule-box category. The pinned engine gives Mega Absol ex the `POKEMON_ex` tag, while Extra Energy Bomb's blocked target list includes only `POKEMON_GX` and old `POKEMON_EX`.

This makes a potential same-turn original-rank-9 acceleration route, where a real five-card physical discarded Energy packet can go to **Basic Mega Absol ex**, which can use `Claw of Darkness` for 200 attack damage plus an opponent hand discard. The opponent still takes two Prizes for Electrode-GX, so the trade's strategic merit remains conditional. A printed, legally available line can still be unrealistically difficult to assemble or inferior to another line.

This **positive eligible recipient** complements [Agent45's proven forbidden old-GX native target and paper correction](agent45-electrode-bomb-forbidden-gx-native-two-seat-20261102.md). It does not weaken Agent45's negative result. The upstream native Store incorrectly accepts transfers to old GX/EX; its corrected opt-in hook disallows those targets while preserving a legal modern ex destination.

## Pin and independently replayable fixture

- Original printed input: [authenticated rank-9 row](full-decklists.json), one unchanged original 60.
- Engine pin: `vendor/twinleaf` submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The engine's actual `MegaAbsolex` class advertises `set=MEG` and `setNumber=86`, but its internal `fullName` is `Mega Absol ex M1L`. The test deliberately checks its actual set and number after native lookup, avoiding a silent same-name proxy.
- Source-representative staged physical packet: four `Prism Energy ASC` plus one Basic Darkness Energy in discard, owner's Active Mega Absol ex, Benched Voltorb/Electrode-GX, Benched Unown, and full six-Prize opponent. Each of those cards is a genuine original rank-9 printed identity (the Basic Darkness fixture uses the simulator's SVE equivalent).
- [Runnable two-seat native test](../../tests/agent29-rank9-electrode-modern-ex-native.test.cjs), alongside Agent45's original native negative controls in the **existing** [manually dispatched CES48 workflow](../../.github/workflows/agent45-electrode-bomb-native-store.yml).

**Native positive result:** [compiled CI 41486251849](https://github.com/FlareZ123/experiment-01/actions/runs/41486251849) succeeded. In both physical owner seats, unmodified CES48 Store and the separately installed paper correction each accepted **all five actual discarded Energy cards** to modern Mega Absol ex. The native printed `blockedTo` did not include Mega Absol ex. The cards genuinely left the owner discard and became attached to Active Mega Absol ex, then Electrode-GX self-Knocked Out. **4/4 staged positive cases passed**. These tests establish an eligible target and native physical attachment, not source-policy activation in a natural game.

**Extended attack-chain development:** [CI 41486856326](https://github.com/FlareZ123/experiment-01/actions/runs/41486856326) failed four extension tests with `ACTION_IN_PROGRESS`, because the staged self-KO's opponent Prize-choice prompt had not been settled before declaring a same-turn attack. The test was repaired to resolve that native opponent Prize selection and verify the opponent moves from six to four Prizes. [CI 41487378003](https://github.com/FlareZ123/experiment-01/actions/runs/41487378003) then failed on an incorrect survival-based damage assertion against a 320-HP Shadow Rider Calyrex VMAX, a Darkness-weak target, while still reaching the requested attack-hand-discard prompt. A further fixture change uses the original rank-10 220-HP Regidrago V as a neutral-Weakness surviving target. These intermediate red runs are retained and cannot be counted as settled attack proofs. **Complete native payoff now established.** [Compiled CI 41488522008](https://github.com/FlareZ123/experiment-01/actions/runs/41488522008), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, **12/12 tests passed** including Agent45's eight older controls. Each of our four positive native arms (two physical seats, baseline and corrected hook) settled the opponent's `ChoosePrizePrompt` to **four remaining Prizes** for the Electrode-GX self-KO, then genuinely declared Mega Absol ex's **Claw of Darkness** with five source-representative physical Energy attached. The engine's separate `ChooseCardsPrompt` removed one actual opponent-hand card. Following its required *later* attack-animation `WaitPrompt`, the originally rank-10 printed **Regidrago V SIT 220 HP** had **exactly 200 damage counters**, surviving with 20 HP. The opponent-hand Fog Crystal CRE in this staged test is a deliberately synthetic one-card hand setup, not a claim about any natural rank-10 deal. All four positive arms logged `selectionCount:5`, `activeEnergyCount:5`, `opponentPrizesAfterBomb:4`, `damage:200`, and `opponentCardsDiscarded:1`.

**Native continuation lesson:** the card-specific discard `ChooseCardsPrompt` can settle while the attack's damage is still pending. The pinned `useAttack` generator yields an additional attack animation `WaitPrompt` and only then applies its base damage. Reading a board after card-prompt completion would falsely label this successful attack as zero damage. The two red development CI results and unverified earlier assertions remain archived for diagnostic provenance.

## Exact original-rank-9 initial Prize exposure

The original 60 has 11 printed Basics, including one Voltorb and one Mega Absol ex. Partition the source into six disjoint groups: one Voltorb, one Mega Absol ex, two Electrode-GX, seven Energy, nine other Basics and forty other non-Basics. Enumerate all six-Prize combinations, weighted by the number of valid starting seven-card hands remaining in the deck after the six Prizes. The necessary resource event is:

- Voltorb not Prized, Mega Absol ex not Prized;
- at least one of the two Electrode-GX not Prized;
- at least five of seven original Energy cards not Prized.

The **exact Basic-valid conditional probability** of that necessary original physical availability is

`55714362486839 / 70349762271360 = 79.19623419896161%`.

The independent valid-first-seven probability is `1137524 / 1462905 = 77.75788585041408%`. The [source-bound exact BigInt enumerator](../../scripts/agent29-rank9-electrode-mega-prize-window.cjs) and [three pure assertions](../../tests/agent29-rank9-electrode-mega-prize-window.test.cjs) preserve the six-Prize weighting and conservation checks. The result was independently recomputed with Python's exact `fractions.Fraction` and `math.comb`. No pure-test CI has yet been certified.

**Important interpretation:** 79.196% describes only physically unprized prerequisites without any Prize retrieval. The original list includes Hisuian Heavy Ball and other connectors. The figure excludes getting five Energy into discard, evolving Voltorb in time, finding and activating Electrode-GX, paying the correct Energy symbols, surviving the two-Prize self-KO trade, opponent play, official clock, and all later attacks. This must never be interpreted as an attack conversion probability or a win rate.

## Integration request

The missing decision-changing evidence is a **prospectively registered natural original-rank-9 source state** with owner-visible access to this complete discarded-Energy / evolved-Electrode / Mega Absol ex line, followed by a *selected* legal native Ability payment, resolved two-Prize self-KO, actual attack and opponent continuation under the common two-seat policy. Audit optional corrections as actually installed; do not infer their presence from isolated successful tests. Compare competing source uses of the Energy packet, especially against the source's other attack plans, rather than merely maximizing use-Ability roots.

Until that work, the Aichi field status remains **29 authenticated original sixties, 0 competitively qualified games, no nominated winning deck and no demonstrated 99.5% win rate**.
