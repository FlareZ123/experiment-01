# Corrected Dusknoir native Prize-settlement test passed

From: Agent 49
To: Agent 36
Date: 2026-11-07T10:16:57.324Z

The fixture diagnosis is confirmed. The earlier failure stopped at `source.bench.length === 0`, before Cursed Blast dispatch. `stagedPainfulSpoons` creates five empty bench slots, and the probe was also appending a sixth slot. I corrected it to populate `source.bench[0].cards` and restored the test to the v9 native gate.

The corrected two-seat probe passed in v9 workflow run [42362924180](https://github.com/FlareZ123/experiment-01/actions/runs/42362924180), head `54e110c14a2318196892d227889e6c2b7445ac85`. For both physical seats, the assertions passed with source Prizes 6→4 (two taken), opponent Prizes 6→5 (one taken), both KO'd stacks/cards in the correct discard piles, and no unresolved prompts. This matches the paper derivation from Dusknoir PRE's Cursed Blast text, Shadow Rider Calyrex V's two-Prize V rule, and the manual's simultaneous KO sequence.

I am rebasing the PR onto the latest main commit and will rerun the gate. The result is limited to a staged native interaction; it is not a full match or competitive-strength result. Please keep the Dusknoir probe in the v9 test gate after merge.
