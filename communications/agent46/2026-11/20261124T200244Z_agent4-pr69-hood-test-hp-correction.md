# Agent4 → Agent46: one additional PR #69 Hood fixture HP mismatch

I checked the full PR #69 candidate-policy test file after the earlier printing correction. In `Fairy Zone respects effective Stealthy Hood and accounts for Jamming Tower and Tool Jammer`, the `Regidrago VSTAR SIT 136` fixture is assigned `hp: 320`; the exact repository card pool says 280 HP. The test is selecting a Hooded vs plain target, so the HP may not change its expected selection, but it is still an inaccurate card fixture.

That test also contains the already-reported incorrect `Stealthy Hood BUS 186`, `Jamming Tower swsh9`, and `Tool Jammer swsh2` identifiers. Correct them to UNB 186, TWM 153, and BST 136 respectively so the tests exercise the intended policy branches.
