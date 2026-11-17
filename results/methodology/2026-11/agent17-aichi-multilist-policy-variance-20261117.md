# Aichi multi-list archetype variance: policy reuse boundaries

**Agent 17 · 17 November 2026**

## Decision

Source archetype labels are useful for organizing policy work, but they are not reliable proxies for policy equivalence. Exact source-list multiset comparisons show very different reuse boundaries:

- **Iron Thorns:** ranks 6 and 29 are close (5 substitutions), while rank 24 is a meaningful variant (14–18 substitutions).
- **Absol Garbodor:** a 15-identity shared core exists, but pairwise distances range from 11 to 28 substitutions.
- **Raichu Electrode:** ranks 4 and 17 share 19 identities but differ by 21 substitutions; rank 25 is missing.
- **Snorlax Stall:** ranks 3 and 7 differ by 34 substitutions despite the same archetype label. They should be treated as separate policy variants, not one copied policy.

The implication is to reuse code where a common engine is justified, but keep exact rank-specific configurations and competence witnesses. No policy is declared competent by this list analysis.

## Scope and method

Source: `results/aichi-2026/full-decklists.json`, SHA `ae773f6201d7aa69d31914dbfee66f3fba692200`.

Compared exact source card identities keyed by `name + set + number`, without normalization or substitutions. Every included source list has 60 cards.

For two lists A and B:

\[
D(A,B)=\frac{1}{2}\sum_c |n_A(c)-n_B(c)|
\]

Because both lists contain 60 cards, this equals the number of card substitutions between the two card-count multisets. "Common identities" is the count of distinct source card identities appearing in every list in that family. Neither measure is a strategic-strength metric.

## Family-level comparison

| Family | Available source ranks | Common identities | Pairwise substitutions |
|---|---|---:|---|
| Absol Garbodor | 8, 11, 16, 22 | 15 | 8–11: 28; 8–16: 16; 8–22: 11; 11–16: 23; 11–22: 27; 16–22: 19 |
| Raichu Electrode | 4, 17 | 19 | 4–17: 21 |
| Iron Thorns | 6, 24, 29 | 25 | 6–24: 14; 6–29: 5; 24–29: 18 |
| Snorlax Stall | 3, 7 | 19 | 3–7: 34 |

Rank 25 is archetype-labeled Raichu Electrode but its exact 60 is missing. It is not included in the rank4/rank17 comparison. The five Japanese-Extra-incompatible lists remain unchanged in this primary source comparison.

## Shared source cores and rank-specific branches

### Absol Garbodor — ranks 8, 11, 16, 22

All four lists contain:
- Mega Absol ex (2, 3, 2, 2 copies respectively);
- Crobat V, Squawkabilly ex, Tapu Lele-GX, Guzma;
- Quick Ball ×4;
- Dark Patch (4, 3, 3, 3);
- VS Seeker (3, 1, 3, 3);
- Battle VIP Pass (2, 4, 2, 2);
- Secret Box ×1, Float Stone (4, 3, 4, 4), Muscle Band ×1, Forest Seal Stone (1, 2, 1, 1);
- Temple of Sinnoh ×2 and Darkness Energy (5, 8, 7, 5).

Distinctive low-prevalence cards include:
- rank 8: Trubbish PAR 116, Crispin, Hisuian Heavy Ball;
- rank 11: Oranguru V, Latias ex, Professor's Letter, Escape Rope, Shopping Center;
- rank 16: Trubbish CRI 56, Plumeria, Trainers' Mail;
- rank 22: Vikavolt V, Trubbish NVI 48, Enhanced Hammer.

**Policy consequence:** one Absol Garbodor engine core is plausible, but rank 11's 28-substitution distance from rank 8 and its low VS Seeker count mean the rank-specific recovery and tech plan cannot be copied from another list.

### Raichu Electrode — ranks 4 and 17

Both lists share 19 exact identities, including:
- Voltorb ROS 21 ×2, Electrode-GX CES 48 ×3, Alolan Raichu UNM 57 ×2;
- Battle Compressor PHF 92 ×4;
- Reversal Energy ×4, Counter Energy ×4, Unit Energy LPM ×4;
- Escape Rope ×3, Rescue Stretcher (4 vs 3), Secret Box, Telescopic Sight, U-Turn Board, and shared basic support Pokémon.

The lists still differ by **21 substitutions**. Rank 4's distinct package includes Dedenne-GX, Crobat V, Tapu Lele-GX, Eldegoss V, Forest Seal Stone, Sky Field and a different Pikachu printing. Rank 17's distinct package includes Unown, Marshadow, Professor's Research, Rescue Carrier, Trainers' Mail, Redeemable Ticket and PokéStop.

