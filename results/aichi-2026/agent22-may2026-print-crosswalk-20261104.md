# Agent 22: source-preserving Aichi May 2026 Basic Energy printing crosswalk

**4 November 2026 | source-provenance research, no game-performance claim**

## Why this is necessary

The benchmark [full-decklists.json](full-decklists.json) records 29 Aichi Open League 2026 Top 32 **name/count** inventories with exactly 60 cards. It is pinned to Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The underlying event was **10 May 2026**. As [Agent17 documented](agent17-postevent-basic-energy-printings-20261104.md), the archive contains **120 copies in 35 rows across 22 ranks** marked as MEE 009–016 artwork, introduced with the Pokémon TCG 30th Celebration release on **16 September 2026**. Those cannot authenticate the actual artwork used in the May event. The archive may still preserve the correct card names and counts.

Evidence: [event listing](https://limitlesstcg.com/tournaments/566/decklists), [official 30th Celebration launch](https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc), [MEE Basic Energy print family](https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)). No original registration photos authenticating the physical Energy artwork have been found for these rows.

## Frozen separate representation

- [35-row crosswalk JSON](original-source-art-crosswalk-v1.json): each offending original rank, player, category, card name/count, transcribed artwork set/number/language, explicit historical-art `unknown`, documented **pre-event representative** set/number/language, and `engineSupportedEquivalent: "not-tested"`. Source-of-truth original JSON is unchanged.
- [Executable transformation and audit](../../simulation/evaluation/agent22-aichi-source-print-crosswalk.cjs): checks event date, source Git blob, 60 cards/rank, Basic Energy printed type and number, and computes a composition-only digest. It returns a **separate derived roster** and proves equality of its source and derived name/count multisets. It neither mutates the original roster nor supplies an engine deck on its own.
- [Standalone tests](../../tests/agent22-aichi-source-print-crosswalk.test.cjs): fixed source identity, comparison to Agent17's independent 120-copy audit, synthetic eight-type table, immutable transform, failure on wrong Energy type or non-60 list, input-order invariance and byte-for-byte semantic equality of the committed crosswalk entries.
- [Existing manual card-audit workflow](../../.github/workflows/aichi-card-audit.yml) exercises both Agent17's chronology unit tests and this independent crosswalk suite, and prints a compact crosswalk digest. No per-commit workflow was introduced.

The provisional representation maps **MEE 009–016 to MEE 001–008** respectively, holding each Energy type and copy count fixed. Each earlier MEE number refers to a **representative** printing available before the event. These numbers **do not prove which Energy art any competitor actually owned**, and the generated roster is **not selected as a new original input to any frozen benchmark**.

## Validation and CI provenance

The original source Git blob, total 29 source ranks, 35 affected rows, 120 copies and 22 affected ranks are independently checked by the new tests. [Manual card-audit CI 41752605558](https://github.com/FlareZ123/experiment-01/actions/runs/41752605558) at commit `ab4f4d8` passed the new step. After committing the full JSON mapping and its exact-data regression, [manual CI 41753008383](https://github.com/FlareZ123/experiment-01/actions/runs/41753008383) at `13cbbe8` again passed the source-print test step. Both *overall workflows failed* at the unrelated pre-existing step **"Verify exact owner-hand Trainer discard contention without native games"**. The successful source-print steps are the only claimed green result; the unrelated failures remain visible.

The original resolver [resolve-field.cjs](../../simulation/twinleaf/resolve-field.cjs) already supports **explicitly opt-in same-set Basic Energy aliasing** and records each applied `same-set-basic-energy-number-mismatch` with source printing and resolved native ID. [Agent49's pinned native-print census](../../simulation/evaluation/agent49-pinned-source-print-census.cjs) further audits native IDs. The proposed source crosswalk must be reconciled to those **actual runtime substitutions** before any claim of a specific pinned engine ID or effect equivalence. A native census has been dispatched separately; runtime result and outcome must be recorded before promoting `engineSupportedEquivalent` status.

## Admission boundaries and next integration

Keep four independent fields in every prospective original-source match receipt:

1. `composition_match`: original name/count 60 against the declared research-derived and native deck inventory;
2. `historical_print_match`: `unknown` unless external dated physical evidence exists;
3. `engine_proxy_map`: exact original printing, explicit desired representative, and **observed** resolved native ID from the pinned deck resolver, with an independent semantic status;
4. `native_physical_deal_match`: measured same-deal comparison from the actual game Store and setup transcript, never inferred from the random seed.

An **original archived printing hash can be reproducible while the artwork annotation is impossible for that tournament date**. Every field-level comparison should preserve both the unchanged source SHA and the crosswalk revision. Historical frozen releases must remain unchanged and retain their documented limitations.

**Outstanding:** 3 of the Top 32 source 60s (ranks 23, 25, 28), independent native proxy validation, a common actually selected two-seat policy, paper-legal decision/payment audits and official-clock games. This work produced **zero competitive games**, changes **no fixed candidate deck**, and supplies **no evidence for 99.5%**.

**Agent 22**, normal invocation begun 2026-11-04T01:07:44.604Z.
