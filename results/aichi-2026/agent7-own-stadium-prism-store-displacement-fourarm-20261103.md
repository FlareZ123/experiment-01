# Agent 7: original-print own-Stadium replacement, native Store versus enumerator

**3 November 2026, pinned native mechanics, two seats × two printed source pairings.**

## Decision-relevant defect and source-root provenance

The pinned Twinleaf `ActionEnumerator.playStadiumActions()` returns no Stadium plays whenever the **acting owner already has a Stadium**. This conflicts with the supplied Advanced Player's Rulebook, section I.B-04, which permits playing a differently named Stadium when the player's one-Stadium-per-turn quota remains available. This source-level defect is independently supported by real original Aichi source owner Passes with public Stadium custody:

- **Original rank 6 Iron Thorns ex**, genuine source-versus-rank9, source seat 0: held `Thunder Mountain Prism Star LOT` hand index 7, own `Wondrous Labyrinth Prism Star TEU` on global turn 10, last Stadium used at turn 2, no reported Stadium lock, native enumeration omitted replacement, and native accepted Pass. Four correlated missed owner roots at turns 10, 12, 14 and 16 in one physical game. Physical initial deal SHA-256 `0f71b28f9fb0d50bf5d27ac102e9f8265a1ae3dc547ef6c1dc9adc1aa661f42e`.
- **Original rank 9 Absol/Electrode**, source seat 0: held `Silent Lab PRC` hand index 8, own `PokéStop PGO` on global turn 8, last Stadium used at turn 2, no reported Stadium lock, native enumeration omitted replacement, and native accepted Pass. Five correlated missed roots at turns 8, 10, 12, 14 and 16 in one physical game. Physical initial deal SHA-256 `b9398dd0e9f4b93085cf1fb36595b17df72e602b3f8e69636c005b43929f2a9a`.

Source receipts and full parity: [Agent 5 original 6-vs-9 Stadium omission report](agent5-original6v9-paper-stadium-replacement-omission-20261103.md), [compiled read-only native CI 41695444985](https://github.com/FlareZ123/experiment-01/actions/runs/41695444985). The rank-5 source `Sky Field`/own `Path to the Peak` omission was previously confirmed separately in [Agent 7's earlier report](agent7-stadium-enumerator-own-stadium-gate-20261103.md).

## New independently executed Store settlement test

[Research-owned native fixture](../../simulation/twinleaf/agent7-own-stadium-prism-displacement-native.cjs) instantiates the actual pinned `PlayCardAction`, using card-manager original printings and **both actual physical seats**, while holding the owner's prior Stadium already in play. For each arm, native enumeration was independently queried, then the native Store was directly dispatched with the exact physical held-card hand index. Original player turn and actor seat were retained.

| Source-derived constructed scenario | Seats | Native Stadium offer | Direct Store play | Displaced original location |
| --- | --- | --- | --- | --- |
| Own Wondrous Labyrinth Prism Star TEU → Thunder Mountain Prism Star LOT | 0, 1 | omitted | accepted | **own Lost Zone**, absent from discard |
| Own PokéStop PGO → Silent Lab PRC | 0, 1 | omitted | accepted | **own discard**, absent from Lost Zone |

**Compiled existing manual workflow**: [CI 41705735885](https://github.com/FlareZ123/experiment-01/actions/runs/41705735885), source HEAD `96cefefb10512c96d93251304f60a04a6ab8daed`, pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both `Native owner Prism Star and ordinary Stadium displacement in both physical seats` and `Certify own Prism Lost Zone and ordinary discard receipt for four native arms` **passed**, 4/4 native constructed arms. Existing separate four-arm normal/same-name control also passed. The fixture emits the full four-arm JSON to the existing Stadium artifact group without creating a new workflow or a new feature flag. No upstream vendor code changed.

The supplied card pool (`sm9-158`, `sm8-191`) supplies the explicit Prism Star replacement rule: a Prism Star card that would go into its owner's discard goes to its owner's Lost Zone instead. The native Store reproduces that rule in these constructed own-Stadium tests. In the same supplied pool, Iron Thorns ex `sv6-77` has `Volt Cyclone` base cost one Lightning and two Colorless units. Under Wondrous Labyrinth's non-Fairy +1 Colorless, the nominal Iron Thorns cost is four units. Thunder Mountain's minus-one Lightning changes its nominal cost to two Colorless units, a **two-symbol reduction** relative to the prior Stadium, subject to other active game effects. This gives a plausible tactical reason to evaluate replacing the own Stadium; no actual attack-activation improvement was demonstrated in the real source game.

## Limitations and release gate

- The new four arms are **constructed true-Store mechanics fixtures** using source-registered prints. They are **not** reconstructed original rank-6 or rank-9 source roots, and their outcomes are not game wins.
- Source original archived Pass opportunities are **authentic** and paper-rule-eligible under the available public state, but the alternative play at those exact roots was **not executed**. Relative strategic desirability, timing, opponent continuation, and paper 25-minute match clocks remain unresolved.
- Future selected common two-seat policy must independently enumerate same-name-safe Stadium alternatives from the physical owner's hand and current public Stadium, quota and lock constraints; provide an explicit strategic preference relative to Pass or keeping the existing Stadium; then actually execute the exact legal Store action and measure the consequent attack/control payoff and opposing reply. Avoid treating native action enumeration as exhaustive or an accepted native play as paper-valid by itself.
- Exactly **29/32** Aichi original lists are authenticated (ranks **23,25,28 missing**); **zero competitively qualified games**, **no final 60 selected**, and **no demonstrated 99.5%** full-field game win rate.

This report strengthens the selected policy's source-action feasibility requirements without changing the fixed-60 decision board or claiming a new candidate.
