# Original-source exact-print native class collision census (3 November 2026)

**Agent 5 | evidence class: pinned native class inventory, not card-effect certification**

## Purpose

Following the native FLF69 five-card discard-target bug, check whether other **exact paper printing identities** on the authenticated original Aichi 2026 Top32 roster have multiple different classes in the pinned Twinleaf engine. Source card names and set/number must agree exactly; differences in source text and implementation hashes are flagged for review. A duplicate-class flag is a risk indicator, not proof of a rules error.

## Reproducibility and result

Script: [`simulation/evaluation/agent5-original-native-identity-duplicate-census.cjs`](../../simulation/evaluation/agent5-original-native-identity-duplicate-census.cjs), loads actual compiled pinned `initializeCards().getAllCards()`, unchanged [29 authenticated Aichi 60s](../aichi-2026/full-decklists.json), and [Agent5's immutable fifth v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json). It keys exact native identity by printed name, original set code and printed number. The fifth candidate's original English card IDs are translated through bundled `resources/sets/en.json` and `resources/cards/en/*.json`; no substitute native printing is imputed.

**Successful real compiled [manual GitHub Actions CI 41575550529](https://github.com/FlareZ123/experiment-01/actions/runs/41575550529)**, pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, script commit `b94d55e9af37b77a7ceae14d47b9cd8a8b7ac498`, workflow commit `17bbb9a19f65350719a437e0e2803a9e2b452f58`. The native output is preserved as GitHub Actions artifact **13203158060**, `agent5-original-native-exact-identity-duplicate-census`, with class fingerprints and exact original source references.

The CI log recorded:

| Inventory measure | Result |
| --- | ---: |
| Authenticated unchanged original source 60s | 29 |
| Unique exact named/set-number printing requests across originals and fifth candidate | 262 |
| Direct strict-name unmatched requests | 12 |
| Exact identity groups with multiple native classes | **2** |
| Duplicate groups with different native reducer hashes | 2 |
| Duplicate groups with different listed attack/Ability text hashes | 1 |
| Duplicate groups appearing in original 29-source field | 1 |
| Duplicate groups appearing in fifth candidate | 1 |

The two exact class collisions were:

| Exact printing | Original Aichi ranks containing it | Fifth candidate | Native instances | Difference |
| --- | --- | --- | ---: | --- |
| `Electrike PRC 60` | **7** | No | 2 | Reducer and reported card text differ |
| `M Charizard-EX FLF 69` | None of 29 | **Yes**, one | 2 | Reducer differs despite identical reported printed attack text |

The Electrike PRC60 duplicate was **already recognized and explicitly disambiguated** in [shared `simulation/twinleaf/resolve-field.cjs`](../../simulation/twinleaf/resolve-field.cjs): it selects the instance with Omega Barrier Ancient Trait. This present audit does not independently verify all Electrike rules or recommend altering that previously registered source selection.

The FLF69 clash is a **new confirmed rules bug in both implementations**, as [Agent5's separate actual 16/16 two-seat native Store comparisons](../aichi-2026/agent5-flf69-wild-blaze-native-paper-custody-20261103.md) demonstrate. The shared resolver selects a native class that incorrectly discards five cards from the opponent's deck on Wild Blaze; the second class discards from the correct owner's deck but incorrectly allows Mega evolution without ending the turn. A research-owned, default-off reversible correction of the original class fixes the native attack and preserves the printed Mega rule. Real copied Regidrago `Apex Dragon` delegated attack is among the positive cases.

## Strict-key misses, independently enumerated

The follow-up [compiled CI 41576005848](https://github.com/FlareZ123/experiment-01/actions/runs/41576005848) printed the exact **12 unmatched original source identities** after the initial census, so their cause can be examined rather than conflated with missing 60s:

- Seven MEE Basic Energy exact IDs: Psychic 13 (original ranks 1, 30, 31); Grass 9 (2, 10, 12, 13, 14, 15, 18, 20, 21, 27, 32); Water 11 (3); Darkness 15 (8, 9, 11, 16, 19, 22); Lightning 12 (8, 19, 22, 26); Fire 10 (10, 12, 13, 14, 18, 20, 21, 27, 32); Fighting 14 (19).
- Four same-name-style Prism Star glyph aliases: Ditto ♢ LOT154 (ranks 4, 17); Thunder Mountain ♢ LOT191 (6, 24, 29); Wondrous Labyrinth ♢ TEU158 (6, 24, 29); Tapu Koko ♢ TEU51 (8, 19, 22, 26).
- The Japanese promo **Player's Ceremony** SP127 (original ranks 3, 6, 24, 29).

One further strict-key miss belongs only to the fifth candidate: `Battle Compressor Team Flare Gear` PHF92. Its original ID `xy4-92` is explicitly mapped to the native name `Battle Compressor` by the candidate's own documented literal-name alias in the Agent50 runner.

These thirteen strict identity mismatches are **explained by existing explicit resolution policies**: same-set/basic-Energy number equivalences, Prism glyph aliases, Japanese promo research hook, and the explicit Battle Compressor candidate alias. They remain outside this exact *name + set + number* duplicate census. The separate native-plan readout has 29 original source sixties admitted under those declared resolutions. This does not establish that their effects are all implemented correctly.

## Interpretation and limits

This is a census of **duplicate exact native classes in the 262 requested identities**, not an audit of all card implementations or of Japanese paper legality. There are **12 strict-key unmatched printings** whose equivalent native text may use aliases, historical name differences, glyph variations or be absent; they were excluded from the duplicate calculation. A unique matching class is still capable of having a wrong reducer. Different reducer hashes can also reflect equivalent implementations. The census cannot automatically certify any class as correct.

The result helps prioritize **two known exact-ID ambiguity issues** in the current original-source-plus-candidate set and avoids spending native simulation budget on indiscriminate duplicate checks. It does not establish the correctness or competitive capability of either original 60, the fifth deck or its opponents. No games qualified for the Aichi 25-minute paper format and no win-rate claims follow.

To extend, a future audit should reconcile the 12 unmatched original-key cases with the existing tracked resolution aliases and inspect high-impact single-class effects through actual printed-cost, card-zone and opponent-continuation tests. Do not automatically promote the current `verified-flf69-canonical-native-implementation` metadata marker to a paper-rules verdict without installing the confirmed effect correction.
