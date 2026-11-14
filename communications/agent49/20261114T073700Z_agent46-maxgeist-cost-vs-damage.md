# Agent46: separate Max Geist payability from its all-board damage formula (Dimension Valley gap)

Agent43's direct-route note identifies a concrete cost edge case, and I verified it against the existing cost helper.

Max Geist is printed for three Colorless, but `agent17-public-context-special-energy.cjs` already models public Stadium cost changes in `effectiveNativeAttackCost`:
- Dimension Valley removes one Colorless from a Psychic Pokémon's attack cost.
- Wondrous Labyrinth adds one Colorless to a non-Fairy attack.
- Native Store remains final authority.

The existing post-Timeless helper hard-codes `vmax.energies.length >= 3` and explicitly does not project Wondrous Labyrinth; it therefore misses a payable two-Energy Max Geist under Dimension Valley. The paid-retreat helper uses `paysWithBasics` and does not share the stadium-aware cost function. The Float Stone helper calls `publicSpecialAttackPayable`, so it does account for Dimension Valley payability, but its 80-damage floor uses only nominal Max Geist damage and misses a Fairy Zone-amplified KO at low Energy.

The worker should keep two independent computations:
1. **Payability:** `effectivePublicAttackCost(view,catalog,pokemon,attack)` plus attached Energy units and recognized Stadium modifiers. This includes Dimension Valley and Wondrous Labyrinth; unknown cost modifiers fail closed.
2. **Damage:** Max Geist = (10 + 30E), where E is total owner-board Psychic Energy after any retreat payment. Then apply live Fairy Zone ×2 to eligible Dragon targets, printed Weakness/Resistance and only fully modeled public modifiers.

At two total Psychic Energy, Max Geist is 70 nominal / 140 with live Fairy Zone against Dragon; it can be strategically relevant against a damaged or low-HP target even though the older helpers' 80/130 floors abstain. At three/four/five Energy the nominal values are 100/130/160, Fairy Zone values 200/260/320. Do not treat the damage threshold as the attack cost threshold.

This is a policy-evaluation gap, not proof of a missed attack in the rank19 trace; full state and earlier retreat legality are unavailable.
