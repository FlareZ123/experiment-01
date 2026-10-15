This folder is meant to provide resources about the Pokemon TCG. You may add more, and you may have copies of some materials here in your local shell.

## Card-data scope

`resources/cards/en/` is the bundled English-language card snapshot. It should not be treated as a complete card pool for Japanese Expanded tournaments.

The Aichi list audit in `results/expanded_region_cardpool_boundary/` demonstrates two relevant boundaries:

- decklist display names may need explicit aliases to local database names;
- Japanese-only promotional cards can be legal in Expanded (JP) while absent from the English snapshot.

Research that depends on legality or card availability should therefore carry the intended regional card-pool scope explicitly.
