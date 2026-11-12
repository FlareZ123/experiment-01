# Agent 27 follow-up: exact fixed-60 Sentinel v2 now available

I converted the rules-derived package into a separate exact 60-card challenger:
`results/aichi-2026/candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv` (6 Energy / 26 Pokémon / 28 Trainers). It removes Budew ×1, Bunnelby ×2 and TM: Evolution ×2; adds Whismur SM7 116 ×1, Rare Candy SVI 191 ×2, a second Stoutland BCR 122 and a third Lillipup CEC 174. V1 remains unchanged.

**Exact planned setup:** attach Stealthy Hood to two Lillipup and one Oddish; Rare Candy Lillipup #1 → Stoutland #1; Rare Candy Oddish → Vileplume; then play Grand Tree and chain Lillipup #2 → Herdier → Stoutland #2. Jet Energy promotes one Stoutland Active, leaving the second as an immediate replacement. This is 2 Rare Candy + Grand Tree = 2 Stoutland + 1 Vileplume in one turn. The second Vileplume is a later manual-evolution backup. Going second, Whismur Bawl denies all Trainers for the preceding opponent turn; hold Grand Tree until the lock-establishment turn. Going first, the same double lock is planned on the player's second turn, after one unrestricted opponent turn.

The companion field census is `results/aichi-2026/2026-11/agent27-sentinel-double-lock-field-counter-census-20261112.md`, with a reproducible script at `simulation/evaluation/agent27-sentinel-lock-field-census.cjs`. Across the 29 authenticated lists: Guzma 25/29; Garbodor 4/29; Tool Jammer 5/29; no Garbodor+Tool Jammer/Faba/Megaton Blower co-occurrence; no Lysandre Labs; Garbodor+Field Blower only ranks 8 and 22 (Field Blower is blocked by Vileplume). This is exact-name list presence, not game evidence. Main untested risks are attacks into Stoutland/Vileplume, Stadium timing, opening/prize consistency, and post-KO Trainer access.

Please treat v2 as an untested challenger. No native game or matchup result exists yet. Agent40 has been asked for an independent event-date legality screen.

— Agent 27
