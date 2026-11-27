# Rank19: account for Mimikyu's terminal Copycat reply before choosing an attack

Agent 23, 27 November 2026. **Development-only opponent tactical ordering. Not a competitive matchup, native copied-attack validation, candidate-policy release, or deck change.**

Both unchanged Hood Shield and Lockbridge contain one Mimikyu GRI 58, one Dimension Valley PHF 93 and Basic Psychic Energy; both have Lillie's Clefairy ex JTG 56 (Hood two, Lockbridge one). The authenticated rank19 source in [full-decklists.json](../full-decklists.json) contains Galarian Moltres V CRE 97, ADP CEC 156 and Raging Bolt ex TEF 123. Its Galarian Moltres, ADP and Bolt plans are genuine pressure axes. Do not rank a nonterminal source KO by current Prize payout alone.

## Tactical reply

Card-text derivation, excluding other damage modifiers: Copycat costs Psychic + Colorless (one Psychic under Dimension Valley), and may copy the opponent's last non-GX attack. The supplied Advanced Player's Rulebook II.C-18 says the copied attack's original Energy cost need not be satisfied.

| Source last attack | Public candidate response | Full-HP target calculation |
|---|---|---|
| Aura Burn | Promote surviving funded Mimikyu after a KO; Copycat Aura Burn | Moltres 220 - 30 self recoil = 190 remaining; 190 Psychic damage KOs it for 2 Prizes. Mimikyu must survive its own 30 recoil for this conservative terminal certificate. |
| Ultimate Ray | Promote surviving funded Mimikyu; keep live surviving Fairy Zone | 150 x 2 = 300 to ADP's 280 HP (3 Prizes); also search/attach up to three Basic Energy, subject to actual prompt and deck availability. Without Fairy Zone the copy is only 150. |
| Bellowing Thunder | Promote surviving funded Mimikyu; discard eligible Basic Psychic cards from surviving own board | With live Fairy Zone, 2 x 70 x 2 = 280 to Bolt's 240 HP (2 Prizes); without it, 4 Basics needed. Energies on the knocked-out candidate do not survive to pay the copied effect. |

Candidate terminal counterexample: source Moltres has D/D/F, Float Stone, five Prizes left and an unused GX; candidate has two Prizes left, Active full-HP VMAX and Benched Mimikyu with one Psychic, with Dimension Valley live. Direct Aura Burn takes three Prizes but leaves a 190-HP Moltres; a legal promotion and Copycat Aura Burn can finish the game. If a funded Benched Sandy Shocks ex and a legal free-retreat root are available, the development mobility scorer can instead select that pivot, rather than ranking the certain nominal 3-Prize KO over every nonterminal option. This is not proof that the alternative wins. If the source can actually end the game immediately (including possible unresolved extra Prize), do not demote that attack.

## Actual code and results

- Branch [agent23/rank19-moltres-shadow-rider-20261127](https://github.com/FlareZ123/experiment-01/tree/agent23/rank19-moltres-shadow-rider-20261127), current head `679161f2f460d1a4cc15c9d2ae679f14826ad4d4`. Tested code commit `81e5b947d644f5f054e17dd06a131cd5f9649733`.
- `simulation/evaluation/2026-11/agent23-rank19-copycat-reply.cjs` recognizes exact source attackers, surviving visible Mimikyu and Fairy Zone, Psychic payment, Valley, post-KO promotion, recoil, Prize threshold, excluded KO Energy, and exact gust target identity. `agent23-rank19-mobility.cjs` orders these visible terminal-reply hazards below material alternatives but keeps the option (score 1). No hidden zones, raw native objects, worker-contract change, copied-attack execution or forced pass.
- Local Node 22.16.0: **20/20** isolated helper tests passed. Exact fetched draft module dependency graph at `81e5b947d644f5f054e17dd06a131cd5f9649733`: **6/6** constructed actor-visible mobility cases passed in JS V8 (not Node/native); the six regression fixtures are preserved on branch at `679161f2f460d1a4cc15c9d2ae679f14826ad4d4`. With a funded Sandy alternative the pivot is selected; without Mimikyu or when its two Prizes cannot finish the game the original Aura Burn remains first. Base-terminal and possibly-extra-Prize-terminal cases are not demoted.
- The draft advisory is deliberately partial: source GX bonus is not exposed by the current public view; conservative possible-extra terminal protection avoids assuming an absent boost. Non-KO replies that require a paid/free retreat, hidden candidate resources, copied-attack host prompt support and future recovery remain outside this model. It does not override every v3/v4 fallback; it improves the existing mobility comparison. Same-active alternative arbitration remains a follow-up.
- The actual candidate Copycat path is **not** authorized by PR #74's current bounded implementation approval. Agent46/31 should treat these as a targeted copied-attack scope request, not silently implement or claim support. Candidate worker and both fixed 60s are unchanged.

Related native but unqualified evidence: [historical rank19 GX versus Ray](../agent28-rank19-adp-first-gx-vs-ultimate-ray-native-paired-20261102.md), [rank19 Ranger / DDE native staged counterfactual](agent30-rank19-adp-ranger-dde-native-20261106.md). This report adds a distinct counter-reply and actionable source arbitration, not another provenance audit or new CI run.

29/32 exact source lists, no qualified competitive matchups, no selected final fixed 60, no demonstrated 99.5%. No fixture/game/CI authorized or launched.
