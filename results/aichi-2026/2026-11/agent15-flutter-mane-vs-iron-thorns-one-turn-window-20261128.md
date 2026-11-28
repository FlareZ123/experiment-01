# Iron Thorns ability lock: Flutter Mane opens an early Gate window, but a one-of does not solve the matchup

**Agent 15 | 28 November 2026 | exact card-text interaction + conditional 60-card initial-deal opportunity model, not full-game evidence or a suggested final card substitution.**

## Why Hood Shield's Radiant Gate gets shut off

Aichi ranks **6, 24, 29** are published Iron Thorns ex control lists. Iron Thorns ex's **Initialization** is continuously active as long as it is Active: Pokémon with Rule Boxes have no Abilities (except Future Pokémon). **Radiant Eternatus CRZ105** is a Rule Box Basic with **Climactic Gate** triggered only *when it is played from hand onto Bench*. If opponent Iron Thorns is already Active, simply playing Radiant under that lock means the on-play trigger is suppressed. **Attaching Stealthy Hood to Radiant afterward cannot retroactively replay the missed trigger.** This is a timing/geometry problem, not just a question of drawing a Hood.

**Shadow Rider VMAX Underworld Door** is different: it is a repeatable during-turn Ability. An already-in-play **Benched Rider VMAX** can acquire Stealthy Hood later and then use Door despite Initialization, provided the Tool's effect is live and a Benched Psychic Energy recipient and hand Psychic exist. This difference matters for recovery-policy sequencing under lock. Rival Tool Jammer disables Tools attached to our **Active**, but does not directly disable Stealthy Hood on our **Benched** Rider. The engine still needs naturally evolving V to VMAX without Gate or otherwise finding a temporary lock-breaking window.

## A real counterlock: Flutter Mane

The paper Expanded card **Flutter Mane TEF78**, a **non–Rule Box Basic Psychic Pokémon**, has **Midnight Fluttering**: while it is Active, the opponent's Active Pokémon has no Abilities except Midnight Fluttering. Iron Thorns's Initialization does not suppress Flutter Mane's Ability, because Flutter Mane has no Rule Box. If Flutter is **in our Active Spot before Radiant enters Bench**, it switches off the opponent Active Iron Thorns's Initialization and allows Radiant's Climactic Gate to fetch two available Rider VMAX from deck. Playing Flutter only to the Bench does **nothing** against the active Thorns lock.

This is a real interaction and merits testing; it is **not a complete game plan**. Flutter Mane is only **90 HP**; Iron Thorns ex's **Volt Cyclone attacks for 140**, so an unprotected Flutter can be KO'd on the opponent's following attack. Once Flutter leaves the Active Spot, Initialization returns and can suppress the two newly fetched Riders until they each obtain live Hood protection or another counterlock remains Active. The Gate ends the candidate's turn, so the new Riders cannot use Door before that immediate opponent reply. The opponent also has **Guzma** (2–3 copies in all three Iron Thorns lists) to manipulate Active positions. This is a temporary lock-breaking window, not persistent ability immunity.

## Exact 60-card diagnostic test, not a deck recommendation

I constructed a physical 60 for **testing only** by adding exactly **one Flutter Mane** to the unchanged Hood Shield card-count model and removing one **Teammates** Supporter. The substitution is **not recommended for adoption**: Teammates has independent comeback value and its removal was only a convenient way to keep exactly60 physical cards. A different cut could affect other matchups; no card swap was made in the published fixed deck.

The [Python model](../../../scripts/2026-11/agent15-flutter-iron-thorns-gate.py) shuffles 60, draws seven, sets six actual Prizes, then gives the candidate its first-turn natural draw. It conditions on an opening Basic. The source Iron Thorns begins Active with Initialization; no other actions or opponent policy are simulated. The model tests whether Flutter can legally be Active **before** playing Radiant:

- Start Flutter as Active if it appears among the opening seven; otherwise choose a low-retreat legal Basic Active. A forced Radiant Active cannot later put that same Radiant from hand onto Bench to trigger Gate.
- Search Flutter using held **Fog Crystal** (Psychic Basic), **Mysterious Treasure** (Psychic Pokémon) or **Quick Ball** (Basic), and search Radiant using Treasure (Dragon Pokémon) or Quick Ball; each paid search consumes a real distinct Item and discard. Candidate may use one **Arven** on its first turn **only when going second**, finding an eligible Item and/or **Float Stone**, subject to actual remaining deck.
- Move starting Active to Flutter before Gate using **Float Stone** on that Active (if Tool effect live) or ordinary retreat with one held/manual Psychic if its printed Retreat Cost is1; no fictional free Skyliner through an active Initialization lock. If **Tool Jammer** is on opposing Active Thorns, Float Stone's effect on our Active is disabled, but a genuinely paid ordinary retreat may still work.
- Radiant must still be accessible from hand/search, and **at least two Rider VMAX must be unprized in deck** at the exact Gate trigger. Bench capacity is sufficient under this isolated starting sequence.

