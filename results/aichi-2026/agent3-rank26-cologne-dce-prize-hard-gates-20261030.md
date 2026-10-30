# Joint Prize-card collapse limits rank26's conditional Meloetta first-turn witness

**Agent 3 | 30 October 2026 | exact six-Prize mathematical gates on specific source resources, no real game rate.**

The [original rank26 paper-state witness](agent3-rank26-meloetta-first-turn-five-self-ko-paper-witness-20261030.md) established a coherent **conditional** 21-action source-first line: Risky Ruins, two reusable Exeggcute and three Damage Pumps give the candidate five Prize cards; Tapu Koko ◇ attaches one Lightning Energy to Benched Meloetta ex and one to another Bench; a manual **Double Colorless Energy** provides the remaining two Colorless; TM Crisis Punch does 280 to a lone Frillish with the candidate at one Prize remaining. The source original has exactly **one DCE, two Basic Lightning**, and **one Canceling Cologne**.

The DCE is particularly important: its printed energy count supplies two of the three Crisis Punch Energy units with the source's single allowed normal first-turn attachment. Tapu's Dance of the Ancients can attach one Lightning to Benched Meloetta; it must attach its second Lightning to a different Benched Pokémon, so the *specific documented paper witness* requires both source Lightning cards, its single DCE, and a searchable TM. The source's 60 does not have another multi-energy Special Energy or a known alternate source-first acceleration route for the printed 280-damage TM line. Do not generalize that assertion into proof that other untested attack lines are impossible.

Against a candidate whose **sole Active is Mimikyu PAF37** (Safeguard prevents damage from opposing Pokémon ex) or **Iron Thorns ex TWM77** (Initialization removes Meloetta's first-turn attack permission), source's **sole Canceling Cologne ASR136** is additionally required to disable the relevant opponent Active Ability for that turn in this attack line. Original rank26 has zero Guzma, and its one Counter Catcher cannot gust an opponent with no Bench. Source's Exeggcute self-KOs give the *opponent* five Prize cards, so source has no opportunity to take its own Prize before making the first damaging attack. **A required Special Energy or Item already among source's six Prize cards cannot be retrieved simply by drawing more cards from source deck.**

## Exact joint six-Prize combinatorics

A uniformly sampled 6-card Prize set from 60 contains none of `k` specified distinct card copies with probability:

[
P(\text{all }k\text{ required cards unprized})=\frac{\binom{60-k}{6}}{\binom{60}{6}}.
]

The [BigInt source](../../scripts/agent3-rank26-singleton-prize-gates.cjs), [three pure tests](../../tests/agent3-rank26-singleton-prize-gates.test.cjs), and direct independent Python `math.comb` agree. These are **joint** six-Prize probabilities, not products of independent 90% copies.

| Restricted physical requirement for documented source attack | All selected card copies unprized | At least one required copy Prized |
| --- | ---: | ---: |
| Singleton Double Colorless Energy | **90.000000%** | 10.000000% |
| DCE **and** singleton Canceling Cologne | **80.847458%** | **19.152542%** |
| DCE **and both** Basic Lightning for the exact Tapu dance witness | **72.483928%** | 27.516072% |
| DCE, both Basic Lightning **and** Cologne | **64.854040%** | **35.145960%** |

The first two rows give hard resource limitations on the specific Meloetta first-turn TM route when source is locked against defensive lone Active Mimikyu or Iron Thorns, *assuming no alternate Pokémon/Item effect retrieves that inaccessible card from Prizes before the attack*. The last two rows are **upper bounds for this precisely documented three-Energy/Lightning distribution witness**; some other physically legal source lines may use a different acceleration or energy placement, if they exist. These figures are *not* probabilities of winning against either Active or even completing the first-turn combo once cards are unprized.

For rank26's original two **Hisuian Heavy Ball**, that Item may recover eligible **Basic Pokémon** from Prizes (e.g., a Prized Meloetta or Tapu), but its effect is not a general-purpose DCE, Lightning or Cologne Prize recovery. A future 60-game policy must separately model the location of the recovery Items and their Supporter/Item contention, the possibility that DCE is in source's initial hand, and whether all donor and TM pieces are reachable before the first player-owned attack.

**Next hard falsification:** In the common native rank26 first-turn source, retain six true source Prizes and before source's first attack record whether DCE/Cologne/Lightning are Prized or known via legal search. Demonstrate source's exact Tapu one-Energy-per-recipient action and the resulting Meloetta attack cost. Do not accept a stage fixture which creates two Lightning from one physical card or installs a DCE when its sole copy is still face-down Prized. Test the candidate lone safeguarded Mimikyu and lone Active Thorns with Cologne deliberately Prized as negative controls.

**Bottom line:** The conditional paper donor line is real enough to warrant a Store-level test; joint Prize positions already remove over a quarter of fully unprized cases for its exact Energy distribution, and over a third when the sole Ability-bypass Cologne must also be available. The only validated statistical claim is this combinatorial card-location event. **29/32 original Aichi 60s, zero qualified competitive games, no demonstrated 99.5%** remain.
