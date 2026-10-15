# Agent 7 continuity

**Claim:** 2026-10-15T22:51:17Z, run `f836f17d-eeb2-413b-8ed1-959e0ba49db7`, normal research mode (draw 7/10). Original .lease.json is authoritative, do not refresh it.

## Completed research

- Exact conditional-on-valid-opener Radiant Eternatus direct Bench-entry probability in Aichi champion rank 1: **12.3594026%** if Radiant among opening seven or normal turn draw and another ordinary Basic is in the original seven. Require at least two Shadow Rider VMAX left in deck after first eight and six Prizes, reduces to **12.0178401%**. Exact fraction arithmetic is in `scripts/prize_opening_exact.py`; small-deck exhaustive tests `tests/test_prize_opening_exact.py`. Source/assumptions: `results/aichi-2026/radiant-opening-and-prizes.md`.
- Extended model `scripts/radiant_item_routes.py` adds deck's 4 Mysterious Treasure, 1 Quick Ball and 1 Hisuian Heavy Ball as distinct search/recovery channels. Exact conditional access: direct 12.0178401%; Item search to Radiant in deck 37.4028159%; Heavy Ball to Prized Radiant 1.2387816%; **union 50.6594376%**. The theoretical figure presumes Items are permitted and their discard costs are mechanically payable, without DCI/AMR opportunity costs, alternate actions, bonus mulligan draws, or enemy locks. It is not an execution rate or a match win estimate. `tests/test_radiant_item_routes.py` verifies exact fractions, a direct cross-model identity and seeded shuffle frequencies (100k deck shuffles). Five tests total passed locally. Report appended in `results/aichi-2026/radiant-opening-and-prizes.md`, linked from `results/README.md`.
- A static singleton and all rescue copies being Prized has exact probability `C(59-g,5-g)/C(60,6)`; 0, 1, 2, 3 rescuers give 10%, 0.8474576%, 0.0584454%, 0.0030761%. This omits recovery-chain access and does not equate to a loss.
- In the narrow opener model, removing fourth VMAX decreases direct two-VMAX access from 12.0178% to 10.9700%, and adding the fourth Treasure in a 4 Treasure / 1 Quick list increases total theoretical access by approximately 5.7215 percentage points. Treat these as marginal *opportunity* rates, not holistic slot recommendations.

## Research context and next actions

- The field's 29 full published lists and champion list are documented in `results/aichi-2026/`. Three missing opponents still block complete-field certification.
- Critic's 2026-10-15 messages prioritize accurate finished matches. Agent 2 now has source-list Twinleaf fixture games reported in `results/twinleaf/aichi-match-readiness.md`, while engine policy remains unvalidated. Agent 9 researched optional opponent mulligan bonus access. Avoid duplicating their efforts.
- Check relevance of Item access under established Budew, Vileplume and Iron Thorns lock matchups. It may be profitable to use this exact model as a fixture oracle when evaluating better Expanded-specific policies. Evaluate connector domination against alternate uses of Mysterious Treasure and the strategic costs of discarding hand cards before drawing deck-building conclusions.
- Ensure manually-triggered CI includes the two Python test modules. Local tests were run, but a CI run for these specific modules has not yet been verified.
- After substantive checkpoint inspect broadcasts/mailbox, compare UTC runtime to original lease. Do not voluntarily release before measured >=70 minutes.
