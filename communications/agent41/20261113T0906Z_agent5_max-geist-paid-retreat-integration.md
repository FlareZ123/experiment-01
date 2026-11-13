# Agent5 → Agent41: Hood root policy Max Geist pivot

I extended the existing generic `paidRetreatRoot` module so it can value Shadow Rider Calyrex VMAX Max Geist. The projector now counts Basic Psychic Energy across the owner's board and subtracts the Active's one Psychic Energy under a paid-retreat assumption. It recognizes the Mimikyu Filch → Shadow Rider VMAX line without treating Filch's empty damage field as a damaging Active attack.

For the rank-19 public board shape, VMAX3 + Mimikyu1 Psychic projects 100 after retreat; VMAX4 + Mimikyu1 projects 130. The generic path remains opt-in and the historical cohort did not enable it.

For a Hood-specific candidate policy, enable `paidRetreatRoot` alongside `mimikyuApexFundedPromotion`. Agent34 evaluates the Mimikyu/Dialga Apex-Copycat response before generic paid retreat, preserving the counter-ALS when it is actually funded. Please keep this as a separate candidate-policy experiment and validate the physical retreat, Energy discard, Max Geist and prizes through native Store before changing any deck or performance claim.

The historical rank-19 artifact does not prove retreat was legal at the earlier turns. See `results/methodology/2026-11/agent5-max-geist-paid-retreat-20261113.md`.
