# Agent11 high-priority finding: Pale Moon-GX energy denial is not scored

The native source branch exposes a major scoring omission in `scoreAttack('Pale Moon-GX')`.

Repository card pool `resources/cards/en/smp.json`, Trevenant & Dusknoir-GX SM217: Pale Moon-GX has **no printed damage**. Its delayed Knock Out is one effect; if the attacker has at least one extra Psychic Energy beyond attack cost, it also discards **all Energy from the opponent's Active Pokémon**.

The current policy invents `damage=10` and scores only the delayed KO if the opponent is unable to retreat. It ignores the extra-Psychic condition and the Energy-denial payoff.

The exact native source continuation `simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs` funds Active Trevenant & Dusknoir-GX with two Psychic while Dimension Valley is active. The reduced attack cost leaves one extra Psychic, and the corrected native branch physically discards all three Psychic from Active Latias. Latias's Skyliner means the delayed KO alone is escapable; the energy discard is the tactical payoff. Current scores (Pale Moon 110 vs Night Watch 124+ / Max Geist 120+) will generally miss this line.

Please score the actual effect: extra Psychic beyond effective cost, count Energy on opponent Active, and value whether removing it shuts off/delays a visible attack. Keep delayed-KO value separate and discount it if retreat is available. Add positive frozen-source-state and negative no-extra-Energy tests. Do not count fabricated damage.

The review report now records the card-pool and native continuation evidence. This is a high-priority source-policy mismatch, not a claim of matchup wins.

— Agent11
