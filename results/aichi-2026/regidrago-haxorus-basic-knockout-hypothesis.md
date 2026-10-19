# Regidrago's Haxorus Basic instant-KO donor: a structural candidate to falsify

**Agent 12 | 19 October 2026. Hypothesis, not a nominated replacement deck.** Format: paper Expanded, Black & White onward. Preserve the single fixed-60 objective. This note identifies a potentially discrete anti-Basic axis absent from all 9 published Regidrago Top32 lists; it does not claim positive competitive results.

## Exact card and interaction

The bundled English card pool's `cards/en/zsv10pt5.json` entry `zsv10pt5-70` is a **Dragon Stage 2 Haxorus** with `Axe Blast`: if the opposing Active Pokémon is a Basic Pokémon, it is Knocked Out. The pinned Twinleaf engine represents this printing as **`Haxorus SV11B`**, set `BLK` / #70 and attack **`Axe Bomber`**, with the same Basic-conditional KO effect; this is a printing/attack-name **alias** that test code must document. Under the bundled Advanced Player's Rulebook II-C-18, using another Pokémon's attack implements its effects and damage without paying the chosen source attack's Energy cost, unless specified. Regidrago VSTAR pays the Grass-Grass-Fire cost of its own **Apex Dragon** and may copy an eligible Dragon Pokémon's attack from its discard pile. Haxorus's Fighting/Metal/Colorless cost is not a second payment.

Pinned normal-Store **paid Apex Dragon** resolution was checked by [`apex-haxorus-basic-ko.cjs`](../../simulation/twinleaf/apex-haxorus-basic-ko.cjs): Basic Iron Thorns ex `TWM` was Knocked Out for two Prizes, Basic Mega Absol ex `M1L` for three, and Evolution Regidrago VSTAR did not satisfy the Basic condition and was not knocked out. The stale engine lookup `Mega Absol ex MEG` was corrected to `Mega Absol ex M1L` in commit `6c5ba316`; the entire manual suite **passed** [CI 39235421281](https://github.com/FlareZ123/experiment-01/actions/runs/39235421281). These are staged Store actions with manually set attackers, Energy, discard payload and Prizes, **not organically established match openings**.

## Why the fixed Aichi field makes this test relevant

The frozen published [29 exact 60s](full-decklists.json) contain exactly **eight distinct opponent ranks** with `Iron Thorns ex` or `Mega Absol ex` in their lists:

- Iron Thorns ex (four each): **6, 24, 29**.
- Mega Absol ex: **8, 9, 11, 16, 22**.

The bundled card database identifies both Pokémon as **Basic**; Mega Absol ex's 280 HP means one successful attack-effect KO takes three Prizes, whereas Iron Thorns ex takes two. The overlap is **8/29 known-list ranks**; 23, 25, 28 remain incomplete. Presence of either Basic attacker is a scope screen, **not** a prediction that the opponent will expose it as Active or that a copied Haxorus attack would resolve unimpeded. Other Pokémon, lock effects, gust opportunities, and attack-effect protection vary by opponent.

Of the **nine** published Regidrago Top32 decks, **zero** register Haxorus and five register Koraidon ex. Koraidon ex's 280 printed Kaiser Tackle damages the opposing Active and 60 to itself; a Haxorus KO effect can avoid that self-damage against an eligible exposed Basic. Against Evolution targets or protection from attack effects, Haxorus's alternative can do nothing while damage still works. This is conditional specialization and should be evaluated as an optional donor rather than a blanket dominance claim.

## Accessibility and opportunity costs

A Haxorus Stage 2 is an **attack payload to put in the discard pile**, not a realistic evolution project in Regidrago. It consumes one or more physical slots, competes for discard outlets and card search, and is a potentially dead card in hands with scarce disposable resources. The nine published Regidrago lists use `Hisuian Heavy Ball`, which retrieves **Basic** Pokémon from Prizes and therefore cannot retrieve a Prized Stage 2 Haxorus. Under an unconditioned uniform 6-Prize sample from a 60, one Haxorus singleton is Prized with **10%** probability; two copies are **both** Prized with `C(6,2)/C(60,2) = 0.8474576%` probability. These are combinatorial unconditioned baseline values; actual opening/mulligan and early hand state can require adjusted analysis. A second copy sharply reduces complete Prize inaccessibility while spending an additional scarce slot.

The generic Twinleaf copied-attack resolver ranks **printed damage** instead of instant-KO/conditional Prize effects. Haxorus's copy is printed at zero damage, so an otherwise legal donated Haxorus may have **low practical AMR** under the current generic bot even when its KO effect wins a Prize race. A successful human-usable 60 would require a policy capable of preferring Axe Blast in Basic KO windows without wasting the copy selection versus Evolutions or protection.

## High-value next falsification

Define a complete distinct 60 with an explicit Haxorus slot and discard-access line, preregister its physical printings and baseline alternatives, and play paired same-seed **both-turn-order** hard rank6/rank11 games. Before any win-rate inference, record whether the payload is accessible, in discard, copy-selectable, paid for, and actually chosen in a Basic Active window; compare Prize transfers and lost alternative Koraidon/Goodra/Dragapult lines. Include negative controls: Evolution Active target, attack-effect immunity, Stage 2 Haxorus in Prizes, Item lock impairing discard access, and a mixed board where another copied attack is stronger. The source engine's observed generic-bot Card mutations and hidden-information defects remain independent validation gates.

**Status:** interesting structural deck hypothesis with validated staged rules interaction, eight relevant published-core opponent ranks, no tested modified 60 and no qualified game-win evidence.
