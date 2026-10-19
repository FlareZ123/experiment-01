# Perfection source family is case-sensitive: New Moon v1 donor-inventory screen

**Agent 34, 19 October 2026.** Evidence class: deterministic printed-card lookup and tested unit regressions. **No headless combat, opponent behavior, or competitive win-rate evidence.**

## Actual classification error and fix

The printed [Mewtwo & Mew-GX UNM 71](../../resources/cards/en/sm11.json) Perfection Ability specifies attacks from **Pokémon-GX or Pokémon-EX** in the player's Bench or discard. The provided English card database preserves the relevant *case distinction*: Pokémon-GX has subtype `GX`, old Pokémon-EX has subtype `EX`, and modern Pokémon ex has subtype **`ex`**. Modern `ex` is a different mechanic and is not eligible merely because its subtype uppercases to `EX`.

The former [fixed-field donor scanner](../../scripts/aichi-copy-donor-name-collision-screen.cjs) uppercased **every** subtype before testing eligibility for Perfection. Thus an unrelated modern `ex` attack could have been misclassified as a Perfection donor and caused a spurious donor-name collision report. **The same scanner also handles Apex Dragon; the nine previously reported Aichi lists all used Regidrago, so their zero-collision empirical result is not reversed by this fix.** That earlier screen found no source Perfection list at all among 29 existing fixed source 60s.

The old scanner now compares the original `GX` and `EX` subtypes without converting case. The new [candidate Perfection donor screen](../../scripts/aichi-perfection-copy-donor-screen.cjs) makes the eligibility rule explicit and fails if a declared candidate English printing cannot be resolved by exact ID and name.

## Source-locked New Moon v1 English-mechanics candidate

Input: the fixed [New Moon Lockbreaker English proxy 60](../als/new-moon-lockbreak-english-proxy-60.json), resolved by exact IDs in [the English card database](../../resources/cards/en/).

| Eligible Pokémon-GX or Pokémon-EX printing | Copies | Printed attacks |
| --- | ---: | --- |
| Mewtwo & Mew-GX, UNM 71 (`sm11-71`) | 2 | Miraculous Duo-GX |
| Gengar & Mimikyu-GX, TEU 53 (`sm9-53`) | 1 | Poltergeist; Horror House-GX |
| Trevenant & Dusknoir-GX, SM promo 217 (`smp-SM217`) | 1 | Night Watch; Pale Moon-GX |
| Tapu Lele-GX, GRI 60 (`sm2-60`) | 1 | Energy Drive; Tapu Cure-GX |

**Total potential eligible source inventory: 4 unique printed Pokémon and 5 physical copies, with 7 distinct printed attack names and zero different-text, same-name eligible donor collisions.** Mewtwo & Mew-GX's Miraculous Duo-GX is also its native attack, but another copy on the Bench or in the discard pile can supply that printed identity. Counting it does not imply a separate useful copying line.

**Pinned-engine source cross-check:** Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts`, filters possible copied-attack Pokémon with `CardTag.POKEMON_EX` or `CardTag.POKEMON_GX`. In its pinned `card-types.ts`, these tags equal uppercase `EX`/`GX`, whereas the distinct modern tag is `POKEMON_ex = 'ex'`. This means **the pinned Perfection source-selection filter itself appears correct on EX/ex categorization**. It separately omits `MewtwoMewGX` from discard-source `extraCards`, although the copycat already has Miraculous Duo-GX natively and can use it as its own attack. This is a source-code observation, not a compiled live-store correctness certification. The research scanner's old case-folding bug was therefore a **research-data classification defect**, with no evidence that this same defect exists in the pinned game engine.

The candidate also contains **three modern Pokémon ex printings**, one copy each, which must **not** be counted as Perfection donor printings:

- Latias ex SSP 76 (`sv8-76`), Eon Blade
- Lillie's Clefairy ex JTG 56 (`sv9-56`), Full Moon Rondo
- Squawkabilly ex PAL 169 (`sv2-169`), Motivate

These three printed attacks are outside Perfection's printed source class even if they are on the Bench or in the discard pile. They remain cards with their own effects and roles in the 60; this classification says nothing about their overall strategic value.

## Regression and reproducibility

- [Case-sensitive scanner and full candidate census](../../scripts/aichi-perfection-copy-donor-screen.cjs)
- [Five unit tests](../../tests/aichi-perfection-copy-donor-screen.test.cjs): old uppercase EX, TAG TEAM GX, modern lowercase ex, adversarial same-name collision cases, fail-closed printing/60 checks, and the frozen candidate's count/attack inventory
- Local Node.js tests: **5/5 passed** using a temporary minimal candidate fixture containing the exact 19 Pokémon copies and the provided set-card JSON resources. All 60 cards were separately counted using the **actual** repository manifest, and all 14 candidate Pokémon printing IDs/names were resolved against the complete repository card JSON, confirming **5 eligible physical copies, 7 printed attacks and zero same-name collisions**. This direct source check is separate from running compiled GitHub Actions. A dedicated GitHub Actions test run is not claimed.
- Both tests and the scanner require the existing source manifest and card JSON during normal repository execution. For source and tests, use Node.js from the repository root under the existing manual-only test workflow; do not add per-commit workflow execution.

## What this result excludes and what it does not

This inventory screen eliminates one specific potential name-alias failure **for the currently frozen New Moon proxy**, assuming the exact English printing mapping and card texts. It does not show that those attacks can actually be used through Perfection in a live legal board state. It does not validate Energy or GX-use costs, Ability lock interactions, the pinned simulator's own EX/ex handling, the earlier reproduced copied-attack identity bug on *other* card combinations, the Japanese paper printing audit, strong opposing play, the 25-minute tournament clock, or the performance of either fixed candidate.

**Research priority:** Do not consume the bilateral v2 integration budget on *this specific same-name donor conflict* without new real source-game evidence. Prioritize closing legal prompt decisions, actual source pressure, candidate reply, source continuation, hidden-information-safe policy, and paper-clock gaps. Keep the general copied-attack identity hook opt-in for future decks with real different-text collisions.

**Benchmark remains 29/32 published opponent 60s and zero qualified competitive games; no evidence here supports 99.5%.**
