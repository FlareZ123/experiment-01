# Rank26 Meloetta Donk has 50 printed slots exposed to the combined Jellicent + Silent Lab restrictions

**Agent 3 | 30 October 2026 | exact original-print category census, not a game win-rate result.**

The authenticated original rank **26, Hibiki Yamada, Meloetta Donk** is a notable adversarial test for the **candidate-first** Active Jellicent ex (WHT45) + Silent Lab (PRC140) position. **Oceanic Curse** prevents the opponent from playing Item cards and Pokémon Tools from their hand while Jellicent is Active. **Silent Lab** makes **Basic Pokémon in play, hand and discard pile have no Abilities**, covering the original source's extensive Basic draw/recursion package. None of these effects directly prohibits source Stadiums or Supporters.

Using the [rank26 print-resolving census](../../scripts/agent3-rank26-duallock-print-census.cjs) with the original [29-deck authenticated manifest](full-decklists.json) and the repository's English print-indexed card database, we classify the source 60:

| Class | Source card slots | Effect under actual combined lock |
| --- | ---: | --- |
| Item cards | **35** | Cannot be played from hand while Active Oceanic Curse applies |
| Pokémon Tool cards | **4** | Cannot be played from hand while Active Oceanic Curse applies; already-attached Tools remain |
| Basic Pokémon with at least one printed Ability | **11** | Printed Abilities suppressed while Silent Lab is active; Pokémon remain playable and can attack |
| Basic Pokémon without a printed Ability | 1 | No Ability to suppress |
| Stadium cards | 4 | Still playable; can replace Silent Lab |
| Supporters | 2 | Still playable subject to normal turn rules |
| Energy cards | 3 | Still attachable subject to normal turn rules |

**39 Trainer slots cannot be played from hand while Item/Tool lock is maintained. Eleven separate Basic Pokémon slots have their printed Abilities suppressed while Silent Lab is maintained. These disjoint categories total 50 of the original 60 printed slots.** This is *category exposure*; it would be materially false to say the source has 50 dead cards or loses 83.33% of its game actions. Basic Pokémon can still be played, attack, and carry Energy; Items and Tools already attached or otherwise used before the lock are also not reversed. Each continuous restriction can cease when its own condition is lost.

## Which exact seven Basic Ability identities matter

| Printed Basic | Copies | Printed Ability rendered unavailable by Silent Lab |
| --- | ---: | --- |
| Unown AOR30 | 4 | **Farewell Letter**, Bench self-discard and one-card draw |
| Exeggcute PLF4 | 2 | **Propagation**, return from discard to hand; essential to repeatable self-KO or discarding-resource lines |
| Meloetta ex BLK44 | 1 | **Debut Performance**, permits first-player first-turn attack (irrelevant when source is going second against candidate-first lock) |
| Tapu Koko ◇ TEU51 | 1 | **Dance of the Ancients**, Lightning acceleration from discard |
| Squawkabilly ex PAL169 | 1 | **Squawk and Seize**, first-turn hand discard and draw six |
| Crobat V DAA104 | 1 | **Dark Asset**, Bench hand refill |
| Dedenne-GX UNB57 | 1 | **Dedechange**, Bench discard and draw six |

The twelfth Basic is Bunnelby PRC121 with an **Ancient Trait** (Barrage) rather than an Ability, so it does **not** belong in the Silent Lab Basic-Ability slot count. The U+25C7 Prism Star diamond for Tapu Koko is normalized only for matching the original manifest's display-character variant to the stored exact set-number print. This is a card-text category census, not an AI inference of how often any ability would actually be used.

The four original **Risky Ruins** Stadiums are an explicit bypass: rank26 may play one to discard Silent Lab, restoring its Basic Abilities. However **Oceanic Curse's separate Item/Tool ban remains active** unless Active Jellicent is removed or that Ability is suppressed. The source has zero Guzma Supporter, and its Item outs (Counter Catcher, Escape Rope, Canceling Cologne) are themselves prohibited while the lock is active. The source might still manually attach and attack, use legal Supporters, or eventually take a Knock Out. Source-first rank26 has an entirely different opportunity: it may use Meloetta ex's printed Debut Performance before a candidate-first lock, conditional on real self-KO, Energy and TM operations.

The [rank26 preturn singleton vulnerability](agent3-meloetta-donk-lone-basic-setup-risk-20261030.md) and [candidate joint lock plus Bench](agent3-secretbox-bench-safe-joint-opener-20261030.md) show why this pronounced card-class exposure does **not** establish even a favorable matchup win rate. Candidate-first lock is a very small direct opening event (only 8.328381% in the 12-Basic four-of Secret Box model), and source-first Donk can threaten before the candidate ever acts. Source still may replace Silent Lab, so its Abilities can resume despite the continuing Item lock.

**Validation:** `tests/agent3-rank26-duallock-print-census.test.cjs` asserts the exact 39+11+10 partition and all seven named printed Ability identities, with strict source-set and number lookups. English card ZIP independently inspected, including Bunnelby's no-Ability classification and the Tapu Koko diamond alias. The exact original-print classification test subsequently **passed on Node 20 in the manually dispatched bounded [source regression CI run 41146136608](https://github.com/FlareZ123/experiment-01/actions/runs/41146136608)** alongside 11 other pure test suites. This validates the repository's print-index mapping and assertions; it is **not** a pinned Twinleaf engine result or a gameplay simulation.

**Native acceptance gate:** candidate-first held Secret Box → Boost+Lab+Hood → Active Jellicent. Source rank26's attempted Quick Ball, TM Crisis Punch and Exeggcute Propagation must be genuinely rejected while the relevant constraints apply. Then source play of its own Risky Ruins should be accepted, restore the Basic Abilities, and **not** restore locked Items or Tools while Jellicent remains Active. Include a real source attack/Prize continuation. This isolates the two distinct continuous restrictions in native game state, with no fake engine win claims.

Benchmark unchanged: **29/32** authenticated original 60-card opponents, **0** competitively qualified games and **no demonstrated 99.5%**.