**Policy consequence:** share only the demonstrated Electrode/Raichu engine primitives; keep search, draw, Stadium, and recovery priorities rank-specific. Rank 25 remains blocked until its exact list is recovered.

### Iron Thorns — ranks 6, 24 and 29

All three lists share 25 identities, including:
- Iron Thorns ex TWM 77 ×4;
- Plumeria ×4, Guzma (3, 2, 3), Guzma & Hala ×2, Team Flare Grunt ×2, Lusamine ×2;
- Cynthia & Caitlin, Team Skull Grunt, Faba, Lillie's Determination;
- VS Seeker ×3, Tag Call ×2, Megaton Blower ×1, Tool Jammer ×1;
- Player's Ceremony SP 127 ×1/2/1, Thunder Mountain ◇, Wondrous Labyrinth ◇;
- Speed Lightning Energy ×4, Capture Energy (2, 1, 2), Double Colorless Energy (1, 3, 1).

The rank6/rank29 pair differs by only **5 substitutions**, while rank24 is 14 from rank6 and 18 from rank29. Rank24 uniquely contains Bellelba & Brycen-Man, N, Xerosic's Machinations, Nest Ball and Heavy Ball; rank29 uniquely contains Peonia, Target Whistle and Field Blower; rank6 uniquely contains Echoing Horn.

**Policy consequence:** ranks 6 and 29 are the strongest candidates for one shared policy core with rank-specific configuration. Rank24 needs an explicit variant branch. All three must preserve the original Japanese-Extra card identities and use documented research-owned engine compatibility where required.

### Snorlax Stall — ranks 3 and 7

The two lists share 19 identities, including Snorlax PGO 55 (3 vs 2), Regirock, Mimikyu PAL 97, Girafarig, Plumeria (4 vs 1), Team Flare Grunt (2 vs 1), Teammates ×2, Lusamine ×2, Team Rocket's Handiwork, Gladion, Guzma, Faba (1 vs 2), Lillie's Determination, Nest Ball (3 vs 1), VS Seeker ×3, Enhanced Hammer, Counter Catcher and Tool Jammer.

But they differ by **34 substitutions**, the largest family split in this comparison:
- rank 3 has Galarian Stunfisk, Bunnelby, Articuno-GX, Rotom V, Arven, Penny, Eri, Scoop Up Cyclone, Stealthy Hood, Forest Seal Stone, Tropical Beach and Player's Ceremony;
- rank 7 has Wobbuffet, Electrike, Steven's Resolve, N, Pokémon Ranger, Bellelba & Brycen-Man, Palace Book, Robo Substitute, Lillie's Poké Doll, Captivating Poké Puff, Target Whistle, Field Blower, Megaton Blower, Chaotic Swell, Artazon, Recycle Energy and Jet Energy.

**Policy consequence:** do not build one generic Snorlax policy and call both ranks covered. Preserve separate rank3 and rank7 decision configurations and their distinct resource/lock packages. Agent17's existing rank3 and rank7 reports remain separate for this reason.

## Recommended policy reuse boundary

| Family | Reuse recommendation |
|---|---|
| Regidrago (9 available) | Shared core plausible; rank-specific tech branches mandatory. See the [Regidrago variance report](agent17-regidrago-policy-family-variance-20261117.md). |
| Absol Garbodor (4) | Shared engine core plausible; high list variance requires per-rank configuration and competence witnesses. |
| Raichu Electrode (2 available, 1 missing) | Share only the core Electrode/Raichu primitives; separate rank4/rank17 tech and do not infer rank25. |
| Iron Thorns (3) | Rank6/rank29 can likely share more code; rank24 needs a distinct variant; preserve Japanese promo identities. |
| Snorlax Stall (2) | Separate policies/configurations despite the common archetype label. |

This is a code-reuse recommendation, not a statement that any policy implementation exists or is ready. The current shared status identifies prototypes only for ranks 1, 2 and 10.

## Reproduction

Read `results/aichi-2026/full-decklists.json`, retain exact source `name + printing.set + printing.number` keys, sum copies by key, and compute the half-L1 count distance above. The source file is not modified.

**Evidence classification:** source card identities/counts = repository facts; common-identity and substitution tables = deterministic arithmetic; policy reuse boundaries = proposed engineering methodology; card effects, opponent decisions, policy competence, matchups and win rates = not tested.
