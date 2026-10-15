# Aichi Top 32 list resolution against pinned Twinleaf

**Agent 2, 15 October 2026.** **Verified CI:** [manual smoke and complete 29-list resolution, run 38820219795](https://github.com/FlareZ123/experiment-01/actions/runs/38820219795).

## Resolution status

The 29 published full lists in [the source-controlled manifest](../aichi-2026/full-decklists.json) each contain 60 cards. All 29 have now been mapped to 60 concrete card IDs that `DeckAnalyser.isValid(Format.EXPANDED)` accepts under the pinned Twinleaf engine (`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`). The three unpublished rank 23, 25 and 28 lists remain unknown and untested.

The native card coverage audit initially reports 989 distinct requested printing rows:

| Resolution category | Rows | Interpretation |
| --- | ---: | --- |
| Native exact name, set, number | 937 | Card exists under precisely the requested printing identity |
| Resolved `♢` Prism Star glyph | 12 | Alias only accepted when the printed set and number match and the Twinleaf card carries `PRISM_STAR` tag |
| Basic Energy printing-number difference | 35 | Source `MEE` numbering 9–15 differs from pinned engine `MEE` numbering 1–7; resolver opts in to the same-name, same-set `EnergyType.BASIC` equivalent, recording each one |
| Colliding Electrike printing | 1 | Pinned engine erroneously assigns `PRC #60` to two materially different Electrike card definitions; resolver checks Ω Barrier to select the verified real print |
| Japanese promo absent upstream | 4 | `Player's Ceremony SP #127` appears in four published lists (five copies total); research-owned implementation is registered only under explicit opt-in |

The row categories total 989. Many of these rows represent more than one physical card; the entire 29-list set contains 1,740 card slots. Engine acceptance must not be interpreted as a paper legality determination, a proof of Japanese card identity, or correct effects in play.

## Electrike source correction

The requested `Electrike PRC #60` is an Ancient Trait Pokémon with **Ω Barrier**. [Limitless's card record](https://limitlesstcg.com/cards/prc/60) and [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Electrike_%28Primal_Clash_60%29) both identify the same printing and effect.

The pinned upstream defines:

- [`electrike.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-primal-clash/electrike.ts): `Electrike PRC`, `setNumber='60'`, has Ω Barrier.
- [`electrike-2.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-primal-clash/electrike-2.ts): `Electrike PRC 60`, also `setNumber='60'`, lacks Ω Barrier.

These cannot be treated as interchangeable. The [checked resolver](../../simulation/twinleaf/resolve-field.cjs) specifically checks for the Ω Barrier power before mapping rank 7's Electrike. No vendor edits or arbitrary card substitutions were made.

## Japanese-only cards

`Player's Ceremony` is a Japan-only Stadium usable at this Japanese Aichi event according to [Japanese-card legality data](https://limitlesstcg.com/cards/jp/SP/127?translate=en) and Agent 1's [regional legality notes](../aichi-2026/japanese-only-cards.md). The research-owned [hook](../../simulation/twinleaf/card-patches.cjs) reproduces the translated effect: a player may draw two cards once during their turn, ending that turn if they do. This effect follows the pinned engine's `TropicalBeach` pattern. Its gameplay semantics still require tests, especially Stadium removal and locks.

`Palace Book SMP NAN25` and `Palace Belt BWP 153` are implemented natively in this Twinleaf revision, despite being absent in the provided English card snapshot. Their regional legality is described in the same [Agent 1 notes](../aichi-2026/japanese-only-cards.md). Their effects remain subject to source-level and gameplay tests.

## Invocation contract and limitations

Use [`resolveManifestFile`](../../simulation/twinleaf/resolve-field.cjs) with the explicit `allowEquivalentBasicEnergies` and `allowJapanesePromoHooks` options when modeling this Japanese field. Resolved decks contain `cardIds`, `rank`, `player`, `archetype`, `modifications`, and `unresolved`. All modifications carry the original source printing and an explanation, so experiments can be challenged or reconstructed.

The [engine runner](../../simulation/twinleaf/headless.cjs) takes 60-element card ID lists and a fixed seed. It has produced a complete *upstream Standard Dragapult mirror* game, but it has not thereby demonstrated a successful competitive Aichi matchup. The SimpleTacticsAi policy and engine effects are not independently validated across the complicated Japanese Expanded field.

The current objective of 99.5% is entirely unverified. The 29 mapped opposing lists enable further tests; ranks 23, 25 and 28 remain explicitly missing. Preserve per-placement results, both seats and failures rather than turning engine viability into strength claims.
