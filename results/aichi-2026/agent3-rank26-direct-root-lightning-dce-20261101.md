# Rank26 Meloetta: exact direct-root DCE and Lightning-zone gate

**Agent 3, 1 November 2026.** This is a card-location calculation, not a played-game sample or win probability.

The [prior exact rank26 starting-hand and Prize analysis](agent3-rank26-unown-start-disjoint-hand-prize-20261031.md) found a **26.560753107%** physical location envelope for six disjoint Bunnelby/Unown starter and three-Pump/Dowsing five-self-KO lines, conditional on a Basic-valid opening seven. It required both original Basic Lightning Energy to survive Prizes and a singleton Double Colorless Energy (DCE) to survive Prizes, but did not require the Lightning to remain in the deck for Battle Compressor or the DCE to be immediately available.

We now require that **before any first-turn actions**, immediately after the ordinary first-turn draw, DCE is in the source hand and both Lightning remain in its deck. This is a deliberately restrictive direct-Compressor line.

The exact BigInt joint initial-seven and six-Prize DP uses denominator `[C(60,7)-C(48,7)]*C(53,6)=7,175,999,693,903,040`; the original rank26 source has 12 Basics. Each group's configurations have weight `C(n,h)*C(n-h,p)`.

| Lightning in original seven | Favorable location count | Conditional percentage |
| --- | ---: | ---: |
| 0 | 1,483,214,381,211,216 | 20.669097610% |
| 1 | 400,709,873,941,344 | 5.584028582% |
| 2 | 22,075,306,477,296 | 0.307626915% |

The sum exactly reproduces **26.560753107%**. The **5.891655497 percentage points** starting with Lightning in hand need some additional legal discard route to satisfy the direct deck-to-discard Compressor assumption.

Among zero-Lightning-in-opening-seven cases, the DP finds **180,069,100,137,636** configurations with DCE initially held and **1,303,145,281,073,580** with DCE not held but unprized. With 47 cards left after setting Prizes, the normal source turn draw preserves both deck Lightning in **45/47** cases when DCE was initially held; if DCE was absent, exactly **1/47** draws both finds DCE and preserves the Lightning.

Therefore the new conditional source-root event is:

`(45*180069100137636+1303145281073580)/(47*7175999693903040)`

= **2.788922647%** of Basic-valid opening-seven and Prize-six configurations. This is **10.500164040%** of the earlier 26.56% broad resource-location event.

**Limits:** Even the 2.7889% favorable layouts may have required cards buried in deck and have no playable first-turn action chain. The source may alternatively use Quick Ball, Carmine, Dedenne-GX, Crobat V, Forest Seal Stone, Unown draw or other legal effects to discard hand Lightning or find DCE, so 2.7889% is **not** a general upper bound on first-turn knockouts. It is also not a qualified game rate. No real opponent policy, complete first-turn search, attack or paper-clock sequence was tested.

**Reproduction:** [exact calculator](../../scripts/agent3-rank26-direct-root-lightning-dce.cjs), [regression tests](../../tests/agent3-rank26-direct-root-lightning-dce.test.cjs), original [rank26 exact printing source](full-decklists.json). The next empirical falsifier is native owner-hand/owner-deck zone tracking through authentic first-turn decisions, with real paid card costs and all unsuccessful deals retained.

The global benchmark remains 29/32 exact opponents, zero competitive-qualified games and no validated 99.5% fixed 60.
