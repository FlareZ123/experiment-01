# Source Aichi-29 exact Trainer/Energy aliases: scoped native construction bridge

**Agent50 | 10 November 2026 | paper-identity development, not competitive evidence.**

## Concrete obstacle and implemented repair

The existing source-29 native printing census identified 146 distinct registered original Trainer/Energy printings: 136 exact native printed identities, nine of them under a different indexed `fullName`, and ten identities with no exact native entry. Previously the reversible `withOriginal29PrintedFidelity` bridge resolved only the 11 original Pokémon aliases, so genuine source lists invoking the printed Trainer/Energy requests still failed exact native lookup.

**Committed repair:** `simulation/twinleaf/agent50-original29-printed-fidelity-hook.cjs` v2 now indexes every card category appearing in the **29 authenticated original source sixties**, preserving every collector number if names/sets recur. When the ordinary `CardManager.getCardByName` fails, and only for a registered source request, it searches the pinned manager for one unique exact `name` + `set` + normalized `setNumber` native class, then asks the unmodified native method for its clone under the real indexed name. Ambiguous and missing matches remain unresolved. Existing Pokémon printed-attack corrections and the descriptor-restoring `finally` are unchanged. The feature remains opt-in through the already existing `actorOriginal29PrintedFidelity` development flag.

The nine previously inaccessible source identities are **Lillie's Determination MEG; Special Red Card CRI; Sidney FST; Grand Tree SCR; Pokémon Communication TEU; Telepathic Psychic Energy POR; Professor's Letter BKT; Pokémon Ranger STS; Wondrous Patch PFL**. They occupy **51 physical card copies across 25 of the 29 known source decks**, counted directly from the authenticated `full-decklists.json` inventory.

## Exact validation boundary

- `tests/agent50-original29-printed-fidelity-hook.test.cjs`: Trainer and Energy aliases on an injected manager, non-source request negative, still-unimplemented source request negative, duplicate printed native identity veto, normal and exception descriptor restoration.
- `tests/agent50-original29-printed-fidelity-hook.native.test.cjs`: reuses the pinned native census to require all nine actual aliases resolve as genuine clones with exact original `name/set/number`, plus post-scope lookup restoration; the previous 11 Pokémon alias and two-seat damage/KO/Prize tests remain.
- Existing **manual-only** workflow `.github/workflows/agent50-electrode-crashburn-native.yml`, [native CI 42727583774](https://github.com/FlareZ123/experiment-01/actions/runs/42727583774). No new per-commit job or extra broad field campaign. The first complete native workflow **passed** at commit `5a9e05132efffeef58106451d7bc5afbd8d1297b`; a new two-seat actual Store POR88 Energy-attachment test has since been added and is undergoing the same manual workflow.

The ten missing exact non-Pokémon printed identities (seven distinct Basic Energy MEE printings, Player's Ceremony SP127, Thunder Mountain Prism Star LOT191 and Wondrous Labyrinth Prism Star TEU158) remain untouched. This is an exact registered-source **construction bridge**; it does not establish the paper legality of a deck, correct all conditional effects, certify any game, or demonstrate a field win rate. The source field remains 29/32 confirmed originals; ranks 23, 25 and 28 are unavailable. The 99.5% target remains unevidenced and no single final deck is selected.

The seven original MEE Energy identities account for 120 physical source Energy copies across 22 ranks. The existing native engine can instantiate some Energy types under the MEE name despite their collector-number mismatch; a missing **exact print** does not imply the Energy is mechanically absent. This correction supersedes the earlier 8-of-10 shorthand in the original print census report.\n\n## Reproduction and next use

Enable the existing optional native printed-fidelity hook only in a new preregistered original 60-versus-fixed 60 game. Preserve the uncorrected control, native first accepted action divergence, actual printed payment, full physical cards, original opponent response, and native winner. Compare under one common policy; the alias bridge is opt-in until a prospective native game and independent paper acceptance demonstrate meaningful behavior.
