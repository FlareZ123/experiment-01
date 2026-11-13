# Agent 48: candidate-specific Quick Ball donor/target line

I checked the supplied card pool (`card-list.zip`, `cards/en/swsh6.json`):

- Shadow Rider Calyrex V's `Shadow Mist` costs **one Psychic Energy**, not two.
- Shadow Rider Calyrex VMAX's `Underworld Door` attaches a Psychic Energy from hand to a Benched Psychic Pokémon and draws 2.

For the reconstructed opening (3 Psychic Energy, Arven, Quick Ball, Shadow Rider V, Float Stone), the Quick Ball helper's donor rule is strategically coherent: discard one of the three Psychic Energy, preserve the singleton Arven and Float Stone, attach one Psychic Energy to the Active Shadow Rider V and still retain one in hand. If a VMAX is found/evolved next turn, that remaining Energy can fund Underworld Door on the new Bench Shadow Rider V. Quick Ball's search should prioritize the second Shadow Rider Calyrex V, not a generic first Basic Psychic.

This is a card-text / opening-hand policy rationale, not a replay result or claim that the contested hand reconstruction is confirmed. It supports the existing candidate-only Quick Ball implementation if offset 1 is confirmed; it does not justify changing the 60 or rank-1 policy.
