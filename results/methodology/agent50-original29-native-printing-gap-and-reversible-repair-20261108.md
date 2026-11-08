# Agent50: Aichi original-29 pinned-native printed fidelity, 11 exact-name aliases and reversible field repair

**8 November 2026 | Engine and policy development; does not establish competitive win rate.**

## Concrete findings

The benchmark source `results/aichi-2026/full-decklists.json` contains **29 authenticated complete published Aichi 2026 Top32 decklists** and **102 distinct original Pokémon printings** across those lists. The remaining three Top32 full lists are unavailable. The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

An executable live-native `CardManager` census compared each original Pokémon by its registered name, set and card number, using `resources/sets/en.json` and `resources/cards/en/` as a print comparator. Two independently checked native outputs:

| Audit measure | First naive name-based lookup | Corrected exact native printed identity |
| --- | ---: | ---: |
| Original Pokémon printings | 102 | 102 |
| Truly missing from pinned native engine | unclassified (11 apparent missing) | **0** |
| Original printings indexed under a different native `fullName` | not distinguished | **11** |
| Missing in bundled English comparator | 5 | **5** |
| Printed HP/type/attack/Weakness/Resistance signature differences (when both sources found) | 10 | **12** |
| Signature differences specifically involving attack lists | 6 | **8** |
| Indexed native card number disagreements | 0 | **0** |

The printing-level discrepancy counts do not establish that the attack-effect implementations are wrong. For instance, an engine may correctly calculate a `10+` attack by effect code while omitting its variable-damage notation. However, missing Resistance, attack spelling mismatches and omitted effects are independently testable errors. The cards in the **five bundled-source gaps** still have corresponding native implementations; their exact English baseline signature could not be directly compared using the bundled files.

### Complete eleven-source native alias list

| Registered Aichi printing | Pinned native `fullName` | Original ranks affected |
| --- | --- | --- |
| Mega Absol ex MEG | Mega Absol ex M1L | 8, 9, 11, 16, 22 |
| Mega Dragonite ex ASC | Mega Dragonite ex M2a | 14, 20, 32 |
| Oricorio-GX CEC | Oricorio GX CEC | 14 |
| Buneary PFL | Buneary M2 | 15 |
| Mega Lopunny ex PFL | Mega Lopunny ex M2 | 15 |
| Trubbish CRI | Trubbish M4 | 16 |
| Mega Kangaskhan ex MEG | Mega Kangaskhan ex M1S | 18 |
| Arceus & Dialga & Palkia-GX CEC | Arceus & Dialga & Palkia GX CEC | 19 |
| Galarian Moltres V CRE | Galarian Moltres V CRE 97 | 19 |
| Ho-Oh-EX DRX | Ho-Oh EX DRX | 19 |
| Meloetta ex BLK | Meloetta ex SV11B | 26 |

All 11 correspond to exact native card `name`, native `set`, and native `setNumber` data, despite their different lookup keys. This means the original source decks are **not automatically playable** through the unmodified `getCardByName(name + ' ' + set)` pathway, despite the native implementations existing.

## Executable solution

`simulation/twinleaf/agent50-original29-printed-fidelity-hook.cjs` exports `withOriginal29PrintedFidelity(callback)`, a synchronous, reversible research adapter around native `CardManager.prototype.getCardByName`. It first attempts the unmodified native indexed name. If it fails, a fallback is permitted **only** if the exact request appears among the 29 authenticated original source decklists. It searches native `CardManager.getAllCards()` for a **single** card with the exact original name, set, and printed number and obtains a cloned native card by calling the original `getCardByName` with that native card's actual `fullName`. Missing, unregistered, or ambiguous names receive no invented card. The adapter restores the original descriptor in `finally`.

On successfully cloned native cards, the same default-off adapter corrects a small number of established printed fields without modifying the vendor submodule:

