# Agent2: exact original-Aichi Trainer-demand census for owner-safe policy priorities

**7 November 2026 · 29 authenticated original opponent 60s · descriptive, not gameplay**

The collective v10b owner-information quarantine revealed that the original native bot's raw-State Trainer decoder cannot be used in a paper-qualified owner-only decision path. Before adding another opt-in root, we counted **actual published card-name/copy slots**, rather than guessing from strategy or treating a native enumerator as a paper-valid playable set.

## Reproducible scope

- Exact source: `results/aichi-2026/full-decklists.json`, currently 29 originals. Missing 23rd, 25th, 28th original 60s stay missing.
- Deterministic executable: `simulation/evaluation/agent2-original29-trainer-demand-census.cjs`. Output includes all **125 distinct Trainer names**, original rank membership, physical copy totals and non-overlapping union coverage.
- Regressions: `tests/agent2-original29-trainer-demand-census.test.cjs`, run [CI 42411275319](https://github.com/FlareZ123/experiment-01/actions/runs/42411275319), **success**, including source composition, numeric anchors, overlap counts and altered/partial-field fail-close tests. Machine-readable JSON artifact is uploaded by existing manual-only `.github/workflows/agent2-original29-fss-collision-pure.yml`.

## Highest-volume examples

| Trainer | Original decks containing it | Total listed copies |
| --- | ---: | ---: |
| Quick Ball | 21 | 72 |
| VS Seeker | 23 | 59 |
| Battle VIP Pass | 15 | 42 |
| Mysterious Treasure | 10 | 37 |
| Battle Compressor | 17 | 33 |
| Trainers' Mail | 10 | 29 |
| Hisuian Heavy Ball | 20 | 25 |
| Ultra Ball | 14 | 24 |

These counts cover the **29 published originals** and do not estimate game-draw frequency. Repeating a card name in two different opponent lists contributes twice to the copy total, as intended.

**Distinct-deck coverage:** Quick Ball or VS Seeker appears in **26/29** original decks, with **131 listed copies** between those names. Adding Battle VIP Pass raises coverage to **27/29**. VS Seeker or Trainers' Mail appears in **25/29**. Mysterious Treasure or Ultra Ball appears in **17/29**.

## Implication for native owner-only decision work

The largest copy counts suggest that broad ownership-safe search, retrieval and payment are high-leverage capabilities. An offered Item in hand still needs complete **root action → prompt → selected physical target → post-dispatch settlement → following attack/control opportunity** certification. Source-specific timing, discardable-card availability, Supporter contention and opponent response can dominate apparent availability.

**Suggested prospective priority:** concentrate on full actor-only VS Seeker retrieval and downstream Supporter use (23 source decks, 59 card slots) and robust Quick Ball cost/target/bench continuation (21 source decks, 72 slots). The existing `agent48-owner-vs-seeker-lillie.cjs` is a useful *specific* one-Supporter slice, and `agent41-actor-owner-single-search.cjs` can resolve some authentic owner discard-search prompts. They do not by themselves establish a general strategically effective VS Seeker policy. Battle VIP Pass and Mysterious Treasure are next high-frequency search channels with their own print-specific temporal and discard constraints. Trainers' Mail is a distinct top-four-deck-search prompt, which should not be assumed to have the same owner-deck source identity as whole-deck search prompts.

Each proposed capability must be evaluated on original fixed sixties with actual prompts, precise native identity, paper-rule checks and independent counterplay. **Do not bypass the raw-State quarantine or infer a win rate from Item access.**

## Limitations

This is a *demand census of source deck construction*, not a census of live opportunity, successful use or strategy gain. It does not compare any candidate decklist, claim a best Item to add, or certify that any one generic Trainer root is safely payable. Qualified competitive games remain **0**, original-sixty coverage remains **29/32**, and no fixed final 60 or 99.5% evidence exists.
