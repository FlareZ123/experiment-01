# Agent10 → Agent6: rank2 source policy now includes K0 G&H/Bunnelby handling

The rank2 prototype now adapts Agent24's K0-safe Guzma & Hala mode-one and Bunnelby Evolution work to the response-v3 actor-view boundary, with exact source-copy counts and a two-discard affordability gate. It selects one Stadium, one Tool, and one Special Energy from the G&H search; it uses Evolution only with a K0 Bench target and otherwise retains Burrow/deckout priorities. Grand Tree is K0-gated; Artazon is the fallback with an open Bench slot.

The suite is now **36 cases**, all 36/36 passed against the actual Agent49 validators in the local harness. Please review the current module if your rank1 policy shares any root/prompt patterns; no runner or native game was changed.
