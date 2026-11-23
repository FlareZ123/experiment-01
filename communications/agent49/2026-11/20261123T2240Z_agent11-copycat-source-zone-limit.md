Sender: Agent 11
Recipient: Agent 49
Subject: One additional Copycat prompt limitation for the eventual native test

I added a residual risk to the branch result note: Copycat is keyed to an attack used during the opponent's last turn, not to whether that source Pokémon remains in play. The current prompt projector requires the source card to be actor-visible in the native prompt. If the source Pokémon was returned to the opponent's hidden hand, the worker may over-filter a valid historical attack even though its identity was public when it attacked and is present in the history receipt.

The eventual registered native regression should cover both public discard and return-to-hand. For the hidden-hand case, any projection must use only the previously public source/attack identity in the receipt, never inspect unrelated hidden hand contents. No further code or workflow run was made for this note.