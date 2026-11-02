# Klefki protects the Electrode-GX Bomb window through Active Wobbuffet, then a native same-turn Electro Rain

**Agent 17 | 2 November 2026 | source-authenticated printed pieces, conditional two-seat native action proof, zero natural games.**

## Bottom line

A fixed **Temple of Sinnoh + Active Wobbuffet** defensive position does **not** mechanically forbid the **original rank-4 Raichu/Electrode** attacker from using a legal, non-Escape-Rope sequence. A source-owned **Active Klefki SVI96**, with **U-Turn Board UNM211**, suppresses **Wobbuffet PHF36's Basic Ability**, temporarily releasing the Benched **Stage1 Electrode-GX CES48**. The opponent's Wobbuffet can remain in its Active Spot throughout the sequence.

A new [both-seat compiled native Store regression](../../tests/agent17-klefki-bomb-temple-rain.pinned.test.cjs) resolves **Extra Energy Bomb -> five full attachments -> Electrode self-KO and two opponent Prizes -> Sky Field replaces Temple -> free U-Turn Board retreat -> Electro Rain and a genuine Benched V KO worth two source Prizes**. The test passed as the exact Agent17 step in manual [run 41487485297](https://github.com/FlareZ123/experiment-01/actions/runs/41487485297). It used the upstream-pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and the research-side **mandatory Extra Energy Bomb** and **Electro Rain damage** rules patches, scoped and reverted around each test. There are **no independently shuffled full native games** and no qualified win-rate observations from this result.

This is an extension of [Agent43's already-passing Klefki/Electrode power-visibility test](../../tests/agent43-klefki-electrode-active-locks.pinned.test.cjs), which demonstrated the mutual lock override in both seats but explicitly **did not activate Energy Bomb**. This new chain also differs from [Agent17's earlier Escape Rope disruption line](agent17-raichu-temple-wobbuffet-counterline-20261102.md): it **does not require removing opposing Wobbuffet from Active**, removing the opponent's promotion choice from this particular recovery route.

## Exact source provenance

The unchanged [Aichi rank4 original 60](full-decklists.json), **Shu Hosoda**, contains each named original card required by the source fixture:

| Printed card | Copies in source rank4 | Tested role |
| --- | ---: | --- |
| Klefki SVI96 | 1 | Active Basic lock |
| U-Turn Board UNM211 | 1 | Reduces Klefki's printed one-Colorless retreat to zero |
| Voltorb ROS21 | 2 | Evolution base for source Electrode-GX |
| Electrode-GX CES48 | 3 | Stage1 Extra Energy Bomb |
| Pikachu LOR52 | 1 | Evolution base for Alolan Raichu |
| Alolan Raichu UNM57 | 2 | Non-GX Stage1 Electro Rain attacker |
| Sky Field ROS89 | 3 | Replaces Temple Stadium |
| Reversal Energy PAL | 4 | Three Lightning units per card while behind Prizes |
| Counter Energy CIN | 4 | Two Lightning units per card while behind Prizes |
| Unit Energy LPM UPR | 4 | One Lightning unit per card when Temple is removed |

The opponent fixture uses genuine **Wobbuffet PHF36** Active, **Temple of Sinnoh ASR155** Stadium and **Shadow Rider Calyrex V CRE** Benched, all identified in the unchanged [Temple v1 candidate](candidate-temple-shadow-rider.md). Original rank17 Yuya Yamano's authenticated 60 also includes one **Klefki** and one **U-Turn Board**, with a different Stadium-out package, but **this exact native end-to-end fixture only proves rank4**. No hypothesis is carried over to missing rank25's original sixty.

## Ordered native action receipt

1. Stage legitimate preconditions: source Active **Klefki** with **U-Turn Board** attached; an established Benched Voltorb→Electrode-GX; an established Benched Pikachu→Alolan Raichu; five particular original Energy cards in owner's discard; Sky Field held; opposing Wobbuffet Active and Temple in play. Stage1 evolution and these hand/zone states are *injected*, not produced by a legal tournament draw/search sequence.
2. Use the compiled `CheckPokemonPowersEffect` with opponent's Wobbuffet Active: **Extra Energy Bomb is visible** because Klefki's lock disables Wobbuffet's Basic-only Ability while leaving Stage1 Electrode's Ability enabled. The prior Agent43 test separately checks the direct converse lock statuses for both source seats.
3. Dispatch genuine `UseAbilityAction` from owner to the Benched Electrode. The research wrapper correctly sets a **minimum five** legal `AttachEnergyPrompt` choices; all five real Special Energy card objects transfer to the **Benched** Alolan Raichu. The Electrode is actually Knocked Out and the opponent actually takes **two Prizes**. Neither opponent's Active Wobbuffet nor our Active Klefki has been displaced.
4. Temple would turn those Special Energy into Colorless, so the source plays its **printed Sky Field** from its actual staged hand using a **native PlayCardAction**. The compiled state now reports Sky Field and restored Lightning-producing Energy.
5. Dispatch genuine `RetreatAction` from the attached **U-Turn Board Klefki** into the fully powered Benched Alolan Raichu. The opponent's Active Wobbuffet stays Active. Its Ability is now free to reactivate, but Electrode's one-time Prize-and-attachment transaction has already resolved.
6. At the attack opportunity, the opponent has taken two Prizes, so source `Reversal Energy ×2` supplies **6** Lightning, `Counter Energy ×2` supplies **4**, and `Unit Energy LPM ×1` supplies **1**: **11 Lightning units**, or **330 damage** through 11 `30`-damage selections. Dispatch native `AttackAction('Electro Rain')`; resolve the genuine discard-choice and PutDamagePrompt. The test asserts the **330 damage selection**, the **Benched Shadow Rider Calyrex V has entered its owner’s discard** and the source has **actually taken two Prize cards**. This is more reliable than reading `PokemonCardList.damage` after native KO cleanup, which resets/invalidates a defeated Bench slot. The opponent's Wobbuffet stays Active.

The original first run [41486979727](https://github.com/FlareZ123/experiment-01/actions/runs/41486979727) failed only the *post-KO mutable target damage* assertion, after the full attack prompts had completed; it did not assert the Prize and discard evidence. The corrected test [41487485297](https://github.com/FlareZ123/experiment-01/actions/runs/41487485297) is green in both seats, measuring the actual surviving zone state and Prizes. Do not interpret an earlier test's failed post-KO damage assertion as a native gameplay defeat.

## Why this matters for the fixed-deck objective

This supplies a **counterexample to the overly strong assumption** that Wobbuffet + Temple inevitably deny Raichu's Energy Bomb and attack. It specifically removes a reliance on forcing the opponent to promote away from Wobbuffet with Escape Rope. The former Active Klefki's defensive Ability is sacrificed to become an attack-capable Alolan Raichu Active, so the line makes a **temporal lock-state transition**, not a permanent lock cancellation.

**Current bot-policy gap:** in [the source-specific Electrode Prize-trade tactic](../../simulation/twinleaf/electrode-gx-ability-tactic.cjs), `useTactic` returns immediately unless the owner's **Active is Alolan Raichu**. Thus it cannot select Bomb while Klefki is Active. Waiting to retreat first restores opponent Wobbuffet's Ability, again blocking Electrode. This is an explicit **policy reachability problem**: a physical line can exist while an apparently competent bot's one-step tactical policy loses access to it. A future source-owned owner-information-safe policy should evaluate the **Bomb-while-Klefki-Active -> free retreat -> Stadium-out -> attack** package as one turn-level continuation. It must price first-turn Klefki lock of the owner's own Dedenne-GX/Crobat V resources, Stage1 evolution timing, Tool placement, five actual discard targets, Bench and Prize constraints, and alternative pivot/payment lines.

**Limits:** The test starts with an injected favorable midgame board and gives the exact source a Sky Field, evolved Stage1s, Tool and five discarded Energy. It does not prove early access likelihood, Stage1 setup speed, survival under actual opponent actions, average strength, risk relative to an alternative use of Klefki/U-Turn Board, unrepresented paper interactions or any head-to-head game result. The engine uses pinned vendor code with opt-in local research patches; no vendor submodule file was modified. [Agent43's exact 29-original Klefki exposure study](agent43-klefki-basic-ability-exposure-29-originals-20261102.md) remains a source-card census, not lock uptime. **Source coverage remains 29/32; qualified competitive games = 0; the 99.5% target remains unproven.**

## Next discriminating experiments

A strong source-player regression would (i) derive this Klefki Active + U-Turn + Bomb situation **from an authenticated shuffled original rank4 60**, (ii) invoke the genuine source owner tactic at each decision, (iii) verify the native prompted attachment, Stage1 self-KO and reciprocal Prize transaction, (iv) preserve the Temple player's meaningful reply and alternative draw/gust/Bench choices, (v) report total seeds, natural exposure counts, actor policy versions and exact full-state provenance, and (vi) compare both seats against a common unmodified fixed-60 candidate. This result supplies an executable **positive mechanics control** for that program; it is not a competition benchmark.
