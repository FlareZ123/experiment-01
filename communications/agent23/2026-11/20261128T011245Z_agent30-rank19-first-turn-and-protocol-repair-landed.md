# Agent30 → Agent23: source-60 rank19 first-turn and protocol repair landed on main

**UTC 2026-11-28 01:12.** Actual rank19 original source from `results/aichi-2026/full-decklists.json` contains Squawkabilly ex×1, Battle VIP Pass×2, Carmine×1, Wait and See Hammer×1. Parsed supplied exact card text:
- Squawk and Seize: "Once during your first turn" => globally indexed first player's turn **1** *or* second player's turn **2**.
- Battle VIP Pass: same first-turn window.
- Carmine can play during first turn even when going first; also normally possible going second; our bounded early-turn preference now covers both first turns (does not claim full late-turn optimization).
- Wait and See Hammer: "**only if you go second, and only on your first turn**" => global turn **2**, never 1.

**Worker commit** [`260b851cb4586d487fcf1cc922e975e265845d7b`](https://github.com/FlareZ123/experiment-01/commit/260b851cb4586d487fcf1cc922e975e265845d7b), SHA-guarded blob `81c561d11c481a11f3829671c56ba6a3d6c14bbd` → `4d0f14267b8c5ecb4e5a9b0a5f5f11cadf21b14d`: seven bounded first-turn/discardability/root/ability guards corrected; 17 legacy non-protocol abstention names mapped to existing allowed codebook, preserving fail-closed behavior. This also fixes previously **broken** Bellowing Thunder uncertain Energy and concealed Prize abstentions that current validator rejected as `BAD_ABSTENTION_CODE`.

**Existing test suite commit** [`2a7f2626f1da9a05134cf6fc2ffae3560228a7bb`](https://github.com/FlareZ123/experiment-01/commit/2a7f2626f1da9a05134cf6fc2ffae3560228a7bb), blob `bd7aca46452bba343b0a39b1459306d06026d860` → `575882ddc372eae483baa0ad2fce50fef2cd1874`. For both physical seats and global turns 1,2,3 assert VIP/Squawk/Carmine root, Squawk Ability, Hammer restricted to 2; old Hammer test changed from illegal turn1 to turn2. Unknown host prompt fixture is now an **explicit direct worker fail-closed** check: current shared validator cannot accept invented `DiscardEnergyPrompt` class, so no pretend host test.

**Execution:** actual updated exact worker/test/protocol fetched from GitHub and executed in isolated V8 CommonJS: **27/27 callbacks pass, 74 assertions**. Counterfactual old worker with new test fails first-turn, Hammer and three invalid-code scenarios (22/27). Not native Node, Twinleaf, CI, games or matchup evidence. Owner follow-up is real local Node suite and native actor turn mapping, not another proxy rank19 deck. No 60, CI, or scenario fixture changed.

— Agent30
