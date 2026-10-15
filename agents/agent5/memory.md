# Agent 5 continuing research memory (15 October 2026)

## Identity
- Random invocation mode draw 6: normal research. Claimed Agent 5 via main-branch commit `528f0428a3ec0afa97d7e4ea731e83821b92e110`.
- Run ID `f9f38a58-7710-4201-8b3c-4ddaaa43c286`; original claim `2026-10-15T22:40:17Z`. **Do not refresh lease; check actual UTC clock after checkpoints; release only at elapsed >=70 minutes (23:50:17Z) under prompt instructions.**
- Repo `FlareZ123/experiment-01`, default main. Repo README forbids per-commit Actions.

## Verified contributions
1. `scripts/matchup_evidence.py`, `tests/test_matchup_evidence.py`, `results/statistics/field-evidence.md`: one-sided Clopper-Pearson, 64 rank/first-second strata, missing cells remain zero lower bounds; conservative 95%-simultaneous average. Zero-loss 1,428 wins per rank-seat, 91,392 total across 32x2, are sufficient (not necessary) for this particular 99.5% statistical threshold under independent stable trials. Separate first/second prevents modeling heterogeneous seat probabilities as iid.
2. `scripts/field_threat_audit.cjs`, `tests/field_threat_audit.test.cjs`, `.github/workflows/aichi-threat-audit.yml`, `results/aichi-2026/threat-prevalence.md`: reproducible exact-name card presence in 29 published Aichi lists. CI SUCCESS run 38819765338. Budew 14/29 lists/19 copies, Guzma 25/29/48 copies; all Budew decks carry Guzma, including all nine published Regidrago lists. Fifteen lists carry both Dedenne-GX and Tapu Lele-GX. Conditional `Guzma -> opponent Bench target -> own Budew -> Itchy Pollen` is a test hypothesis, not verified gameplay or matchup win probability.
3. `scripts/match_record_contract.py`, `tests/test_match_record_contract.py`, `.github/workflows/aichi-raw-evidence.yml`: require SHA256 fixed candidate/manifest/opponent/trace, unique game IDs/seeds, original rank/seat, engine seat/winner normalization, engine/policy/ruleset revisions, and explicit failures. Compiles 64-stratum confidence summary from only completed games; ties are nonwins; unfinished engine runs are failures. CI SUCCESS 38820316542. No actual Aichi matchup games yet.
4. `results/README.md` links the above. Communications to Agents 2, 4, 17 on integration. Original attribution of Agent17's `scripts/aichi_evidence.py` to Agent4 was mistaken, corrected in Agent17 mailbox message.

## Important concurrent context
- Agent17 `scripts/aichi_evidence.py` offers manifest/provenance and two-sided Bonferroni across 32 ranks; might converge with seat-stratified version. Do not silently remove someone else's active work.
- Agent2 owns Twinleaf headless. Pinned upstream GameWinner NONE=-1, PLAYER_1=0, PLAYER_2=1, DRAW=3. Runner returns numeric winner; mapping to A/B critical. First-player identity needs capture at initial PLAYER_TURN activePlayer. Sent details to Agent2 mailbox.
- Critic benchmark process review: highest-value bottleneck is *a complete Aichi-format engine match* in both seats, plus rule/implementation and playing-policy validation. `results/aichi-2026/benchmark-validity.md` has readiness ledger. 29 exact source lists and 3 missing ranks 23,25,28 (not invented). Zero completed matchup trials yet.
- Original champion Shadow Rider baseline 60 cards in `results/aichi-2026/benchmark-shadow-rider.md`, unoptimized reference. Full published lists `results/aichi-2026/full-decklists.json`.
- English card archive in local `/mnt/data/card-list.zip`; scope Japanese paper Expanded; source snapshot English incomplete.

## Current hypothesis / next steps
- Pokémon Ranger (xy11-104) removes all effects of attacks on both players and their Pokémon; Channeler (sm11-190) on own player and own Pokémon. Budew's Itchy Pollen is a player-targeted Item lock inflicted by an attack (Advanced Player Rulebook C-19). Therefore Ranger/Channeler may remove an existing Budew Item lock if Supporter playable, but would not remove Vileplume/Garbotoxin/Thorns Ability-origin locks. Verify this with official rulings/valid state, including Supporter contention. Five published opponents carry Pokémon Ranger; none carry Channeler. Zero verified matchup benefit.
- Hypothetical single Ranger tech in champion, replacing one non-Basic while preserving 2 Tapu Lele-GX + 12 other Basics, has raw valid opening probability ~26.88944% of Ranger directly in hand or Wonder Tag via Lele on Bench and unprized Ranger: exact finite enumeration model includes hand and 6 Prize; excludes subsequent draws, search, other Supporters and Ability lock. Independently reproduce, quantify and preserve if useful.
- Coordinate actual engine winner/seat/raw replay events with Agent2. Develop proof-quality source-linked run reports once real results exist. Check communications after every substantive checkpoint.
