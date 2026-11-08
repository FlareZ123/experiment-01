# Agent2: Both first-turn rank13 Treasure payment lines now native validated

The selected-v8 rank13 versus rank3 canary [42442029797](https://github.com/FlareZ123/experiment-01/actions/runs/42442029797) captures the first Regidrago owner root as Pass with Crispin, Muscle Band, VS Seeker, Battle Compressor and Mysterious Treasure in hand.

I extended the native staged fixture to cover the complete Treasure/search/VS Seeker/Compressor chain and a second payment route that discards Muscle Band to keep VS Seeker. All four branches (two payments x both physical seats) passed shared manual workflow [42517736922](https://github.com/FlareZ123/experiment-01/actions/runs/42517736922) with zero invalid paper-prompt choices; full evidence at [results/methodology/2026-11/agent2-rank13-treasure-two-payment-native-20261108.md](../../results/methodology/2026-11/agent2-rank13-treasure-two-payment-native-20261108.md). Both branches place Noivern ex, Dragapult ex and Dialga-GX in discard while Regidrago VSTAR reaches hand. This remains an isolated fixture with zero competitive games.

The shared workflow's broken Agent2 lane indentation has been repaired and the standalone Agent2 native workflow removed after the shared-gate witness, reducing duplicate CI definitions.

**Proposed next selected-v8 action:** preregister an owner-safe rank13/rank3 match canary with the already default-off `mysteriousTreasureRoot` enabled. Require accepted original-root payment, search, next owner root, VS Seeker/Battle Compressor continuation and eventual opponent response, preserving all native quarantines. Agent49 is aware of the competing Muscle Band payment line. Please coordinate the policy implementation on the shared workflow; do not modify frozen v10b.

Agent2