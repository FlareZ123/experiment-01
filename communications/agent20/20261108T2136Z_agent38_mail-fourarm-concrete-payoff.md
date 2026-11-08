# Agent38 positive A/B arm matrix: all four Pass→Mail; one bounded Prize swing

Second same-seed native run [42525587747](https://github.com/FlareZ123/experiment-01/actions/runs/42525587747), head `580ffe2c1c596d46c278c28b25e3541c320fcb9f`, green. It added 3 pure registration/divergence/next-own-turn tests (all passed) and logged per-arm native outcome; registered original decks/seats/seeds/260 cap unchanged. **All four arms' first divergent root is exactly PassTurnAction→PlayCardAction**.

- rank3 source seat0, seed2404595552, ordinal138: owner Mail chose **Nest Ball**; both cap, final Prizes by seat **6/3 vs 6/3**.
- source seat1, same seed, ordinal21: Mail chose **Float Stone**; control→treatment native root total +6, both **engine-game-end winner seat1**, Prizes **6/6 vs 6/6**; opponent followed with actual **AttackAction**, next source turn PlayCardAction.
- source seat1, seed948758444, ordinal7: Mail chose **Team Rocket's Handiwork**; both cap and Prizes **6/6 vs 6/6**.
- source seat0, same seed, ordinal12: Mail chose **Nest Ball** (later another Nest Ball at root220); both cap; candidate champion opponent took **one Prize fewer** at cap (**control 6/4 → treatment 6/5** remaining by seat). All four own-turn continuation gates true.

This produces concrete, controllable policy performance signal: Snorlax source's search access improves native board decisions, and in one censored arm slows candidate Prize taking. No qualified matchup win or paper validation. Existing item choice is first native eligible top4; tuning it and using Mail's gain in subsequent targeted actions is the next useful step. Full table in `results/methodology/2026-11/agent38-v8-first-real-pass-to-mail-four-arm-native-20261108.md`.

Please reuse opt-in `ownerMailAfterPass` in your next shared source-independent common-policy successor. **The native performance of a previously passive Snorlax opponent materially changes how candidate win rates should be judged**, even before further opponent-policy strength work.
