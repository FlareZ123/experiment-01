# Why the original rank-11 early Garbotoxin source almost never reaches its direct Boost Shake path

**29 October 2026. Evidence:** exact combinatorial calculation on the published Aichi rank-11 source 60 and an independent 32-arm native trial. This diagnoses a severely narrow source-policy route, without claiming that human competitors would play as the bot does.

## Native diagnosis

[Preregistered native cohort, all 32 attempts](agent41-prospective-canonical-scout-native-20261029.md) gives rank11 original Absol/Garbodor source **16 games** across two candidate inventories and both physical candidate seats. Its source policy triggered and completed the direct `Boost Shake` plus equipped `Garbodor` sequence in **2/16** cases. Both successes came from **the same source second-start opening** at seed `24941728`, repeated against the two candidate inventories. Across all **12 rank11 source-first arms**, that direct line completed **zero** times. The source nevertheless made **199 later attack declarations**, which are not early lock or Garbotoxin proof.

The raw native `PlayCardAction` ledger for rank11 records **zero ordinary source Supporters**, **zero Quick Ball**, **zero Battle VIP Pass**, **zero Secret Box**, **zero Professor's Letter** and **zero Dark Patch** across the 16 games. It records **two Boost Shake and two Float Stone plays**. This is a real decision-policy gap given the original source 60: 3 Carmine, 3 Marnie, 2 Guzma, 4 Quick Ball, 4 VIP Pass, 1 Secret Box, 4 Professor's Letter and 3 Dark Patch remain underused or unused in the native source policy. The source occasionally draws or attacks with other cards, so missing a direct line does not imply that it never has any useful move.

## Exact first-hand subset probability

The current `simulation/twinleaf/rank11-direct-opportunity.cjs` actor-visible K0 predicate starts a direct line only if a hand **already** contains:

1. At least one `Boost Shake`;
2. At least one Tool among `Float Stone`, `Forest Seal Stone` and `Muscle Band`;
3. A `Trubbish` or a `Battle VIP Pass`, unless a suitable untooled Trubbish is already Benched;
4. Fewer than two `Garbodor` cards held when `k0AvoidAllGarbodorHeld` is enabled.

The exact source list has **2 Boost Shake, 6 eligible Tools (3+2+1), 6 immediate Bench enablers (2 Trubbish + 4 VIP Pass), 2 Garbodor, and 44 other cards**. These five groups are disjoint. Before any board position or played-card effects, the favorable uniform unordered `n`-card subsets are

\[
N(n)=\sum_{\substack{b\geq1,\ t\geq1,\ s\geq1,\g\in\{0,1\}\\b+t+s+g+o=n}}\binom{2}{b}\binom{6}{t}\binom{6}{s}\binom{2}{g}\binom{44}{o}.
\]

This counts only available hand resources under the K0 protected-Garbodor guard, and treats each `n`-card set as equally likely, without conditioning on legal opening Basics, prize composition, mulligans, actual first player, previous turns or action order.

| Raw uniformly selected hand | Favorable subsets | All subsets | Exact probability |
| --- | ---: | ---: | ---: |
| 7 cards | 18,918,578 | 386,206,920 | **4.8985600776%** |
| 8 cards | 181,005,384 | 2,558,620,845 | **7.0743339856%** |

This is an *unconditional direct-hand baseline*, not the true opening-line probability in the original game. The policy checks after other actions, and legal opening Basic setup, natural draws, mulligans, the active-slot constraints, search, ACE SPEC discard costs and Prize cards can all change its true opportunities. The observed two completed uses in sixteen attempts are too few and too dependent to estimate a trigger success rate. The calculation nevertheless shows that expecting an already-complete three-channel hand is extremely restrictive.

Reproducible code: [exact BigInt enumerator](../../simulation/evaluation/agent41-rank11-direct-triple-probability.cjs) with [independent inclusion-exclusion regression](../../tests/agent41-rank11-direct-triple-probability.test.cjs). Those read the actual published rank11 60, enforce the `2/6/6/2/44` counts, and compute exact subset numerators and denominators. This does not sample seeds or call the native bot.

## Why a realistic source must search and sequence

- **Boost Shake** (Evolving Skies 142) explicitly permits first-turn evolution and ends the turn. Early Tools and Bench placement therefore need to occur before playing it; any planned Supporter or search after it is impossible.
- **Garbodor BKP 57** has Garbotoxin when it holds a Tool. The original source's **Oranguru V ASR 133** can search two Tools with Back Order *only while Active*. Garbotoxin itself disables other applicable Abilities after it is established, so Back Order must precede the lock when it is used as part of the line.
- **Carmine TWM 145** is a first-turn-going-first Supporter exception, but discards the entire hand before drawing five. It can rescue weak hands while sometimes destroying strategically protected resources. **Quick Ball** requires a discard, **Secret Box** requires three discards, and **Forest Seal Stone** needs an appropriate V Pokémon to use Star Alchemy. Search and hand availability cannot be assumed from a graph edge.
- The current direct predicate bypasses these connecting branches. The native bot in the tested cohort also failed to execute ordinary source Items and Supporters. Simply measuring source wins without rehabilitating those legal actions tests a weak policy instead of the original Aichi opponent.

A better owner-information-safe policy should select actions by reachable multi-card lines, the cost in actual disposable hand cards, one-Supporter limits, Active/Bench position, K0 versus K1 owner deck knowledge, and immediate turn-end consequences. Bench search via VIP Pass, Trubbish in hand, Quick Ball or other legal tools should be considered before deciding that the line is unavailable.

## Qualification target

An improved source policy must demonstrate on **new preregistered actual Store deals** that source-first rank11 can establish a Tool-equipped Garbodor early, that a real opponent printed eligible Ability is blocked by the native Store while the lock is active, and that the candidate's answer plus the source follow-up are authenticated. Retain all failed seed attempts, inspect every actual starting order, and reject data whose policy reads concealed opponent state. This direct-hand result is a planning bound and diagnostic, with **zero newly competitive-qualified games**.
