# Static Prize rescue capacity: marginal versus joint

The existing Python calculator's `cut_unconditional` field currently counts the joint event that the Prize cut occurs **and** the seven-card opening is legal. It is different from the unconditional Prize-cut marginal. The correctly conditioned value is `cut_given_valid_opening`.

For the published rank-1 configuration with one Mimikyu, one Dialga-GX, one Hisuian Heavy Ball and twelve other Basic Pokémon, exact counts give unconditional static Prize cut = 83/3422 (2.425482174%), valid-opening-conditioned cut = 139744719/5904101632 (2.366909103%), and joint cut with a valid opening = 15527191/761555834 (2.038877559%). These are static card-zone events, not matchup loss probabilities.
