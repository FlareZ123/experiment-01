# Horror House-GX's extra Psychic condition ignores Prism/Rainbow in pinned Twinleaf

**Agent 10, 18 October 2026.** Evidence: pinned upstream card source, published Aichi rank-9 source 60, and compiled *staged* Store-action tests. This is a paper-rule compatibility diagnosis, **not a real source-dealt win-rate test**.

## The discrepancy

The paper Gengar & Mimikyu-GX (Team Up 53) attack `Horror House-GX` costs one Psychic. Its additional condition requires at least one *extra Psychic Energy* attached, and then both players draw up to seven cards. Psychic units from attached all-type Special Energy count when that card is providing Psychic. The advanced rulebook's sections on Energy type and attack cost describe effective supplied Energy independently of the physical count of cards.

Pinned upstream Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements the extra condition as:

```ts
const extraEnergy = player.active.cards.filter(card =>
  card.superType === SuperType.ENERGY &&
  (card as EnergyCard).provides.includes(CardType.PSYCHIC)
).length > 1;
```

Source: [pinned Gengar reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx.ts). It compares **static card-printed `provides` arrays** rather than dynamically supplied units.

Source [Prism Energy NXD](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/06-black-and-white/set-next-destinies/prism-energy.ts) prints `[COLORLESS]` but contributes `[ANY]` via `CheckProvidedEnergyEffect` while on a Basic. [Rainbow Energy SUM](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon/rainbow-energy.ts) likewise supplies `[ANY]`. The engine's general attack-cost checking understands this through `StateUtils.checkEnoughEnergy`. Hence the normal attack can correctly consume Psychic from these cards while the extra-condition check ignores that same Psychic provision.

## Controlled printed-card Store test

[Staged native attack regression](../../simulation/twinleaf/gengar-horror-house-rainbow-fidelity.cjs) creates a real Store with Gengar & Mimikyu-GX Active, six face-down Prizes, an opposing Pidgey, two attached Energy cards, a live `AttackAction('Horror House-GX')`, and ten-card synthetic decks. Attached cards are present in both relevant Store arrays, matching normal energy attachment. All four variants have enough Energy for the one-Psychic attack. Both players begin with empty hands. The test separately checks GX usage and opposing hand-play restriction.

| Attached Energy | Paper should draw each | Raw pinned engine draws each |
| --- | ---: | ---: |
| Psychic + Psychic | 7 | **7** |
| Psychic + Rainbow | 7 | **0** |
| Psychic + Prism (Basic Gengar) | 7 | **0** |
| Psychic + Double Colorless | 0 | **0** |

Compiled manual [CI 39103385200](https://github.com/FlareZ123/experiment-01/actions/runs/39103385200) **passed** after two test-harness coding corrections (numeric enum values and scoped `CardType` import). The preceding red runs did not refute the discrepancy; they failed the test's own assertions and scope import.

## Research-side correction

The [reversible opt-in hook](../../simulation/twinleaf/gengar-horror-house-extra-psychic-hook.cjs) preserves the original card handler and calls `CheckProvidedEnergyEffect` plus `StateUtils.checkEnoughEnergy(...,[PSYCHIC,PSYCHIC])` before resolving the attack. If effective Psychic is sufficient while the pinned reducer's static criterion is false, the hook supplies the missing both-player draw-to-seven *after* the original valid GX and lock effect. It restores the upstream class prototype afterward. A [paired raw-vs-corrected Store contract](../../simulation/twinleaf/gengar-horror-house-extra-psychic-hook-contract.cjs) checks basic, Rainbow, Prism, and negative-Colorless states and exact hook restoration. [CI 39103629498](https://github.com/FlareZ123/experiment-01/actions/runs/39103629498) passed the targeted compiled raw and corrected Store steps. Its wider workflow still had a separate Tool-Power diagnostic in progress at this check, so full-workflow success was not yet confirmed.

The correction does not yet have a source-dealt rank-9 full-game replay, a proven delegated Perfection copy-path regression, or demonstrated tournament performance. No claim that the printed card had a non-Psychic cost is implied. A full analysis should additionally check stadiums modifying Special Energy, atypical multienergy cards, and absence of accidental duplicate draws.

## Actual Aichi opponent relevance

The preserved published `results/aichi-2026/full-decklists.json` lists **rank 9 Shun Ito, Absol Electrode**, with **one Gengar & Mimikyu-GX, four Prism Energy, one Telepathic Psychic Energy, two Darkness Energy**, and no basic Psychic Energy. Thus this simulator false negative is directly relevant to a printed card/Energy package in the actual known opponent field. However, a list containing Gengar and Prism does not prove the player actually used Horror House with sufficient Energy in the audited game state. In particular, this is **not evidence of a competitive win-rate change** for any candidate.

The benchmark remains 29/32 exact decks with zero independently qualified games; ranks 23, 25, and 28 are still missing. Neither this staged test nor one isolated engine result qualifies the 99.5% target.
