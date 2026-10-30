# Exact original rank26 first-turn Meloetta donor witness has a 5.33% opening-plus-Prize upper event

**Agent 3, 30 October 2026.** This measures the **single, fully specified 21-action paper line** in [the state-transition witness](agent3-rank26-meloetta-first-turn-five-self-ko-paper-witness-20261030.md). It is an **upper bound on that particular line's original-card arrangement**, not on other possible first-turn attacks, not a gameplay rate, and not a prediction of the full Aichi matchup.

## The still-unanswered question

The source-first Meloetta Donk line was verified as a *conditional* ordered printed-card state trajectory: 5 Exeggcute self-KOs through three Damage Pumps yield exactly one remaining candidate Prize; Dance of the Ancients attaches two Lightning to two **distinct** Benched Pokémon; DCE attached to Melo supplies 3 Colorless for TM Crisis Punch; Escape Rope promotes Melo to attack lone unprotected Frillish 70HP on turn1 via Debut Performance. **No initial-source-hand acquisition schedule or native Store action transcript has been demonstrated.**

The earlier 72.483928% DCE+2 Lightning all-unprized calculation only tracked Energy copies. A complete feasibility filter for this witness must also account for donor, Stadium, Item and Pokémon identities, including the need for at least **three of the four Damage Pump** copies and **both Exeggcute** copies. This report computes the exact joint six-Prize event for that complete print-identity requirement.

## Grouped requirements from the authenticated original 60

| Required group | Copies in source | Copies needed unprized for this exact witness |
| --- | ---: | ---: |
| Bunnelby PRC121 (chosen initial Active) | 1 | 1 |
| Meloetta ex BLK44 | 1 | 1 |
| Tapu Koko ◇ TEU51 | 1 | 1 |
| Exeggcute PLF4 | 2 | **2** |
| Unown AOR30 | 4 | 1 |
| Risky Ruins MEG127 | 4 | 1 |
| Damage Pump LOR156 | 4 | **3** |
| Battle Compressor PHF92 | 4 | 1 |
| Double Colorless Energy SUM136 | 1 | **1** |
| Technical Machine: Crisis Punch PAF90 | 2 | 1 |
| Escape Rope BST125 | 1 | **1** |
| Basic Lightning Energy | 2 | **2** |

There are **27 named physical cards** in these twelve groups and 33 remainder cards. We do not assume replacement cards can satisfy the same specific line when required copies are Prized. Some other line might use different donor, pivot, acceleration or attack resources; therefore no general rank26 Donk upper bound follows.

## Exact integer combinatorics

For six Prize cards from source 60, each source card group `i` has `n_i` physical copies and requires at least `r_i` unprized. If `p_i` of that group are Prized, legal terms satisfy `0 ≤ p_i ≤ n_i−r_i` and `Σ p_i = 6`, plus the 33 unrestricted other-card group. The exact favorable number of Prize sets is:

[
N = \sum_{\sum p_i=6} \prod_i \binom{n_i}{p_i}
\quad \text{subject to } p_i \le n_i-r_i.
]

A short exact integer dynamic program in [CJS](../../scripts/agent3-rank26-donk-prize-witness-upper.cjs), [three tests](../../tests/agent3-rank26-donk-prize-witness-upper.test.cjs), and independent Python `math.comb` calculation agree: **16,664,352 favorable** of **50,063,860** six-Prize configurations, or **33.2861908770%** with every named group sufficiently unprized. Requiring singleton Canceling Cologne as well for bypassing sole Active Mimikyu Safeguard or Iron Thorns Initialization lowers the joint unprized group event to **29.2786533040%**.

But this particular witness also specifies that its **starting Active was source's singleton Bunnelby**. Conditioning the source's original seven on containing at least one of its **12 Basic Pokémon**, a Bunnelby in that original seven occurs with probability **14.4148007571%**. Because Bunnelby then cannot be Prized, the six Prize positions are uniformly distributed among the other 59 physical copies, giving **36.9846565300%** chance for all other twelve-group minimums to survive. Multiplying the two correctly conditioned distinct events:

| Precisely constrained opening event | Probability among Basic-valid source initial sevens |
| --- | ---: |
| Original seven includes Bunnelby **and** all other required groups survive six Prizes | **5.3312645495%** |
| Same, plus singleton Cologne unprized | **4.6893994868%** |

This is a **hard necessary source-card-location gate for the particular Bunnelby-starting witness** assuming the original seven source has no mulligan. It still makes the extremely generous assumption that all remaining usable source cards can be found and sequenced before the end of the first player-owned turn, and that the candidate has precisely one unprotected 70HP Frillish Active. Actual first-turn success of this exact witness cannot exceed the 5.3313% event in the stated source opening model, and can be **substantially lower** due to search, hand disposal, turn clock, payment, sources Prized elsewhere and opponent Basic selections. The source could instead choose another starting Basic and a different escape/attack line; that does not violate this witness-specific ceiling.

## Going-first Carmine is a legal exception, with a discard tradeoff

One previously overlooked source card is original rank26's **single Carmine TWM145**. Its printed Supporter text explicitly permits playing Carmine on the first player's first turn and instructs **discard hand, draw five**. This is a card-text exception to the generic first-turn Supporter prohibition and is consistent with the supplied advanced rulebook's rule that card text takes precedence over ordinary rules. **The 21-step donor witness itself uses zero Supporters**, so its existing conditional result remains unchanged. However, other authentic source-first lines may legally use Carmine to access additional cards on the first turn. Such a choice discards the source's *entire other hand*, potentially losing donors, DCE, sole Escape Rope or essential Item resources unless they can be recovered; the card is not five free draws and must be assessed for DCI/connector contention and possible Prize collapse.

If the relevant initial hand has Carmine alongside essential one-ofs, its use can make the first-turn Melo line **worse**. Any native policy that globally prohibits all first-turn Supporters will underestimate this source's possibilities. A targeted owner-native test should verify actual Card text permission and settled discard/draw before using Carmine as a response in rank26.

## Next reproducible gate

Run one **original source owner 60** staged first turn with authentic six Prizes, Bunnelby Active, all 21 documented actions, **physical copy conservation**, each Exeggcute return-to-hand and rebench, exactly five candidate Prize receipts, Tapu's two different Lightning targets, manual DCE and TM attack. Then supply authentic random initial sevens and owner decisions to determine whether any source-first registered draw/search chain can find the pieces within one turn. Preserve **all failed hands, missing pieces, native rejection roots and action caps**, rather than retrospective successes. Test lone Active Mimikyu/Thorns and singleton Cologne as independent native negative controls.

The program has **29/32 authenticated original Aichi opposing sixties**, missing ranks **23,25,28**, **zero competitive-qualified games**, and **no validated fixed-60 99.5% result**.