- Electrode-GX CES48: `Crash and Burn-GX` becomes original printed `Crush and Burn-GX`.
- Pidgeotto TEU123: Fighting Resistance becomes **−20** rather than engine −30.
- Mew V FST and Mew VMAX FST: restore **−30 Fighting Resistance**.
- Genesect V FST: restore **−30 Grass Resistance**.
- Shadow Rider Calyrex VMAX CRE: `Max Geist` printed variable damage `10+` metadata is restored.
- Koraidon ex TEF: `Retribution Strike` printed `20+` metadata is restored.
- Toedscruel PAR17: rename `Scratch` to actual `Mushroom Drain` and restore the missing **heal 30 damage from itself** attack effect using the pinned native healing prefab.

These limited corrections do **not** certify every effect, attack interaction, legality or a complete competitive engine. Some other attack text and implementation defects will remain. Paper card texts must continue to take priority over engine behavior.

The existing `simulation/evaluation/agent41-bilateral-v2-development.cjs` shared runner now supports the **default-off** option `actorOriginal29PrintedFidelity:true` under `actorOnlyComposition:true`. Historical registered benchmarks remain unchanged unless a new prospective experiment explicitly enables it for both physical seats. The canonical-only gating and related pure contracts passed [shared contract CI 42523655857](https://github.com/FlareZ123/experiment-01/actions/runs/42523655857).

## Genuine pinned-native receipts, distinct from competitive benchmarks

- [Run 42522418768](https://github.com/FlareZ123/experiment-01/actions/runs/42522418768) passed native paper-fidelity fixes in **both physical seats**. A real `Timburr BLW` Fighting `Pound` dealt 10 damage to an unpatched `Mew V FST`, then **0** after restoring printed Resistance. An exact-name `AttackAction('Crush and Burn-GX')` was accepted by the pinned native Store; one physical Lightning Energy was discarded and the attack dealt 80. A damaged real `Toedscruel PAR` at 70 damage used unpatched `Scratch` and remained at 70; with the correction, `Mushroom Drain` dealt 80 to its target and healed 30 from itself, reducing its damage to 40. All relevant native prompt chains settled.
- [Run 42522902789](https://github.com/FlareZ123/experiment-01/actions/runs/42522902789) passed the exact native `Mega Absol ex MEG` alias test in **both physical seats**. It resolved to the true existing `Mega Absol ex M1L` class (native printed set MEG, number 86), used its real `Terminal Period` attack against a Pokémon with precisely six damage counters, completed Knock Out, selected physical Prize cards, and reduced the acting player's six Prizes to **four**. This is a synthetic test state and not an original source-dealt game.

Tests: `tests/agent50-aichi29-native-printed-attack-parity.test.cjs`, `tests/agent50-original29-printed-fidelity-hook.test.cjs`, and `tests/agent50-original29-printed-fidelity-hook.native.test.cjs`. Existing small compiled native workflow `.github/workflows/agent50-electrode-crashburn-native.yml` executes the tests and uploads the complete 102-row native-versus-source report as a run artifact. No new broad CI workload is introduced.

## What remains before a competitive result

1. **Completed:** [final native run 42523265052](https://github.com/FlareZ123/experiment-01/actions/runs/42523265052) passed the 102-printing census and authenticated **all eleven** native aliases under the scoped hook as genuine pinned native clones, checking source `name`, `set`, and `setNumber`. No original Pokémon class was missing from the pinned revision. Complete source-rank exposure screens are produced by the deterministic `byRank` report.
2. Use the repaired exact registered source sixties for new, source-dealt, genuine two-seat native runs, with real action policies and no hidden-information fallback. Record each blocked prompt, exact decisive first changed action, physical Prize movements, terminal result and every assumption.
3. Validate paper legality independently from engine availability, and distinguish legacy cards that are present but not yet correctly implemented. Do not imply all original decks are competitive-match ready solely from a Pokémon-printing identity census.
4. Preserve the fixed candidate 60 unchanged for any actual Aichi field evaluation. The target remains 99.5%, with **zero competitively qualified completed games** established by this work. A staged native proof is a mechanical validation only.

**Status:** script, reversible hook and native evidence committed. The aggregate eleven-alias test is **green** in [CI run 42523265052](https://github.com/FlareZ123/experiment-01/actions/runs/42523265052); the reported 102 original printings now have zero truly absent native Pokémon classes. The report remains explicitly noncompetitive, with zero completed qualified benchmark games.
