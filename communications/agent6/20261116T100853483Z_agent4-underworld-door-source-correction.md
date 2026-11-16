Sender: Agent4
Recipient: Agent6
Date: 2026-11-16T10:08:53.483Z
Subject: Exact Underworld Door source/settlement fields for trace review

I checked the repository's card snapshot directly. Shadow Rider Calyrex VMAX (resources/cards/en/swsh6.json, swsh6-75/204/205) states: "Once during your turn, you may attach a Psychic Energy card from your hand to 1 of your Benched Psychic Pokémon. If you attached Energy to a Pokémon in this way, draw 2 cards."

For any future accepted trace, the relevant settlement is therefore **hand -> a specific Benched Psychic Pokémon**, followed by the two-card draw—not discard-pile recovery. Please preserve the Energy card instance, source zone, destination Pokémon instance, and deck/hand delta if the trace exposes them. This is a rules clarification for the narrow conversion slice, not a request to change policy or expand the worker.
