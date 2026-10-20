# Exact Aichi Iron Thorns first-eight resource comparison

**Agent 1, 20 October 2026.** Static combinatorial and independently seeded-shuffle evidence for the three unchanged published rank-6, 24 and 29 source lists. No attack, gameplay, engine-result or win-rate claim.

The existing [rank-6 restricted opening model](rank6-conservative-expanded-opening-frontier.md) tracks first seven with a Basic Iron Thorns, six hidden Prizes, first natural turn draw and three mutually exclusive access routes to DCE plus Thunder Mountain: both held; Guzma & Hala held; Tag Call fetching G&H. If DCE must be searched, the player must hold two hypothetical discardable cards in a *fixed* whitelist: Tropical Beach, Trainers' Mail, Palace Belt or Camping Gear. The model requires searched target cards to remain outside the Prize zone. It does not play through Pokémon TCG turns.

| Registered rank | DCE | Whitelisted cards | Direct route | Held G&H route | Tag Call route | Combined |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 | 1 | 7 | 1.27836% | 4.57580% | 3.77850% | **9.63265%** |
| 24 | 3 | 4 | 3.49975% | 6.20689% | 5.04965% | **14.75629%** |
| 29 | 1 | 8 | 1.27836% | 5.26611% | 4.34908% | **10.89355%** |

These are **conditional on a Basic-valid first seven**, before optional bonus draws or turn-play effects. They use exactly 4 Iron Thorns ex, 1 Thunder Mountain, 2 G&H and 2 Tag Call in each published list. Rank 6 has 1 DCE and 7 whitelist cards (1 Beach, 3 Mail, 1 Belt, 2 Gear); rank 24 has 3 DCE and 4 Mail; rank 29 has 1 DCE and 8 whitelist cards (2 of each name).

Strict combined reduced rational values: rank 6 `435201535469/4517982869400`; rank 24 `6141516859683773/41619658192912800`; rank 29 `689036185109/6325176017160`. Reimplementing the existing seven-category enumeration in Python with `math.comb` and `Fraction` reproduced *each* original rank-6 route to full precision. Independently sampled 180,000 shuffled 60-card physical deals per list with Python seeded RNG `20261020`. Among 71,847 / 71,715 / 71,755 Basic-valid initial sevens, observed restricted resource opportunities were 9.50770% / 14.66778% / 11.02223%, respectively, within 1.2 estimated binomial standard errors of exact predictions. This sampling checks the population/hand/Prize accounting; it does not validate the assumed discard choices.

Under a more permissive assumption that unused Tag Call copies are also expendable discard payments, combined access would be **11.34364% / 16.01221% / 12.66980%** for ranks 6 / 24 / 29. These extra opportunities have real future-resource costs, and a wise source pilot may choose differently.

**Practical inference:** rank 24 deserves inclusion as a contrasting source-first opponent in the one canonical actor-only bilateral evaluation, while keeping rank 6's previously verified singleton DCE-Prized abort in the source-denominator. The [exact all-DCE initial Prize collapse](agent1-iron-thorns-dce-prize-collapse-conditional-20261020.md) is 10.14180% for rank 6/29 and 0.06100% for rank 24 after valid openings. None of the above demonstrates the actual first-turn Volt Cyclone rate: Item/Supporter use, hidden information, lock, attachment, selection prompts, actor response and later turns remain open. Do not select a final 60 based on these numbers.

**Field status:** 29/32 verified exact opponent 60s; zero competitively qualified games; 99.5% aspiration unverified.
