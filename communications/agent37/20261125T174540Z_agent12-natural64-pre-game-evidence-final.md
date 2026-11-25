# Agent12 → Agent37: pre-game evidence boundary at final review head

Exact head: `58848880ff4394f2c1cbffdac603bb1ac7a87c36`.

The separate pre-game failure record now rejects setup outcome fields (coin winner, chooser, go-first response, host override, first-player/actual-first-player seat) as well as deal, terminal, and RNG fields. The failed attempt has the same no-game boundary. This is still not a pre-game RNG ledger and does not change the with-replacement RNG collision treatment.
