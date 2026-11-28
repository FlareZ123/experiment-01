# New Moon v3: win by making Counter Catcher legal *during* the turn

**Agent22 · 28 November 2026 · research-only experimental worker overlay.** This **advances the existing unchanged legal fixed v3 60**, not a new 60 or best-deck nomination. The exact deck is [New Moon v3 Dusknoir](../../../results/als/new-moon-dusknoir-shadow-bind-v3-60.json); its single Counter Catcher SV4 160, Dusknoir SFA20, paid Mewtwo & Mew-GX, and optional Trevenant & Dusknoir-GX donor permit a distinct Prize-clock tactical win. These are **conditional print-text lines with an implemented actor decision**, not native results, actual qualified games, 99.5%, or full-field evidence.

## The newly available action is caused by the self-KO

Printed **Counter Catcher** can only be used when our remaining Prizes exceed the opponent's. At a tied 3–3 or 2–2 state, it is ordinarily **not legal**. Benched Dusknoir's **Cursed Blast** places 13 counters on an opposing Pokémon, then knocks itself out and gives the opponent one Prize. This updates the comparison *before the attack* and makes Counter Catcher newly usable at 3–2 or 2–1, unless Items are blocked. This is materially different from an abstract “gust card accessible” graph: the self-KO is an enabling resource expenditure, rather than a pure disadvantage.

| Tied starting Prizes | Actual Benched target | Action chain after paid setup | End |
| --- | --- | --- | --- |
| 3–3 | **Mega Lopunny ex 330 HP**, 3 Prizes | Cursed Blast 130 (own Dusk selfKO, opponent 2 Prizes remain) → offered Counter Catcher → gust damaged Mega → active Mewtwo & Mew-GX paid *printed* Miraculous Duo-GX 200 | 330 damage, our final three Prizes |
| 3–3 | **Mega Kangaskhan ex 300 HP**, 3 Prizes | Same chain, 130+200 ≥300 | Our final three Prizes |
| 2–2 | **Regidrago VSTAR 280 HP**, 2 Prizes | Cursed Blast 130 (opponent 1 Prize remains) → offered Counter Catcher → gust damaged Regidrago → active Mewtwo with live Perfection copies **Night Watch 150** from a correctly indexed Benched Trevenant & Dusknoir-GX | 280 damage, our final two Prizes; no GX use needed |

The actor must already have a **legal paid source attack offered in the root**, Dusknoir SFA20 live on Bench, the Item physically in hand, valid opponent target and own Prize equality. The new root action uses an **actual offered native Ability action token**, not a guessed card. The Stage2's Bench target may not already have 130 or less remaining HP (it would be KOed before the gust). The eventual attack is checked **after** the gust against the actual new Active and native damage metadata. Miraculous uses the *printed* Mewtwo attack; Night Watch needs active, unsuppressed Perfection and a real, current, indexed Benched Trev–Dusk GX donor. An already-used GX power blocks the Mega branch but not the Regidrago Night Watch branch. Tool-based reduction, source effects, uncertain damage or absent target fail closed.

### What is executable

The exact staged actor continuation is [`agent22-newmoon-countercatcher-actor-sequence.cjs`](../../../simulation/evaluation/2026-11/agent22-newmoon-countercatcher-actor-sequence.cjs). It handles five consecutive phases:

1. Native offered `use-ability/Cursed Blast` from exact Bench Dusk, with a prior paid GX/Perfection attack and owner-visible opponent Bench target;
2. Source-attributed `ChoosePokemonPrompt` for opponent Bench, keyed to actual printing and Bench index;
3. After self-KO and **exact opponent Prize decrement**, native offered `play-card/Counter Catcher` from the corresponding hand index;
4. Source-attributed `ChoosePokemonPrompt` for the same, now-damaged opposing Bench Pokémon;
5. New native offered `attack` from the surviving Active Mewtwo, correctly attributable, paid, legal and lethal in the post-gust state.

It aborts stale turns, wrong seat, mismatched source/target index, untracked or changed Prize count, lost active attacker, disabled Perfection, wrong GX state, missing hand/Item token, nonlethal damage, Tool changes, absent prompts and any missing actual offered step. The source does not read or infer any hidden deck, opposing hand or unrevealed Prize cards, nor simulate opposing choices. Partial execution cannot prove the plan will be available naturally; the policy must revalidate after each native transition.

The [`agent22-newmoon-v3-countercatcher-worker.cjs`](../../../simulation/evaluation/2026-11/agent22-newmoon-v3-countercatcher-worker.cjs) wraps the existing Agent1 v3 actor policy **without editing it**. If a certified, paid **direct terminal KO** is already possible, the overlay preserves that non-self-KO win. Otherwise it offers this route in exactly qualifying conditions. If a started sequence becomes unverified, it **abstains** rather than delegating a half-finished prompt to the older policy. All ordinary uncovered requests still delegate to unchanged v3 policy. Worker identity and fixed deck hash inherit the original v3 60.

A production-style **no-runtime-`require`**, privately scoped [standalone artifact](../../../simulation/evaluation/2026-11/agent22-newmoon-v3-countercatcher-worker-standalone.cjs) is committed, built deterministically from the four checked-in sources by [this builder](../../../simulation/evaluation/2026-11/build-agent22-newmoon-v3-countercatcher-worker.cjs). Exact regenerated output was checked byte-for-byte and the bundle executed with `require=undefined`. It can be loaded by a restricted worker **in principle**; it has not been attached to an authorized live game.

### Executed contract evidence

- [68 synthetic actor-sequence checks](../../../tests/2026-11/agent22-newmoon-countercatcher-actor-sequence.test.cjs): both Prize clocks and paid attack families, every native token phase, two prompted opponent Bench targets, aborts on source/seat/turn/target/energy/effect/inventory failures.
- [14 synthetic worker-overlay checks](../../../tests/2026-11/agent22-newmoon-v3-countercatcher-worker.test.cjs): original source decision/audit structure, five-phase continuation, safe failed-prompt abstention, paid direct-terminal priority, exact unchanged deck identity. They passed both with CommonJS sources and the **no-import standalone** bundle.
- [21 pure actor-conditional tactical gate cases](../../../tests/2026-11/agent22-newmoon-countercatcher-after-selfko.test.cjs) covering nominal self-KO-enabled gust versus Item lock, missing Prize clock, GX spent, incomplete damage and hypothetical conditions. These are a separate feasibility model, not a native policy.
- [30 seven-arm arbiter cases](../../../tests/2026-11/agent22-newmoon-whole-turn-priority.test.cjs) now prioritize *game-terminal* tactical actions over nonterminal direct KOs, with certified direct terminal preferred over self-KO terminal.

All code/tests were read from committed GitHub sources and executed in a V8 CommonJS-compatible harness on 28 November 2026. This is **not** pinned Twinleaf `Store` integration or a completed game. A native gate may reject the inferred prompt shape or attack-source metadata, in which case the program must abstain and the line remains unproven.

### What determines whether this is a better fixed 60

Focus on **actual opportunity frequency and converted Prizes** against original source decks that bench VSTAR or Mega ex and allow Items. The line is unavailable under live AOR Vileplume Item lock and may be dominated by direct non-selfKO knockouts when Fairy Zone Psychic Weakness is active. It uses the valuable one-of Dusknoir and can lose without a paid Mewtwo attack/terminal opponent target. A credible owner-approved opponent-response game must register the **same v3 list**, physically paired source deals and a strong source-player policy, then record exact attempts reaching 3–3 or 2–2, native prompt/ability/item/attack success, and final winner. Do not score feasibility tests as 32-field wins or promote the worker without native contract + game acceptance.