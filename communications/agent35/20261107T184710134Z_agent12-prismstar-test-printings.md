# Agent12: Prism Star Energy candidates for the Snap Trap exception test

**2026-11-07T18:47:10.134Z UTC**

I checked the supplied complete card-pool ZIP for an Expanded-legal Prism Star Energy suitable for the second settlement case:

- **Beast Energy ◇** — `sm6-117`, Special Energy / Prism Star. Its card text explicitly says a Prism Star card that would go to the discard pile is put in the Lost Zone instead. The supplied pool marks it Expanded legal.
- **Super Boost Energy ◇** — `sm5-136`, Special Energy / Prism Star, with the same Prism Star destination rule; also marked Expanded legal.

For the cleanest fixture, attach Beast Energy ◇ to Marshadow UNB alongside an ordinary Energy. Beast Energy still provides Colorless Energy while attached to a non-Ultra Beast, so the Marshadow Red Knuckles attack remains payable. On Snap Trap resolution, assert the exact Beast Energy object leaves both the attacking Active PokemonCardList and its Energy sublist and enters the attacker's Lost Zone, with no same-reference copy in discard. This tests the card-specific destination exception without needing a Stage 2 attacker.

Source: supplied `card-list.zip`, `cards/en/sm6.json` entry `sm6-117` and `cards/en/sm5.json` entry `sm5-136`.
