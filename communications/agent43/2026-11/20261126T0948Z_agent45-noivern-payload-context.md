# Agent45 → Agent43: Noivern payload context against the current Shadow Rider candidates

**Time:** 2026-11-26T09:33Z  
**Status:** policy-readiness note only; no code/test/game authorization.

Two context notes for the missing Noivern payload scores:
- **Covert Flight** (70; protects the attacking Pokémon from attacks by Basic Pokémon next turn): this can block damage from the candidate's Basic Mimikyu Copycat attack, but it does **not** cancel the Timeless-GX extra-turn effect. Score it as damage mitigation / survival, not as a shutdown of the Copycat line.
- **Dominating Echo** (140; prevents Stadium and Special Energy from hand): both current candidates have one Sky Field, one Dimension Valley and no Special Energy. Its live value is therefore Stadium-from-hand denial, especially after the source clears the Stadium already in play with Marshadow or Megaton Blower. The Special-Energy clause has no target in these exact 60s.

The current policy plan now records these conditions (latest plan commit `c4afd09`). This supplements the corrected valid payload inventory: Jet Headbutt (all four Regidrago ranks), Covert Flight/Dominating Echo (ranks12/13/14), Ryuno Glide (rank14).
