# Original rank31 Roxie → Koffing → Radiant: paid Fog Crystal and Wonder Tag physical access

**Agent 15 | 3 November 2026 | original Aichi rank31 printed 60, exact source-card-count combinatorics and independently seeded physical simulations; no played native game and no qualified win.**

## Why this matters

The original rank31 Dusknoir/Chimecho source has **Roxie CEC205 (4), Koffing CEC76 (3), Radiant Alakazam SIT59 (1), Fog Crystal CRE140 (4), and Tapu Lele-GX GRI60 (1)**. The source's already-confirmed native Roxie→Koffing root and optional Blow-Away Bomb outcome were documented in [Agent43's single native source case](agent43-rank31-koffing-root-confirmation-pair.md), but neither the native source policy nor shared Roxie paper-payment guard establishes a completed three-Ability game line. Our [first direct eight-card triad analysis](agent15-rank31-roxie-radiant-firstturn-20261103.md) identified a strict 1.71483424% first-own-turn Roxie+retained Koffing+Radiant direct-hand occurrence. The ability to fetch missing pieces changes that pre-Roxie opportunity substantially.

**Printed source abilities:** Fog Crystal CRE140 searches a Psychic Energy or Basic Psychic Pokémon. Original Koffing, Radiant Alakazam and Tapu Lele-GX are all **Basic Psychic** Pokémon and therefore legitimate Fog search targets while an appropriate copy is in deck. Playing Tapu Lele-GX **from hand onto the Bench** can use Wonder Tag to search a Supporter, including Roxie. Roxie can discard a physical eligible Koffing from hand, triggering an optional Blow-Away Bomb counter on each opposing Pokémon; an in-play unsuppressed Radiant may then use Painful Spoons to move up to two existing damage counters from one opposing Pokémon to another. Correct target geometry, suppression and timing remain separate prerequisites. This paper card-text reachability is an **access sequence**, not an observed complete native sequence.

## Event A: exact held-Roxie + Fog source bridge

Original rank31 has 15 opening Basic Pokémon. We require at least one Basic in the seven-card opening, choose an initial Active **before** the eighth card with preference for any non-Koffing Basic, set six unknown Prizes, and obtain exactly one ordinary first-own-turn draw. No other draws, Items, Supporters, Ability searches, mulligan bonus or opponent actions occur. Require Roxie in hand and at least one Koffing left for the physical Roxie payment. Radiant must be held or searched for placement. If a target is missing, each separate Fog Crystal is consumed, and the target must actually remain outside all six Prizes. In this first model, Fog may **not** search Lele: Roxie must already be held.

The exact six-Prize calculations use multivariate hypergeometric initial-seven classes, the remaining-53-card eighth draw, and combinatorial no-all-prized conditions. The denominator is **367,753,188,390,588,000**, meaning `340827300 valid seven-card combinations × 53 possible next identities × C(52,6) six-Prize patterns`.

| Disjoint physical source condition | Basic-valid-seven conditional rate |
| --- | ---: |
| Roxie, retained Koffing and Radiant already in first eight | **1.71483424%** |
| Roxie and retained Koffing held; one held Fog finds unprized Radiant | **3.45184857%** |
| Roxie and Radiant held; one held Fog finds unprized Koffing | **1.64540492%** |
| Roxie held; at least two held Fog find both missing identities | **1.61293191%** |
| **Union of available complete triad identities via held Roxie and Fog** | **8.42501965%** |

An important exclusion: **9.207645%** of Basic-valid openings have Roxie, lack both held Koffing/Radiant, and possess **exactly one Fog**. This Fog can only fetch one of the two distinct required Basic Pokémon. More abstract search graph connectivity must not turn a one-Item hand into two independent search actions. Actual Roxie payments might still become possible from other cards in the hand, but the specified *Koffing/Radiant* three-card line is incomplete within this direct-window model.

[Source-based Fog CJS enumerator](../../scripts/agent15-rank31-roxie-fog-crystal-bridge.cjs) and [printing/prize regression](../../tests/agent15-rank31-roxie-fog-crystal-bridge.test.cjs) contain the exact integer category counts and branch formula. An independent 700,000-shuffle simulation generated 617,691 Basic-valid openings and 52,012 physically available Fog triads (8.42039%), consistent with the exact value. It generated no match outcome.

## Event B: a complete Fog→Lele→Roxie access route with independent Active/BENCH choice

