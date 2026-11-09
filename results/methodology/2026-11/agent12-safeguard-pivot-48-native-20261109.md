# Fixed Iron Thorns / Mimikyu Safeguard Pivot: authentic 48-game development panel

**Agent12 | 9 November 2026. Status: completed native study, zero paper-qualified competitive games.**

The exact new [fixed 60-card Safeguard Pivot v1](../../aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.json) adds Mimikyu PAL97, one Basic Psychic, and one Jet Energy to the original rank6 four-Thorns 60, removing two Camping Gear and a Captivating Poké Puff. The primary architectural purpose is a non-Rule-Box Safeguard wall and paid Ghost Eye against ex/V attackers, including the three original rank6/24/29 Thorns-only source lists.

## Reproducible native result

The [preregistration](../../aichi-2026/registrations/agent12-thorns-safeguard-contrast-20261109.json) frozen before any native games designated 24 fresh original-source rank/seat/seed groups, comparing unchanged rank6 against the unchanged fixed Safeguard Pivot, 48 real pinned Store games at a 260-root ceiling. Three original Thorns sources (ranks 6, 24, 29) received two independent seat-balanced repeats. Other sources: original ranks 1,2,5,11,13,31.

[Successful GitHub Actions run 42596801182](https://github.com/FlareZ123/experiment-01/actions/runs/42596801182) passed all tests, compiled Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, executed all 48 registered games, and archived every native row in [artifact 13663698288](https://github.com/FlareZ123/experiment-01/actions/runs/42596801182/artifacts/13663698288). [Runner](../../../simulation/evaluation/2026-11/agent12-safeguard-pivot-original-field-native.cjs), [tests](../../../tests/2026-11/agent12-safeguard-pivot-native.test.cjs).

| Native observed status | Original four-Thorns 60 | Safeguard Pivot v1 |
| --- | ---: | ---: |
| Wins | 7 | 11 |
| Losses | 7 | 1 |
| Root-260 censored | 9 | 11 |
| Native errors | 1 | 1 |
| Genuine declared and prompt-settled Ghost Eye | 0 | **25** |
| Declared Volt Cyclone | 57 | 54 |
| Actor Pass actions | 448 | 547 |

Only **20/24** source physical deals matched across candidates; **8/20** matched groups completed both native games. Across the 20 matched groups the sharp Safeguard-minus-original native-win count interval is **[-5,+12]**, so the apparent 11 versus 7 native wins do not identify a ranking. On all 24 arms, honest censor/error-only win-count intervals are original **[7,17]**, pivot **[11,23]**. Engine errors and caps are not losses.

## Key new bottleneck

The pivot produced **25 genuine Ghost Eye declarations and settlements**: ten against original rank1, fourteen against original rank5, **one against rank29**, and **zero against ranks6 and24**. Thus the prototype exploits the new paid Mimikyu attack against Shadow Rider and Mew, while almost never realizes its proposed counterplay against original Iron Thorns mirror opponents under this shared developmental actor policy.

Original Aichi ranks 6, 24, and 29 each play **only Special Energy** as printed (Speed Lightning, Capture, Double Colorless, and sometimes Spiky). Their Volt Cyclone costs Lightning plus two Colorless. A Temple of Sinnoh Stadium converts all Special Energy to single Colorless, removing their Lightning payment while in play. Because Safeguard Pivot has one Basic Psychic, Mimikyu can still fund Ghost Eye through Temple with one supplementary Colorless. This creates a specific asymmetric **stadium + Energy + non-Rule-Box attacker line** worth testing. Temple also disables our own Thorns' only-Special-Energy attack funding, so an opportunistically played Stadium can harm its owner unless Mimikyu is ready, and opposing Stadium replacement can break the effect.

## Decision

Advance neither the original Thorns copy nor Safeguard Pivot v1 to final selected 60. Preserve the v1 observed superior native terminations as a **candidate hypothesis** subject to an extremely wide paired interval, source-actor competency, 260-root censoring, and paper-clock validation. The immediate missing proof is native executed, opponent-contested Mimikyu + Temple positioning against all three original Thorns sixties, plus how much alternative Stadium recovery and Energy denial they can apply. Zero competitively qualified games, three unauthenticated Top32 exact 60s, and no demonstrated 99.5% win rate.
