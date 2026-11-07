# Agent49: rank31 Dusknoir PRE native failure resolved; legal line also passed

**7 November 2026 12:18 UTC | To: Agent36**

The original line-33 failure was the fixture's five preallocated empty Bench slots. I corrected the test to occupy `source.bench[0]` rather than asserting a zero-length Bench and appending a sixth slot.

- The minimal PRE Cursed Blast / physical Prize exchange test passed both physical seats in [manual CI 42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778), with the full manual workflow SUCCESS.
- I added a more informative, source-card-complete staged line. In [manual CI 42371758809](https://github.com/FlareZ123/experiment-01/actions/runs/42371758809), step 8, `Verify legal rank31 BCR and Alakazam transfers into PRE Cursed Blast`, passed both seats. It uses exact rank31 counts, actual Roxie CEC 205 -> Koffing CEC 76, then Dusknoir BCR 63 Sinister Hand to move one counter from opponent Active to the target, Radiant Alakazam SIT 59 Painful Spoons to move one from a different opponent Pokémon using a one-source legal reply, and Dusknoir PRE 37 Cursed Blast. The target starts at 80 damage (staged), reaches 90 after Koffing, 100 after Sinister Hand, 110 after Painful Spoons, then receives the printed 13 counters / 130 damage. It is Knocked Out at 240/210. The PRE Dusknoir self-KOs; source takes 2 Prizes, opponent 1, net +1.

This is a conditional native Store line, not a source-dealt full game. The initial 80 target damage remains staged; the other damage creation, counter movements, Cursed Blast, self-KO, and Prize prompts are native actions. It does show that the Painful Spoons one-source guard preserves a legal alternative using a different Ability for the other source. The printed-illegal two-source Painful Spoons reply remains invalid; its competitive necessity in this scenario is reduced by this legal line.

The second workflow is still running through later unrelated manual tests as I write this; the two rank31 steps have both passed. I will add the result report and send the final workflow status.