**Important information boundary:** this is an *optimistic full-zone opportunity screen*. Its chosen connector/discard line may depend on the actual sampled deck/Prize contents; it is **not** a K0 actor policy and cannot be read as a real gameplay rate. It excludes other Supporters/draw, multiple mulligans, opponent first-turn effects beyond active Thorns/Jammer, your tools already attached, item lock, energy-stripping, follow-up fighting, and whether the new board ever wins.

### 30,000 paired physical initial deals, fixed seed 28112026

The same diagnostic Flutter sixty and physical shuffles gave **26,569 Basic-valid seven-card hands**. All numbers below are percentages of those Basic-valid hands that have an available **turn-one Flutter-Active-then-Gate action sequence** in the restricted oracle-feasibility model.

| Candidate first turn | Discard cost model | No source Tool Jammer | Source Tool Jammer live |
|---|---|---:|---:|
| Going first (no first-turn Supporter) | Permissive | **20.26%** | 17.27% |
| Going first | Protected singleton/resource discard | 18.36% | 16.24% |
| Going second (Arven allowed) | Permissive | **24.50%** | 19.81% |
| Going second | Protected singleton/resource discard | 23.28% | 18.80% |

The one Flutter was naturally Active in **3,586/26,569 =13.50%** of valid opening sevens. The extra opportunities above that require the precise search and actual mobility sequence. The going-first Jammer column is a **counterfactual tool-effect sensitivity** (the opponent cannot ordinarily attach Tool Jammer from hand before the first player's opening turn); going-second Jammer is plausible after the opponent's first turn. All three original Iron Thorns lists physically contain exactly **one Tool Jammer** and 2–3 Guzma; the model does not assume that singleton was necessarily drawn or attached.

### Failure and what to optimize instead

The one-of Flutter **cannot** establish a turn-one Radiant Gate in the great majority of these restricted legal openings, even under favorable deck-aware planning. Moreover, the accessible Gate window does not survive the opponent's ordinary Volt Cyclone attack by itself. Thus **do not replace a useful singleton merely on the theory that “Flutter Mane beats Iron Thorns.”** Its effect is real, but the integrated line's Active movement, tool contention, early survival and post-Gate energy engines remain hard.

The stronger future investigation is a **non-Gate recovery route** in the existing Hood Shield 60: establish Rider V on Bench before a normal T2 evolution into VMAX, attach Stealthy Hood while it remains on Bench, use the now-protected Underworld Door for acceleration, then fund attackers **before** moving them Active under opposing Tool Jammer. Compare that with the timed Flutter Gate path in the **actual** three Iron Thorns source lists, which also contain heavy Energy stripping (four Plumeria and two Team Flare Grunt each, plus some Crushing Hammer). Neither route is yet a demonstrated win.

## Reproduction and verdict

- [Source and exact 60-card diagnostic sampler](../../../scripts/2026-11/agent15-flutter-iron-thorns-gate.py)
- [Local-passing regression](../../../tests/2026-11/agent15-flutter-iron-thorns-gate.test.py) covers forced Flutter Active, one-P paid retreat, Arven+Float going second, rival Tool Jammer, forbidden Radiant Active, exact physical cards and fixed 5,000-seed screen.
- Run: `python tests/2026-11/agent15-flutter-iron-thorns-gate.test.py` and `python scripts/2026-11/agent15-flutter-iron-thorns-gate.py 30000`.
- Card text checked in the supplied English corpus: Iron Thorns ex TWM77, Flutter Mane TEF78, Radiant Eternatus CRZ105, Stealthy Hood UNB186 and Tool Jammer BST136. Opponent exact inventory drawn from ranks6/24/29 in `results/aichi-2026/full-decklists.json`.

No candidate fixed deck, frozen worker/fixture, GitHub Actions, Twinleaf or native match changed. **No 99.5% performance or even a measured Iron Thorns matchup rate is asserted.** This is a concrete warning against substituting “card answers lock” for “reliably executing a winning line.”
