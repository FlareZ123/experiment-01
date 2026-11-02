# Source-informed Klefki lock exposure across 29 authenticated Aichi originals

**Agent 43 | 2 November 2026 | deterministic decklist census, not a matchup simulation**

## Research question

The [rank-25 Alolan Raichu player's first-person report](agent43-rank25-kume-primary-strategy-scout-20261102.md) describes an intentional **going-first Active Klefki** line to suppress Regidrago's Basic Pokémon utility Abilities, especially **Latias ex / Skyliner** and **Tapu Lele-GX / Wonder Tag**. How widely are those physical utility cards represented among exact surviving authenticated 2026 Top-32 opponent 60s?

This census measures card-in-deck exposure, **not live lock effectiveness or the frequency of a playable starting Klefki**.

## Source pin and card-text verification

- Input: committed [29 exact published original 60s](full-decklists.json), blob SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`, `decks[].rank`, `decks[].archetype`, and `decks[].cards[].name/count`. Confirmed all **29** records contain exactly **60** counted cards. Omitted final ranks **23, 25, 28** entirely; no imputation.
- Supplied offline card ZIP, `cards/en/sv1.json`, **Klefki sv1-96**: Basic Pokémon; **Mischievous Lock** removes Abilities from Basic Pokémon in play on both sides while Klefki is Active, with its own named exception.
- `Latias ex sv8-76`: Basic Pokémon, **Skyliner** removes your Basic Pokémon's Retreat Costs.
- `Tapu Lele-GX sm2-60`: Basic Pokémon, **Wonder Tag** searches for a Supporter when you *play it from hand to Bench*. Existing resolved searches are not undone by an ensuing lock.
- `Dedenne-GX sm10-57`, `Crobat V swsh3-104`, and `Squawkabilly ex sv2-169` are Basic Pokémon with **Dedechange**, **Dark Asset**, and **Squawk and Seize**, respectively. The first two are on-Bench entry draw effects, while Squawk is a once-first-turn activated draw effect. Each can lose access under Active Klefki in the absence of another overriding effect.
- An Ability lock can itself be removed by interactions such as more general lock effects or a switch away from Klefki. No such game-state analysis was performed here.

## Exact deck-level count results

The deterministic aggregation matches case-sensitive `cards[].name` and sums quantities, with each original 60 counted only once per union.

| Printed Basic Ability carrier | Decks containing one or more, of 29 | Physical copies in the 29 originals |
| --- | ---: | ---: |
| Latias ex | **14** | 14 |
| Tapu Lele-GX | **18** | 20 |
| Dedenne-GX | **18** | 22 |
| Crobat V | **13** | 15 |
| Squawkabilly ex | **16** | 17 |
| **Union: Latias ex OR Tapu Lele-GX** | **18** | 34 copies across those decks |
| **Union: any of the five** | **22** | 88 copies across those decks |

The **18/29** first union is rank-based, not a sum of individual deck-presence counts. The 22 distinct ranks with at least one of the five are:
`1, 4, 5, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 26, 27, 30, 31, 32`.

The seven with **none of these five named cards** are ranks `2, 3, 6, 7, 15, 24, 29`, with archetypes Vileplume Control, Snorlax Stall (two), Iron Thorns (three), and Lopunny Vileplume. **This does not mean those decks lack other Basic Pokémon Abilities**; five explicit targets were counted, and other abilities/lines may matter.

### Regidrago subfield

All **nine authenticated original Regidrago 60s** (ranks `10,12,13,14,18,20,21,27,32`) contain **both** `Latias ex` and `Tapu Lele-GX`. They carry **nine** Latias and **ten** Lele physical copies. Thus the exact Kume-named opposing deck-inclusion pattern occurs in **9/9 known Regidrago originals**. Final ranks 23 and 28 are also reported as Regidrago but remain unauthenticated and **are excluded**.

This confirms the *relevance of the choice of target* in the player's explanation, conditional on the reported Regidrago opponent opening. It provides no probability that Klefki will successfully be Active before a particular Wonder Tag resolves, nor a game-win percentage.

### Symmetric self-lock counterpressure

The **rank-4 Raichu Electrode Combo original 60** contains **one Tapu Lele-GX, two Dedenne-GX, two Crobat V, one Squawkabilly ex** (six copies across these five names). The different **rank-17 Raichu Electrode Combo** contains two Squawkabilly ex copies and none of the other four. These are *distinct confirmed original lists*. Their own Basic Ability access could also be reduced while their own Klefki is Active, if they ran and opened it. Nothing in these counts establishes the **unpublished rank-25 Alolan Raichu** list's support Pokémon or validates importing Klefki into either published list.

## Reproduction procedure

Read the fixed `full-decklists.json` blob, reject any deck with a non-60 sum or duplicate rank, and for each of the five exact strings above compute `sum(count)` for matching cards and count each deck when its sum is positive. Compute the two unions using set membership by rank; filter `archetype === 'Regidrago'` for the nine-deck subgroup, then require both named carriers to be present. The row data and all totals were computed directly over that JSON via a JavaScript tool execution, with no Monte Carlo, independence, estimated metagame share, or extra inferred list.

## Consequential test design

A future original-source rank-25 opponent driver, after its exact registered 60 is recovered, should preserve a **going-first Active Klefki** choice when supported by the actual setup prompt, select its legal owner-only setup hand, and observe:
1. Klefki's genuinely active (or nullified) printed lock on the running game state;
2. whether opposing Bench-play `Wonder Tag`, `Dedechange`, and `Dark Asset` are natively suppressed or incorrectly still used;
3. whether `Skyliner` actually changes a meaningful public Retreat/positioning line;
4. whether own-side Basic utility access is also lost;
5. whether a competent opponent can change the lock posture by switching, gusting, or turning off Klefki, with a meaningful opposing continuation.

The tests require original-store physical receipts, effective Ability status, accepted root/prompt/effect, player-private information discipline, and both actual starting seats, as specified by the [central action-chain release gate](../../communications/broadcast/20261101T2242Z_critic_end_to_end_action_fidelity_gate.md). The five-card count is a screening tool, not itself an executable replacement for a rank-25 opponent list.

**Status unaffected:** 29/32 exact originals; no competitively qualified games, no certified fixed 60, and no demonstrated 99.5% performance.
