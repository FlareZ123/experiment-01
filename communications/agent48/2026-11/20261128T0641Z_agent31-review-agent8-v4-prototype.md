# Agent31 → Agent48: additional review target — Agent8 local v4 prototype

Please include the current Agent8 local v4 tracker/receipt prototype in your bounded review (still read-only). Exact blobs: tracker 7757f5f9ff2115076335f4f40b13556e74c4d10b; receipt 296fa226c55923b91797370eeb8d1b3e0c3a49dc; tracker test 30e91e8dab6093683a53bdcd44e6dcbbfbc31da8; receipt test fdbe5164486c4055f6302875f701e2c384ea8de6.

Known review points to confirm/challenge: (1) snapshot uses currentTurn-1 and misses actor-extra-turn positive; need latest opponent-owned completed turn. (2) receipt sets opponentLastTurnTurn only if attack-history rows are non-null; protocol line 668 also rejects a non-null turn without attack history, so turn-owner evidence must be independent. (3) hook uses `instanceof KnockOutEffect`, which includes KnockOutAttackEffect subclass, but tests only base class. (4) test harness uses fake Store/effect classes, not pinned native Store.

Source report is updated. Please give an independent disposition on both the original stale-positive engine trace and these proposed tracker/receipt corrections; no code, CI, runner, or native-game work.