# Agent 4: original native Store, two-seat identical-root Plumeria versus Team Flare Grunt choices

**31 October 2026 | pinned Twinleaf \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\` | staged legal card effects**

## Concrete gap closed

The earlier [costed Plumeria menu](agent4-plumeria-payment-menu-owner-root-20261031.md) and [printed two-Supporter comparison](agent4-source-thorns-plumeria-flare-choices-20261031.md) identified different cost and target choices at a detached acting-player root. Their structural offers were intentionally not native Store proof.

Two new tests were added to the existing [compiled pinned original Store fixture](../../tests/agent4-plumeria-pinned-native.test.cjs) and executed in the **existing** manually dispatched [CI 41161610475](https://github.com/FlareZ123/experiment-01/actions/runs/41161610475), at exact head \`0c11b4f5bed6f74ecebdade32a812aeff707a7c6\`. Its \`Verify both native Plumeria physical seats on pinned Store\` step completed **success** for all tests. Both physical seats 0 and 1 are required for each tested alternative. No new CI workflow was created.

## Same attached Active Energy, distinct actual resources consumed

For each seat, create **two separate original Store instances from exactly the same staged owner observation**. The same owner has an Active Bunnelby, hand \`[Plumeria BUS, Psychic Energy SVE, Psychic Energy SVE, Team Flare Grunt XY]\`, an unspent Supporter quota, and the opponent has Active Bunnelby with one physically attached Psychic Energy SVE. Independent roots share the same full deeply detached \`actorObservation\`, asserted by full structural equality. Both selected Supporters return true from their actual card \`canPlay\` method.

- **Plumeria branch:** original native \`PlayCardAction\`, its authentic two-card hand-payment prompt (both physical Psychic Energies), opposing Pokémon choice prompt (Active), and attached Energy choice prompt all settle. The original two discarded owner hand Energies enter owner discard. Opponent's original attached Psychic enters opponent discard. Owner still holds Team Flare Grunt.
- **Team Flare Grunt branch:** original native \`PlayCardAction\` selects its held physical Supporter instead. Its original target prompt is resolved when needed. The *same opponent Active Energy instance* is discarded with no two-card owner payment. Owner retains Plumeria and both Psychic Energies.

Both variants have the same opponent discarded Energy printed output, as independently checked by native discard-zone printings. The original acting Supporter card consumed differs, and subsequent owner-hand card availability differs. The comparison does **not** assert Team Flare strategically dominates Plumeria, because their future Supporter-card values, possible discard benefits, Bench reach, and follow-through may differ. The experiments stop after native effects.

The detached owner menu correctly predicted **three** possible Plumeria payment pairs, including **two that discard the Team Flare card itself** and **one preserving it**. The two outcomes demonstrate why same-target graph connectivity without resource costs does not distinguish real next root states.

## Reach difference: opposing Bench Energy

A separate both-seat original Store fixture also keeps the original opposing Active Psychic attached while staging a physically attached second Psychic on opposing Benched Bunnelby. Detached comparison predicts **one shared Active Energy target** and **one Bench target exclusive to Plumeria's printed reach**. Original Plumeria executes its two-card payment and valid original \`ChoosePokemonPrompt\` for the Bench, followed by actual \`ChooseCardsPrompt\` for the Benched Energy. Its physical Energy leaves the opponent's Bench for their discard, while the original Active Psychic stays attached. The Team Flare option's public legal target menu remains Active-only.

This independently validates Plumeria's Bench reach in the actual compiled Store, beyond the printed text interpretation. It does not produce a complete paired native Team Flare Bench-denial action, which printed Team Flare does not provide.

## Qualification boundaries and next gate

The native fixtures are **staged**, **do not contain two authenticated complete original 60-card decks**, are not naturally dealt opening hands, and do not advance to an opponent's real subsequent turn. The comparison is exact at the detached acting-root input and real native physical item/effect outputs. It is a verified *local action-level counterfactual*, **not** a source-rank6 full-game policy comparison, a competitive-valid win, or a fixed-deck advantage.

Next test: on an authenticated original rank-6 or rank-24 source-root state from a source-conserved original deal, capture both held Supporters and attached opposing Energy, confirm same-root native eligibility, fork original Store action+prompt lines with physical hand choices, and retain later opponent reply with every rejected/absent alternate. If a naturally encountered positive root does not exist in the preregistered sample, record that negative denominator instead of staging a success. The common chooser steward (Agent 41) can treat these models as read-only grouped payment/target offers until its owner-safe native action dispatcher supports their complete cost.

**Global field decision remains 29/32 exact opponents, zero competitively qualified games, no demonstrated 99.5%.**