The first model can miss a legal route in which **Roxie is absent from the first eight but Tapu Lele-GX is accessible**. This second, deliberately narrower board-realistic model requires the actual starting seven to contain one of the source's **10 Basic Pokémon that are neither Koffing, Radiant nor Lele**. Choose such a Pokémon Active before drawing the eighth. Preserve Koffing for payment; keep **two Bench spaces** free for Radiant and Tapu Lele-GX, with no additional forced Switch. After the mandatory draw, use one distinct held Fog for **each missing** Koffing, Radiant, or Lele. If Roxie is absent, Lele must be held or searched, then placed from hand onto Bench to trigger Wonder Tag. A Roxie still available in the actual deck must survive the six Prizes. All required deck-only identities must survive **simultaneously**.

That is a **physical source-option screen**, assuming playable Items, one available Supporter use, physically acceptable discard options for Roxie, unsuppressed Basic Wonder Tag, and no other card/opponent effects. All missing targets are counted using exact inclusion-exclusion on the joint six-Prize subset, including possible concurrent Prizing of Radiant, Koffing, Lele and all copies of Roxie. No candidate ever receives hypothetical cards that have been Prized.

| Mutually exclusive pre-Roxie resource branch with clean opening Active | Basic-valid-seven conditional rate |
| --- | ---: |
| Roxie held; Koffing/Radiant held or searched with physical Fog copies | **6.45512593%** |
| Roxie absent, Lele held; legally Bench it to search unprized Roxie | **1.28564280%** |
| Roxie and Lele absent, Fog fetches Lele for Wonder Tag, with independently supplied Koffing/Radiant | **1.75087817%** |
| **Full identity/Bench access union** | **9.49164690%** |

The clean other-Basic starting Active itself occurs in **84.00809442%** of Basic-valid initial sevens; the table probabilities already include this prerequisite. The **9.49165%** belongs to a *different stricter starter policy* than the 8.42502% held-Roxie model. Do **not** add the two totals or describe their simple difference as the universal contribution of Wonder Tag. The clean starter also prevents accidental information leakage from deciding the opening Active only after seeing the eighth card.

[Source-guarded full-chain enumerator](../../scripts/agent15-rank31-roxie-wondertag-fog-chain.cjs) and [source printing/inclusion-exclusion regression](../../tests/agent15-rank31-roxie-wondertag-fog-chain.test.cjs) preserve all integer weights, source naming and end-stage partitions. Independent 600,000 literal 60-card shuffled opening samples, with six actual Prizes and the preselected clean Active, yielded 529,637 Basic-valid openings and 50,320 full setups (9.50085%). The split was 34,182 held-Roxie, 6,922 held-Lele, and 9,216 Fog-fetched-Lele setups; all are compatible with the exact model.

## Crucial restrictions and next release test

Both calculations concern only the first own turn **going second**, because an ordinary Supporter cannot be played on the first player's first turn. They deliberately omit extra draw, Roxie's own subsequent draw (which can find Radiant after discarding Koffing), Random Receiver, Quick Ball, Pokémon Communication, first-turn opponent bonus mulligan draws, earlier item search, Grand Tree, Item denial, opposing damage counters, Ability lock and later turns. Consequently, **neither 8.425% nor 9.492% is a ceiling on actual access, an execution rate or a game win rate**.

A prospective source-owned two-seat rank31 release should certify every link in the same actual Store game: original source first seven, six unknown Prizes, physical opening Active, Fog each consumed only once, search results from the deck, Lele played from hand to a real Bench slot with a legally selected Wonder Tag Supporter, Roxie playable only with a genuinely eligible non-GX/EX payment, actual Koffing discard and affirmative Blow-Away Bomb, physically located Radiant with unsuppressed Painful Spoons and meaningful opponent targets, and opponent's next decision. Report not-encountered, missed target, insufficient Fog, illegal payment, native error/cap and real terminal distinctly. First-turn access does **not** automatically establish a legitimate source attack or an opponent reply.

The historical shared v8 Roxie portfolio lacked a PlayCard-root veto for zero eligible physical owner-hand Pokémon. **The currently checked shared v11 portfolio now contains that source-stamped pre-dispatch negative guard** (`simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`, `ROXIE_CEC_NO_ELIGIBLE_POKEMON`), although its existence alone cannot certify selection under a frozen natural two-player policy. The earlier affirmative Koffing case action-capped without a qualified game. These new exact opening denominators provide a prespecified opportunity reference for the common source policy, not a replacement for a selected native trial. The larger goal remains one unchanged legal 60 against all 32; **29 opponent lists are authenticated, ranks 23/25/28 remain missing, zero full games are competitively qualified and 99.5% has not been demonstrated**.
