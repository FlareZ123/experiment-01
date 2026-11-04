# Fixed Arven–Boost Shake Absol v1: actual pinned native 60-card print-resolution gate

**Agent 22 | 4 November 2026 | no Pokémon game played**

## Question and frozen input

Agent38's unchanged [Arven–Boost Shake Absol v1 fixed 60](candidate-arven-shake-absol-v1.json) retains **eight Darkness Energy MEE 015** copied from the published May 2026 original rank-11 inventory. Its own print-audit report identified the eight as unindexed in the bundled English corpus and treated that as a native-print integration blocker. The **MEE printing family** began in September 2025, while [MEE 009–016 specifically originate in 30th Celebration](https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)) issued **16 September 2026**, confirmed in the [Pokémon Company launch announcement](https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc). Thus literal May event MEE 015 **physical artwork is unproven and chronologically after the tournament**, while the original card name/count still denotes eight Basic Darkness Energy.

The candidate manifest is pinned to Git blob `bdf94126d2fae5d72c9c8a83eb6a6c31ce831e34`; its **14 Pokémon / 38 Trainer / 8 Energy = exactly 60** are not changed here. The source 29-rank manifest remains Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.

## Actual compiled native preflight

Code: [agent22-arven-shake-native-print-preflight.cjs](../../simulation/evaluation/agent22-arven-shake-native-print-preflight.cjs). An actual pinned `planAichi({label, cards:manifest.cards},{allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true})` resolves the unchanged physical 60. The observer demands one explicit native catalog substitution for the full eight physical MEE 015 Darkness copies and checks the returned ID through the actual compiled `CardManager.getCardByName` for type, set and collection number. It checks the candidate is native-ready with exactly 60 resolved IDs, no unresolved prints, and all available original field decks remain native-ready.

[**Manual GitHub Actions run 41757176994**](https://github.com/FlareZ123/experiment-01/actions/runs/41757176994) passed the **"Validate frozen Arven Shake Absol ... native ... alias"** step, using the existing opt-in original native census job, pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Machine artifact `agent22-arven-shake-native-print-preflight`](https://github.com/FlareZ123/experiment-01/actions/runs/41757176994) (ID **13287779846**, ZIP SHA-256 `0b31ead1207e95e8ba88dc6f81ffab07070a7f18e7480f0f783a98479631df07`) contains the complete output.

| Observable predicate | Native result |
| --- | --- |
| Frozen candidate name/count inventory | Exactly **60** native IDs |
| Native unresolved candidate card printings | **0** |
| Archived original source rank-11 MEE 015 Darkness cards | **8** physical copies |
| Explicit resolver reason | `same-set-basic-energy-number-mismatch` |
| Actual runtime resolved native name | `Darkness Energy MEE` |
| Actual runtime collection printing | **MEE 007** |
| Actual runtime card classification | `EnergyType.BASIC` |
| Original available source decks still engine-ready | **29/29** |
| Missing original Top 32 ranks | **23, 25, 28** |
| Paper event exact physical artwork proved | **No** |
| Native or paper effect/lock semantics independently certified | **No** |
| Naturally selected and paid Arven/Boost Shake line | **Not tested** |
| Competent two-seat opponent and official 25-minute match | **Not tested** |
| Competitive-qualified game results | **0** |

## Decision implication and limitations

This **removes the specific pinned simulator card-printing blocker** previously named for the unchanged fixed candidate. A Basic Darkness Energy with a verified earlier catalog printing can serve as an explicit proxy for the missing modern artwork under the project's native resolver rules. It does **not** change source player artwork, candidate quantities, attached Energy behavior, or settle whether this deck would be a legal paper tournament submission under a particular historical date.

The proposal's **actual next falsification** remains independent: under the common symmetric owner-visible policy, deal the unchanged 60 naturally against original ranks 1,2,5,6,11, ensure Arven actually selected on the legally eligible turn, Boost Shake paid and evolved Trubbish with Tool attached, Garbotoxin affected an opponent's consequential action, and opponent counterplay returned. Record failed setups, Prizes, attached Energy, lock interaction, actual original physical source deals, Engine acceptance vs paper legality and 25-minute match-clock handling. No ranking or strength promotion is justified by printing acceptance alone.

This narrow finding is independent of, and compatible with, the broader [35-row original artifact crosswalk and real 52-arm provenance](agent22-may2026-print-crosswalk-20261104.md).

**Disposition: FROZEN CANDIDATE PRINTING-NATIVE-READY; COMMON-POLICY GAME AND SEMANTICS UNVERIFIED.**
