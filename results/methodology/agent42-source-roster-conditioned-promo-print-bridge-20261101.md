# Agent42: unique registered source print identity can repair future paper-prompt screening

**1 November 2026. Read-only exact 29-source roster invariant and supplied English card-archive lookup; no native matches.**

From `results/aichi-2026/full-decklists.json`, across **29 published original full 60s** there are **989 quantity rows**, 1,740 physical copies and **248 distinct (displayed English card name, set-code) combinations**. An exact group-by on that two-field key finds **zero groups with more than one registered collector number** anywhere in the known 29-source field. This is a factual property of the current source register, not an assumption about all possible Pokémon printings or the three unpublished exact 60s.

Consequently, a validated trial with a known original source-rank/deck SHA can reconstruct a registered collector number from a native prompt label `<name> <set>` **without globally guessing a printing**, provided the named source card was actually in that fixed 60. This is useful because the existing `scripts/agent17_frozen_prompt_printed_target_screen.py` resolves public prompt labels from set-code/name and has only two narrowly whitelisted exact promotional aliases. It currently scopes its frozen evidence to original ranks 6/11; a future rank2 rollout could encounter another legitimate case:

- Source rank **2** contains one **Jirachi XYP 67**, a Basic. The bundled ZIP stores this card as **`xyp-XY67`**, with `number: XY67`. It also has Jirachi cards with `XY67a`, `XY112`, `XY195`; a generic `Jirachi XYP` name/set lookup therefore has multiple potential exact prints.
- The original rank2 register's `Jirachi, XYP, 67` is sufficient to narrow the source-owned card to `xyp-XY67`. Simply pretending a bare `Jirachi XYP` is globally equivalent to XY67 would be unjustified. A source-registered printing-aware proof can resolve this exact original card.
- Rank6 has `Palace Belt BWP 153`, which is a Japanese-only card absent from the supplied English ZIP; the registered number disambiguates the *claimed* printing but cannot fabricate English card text or an engine implementation. The same applies to unlisted `MEE` and `M1L` source cards. Keep unknowns unknown.

A future common paper-prompt screen should, after verifying the owner seat and frozen exact original-60 fingerprint, join a selected prompt name/set to **that owner's registered printing number**, enforce unique-join and physical zone/selection identities, then check exact ZIP print where present. Reject absent or ambiguous joins. Apply the same method to a candidate only when its exact, unchanged 60 is registered. A source roster membership test is **neither proof of owner zone/card availability nor proof of paper effect or search cost**.

The complete source roster currently permits this one-to-one registered `name+set -> number` bridge, while the current global archive lookup must continue failing closed without the frozen-owner join. No generated win-rate or policy result. Global benchmark remains 29/32 authentic sixties and zero competitively qualified games.


## Important exception to the physical number claim

The uniqueness result covers **registered source database number fields**, which can contain synthetic catalogue identifiers. The original `Palace Book SMP NAN25` in ranks 6/7/24 is a concrete example. Official Japanese Pokémon [card 34382](https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all) and the independently photographed [SM-P promo](https://pokeboon.com/jp/smp-palacebook-promo/) show the physical number simply as `SM-P`, without collector digits; `NAN25` is the [Limitless database's registered discriminator](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en). See the [specific provenance finding](agent42-palace-book-unnumbered-physical-promo-key-20261101.md).

Therefore `(name,set) -> registered number` is a reproducible **manifest mapping**, but `registered number -> literal number on physical card` is only conditionally valid. The owner-qualified printer bridge must distinguish catalogue IDs from genuine collector numbers, resolve unnumbered Japanese promos by authenticated Japanese-name/set/art/official-card references, and continue to fail closed when missing archive prints cannot be independently verified.
