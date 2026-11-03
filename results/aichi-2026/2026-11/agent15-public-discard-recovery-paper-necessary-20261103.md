# Public discard-pile recovery Items: conservative source-wide necessary-condition gate

**Agent 15 | 3 November 2026 | source-printed card text and original-29 census, pure test and manual CI. No played native matches and no competitive-qualified games.**

## Decision question

An owner-only generic Trainer planner should not propose a recovery Item whose printed target does not exist in the player's actual publicly visible discard pile. But it must not incorrectly label a target absent merely because an incomplete native name+set identifier or missing card metadata prevents identification.

Existing source research has `agent5-generic-owner-trainer-opportunity.cjs`, a read-only held-copy and generic public-lock frontier, and `agent4-owner-paper-trainer-necessary-screen.cjs`, a separate five-family negative-certificate overlay. Agent35 independently registered [a VS Seeker-only public discard negative](../agent35-vs-seeker-public-discard-target-necessary-20261103.md). This investigation extends that question to **four additional source-used recovery Items**, with a shared ambiguity-preserving metadata loader and a composable necessary-condition overlay. It does not claim to replace Agent35's existing VS Seeker implementation or certify all Trainer card effects.

## Exact authenticated-source printings

The source is [`full-decklists.json`](../full-decklists.json): **29 original printed sixties**, with original ranks **23, 25 and 28** unavailable. Counting the `name + set` identifiers (not all alternate printings) gives:

| Held Item | English source card | Source physical copies | Original lists | Needed in owner's public discard |
| --- | --- | ---: | ---: | --- |
| VS Seeker PHF | `xy4-109` | 59 | 23 | Supporter card |
| Rescue Carrier EVS | `swsh7-154` | 17 | 5 | Pokémon with HP no more than 90 |
| Super Rod PAL | `sv2-188` | 11 | 11 | Pokémon or Basic Energy card |
| Night Stretcher ASC | `me2pt5-196` | 7 | 5 | Pokémon or Basic Energy card |
| Special Charge STS | `xy11-105` | 2 | 1 | Special Energy card |
| **Registered physical total** | | **96** | | |

The **37 non-VS-Seeker copies** represent additional source-item coverage beyond Agent35's existing isolated VS Seeker certificate. These counts are static deck inventories, not the denominator of legally payable owner-root actions. The printed text was checked directly from the bundled `resources/cards/en/*.json` cards: the “up to” recovery Items need at least one applicable target if the Item is to change game state; the specified two-Special-Energy operation uses the maximum available if fewer than two are present under the Advanced Player's Rulebook's general cardinality provision. In all cases **one** truly valid target is enough to avoid this *negative* certificate. This does not imply the play is strategically beneficial.

## New reusable paper-negative component

[`simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs`](../../../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs) provides a source-ID-registered target-family map, a tri-valued `targetMatch`, a public metadata index, `publicDiscardTargetNecessary` for a real detached owner-root hand index and owner-visible public discard pile, and `augmentPaperNecessityWithDiscardTargets` for combining with the existing necessity rows.

For each held registered Item, only a **complete, known negative** public discard census yields `paperPlayable:false`. A supported target gives `paperPlayable:null`, meaning *unknown remaining prerequisites*. Missing metadata or mixed printing variants also return **unknown** and block an unjustified no-target proof. The overlay preserves every older blocker, recomputes summary totals, adds no native action, makes no strategy decision, and never reads opponent concealed cards, deck order or face-down Prizes. Native Store acceptance, target selection, subsequent card custody, owner-turn quota, cost and opponent continuation remain independent questions.

**Source-printing information loss is consequential.** In the complete bundled English card pool, indexed on the actual native-style `name + ptcgoCode` key, there are **16,475** keys. **493** resolve to multiple nonidentical type/subtype/HP metadata records, and **38** have a Pokémon HP variant at or below 90 and another above 90. Example: `Bouffalant BLW` represents English `bw1-90` (90 HP) and `bw1-91` (100 HP). A public discard-pile string containing only `Bouffalant BLW` is insufficient to decide Rescue Carrier eligibility. The new index keeps both variants and labels the result unknown; an eventual paper-faithful owner observation should preserve exact public card identities (including collector number) when they genuinely differ. These totals are from the **whole** English convenience pool, which is not a paper Expanded legality list or a count of collisions present in the 29 original source lists.

## Reproduction and observed result

- Rule and ambiguity tests: [`tests/owner-public-discard-target-necessary.test.cjs`](../../../tests/owner-public-discard-target-necessary.test.cjs).
- Exact original source and printing audit: [`scripts/agent15-discard-target-source-census.cjs`](../../../scripts/agent15-discard-target-source-census.cjs) with [`tests/agent15-discard-target-source-census.test.cjs`](../../../tests/agent15-discard-target-source-census.test.cjs).
- **15/15 pure Node 22 tests passed** both locally on the supplied bundled English card pool and in the existing manual-only `aichi-card-audit.yml` Trainer-negative job. [Successful compiled workflow run 41741290663](https://github.com/FlareZ123/experiment-01/actions/runs/41741290663), branch main source SHA `10bfaba4d5cf1b124ffeb20975e4bfa12b591459`, job `agent35-trainer-negative-gate`, artifact **13280954556**, archived ZIP digest `ced441b0b41a21bb903b763434f4a6aeba559e6dd30cf33696172dc4698ce2bc`. It contains the older Agent35 audit and this new source/metadata JSON. No submodule checkout, Twinleaf compilation, native match simulation or push-triggered CI was added.

### Limitations and integration handoff

This is a **necessary-condition filter**, so it cannot certify paper-positive plays. The shared paper-necessity owner-root observer has **not** selected this overlay in a frozen bilateral policy; the standalone tests and manual census therefore do not demonstrate a change in decisions, player attack sequences, or game outcomes. Existing Agent35 VS Seeker native-class indexing and this source-metadata index have different provenance boundaries and require explicit reconciliation before a merged release.

The most useful next native integration is to add these five statuses as an owner-only opt-in read-only annotation to the common rank-5/rank-11 two-seat decision frontier, preserving prior five-family blockers, real source physical deals, repeat hand indices, offered and unoffered native choices, prompt/custody outcomes and competing resource priorities. Observe both cases where the old bot attempts a proven-empty target and where it misses a real legally payable, consequential target. Test printed-discard target restoration after card effects, not just static names. Reject any policy gain measured only as increased card-play count without restored attack/control outcomes and an opposing continuation.

**Shared goal status:** 29/32 authenticated originals, **zero qualified competitive games**, no selected fixed 60, and no demonstrated 99.5% field win rate.
