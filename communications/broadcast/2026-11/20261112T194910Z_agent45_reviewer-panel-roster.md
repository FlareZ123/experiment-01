# Agent45: consolidated external reviewer panel roster

**Recruitment status: leads only. No one has been contacted, accepted, or enrolled.** This consolidates the prior Agent45 broadcasts so the maintainer has one actionable roster.

## Workload and gate

- The complete balanced field design is **32 opponent ranks × 2 candidate physical seats × 2 first-player seats = 128 outcome cells**. The currently authenticated 29 ranks represent **116 cells**; ranks 23, 25 and 28 remain unavailable.
- Current V3 bundle contract: exactly one independent `paper` and one independent `strategy` signature per untimed game bundle. Current ledger implies one bundle per outcome cell; Agent49 confirmation of exact runner grouping is pending. Full-field planning estimate: 128 paper signatures + 128 strategy signatures; 116 of each for the currently authenticated 29 ranks.
- Evaluator/builder code supports reviewer-ID rotation across bundles: any uniquely registered reviewer with the required role may sign; each bundle still needs exactly one signature per role, and same-bundle reviewer IDs cannot overlap with the pre-deal policy reviewers or the other game reviewer. Agent43 confirmation is pending. Keep each person assigned to one role across the study and distinct from the two pre-deal policy reviewers and all policy/bundle producers.
- A panel of four per role averages ~29 bundles each on the current 116-cell field and ~32 on the full 128-cell field. Additional repeated samples to establish meaningful statistical confidence increase the workload. The 128-cell minimum is coverage, not evidence of 99.5% confidence.
- First fixture-only game is a workflow/paper-packet pilot, not competitive evidence. Do not generate a production physical deal while the authorized reviewer registry is empty.

## Paper-review panel leads

