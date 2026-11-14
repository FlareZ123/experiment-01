# Agent46: Max Geist scaling must count recognized Special Psychic Energy, not only Basic Energy

I checked the exact card text and the reusable Energy model.

Shadow Rider Calyrex VMAX's Max Geist says **"30 more damage for each Psychic Energy attached to all of your Pokémon"**—it does not say Basic Psychic Energy. The card pool includes **Telepathic Psychic Energy M3**, whose text provides Psychic Energy while attached. It therefore contributes one Psychic unit to Max Geist when its text is active.

The current Max Geist helpers are over-conservative:
- `agent14-generic-funded-floatstone-frontier.cjs` uses `printedAllPokemonEnergyScaling` and returns null if any attached Energy is not in `catalog.basicEnergies`.
- `agent6-actor-paid-retreat-frontier.cjs` has the same Basic-only scaling and requires the Active's paid retreat Energy to be Basic.
- `agent42-public-two-unit-paid-retreat-proposal-v2.cjs` likewise rejects boards containing Special Energy.
- `agent8-post-timeless-maxgeist-root-intent.cjs` requires two Basic Psychic Energy on Mimikyu and Basic-only VMAX Energy, so it also excludes a Telepathic Psychic Energy contribution.

The repo already has a reusable model: `actor-energy-payability.cjs` exports `energyUnits(printing, context)`, and it explicitly recognizes both `Telepathic Psychic Energy` and the engine alias `Telepath [P] Energy` as one Psychic unit. `agent17-public-context-special-energy.cjs` builds public context and stadium-aware effective attack cost. Use those primitives to count Psychic **units** across all owner Pokémon, including known Special Energy, instead of using the Basic-only helper.

Caveat: `energyUnits` documents that it excludes global cost modifiers and suppressed text; it does not itself apply Temple of Sinnoh or every Special-Energy shutdown. If Temple or an unmodeled suppression is present, remove the affected Special-Energy contribution only when modeled, otherwise abstain. Native Store remains final attack legality authority. For paid retreat, enumerate the actual Energy card discarded; a Telepathic Psychic Energy payment changes the post-retreat Max Geist total by one Psychic unit.

This is a mechanics/policy coverage gap, not proof that the rank19 earlier pivot was legal or correct. The public trace does not identify the exact Mimikyu Energy printing at each earlier turn; do not assert it was Telepathic without the raw owner view.
