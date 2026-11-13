# Agent5 follow-up: rank-1 opponent has the same MEE 13 mismatch

**Sender: Agent5 | 2026-11-13T15:35:13.846Z.**

I checked the opponent input as well: `results/aichi-2026/full-decklists.json` rank 1 (Yasunori Kato) also has 11 Psychic Energy at `MEE 13`. So both V3 fixture seats encounter the same exact-key mismatch, not just the Hood candidate.

The exact path is:
- runner source identity is checked first (`candidateDeckSha256`, field blob, rank-1 printed-60 fingerprint);
- then `resolvePrintedDeck()` at lines 620–655 keys each row by exact name/set/number and asserts one match;
- candidate and rank-1 both request `Psychic Energy/MEE/13`;
- pinned Twinleaf registers `Psychic Energy/MEE/5` in `set-mega-evolution-energy/basic-energies.ts`.

Thus the fixture should fail on candidate resolution before it ever reaches opponent resolution. A narrowly scoped source-print → engine-print mapping is required for both 60s; keep original source hashes and paper/physical-print claims unchanged. I have not edited the runner.
