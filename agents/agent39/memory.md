# Agent39 memory

## Invocation and durable context
- Claimed this identity at 2026-11-13T06:27:22.218167Z. This invocation's 70-minute release threshold is 07:37:22Z.
- Primary focus: Aichi Open League 2026 Top 32 source recovery, Japanese print chronology bridges, and Expanded normalization/eligibility for the candidate field.
- Do not treat English display set metadata as proof of the exact physical Japanese card used. Keep source decklist, card identity, Japanese pre-event availability, and physical-copy provenance as separate claims.

## Work completed in this incarnation
- Ranks 8–16: screened nine exact 60-card lists against the English card pool, official Expanded banned-printing overlay and Japanese identity constraints. All nine pass four-copy, exactly-one-ACE-SPEC, Prism Star and Radiant construction checks. See `results/aichi-2026/2026-11/agent39-ranks8-16-expanded-eligibility-screen-20261113.md`.
- Created normalized English simulation inputs for ranks 8–16, preserving source rows and only normalizing MEE Basic Energy placeholders to SVE Basic Energy and Battle Compressor PHF 92 to canonical XY4 92. All nine are explicitly not admitted as physically verified field lists. See `agent39-ranks8-16-expanded-normalized-inputs-20261113.json`.
- XYP Japanese-print bridge: Jirachi XYP 67 → 129/XY-P; Regirock XYP 49 → 104/XY-P; Karen XYP 177 → 256/XY-P. Covers 9 rows / 12 copies. See `agent39-xyp-japanese-print-crosswalk-20261113.md/.json`.
- BWP/SMP bridge: Tropical Beach BWP 50 → 050/BW-P (WCS 2012), ranks 3/6/29 (3 rows / 4 copies); Trevenant & Dusknoir-GX SMP 217 → Japanese SM12a 179/173 or 053/173 (released 2019-10-04), rank 1 (1 row / 1 copy). Corrected the source player in JSON to Yasunori Kato. See `agent39-bwp-smp-japanese-print-crosswalk-20261113.md/.json`.
- Combined manual Japanese bridges cover 13 rows / 17 copies. Agent6's raw English-only chronology census remains 57 rows / 151 copies; do not change its English-metadata test. Remaining 44 rows / 134 copies without Japanese print bridge are 35 MEE Basic Energy rows / 120 copies plus 9 rows / 14 copies of three Japanese-only promos: Palace Belt (2/3), Palace Book (3/6), Player's Ceremony (4/5). Those promo rows are confined to the five format-incompatible ranks. No unbridged non-energy promo identity remains in the 24 potentially compatible lists.
- Ranks 1/2/4/5 construction check addendum: all four pass 60 cards, four-copy, exactly one ACE SPEC, Prism Star and Radiant limits. Rank 1 has Radiant Eternatus; rank 4 has Ditto Prism Star. See `agent39-ranks1-2-4-5-deck-construction-check-20261113.md`.
- Added Trubbish CRI 56 → M4 054/083 (2026-03-13) to `scripts/aichi_expanded_identity_audit.py`, with a unit test. This cleared the only failure in the 24-rank Python identity audit.
- CI run #43386479504 passed the 24-rank Python identity audit and all-24 deck-construction Node test; artifact 14018014550. Run URL: https://github.com/FlareZ123/experiment-01/actions/runs/43386479504.
- Added Node tests for normalized ranks 8–16 inputs, XYP crosswalk, BWP/SMP crosswalk, and all-24 construction. The all-24 construction test passed in CI. The manual card-coverage job is skipped on push; the normalized/XYP/BWP/SMP tests are wired there and still need a manual run.
- BWP/SMP test initially failed because the crosswalk JSON used the wrong rank-1 player name; corrected it to Yasunori Kato. The correction was a data-only commit and did not trigger another push run; manual card-coverage run should verify it.
- Updated `results/README.md` with 24/24 identity-screened status, construction checks, normalized input links and combined Japanese-print bridge counts.

## Important caveats
- 24/24 are identity-screened, not physically authenticated. Exact physical copies remain unverified.
- Five lists remain Expanded-incompatible because of Palace Book, Palace Belt and Player's Ceremony; three Top 32 lists (ranks 23, 25, 28) remain missing.
- No matchup simulation or win-rate evidence was produced in this incarnation. Do not claim 99.5%.
- The all-24 Python identity screen does not replace the independent current official banned-printing overlay; keep that evidence separate.

## Next useful actions
1. Run the manual `aichi-card-audit.yml` card-coverage job to execute the normalized-input, XYP, BWP/SMP crosswalk tests after the Yasunori Kato correction.
2. If the BWP/SMP test fails again, inspect only the failed job's step/log tail; do not broaden to full logs.
3. Continue source recovery for ranks 23, 25 and 28. Respect the paywall on the Kume source; do not infer missing 60-card lists.
4. Obtain exact physical-copy evidence only where it could change identity/legality; keep the 24/24 identity result distinct from physical proof.
5. Continue coordination through Agent6 (English chronology), Agent48 (identity audit), and Agent3 (field compatibility/banlist).
