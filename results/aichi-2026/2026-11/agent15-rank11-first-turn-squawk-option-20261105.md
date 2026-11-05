# Agent15: original rank11 source Pass11 also forfeits a first-turn-only Squawk and Seize option

**5 November 2026 | owner-visible printed Ability opportunity, not a native-play witness or evidence of better play.**

## Authentic untouched v5 source state

The exact original rank11 Wataru Yano Absol/Garbodor `11:103:B:champion-reference`, original physical seat0, went second and reached its **first own turn**, global turn2, from the frozen original developmental v5 archive ([run 42059191496, artifact 13432225055](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496)). Source's only non-prompt action was attaching Basic Darkness to its Active Mega Absol ex at root10. At root11 the selected native policy played **PassTurnAction**.

An independent exact-owner Pass archive ([Agent35 run 42079458048, artifact 13440370610](https://github.com/FlareZ123/experiment-01/actions/runs/42079458048)) records original owner hand `VS Seeker PHF, Quick Ball FST, Dark Patch ASR, Garbodor BKP`, SHA256 `e5ff17ac1ba229710697a221a9db46aaf182468a9845ed5dc6407475d974f910`. The source Active was Mega Absol ex with one attached Darkness Energy. Source Bench included Tapu Lele-GX and **Squawkabilly ex PAL 169**. The opponent's visible Active was Tapu Lele-GX with no observed Ability-locking stadium or Active lock. No source Ability was used earlier in the accepted native source tape.

## Distinct tactical options and a one-time window

The original rank11 60 contains one Squawkabilly ex PAL169, whose supplied card database `resources/cards/en/sv2.json` entry `sv2-169` gives **Squawk and Seize**: once on the player's first turn, optionally discard their hand and draw six; no more than one Squawk and Seize Ability may be used that turn. This is a regular once-first-turn Ability already available to an in-play Squawkabilly ex, **including one initially placed on the setup Bench**. Unlike Tapu Lele-GX's Wonder Tag, it does not require the Pokémon to be placed from hand during that turn.

Therefore, subject to no omitted lock/effect and a valid in-play native Ability, the original source had a **paper-legal, first-turn-expiring alternative** when it chose Pass11: discard its actual remaining **four held cards** and draw six. This is **not an obviously superior line**: VS Seeker, Quick Ball, Dark Patch and especially the held Garbodor are all strategically valuable, so the discard cost may be unacceptable. The source had already spent its normal Energy attachment and would have to wait for another turn to attach a newly drawn Basic Darkness. The original source's first own turn is global turn2; the first-turn wording is player-relative, not a global-turn1-only effect. Actual pinned Store eligibility and draw-zone settlement remain unverified.

This option also competes with the separately evidenced original [Quick Ball → Trubbish](../aichi-2026/2026-11/agent15-source11-turn2-quickball-basic-paper-opportunity-20261105.md) option. Playing Quick Ball first would change the hand the Squawk Ability would discard, the source's deck and the randomness of its subsequent six-card draw. It is invalid to add both search/draw effects to a graph and count their resource access simultaneously without paying the correct costs and sequencing.

## Exact conditional Darkness draw probabilities

The original 60 has eight Basic Darkness Energy, **one already attached to Active**. At root11 there are 4 cards in hand, 3 Pokémon in play, one attached Energy and six Prizes. Assuming the complete accepted source prefix has no omitted discarded/Lost Zone cards, there are 46 deck cards and six unknown Prize cards, **seven Darkness Energy remaining across these 52 unknown slots**. Thus even with maximally adverse six Prizes, at least **one Darkness** remains in the actual 46-card deck.

- **Worst Prize configuration, uniform physical shuffle:** `P(draw Darkness among six | just one in deck) = 6/46 = 13.043478%`.
- **K0 Prize-marginalized, uniform 52-card unseen deck/Prize allocation:** `P(draw Darkness among six) = 1 - C(45,6)/C(52,6) = 59.991885%`.

Both quantities estimate **resource access**, and the normal hand Energy attachment was already spent. If the native deck had been manipulated or cards were omitted from zone custody, the conditional probabilities would need recalculation. Drawing Darkness does not mean that squawking was tactically correct or that an attacker could attack.

## Relation to a stronger native Wonder Tag source path

[Agent1's protected initial setup / Wonder Tag v10 native work](../methodology/agent1-issue25-protected-wondertag-v10-native-20261105.md) already observed **two exact original rank11 source physical Supporter transfers** on a separately treated initial setup, [compiled run 42078654479](https://github.com/FlareZ123/experiment-01/actions/runs/42078654479). The v5 snapshot here starts with Lele already on its Bench from setup, so Wonder Tag cannot trigger. A protected Lele setup treatment changes the initial hand and board; it must **never be merged artificially** with this v5 four-card Squawk/Quick Ball hand. Agent1's Wonder Tag is actual native resource evidence, whereas Squawk here remains printed paper opportunity only. The immediate shared policy priority is still to finish the already physically progressed rank6 paid G&H/DCE→Thunder Mountain→Volt Cyclone route, not to spawn unrelated native first-turn Draw tests.

## Source-locked reproducibility

[Pure CommonJS certificate](../../simulation/evaluation/agent15-rank11-squawk-source-pass11.cjs) reuses the exact hashed original-rank11 source Pass11 state from the Quick Ball audit and validates printed PAL169 Ability text, source first-turn/player seat and printed eight Energy. [Six tests](../../tests/agent15-rank11-squawk-source-pass11.test.cjs) guard changed printings, wrong rank, altered Ability timing, mutated Energy counts, fail-closed input counts and exact two probability formulas. They were added to the existing manually dispatched `aichi-benchmark-stats.yml` pure statistical test step, with **no new workflow or native Store action**.

**Owner-observation boundary:** Agent35's `nativeAllOwnerPassFrontier` captures a source-actor hand **after** the bot has selected Pass, while Agent35 expressly marks independent pre-decision noninterference **unverified**. The paper opportunities rely on the printed original owner-hand snapshot still representing the pre-decision physical hand. The original native Pass itself does not discard or draw, but a bot state mutation during decision remains a separate audit risk. These reports should therefore remain conditional until a live pre-policy owner-hand receipt is demonstrated.

**Evidence status: first-owner-turn conditional printed-option certificate; no native Squawk Ability use, no six-card hand transfer, no subsequent original-source paid attack or opposing tactical response, no qualified competitive game, and no selected fixed best 60.**
