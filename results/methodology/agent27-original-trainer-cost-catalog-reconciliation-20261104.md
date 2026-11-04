# Original Aichi 29 printed Trainer hand-payment cost audit reconciliation (4 November 2026)

**Agent 27, normal mode; original shared source roster:** `results/aichi-2026/full-decklists.json` (Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`). Scope is exact English set/name cost-text matching across the **29 authenticated original card-count inventories**. No games simulated; no new deck selected.

## Failure and repair

The previously failing manual `aichi-card-audit.yml` step **"Verify exact owner-hand Trainer discard contention without native games"** exercised four Agent27 pure test suites. The cost catalog had expanded from eight to **twelve source name/set printings**, but the companion bundled-print text checker still assumed eight printings / 231 covered copies / 804 unknown copies and parsed two optional modes as mandatory. In particular:
- `Bellelba & Brycen-Man CEC`: printed optional discard **three other hand cards**, hence cost modes `[0,3]`; three source copies.
- `Cynthia & Caitlin CEC`: printed optional discard **one other hand card**, hence `[0,1]`; four source copies.
- `Plumeria BUS`: mandatory discard **two hand cards**; twenty source copies.
- `Dowsing Machine PLS`: mandatory discard **two hand cards**; one source copy.

The first eight sources remain unchanged: Quick Ball FST (72), Ultra Ball MEG (24), Mysterious Treasure FLI (37), Secret Box TWM (10), Guzma & Hala CEC (13), Battle VIP Pass FST (42), Trainers' Mail ROS (29), and Professor's Letter BKT (4).

Updated `scripts/agent27-source-trainer-cardtext-cost-audit.cjs` to distinguish the two optional modes and fail on ambiguous combinations; updated `tests/agent27-source-trainer-cardtext-cost-audit.test.cjs` to assert every new source printing, copy count, and payment mode, plus negative ambiguous-card-text coverage. Independent local checks against supplied `card-list.zip` confirmed English printed rule text for all twelve name/set groups and relevant physical variants.

**Coverage reconciliation:** 29 source decks, **1,035 Trainer copies** in original registered 60s, **259 copies across 12 known name/set printings** with audited hand payment text, and **776 copies outside this specific known-cost catalog**. Coverage is *not* a claim that 776 have costs or are unplayable.

## Reproduction and bounded evidence

- Source fix: GitHub commits `e67ee5e5f33f35eb9d036d79128795a4ea9a0e0f`, `935499fb829e830c425612f4e95a7a89d5503f5f`.
- [Manual audit run 41769662328](https://github.com/FlareZ123/experiment-01/actions/runs/41769662328) at exact second-commit HEAD: **Agent27 payment step succeeded** (four no-native suites). The whole run was **red on a separate Agent17 first-turn Item/Trainer holdings step**, which is outside this Trainer discard-text repair. Do not describe the whole job as green.
- Before correction Agent22 reproduced [run 41754920578](https://github.com/FlareZ123/experiment-01/actions/runs/41754920578) red on the Agent27 payment step, while the newly added unrelated historical-print crosswalk step passed.

This is a paper-text matching / initial owner-hand affordability prerequisite. It does **not** certify the target search, selectable payment in native Store, Supporter or Item locks, strategic discard acceptability, owner-only policy choices, resolved effect, original-source opponent competence, 25-minute event clock, or any competitive game win rate. Benchmark remains **29/32 complete original lists**, ranks 23/25/28 absent, **zero qualified competitive games**, **no selected fixed winner**.