| Priority | Person / contact | Publicly stated evidence | Conflict / qualification checks |
| --- | --- | --- | --- |
| 1 | [ティー — @T_Anon_Pokemon2](https://x.com/T_Anon_Pokemon2) | Public profile says Pokémon TCG Official Judge + Event Organizer since 2021; WCS staff 2023–2026; Gifu/Aichi. | Confirm current credential, BW-onward Japanese Extra familiarity, availability and no ties to any policy/bundle producer or Top32 list author. |
| 1 | [トムリン — @tom_ring_](https://x.com/tom_ring_) | Public profile says Aichi-based Official Judge/Event Organizer since 2016; recent posts mention preparing a judge handbook. | Confirm active credential, exact rule expertise, availability and conflicts. |
| 2 | [あかつき — @aktuki12](https://x.com/aktuki12) | Public profile says Aichi-based Official Judge/Event Organizer; R40+ Aichi top-10 and 2025 City League top-8. | Confirm current judge status and Extra paper-rule familiarity; disclose any relationship to field players. |
| 2 | [Mガルーラ — @Mgargar5](https://x.com/Mgargar5) | Public profile says Judge/Event Organizer qualification in April 2025; organized 12 events in 2025 and 18 in 2026 (as of August). | Confirm active credential, rules experience, location, availability and conflicts. |

The Pokémon Company describes Japan's Official Judge certification and judging duties at official events: https://corporate.pokemon.co.jp/en/topics/detail/t-36/

## Strategy-review panel leads

| Priority | Person / contact | Publicly stated evidence | Conflict / qualification checks |
| --- | --- | --- | --- |
| 1 | [めかぶ — @mekabugames](https://x.com/mekabugames) | 41st (6–2) at CL Aichi 2026 Extra, outside Top32; detailed 2026 deck/matchup/year-round preparation report, plus a 2025 Aichi Extra report using Black Shadow Rider (relevant to the candidate archetype): https://note.com/mekabugames/n/n5c46a956728e and https://note.com/mekabugames/n/n181c365cc604 | Their 2026 report records a match against Top16 player Sasaki Hiromu and list/preparation help from a local organizer. Disclose these ties; do not assign them to any conflicted rank. Confirm no project/policy/bundle producer involvement. |
| 1 | [ンニー / んにる — @Nautilus_inte](https://x.com/Nautilus_inte) | 46th (6–2) at CL Aichi 2026 Extra, outside Top32; 2025 Aichi Extra 6–2/top-64; year-round Extra trend tracking, deck development and detailed match-by-match report: https://note.com/n_niru2555/n/n1ba0879478a9 | Article lists testing/advice relationships with other players (including Kate, Amakusa, Dice and Akasaka). Confirm any ties to Top32 authors/producers and recuse from conflicted ranks. Strong current-field strategist. |
| 1 | [ガルシア / Takuya Hasegawa — @Trubbishx3](https://x.com/Trubbishx3) | Public portfolio says CL2021 Aichi Extra champion, WCS 2017/2022 Japan representative, current Extra organizer and Card Rush sponsored player: https://note.com/trubbishx3/n/nb5f78d6273f8. 2026 Extra event report: https://note.com/trubbishx3/n/nd2fb0e9eb8e3 | Disclose Card Rush sponsorship and community/Top32 relationships. The Garcia Cup community includes other current Extra players; verify conflicts before assignment. |
| 2 | [ともぽん — @tomopon_ptcg](https://x.com/tomopon_ptcg) | Detailed May 11 2026 Aichi Extra field retrospective; author says they were not selected to compete but prepared/practiced: https://note.com/tomopon_ptcg/n/n980eeda2406e | They placed runner-up at a 2024 Garcia Cup event; disclose this community relationship with Garcia and any Top32/player ties. Confirm current Extra expertise and independence. |
| 2 | [T-naka — note profile](https://note.com/t_nakaz) | 107th (6–2) at CL Aichi 2026 Extra with Dust Dolphinman; second consecutive year using the archetype; detailed list evolution, game plan and matchup report: https://note.com/t_nakaz/n/n0a37caf222e3 | Kansai-based; reported 107th finish is outside Top32. Confirm any ties to Top32 list authors/producers, current availability and willingness. Could be especially useful for Dust Dolphinman matchup review. |
| 3 | [ま・つ父 — @mako_tsuka_dad](https://x.com/mako_tsuka_dad) | Public profile lists 2019 CL Niigata Extra top-8 and WCS Day 2. | Profile currently describes TCG activity as dormant; low-priority reserve only. Confirm current knowledge and availability. |

## Recommended invitation order

1. Invite ティー and トムリン for paper review; use あかつき and Mガルーラ as additional panel candidates.
2. Invite めかぶ and ガルシア for strategy review; use ともぽん and ま・つ父 as additional candidates, subject to the disclosed community/availability checks.
3. Ask each candidate to accept a **pilot bundle first**, then agree their allocated count, review time, schedule and compensation/credit. Do not imply that one person must review all 128 bundles. Four reviewers per role is a planning target, not a required fixed panel size.
4. Require written independence/conflict declarations. For any relationship with a Top32 list author, recuse the reviewer from that rank's bundle; maintain an explicit conflict-to-rank assignment record.
5. The maintainer must verify identity and current credentials through known public channels, obtain role acceptance, then bind the person's Ed25519 public key with an out-of-band signed nonce. Only public PEM enters `simulation/evaluation/agent45-authorized-reviewers.json`; never request or commit a private key.
6. Keep `paper`, `strategy`, `candidate-policy`, and `opponent-policy` identities distinct. Do not enroll anyone from public profiles alone.

## Current blocker and authority

The production registry remains empty. No direct X/Twitter messaging tool is available to this invocation; the public X profiles are the contact routes, so the repository maintainer must send the invitations. GitHub permission lookup reports repository owner `FlareZ123` as admin; connected account `vv12x` has write permission only. The maintainer is the trust authority unless explicitly designating another admin.

Open confirmations: Agent43 (multi-reviewer rotation semantics), Agent49 (exact runner bundle grouping/human packet), and maintainer response on issue #25.

— **Agent45**
