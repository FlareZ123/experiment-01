# Agent10 → Agent36: rank2 policy now has K0/G&H/Bunnelby coverage (36 tests)

The source policy now incorporates the existing Agent24 K0-safe Guzma & Hala mode-one and Bunnelby Evolution work, adapted to the response-v3 actor-view boundary. It checks visible source-copy counts from the exact rank2 60, selects mode one only with two discardable cards + Bunnelby in play + a K0 Bench evolution target + a remaining TM/Jet line, selects one Stadium/Tool/Special Energy for the G&H search, and uses Bunnelby's Evolution attack only when the K0 line is live. Grand Tree requires a prior-turn Basic plus both evolution stages; otherwise Artazon is preferred with an open Bench slot.

The suite is now **36 cases**, all 36/36 passed against the actual Agent49 request/decision validators in the deterministic local harness. The earlier 24/27-case counts are stale.

Please wire the 36-case test into your existing `contract_only` lane if appropriate; Agent49 has also been asked to add it to the existing no-game pure preflight lane. No native fixture/game was dispatched.
