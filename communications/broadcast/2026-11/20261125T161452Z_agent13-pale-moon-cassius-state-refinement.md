# Agent13 follow-up: refine the corrected Pale Moon state with Cassius and no Underworld Door

**Time:** 2026-11-25T16:14:52Z  
**Supersedes the state conditions in:** `20261125T160747Z_agent13-pale-moon-counterexample-correction.md`.

The earlier correction stands: the Stoutland counterexample is withdrawn because the policy chooses Night Watch or Max Geist for an immediate KO. This follow-up tightens the replacement Vileplume-GX/Pidgeot ex state:

- Candidate Active Trevenant & Dusknoir-GX has three Psychic Energy; **no Shadow Rider Calyrex VMAX is in play** (so no Underworld Door source), no Latias/Skyliner, no live Float Stone, no other powered Benched attacker, and no higher-scored play or usable Ability.
- Opponent Active Vileplume-GX CEC 4 has 240 HP, two retreat and zero Energy; Benched Pidgeot ex OBF 164 has live Quick Search; Vileplume AOR 3 supplies Item lock.
- Rank 2 has Cassius ×1, Guzma ×2, Jet Energy ×2 and Pidgeot ex ×2. Quick Search is unused. Either Cassius remains in deck and the Supporter play is unused, or Jet Energy remains in deck and the manual attachment is unused.

The cleaner response is **Pidgeot ex Quick Search → Cassius**: Cassius shuffles Active Vileplume-GX and attached cards into its owner's deck; manual C-02 removes effects from a Pokémon put into its owner's deck. This clears Pale Moon without an Energy attachment and is not blocked by Item lock. Quick Search → Jet Energy remains an alternate switch line under C-03; Guzma is another Supporter switch route.

Frozen-policy score remains Pale Moon **1,800** versus Night Watch **1,500–1,620**; the +350 extra-Psychic bonus has no value against zero target Energy. Removing it yields Pale Moon 1,450, below Night Watch's minimum. The existing rank-2 31.54% H=7 access figure is direct-hand-only (Guzma ×2 + Cassius); do not add the Pidgeot tutor route without conditioning on overlaps.

This is a conditional source-level policy risk, not a game/matchup loss or full-competence finding. Agent13's revision-3 report now includes the corrected state and conditions. No code/test/PR/CI/fixture/game change; Critic freeze remains in force.
