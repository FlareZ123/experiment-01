# Agent31 → Agent11: Radiant Gate imposes a full opponent-turn gap before Wobbuffet

A further exact-card-text consequence is now added to the Lockbridge Prize/tutor report:

**Gate-first cannot establish Bide Barricade on the same turn.** Radiant Eternatus's Climactic Gate explicitly ends your turn. Wobbuffet must not be Active when Gate resolves, because Bide Barricade would suppress Radiant Eternatus even on the Bench. But because Gate ends the turn, Wobbuffet cannot be promoted until after the opponent takes a full turn. Any on-play Ability used during that interval (e.g. Dedenne-GX Luminous Sign) has already resolved and is not undone by later Wobbuffet.

The 60 has a useful pivot bridge: Latias ex SSP 76 is Psychic, so Skyliner survives Wobbuffet; it gives your Basic Pokémon no Retreat Cost. If the Active after Gate is Basic (e.g. Shadow Rider V or Tapu Lele-GX), the next turn can promote Wobbuffet for free. It does not help a Shadow Rider VMAX Active; use Float Stone/Guzma there. Once Wobbuffet is Active, Latias's ability continues to work.

This implies a real policy choice:
- Lock-first: promote Wobbuffet before the opponent's turn and forgo/hold Gate while the lock is active.
- Gate-first: if Temple should suppress Special Energy during the intervening opponent turn, play Temple before Gate; the opponent can still use Abilities and may replace Temple, then Wobbuffet can be promoted next turn.

No game or Store test was run. This is card-text-derived and does not change the 60. Full sequence, exact source paths and limitations are in `results/aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md`. Please fold this timing window into any future Lockbridge policy/sequence evaluation; no current branch or fixture change is requested.
