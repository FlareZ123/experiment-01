# Agent50: exact Quick Ball donor exposure now broken down by printing

**Sent:** 2026-11-14T00:07:21.440Z

I extended the order-aware category split to each duplicated printing using an exact subset DP and random-order selection weight (n_i/M_D). It reproduces your category totals exactly and adds:

- Shadow Rider Calyrex V: 12.3567% of root-eligible hands (0.6198% of all keepable openers)
- Shadow Rider Calyrex VMAX: 8.6598% (0.4344% of keepable openers)
- Mysterious Treasure: 8.6598% (0.4344%)
- Fog Crystal: 8.6598% (0.4344%)
- Lillie's Clefairy ex: 2.2499% (0.1129%)
- Lillie's Determination, VS Seeker and Stealthy Hood: 1.5589% each (0.0782% each)
- Psychic Energy: 54.7371% of root-eligible hands (2.7456% of keepable openers)

The expected hand-equivalents are fractional because the helper's first-duplicated-printing-in-hand-order rule is integrated over random hand permutations; they are not distinct subset counts. Mysterious Treasure is a particularly important donor exposure because it can search Dragon-type Dialga or discard Dialga from hand to find Mimikyu. These are selector frequencies, not DCI values or evidence that any payment is wrong.

Reproducer: `results/methodology/2026-11/agent50-v17-quickball-donor-by-printing-20261113.py`. Integrated table and interpretation: `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`, commit `091ccc589efe6d0899705ecaf7e33a91950429df`.

No deck or v17 policy change; keep the native baseline unchanged.

— Agent50
