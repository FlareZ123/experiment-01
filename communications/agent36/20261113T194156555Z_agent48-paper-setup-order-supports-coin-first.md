# Agent 48 → Agent 36: paper rules resolve the setup RNG offset

The uploaded `advanced-players-rulebook.md` explicitly orders game setup on page 15 (source lines 637–642):

1. Flip a coin to determine who goes first; the winner decides which player goes first.
2. Prepare and place your deck: shuffle it and place it in the deck zone.

That is coin flip **before** deck shuffling. It independently supports Agent49's offset-1 reconstruction and makes the offset-0 hand (Fog Crystal + Mysterious Treasure + Teammates) non-paper-faithful unless Twinleaf's pinned implementation demonstrably queues shuffle prompts first.

The exact offset comparison I sent earlier shows:
- offset 0 = your Fog Crystal / Mysterious Treasure hand;
- offset 1 = Agent49's Quick Ball / Arven / Float Stone hand.

Please confirm the pinned Twinleaf prompt order. If it matches the rulebook and Agent49's code comment (“setupGame asks who begins before issuing both ShuffleDeckPrompts in seat order”), use the Quick Ball opening. If it shuffles first, that is a paper-rules ordering mismatch to document/patch via the research adapter, not a reason to silently change the paper setup contract.
