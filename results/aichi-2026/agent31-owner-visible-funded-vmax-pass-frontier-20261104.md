# Agent31: exact owner-visible funded-VMAX opportunity at nine native Passes

**4 November 2026.** This read-only investigation separates repeated *owner-visible turn opportunities* from independent randomized games. It reuses the unchanged frozen [Agent31 preregistered original rank-5/rank-11 64-attempt native archive](agent31-crossrank5-11-floatstone-heldout-20261104.md) and introduces no new simulation, game policy or opponent sample.

## Reproduction and evidence boundary

- Original registration: [32 paired trial IDs and 16 independent seed groups](registrations/agent31-crossrank5-11-floatstone-20261103.json), Git blob `04eeebb1d3335202aba9f283d7419b74e74c8dbe`.
- [Actual pinned native run 41694723676](https://github.com/FlareZ123/experiment-01/actions/runs/41694723676), [complete archived ZIP 13260926041](https://github.com/FlareZ123/experiment-01/actions/runs/41694723676/artifacts/13260926041), ZIP SHA-256 `8333ea0989cd8c9092040c93435c35f5a454dc204601ee89593681ea5994d634`, raw 53,660,033-byte JSON SHA-256 `3783eaca1882406e2de1998c4fde8440a9fdbca27284b12ac2b0a1dcc7eac9ab`.
- New [read-only owner-visible Pass frontier](../../simulation/evaluation/agent31-shadow-rider-visible-pass-frontier.cjs), [six pure negative/positive tests](../../tests/agent31-shadow-rider-visible-pass-frontier.test.cjs). Tests passed locally on Node 22.16.0, 6/6. The audit of the original complete archive passed exact registered ID and paired initial physical-deal checks for all 32 trial IDs.
- The unit of observation is specifically each **candidate's captured final Pass after a source attack**. Other owner turns without a source attack are outside this observer's denominator. No hand information from the opposing player is used.

### Audited visible conjunction

At the candidate's actually accepted `PassTurnAction`, the observer requires the following **owner-hand and public** conjunction:

1. A physically held `Float Stone` in owner hand, an untooled Active `Shadow Rider Calyrex VMAX` with fewer than three attached Basic Psychic Energy cards, and a distinct Benched `Shadow Rider Calyrex VMAX` with at least three attached Basic Psychic Energy cards.
2. The Benched Pokémon's public printed `Max Geist` cost is three Colorless (`[9,9,9]` in the pinned numerical card type enum). The hand card `Float Stone BKT` is supported by the supplied card database entry `cards/en/xy8.json` (`xy8-137`): it gives the attached Pokémon **no Retreat Cost**. `cards/en/swsh6.json` (`swsh6-75`) has Max Geist's three-Colorless printed cost and the VMAX's two-Colorless Retreat Cost.
3. No native `RetreatAction` was previously taken by that actor during the same turn. Both public Stadium lists are empty. Every visible opposing Pokémon is a `Mega Absol ex`, `Oranguru V` or `Latias ex`, without attached Tools. These printed opposing cards have no relevant Item/Tool/retreat lock in the provided database. This narrow allowlist deliberately abstains on unknown opponents rather than assuming their locks are absent.
4. The Pass ordinal, physical player seat and turn agree with the real archived Store-root ledger.

The **full paper legality** remains unresolved because archived Pass records omit Special Conditions, some persistent effects, exact observed Trainer permission and full independent paper payment. A visible conjunction establishes a specific plausible line for triage, and the separate native paid-chain witness shows it was executable by that simulator. This auditor cannot certify all paper rules.

## Complete sampled Pass-frontier denominator

| Observation | Frozen control | Rescue enabled |
| --- | ---: | ---: |
| Paired registered physical trials | 32 | 32 |
| Captured candidate final-Pass snapshots following source attacks | **173** | **164** |
| Such Pass snapshots with held Float Stone | **42** | **33** |
| Narrow visible funded-VMAX conjunction fulfilled | **9** | **0** |
| Distinct physical trial IDs fulfilling that conjunction | **1** | **0** |
| Paper-competitive-qualified games | **0** | **0** |

All **nine** control snapshots occurred in **one and the same** matched original rank-11 physical game: `11:3:B:champion-reference`, seed `1681435956`, original rank-11 source seat 0 and fixed rank-1 Shadow Rider contender seat 1. The exact control Pass root ordinals were **137, 144, 151, 192, 199, 207, 215, 222, 251**. They are repeated game-state observations **rather than nine independent opponent trials**. The first qualifying Pass occurs at global turn **29**.

At the first missed Pass, the owner held `Float Stone BKT`; Active VMAX was untooled with **one Psychic**; its Benched VMAX had **three Psychic** and printed Max Geist; no Stadium was in play; the opponent had Active `Mega Absol ex` and two untooled `Oranguru V`. No same-turn retreat had occurred. The counterpart rescue run shares every native accepted action through root136. At root137 it **physically played held Float Stone on Active**, root138 **retreated to the Benched 3-Psychic VMAX**, and root139 **settled Max Geist**. The source then used Terminal Period at root143, and the contender ultimately reached a native winning terminal at turn37, whereas the control source reached a native winning terminal at turn55. All these are native engine observations and remain **unqualified paper games**.

The nine-to-zero change should be interpreted as a **single matched-trial intervention avoiding repeated missed owner-visible opportunities**. It does not estimate the incidence of paper-valid Float Stone opportunities in the broader Aichi field. The 173/164 snapshot denominators also differ following divergence and are not identical independent Bernoulli trials.

## Research consequence

The crossrank root-chain audit established one actual selected contender-side native Tool→Retreat→attack line. This new owner-visible census identifies the *opportunity the original control pilot repeatedly failed to take*, providing a concrete counterexample to policy evaluation based solely on number of attacks or theoretical card access. For Issue #25, retain the actual hand, public Bench Energy, prior retreat, tool-lock context, selected action and opponent reply as a **single causal sequence**. This dataset supplies a useful positive replay seed for a source-independent policy such as [Agent14's broader general helper](../twinleaf/agent14-generic-funded-bench-floatstone-three-family-20261104.md). Agent14's separate fresh [12-pair generic prospective sample](agent14-prospective-generic-funded-floatstone-zero-activation-20261104.md) registered **zero** changed real root histories and should be interpreted within its own seed denominator.

**Scope:** 29 authenticated original 60-card name/count inventories, three missing ranks, no selected final fixed 60, no qualified competitive games, no demonstrated 99.5% win rate.
