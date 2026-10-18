# Physical-card ownership diagnosis: Telepath from-deck attachment

**Agent 3, 18 October 2026 UTC.** Evidence class: direct pinned-engine Store regression with a reference-identity diagnostic. No source-dealt full match, qualified competitive win or win-rate inference.

## Question and invariant

The prior compiled [Telepath from-deck reproduction](telepath-attachment-source-confusion.md) showed that an Energy card selected from a deck by Solgaleo-GX's Sol Burst-GX could appear in a Pokémon's `energies.cards` while it remained in the deck. That source code uses `CardList.cards` for physical storage and `PokemonCardList.energies.cards` as an attachment index. A naive duplicate-reference check would incorrectly count the legitimate, mirrored energy index as a separate physical card.

The read-only [physical-card ledger](../../simulation/twinleaf/physical-card-ledger.cjs) therefore scans canonical Player storage: deck, hand, discard, Lost Zone, stadium, Supporter, Active card list, Benched card lists and Prize lists. It compares actual object references, retaining no card names/identifiers or secret card faces in its report. Independently, it checks each `energies.cards` index against the containing physical Pokémon slot and identifies repeated index references. It is a diagnostic for this pinned data model, not proof that every possible card-storage mechanism has been modeled.

## Compiled evidence

[Manual workflow 39081821001](https://github.com/FlareZ123/experiment-01/actions/runs/39081821001), head `1a869f05537d0798b5762b5d2ba61f39565278f4`, compiled Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and ran the new code.

- Five `node --test tests/physical-card-ledger.test.cjs` cases **passed (5/5)**, including canonical duplicate references, ghost indexed Energy, repeated secondary indexes, deliberate duplicate numeric IDs on distinct objects, and legitimate mirrored attachment references.
- The real Store source fixture [`telepath-nonhand-solburst-source.cjs`](../../simulation/twinleaf/telepath-nonhand-solburst-source.cjs) **passed** its two-seat raw negative assertions: the deck-origin Energy has one `energyWithoutPhysicalCard` index anomaly at the recipient Bench slot.
- The paired raw / opt-in-repair / hand-positive / restored-raw experiment [`telepath-source-origin-paired.cjs`](../../simulation/twinleaf/telepath-source-origin-paired.cjs) **passed** the augmented assertions: the opt-in correction has zero canonical double references and zero ghost Energy indexes in both seats. [Machine-readable paired artifact 12119735457](https://github.com/FlareZ123/experiment-01/actions/runs/39081821001/artifacts/12119735457).
- The full workflow **failed later, for a different existing Horror House / Volt Cyclone staged assertion** in `new-moon-native-horror-house-opponent-action.cjs:149`: it expected an Energy movement prompt, but its staged game did not offer one. This is a separate red gate. Therefore report the passing Telepath steps precisely and never label the entire run green.

## Limits and next falsification gate

This proves the detector identifies this one genuine defect without treating the normal secondary index as an extra card. The stage creates a legal attack-effect context but does not replay a naturally shuffled 60-card game, evolving Solgaleo through normal turns or qualifying opponent choices.

A high-value next test is to attach the read-only ledger at **actual root Store dispatch boundaries**, excluding speculative policy Simulator clones, across authentic fixed candidate versus Aichi ranks 9, 30 and 31 source-dealt games. A red result should preserve action ordinal, turn, zone locations and the frozen source seeds/engine/policy, with no hidden identities. A green result only means this checked invariant stayed intact on those trajectories. Independently check the effect-origin semantic condition, since a trigger can be wrong without violating card ownership.

**Source and empirical status remain unchanged:** 29/32 exact field lists, ranks 23/25/28 unknown; zero policy-qualified competitive games, no evidence for the 99.5% target.
