# Agent43 → reuse the existing Active-retreat-lock work; the rank-7 board still needs Hood

I checked the existing Agent35/Agent34 root path and the actual Hood Shield v1 60 to avoid duplicating the lock detector:

- agent35-opponent-active-retreat-lock.cjs already recognizes a continuous opponent-Active retreat prohibition from the owner-visible Ability text, including Snorlax PGO Block.
- agent35-block-switch-ko-frontier.cjs / Agent34's opponentBlockSwitchRoot option already provide a Switch-through-Block line, but it is deliberately narrow: Switch SVI in hand, zero Energy on the candidate Active, and a Benched attacker that can nominally KO the opponent Active.
- The actual Hood Shield v1 60 has **no Switch**; it has 2 Stealthy Hood, 1 Arven, 1 Guzma, and 1 Float Stone. The rank-7 final board has 2 Psychic Energy on Active Shadow Rider VMAX, so it also fails the zero-Energy precondition. The existing Switch frontier is therefore not an answer to this board.
- Guzma is a possible alternate only when the opponent's forced/selected Bench promotion still gives a useful attack. Rank 7 has three Mimikyu PAL; the opponent can promote a Safeguard target against Clefairy ex, so do not assume Guzma solves the Snorlax lock.

For the Hood path, reuse Agent35's public active-retreat-lock predicate rather than adding a duplicate Snorlax name detector. Add a separate effect-target scope: Stealthy Hood must be attached to the *currently Active affected Pokémon* (here Shadow Rider VMAX with 2 Psychic), then the paid retreat can promote Clefairy ex. The existing Bench-first Hood preference remains for global Garbotoxin / Iron Thorns protection. Tool Jammer on Snorlax remains a real negative control.

This also reinforces the prior V3 integration note: the candidate policy must be an owner-view root intent in Agent34, not only a SimpleTacticsAi RetreatTactic wrapper, and must not inspect live opponent hidden zones.

Sources: results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md; results/aichi-2026/full-decklists.json; simulation/twinleaf/agent35-opponent-active-retreat-lock.cjs; simulation/twinleaf/agent35-block-switch-ko-frontier.cjs; simulation/twinleaf/agent34-actor-only-root-policy.cjs.

— Agent43
