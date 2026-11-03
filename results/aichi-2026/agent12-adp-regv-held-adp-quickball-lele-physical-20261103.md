# ADP held in original seven: Quick Ball discard into Tapu Lele's Wonder Tag and Thorton

**Agent 12 | 3 November 2026 | exact frozen Agent5 ADP / Thorton / Regidrago v2 60, SHA-256 bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b | six-Prize exact combinatorics and two-million-deal independent literal shuffled sample | zero games**

## Paper card-text setup and strategic question

The attached full English card pool confirms the relevant actual printings: Quick Ball SWSH179 requires discarding **another** card from hand to search a Basic; Tapu Lele-GX GRI60's **Wonder Tag** searches a Supporter when Lele is **played from hand onto Bench during your turn**; Battle Compressor PHF92 searches the deck for **up to three** cards to discard; Thorton LOR167 swaps a Basic in discard with a Basic in play, retaining attached cards and the receiving Pokémon's inherited turns in play.

Consider a distinct, physically possible Regidrago V-starter path that the prior [no-original-seven-ADP RegV model](agent12-adp-regv-pokegear-two-turn-exact-20261103.md) excludes:

1. The initial seven contains **both** ADP and Regidrago V. Deliberately choose Regidrago V Active and keep ADP in hand.
2. On the player's first turn going second, the first eight cards contain Double Dragon Energy, Quick Ball and Battle Compressor. Quick Ball physically discards the held ADP, searches the **unprized, in-deck** singleton Tapu Lele-GX and brings it into hand. Bench Lele during the turn and use Wonder Tag for a **genuine unprized in-deck** Thorton.
3. Battle Compressor discards the singleton unprized **M Charizard-EX FLF69** attack donor from deck. One functioning Double Dragon Energy pays enhanced Altered Creation-GX after Thorton swaps the now-discarded ADP into the Active in place of original Regidrago V. Original Regidrago enters discard.
4. The opponent's turn must leave ADP intact. On the owner's second turn, if the held physical resources include a second Thorton or VS Seeker, a Basic Grass/Fire and Regidrago VSTAR, the owner Thorton-swaps Regidrago back, evolves under the inherited original-seven in-play history, attaches one Basic and could use Apex Dragon to copy Wild Blaze.

This study is deliberately restricted to **direct second-turn Thorton or VS Seeker and a held/drawn VSTAR**, without secondary T2 Pokégear or Ultra Ball. There are only four physical cards left in the turn-two hand after spending opening Regidrago, ADP, Quick Ball, Compressor, DDE and fetched T1 Thorton, then drawing the ninth. Playing a second Supporter and attaching Energy leaves too few cards to discard two for Ultra Ball. The player's starting Bench optionality is respected by keeping ADP and not prematurely benching Lele during setup.

## Exact result for this disjoint branch

The source [exact integer combinatorics](../../scripts/agent12_adp_regv_held_adp_quickball_lele_exact.py) enumerates original seven with ADP and RegV, all eligible eighth-card paths, six joint face-down Prizes leaving the actual Lele/M/Thorton deck targets accessible, three authentic deck removals and one T2 natural draw from the remaining **43**. It retains existing first-eight Thorton and VS Seeker cards for the second turn, or accounts for an actual ninth-drawn one. The frozen 60 SHA is verified before enumeration. The original seven must contain both named Basics and the original eighth contains the actual QBall/Compressor/DDE requirements. All displayed rates use the same 232,063,840 Basic-valid opening-sevens denominator as the earlier studies.

| Explicit paper-resource condition | Exact probability per Basic-valid opening seven |
| --- | ---: |
| T1 enhanced GX physical resource opportunity | **0.187584722106858%** |
| T1 enhanced GX followed by strictly direct T2 Apex resource opportunity | **0.00354947449945247%** |

The T2 contribution decomposes into **0.00232249082310 percentage points** with a held second Thorton, **0.00055780101267 pp** with held VS Seeker, and **0.00066918266368 pp** with a ninth-drawn Thorton or VS. The exact reduced fractions are **117426744227133 / 62599311344897600** for T1 and **15871047093 / 447137938177840** for full T1/T2. The raw favorable T2 combinatorial mass is **382174813999440 / 10767081551322387200** before reduction; the T2 natural-deck size of 43 is explicit.

The branch is **disjoint by original-seven ADP status** from the prior RegV-starter calculations that require zero ADP in the opening seven. Therefore it adds a mathematically distinct narrow access mechanism without double-counting those first-seven cohorts. **It is not a global deck opening chance**, because other starting Active choices and many tactical and search avenues remain excluded. In particular, starting ADP Active directly is a competing line and might dominate this needlessly elaborate RegV-first Quick Ball/Lele route in some states. The model makes no claim that the intentional R-start choice maximizes winning probability.

## Independent shuffled physical validation

The [separate literal 60-deal test](../../scripts/agent12_adp_regv_held_adp_quickball_lele_physical.py) splits the Crobat V from the neutral category to preserve the real seven-Basic starting legality, physically places the six Prizes, physically removes the named donor/Supporter search targets and draws the actual ninth card after deck shuffle. It does not call the exact hypergeometric calculation; its two result assertions use five-binomial-standard-error sampling envelopes.

**2,000,000 shuffled 60s, random seed 12051327:** **1,202,226** Basic-valid opening sevens; **2,359** physical T1 GX resource opportunities (observed **0.19621935%**, exact **0.18758472%**), and **51** strict T1-to-T2 resource opportunities (observed **0.00424213%**, exact **0.00354947%**). Observations are within 2.2 and 1.3 binomial standard errors of the exact figures, respectively. Statistical variability is substantial on the low-frequency T2 event; exact combinatorial calculation is the primary evidence.

[Existing opt-in manual GitHub Actions run 41593405186](https://github.com/FlareZ123/experiment-01/actions/runs/41593405186) completed **SUCCESS** at commit cf9336a0b805176763ca7f258676d470d98019d4, including both scripts, all previous three-million-deal and 750k Gear controls and Goodra/HP calculations. No additional on-push workflow was introduced.

## Opportunity cost, inability to rank the deck and next test

This narrow Quick Ball line **turns a held ADP into a desirable discard target**, consistent with state-dependent DCI, but it also consumes the Quick Ball search, one Bench spot occupied by a two-Prize Lele, and the one Wonder Tag Ability. Against an opponent with already active Iron Thorns ex Initialization or other relevant Ability lock, Wonder Tag may fail even when the exact card resources are present; likewise Item lock can remove the Quick Ball/Compressor access entirely. These ability and lock constraints are not in the count.

The alternative ADP-first Active setup and other physically possible two-turn pathways are excluded. Adding this 0.00354947% branch to prior disjoint cohorts is valid only as a narrowly defined union of resource patterns, not as evidence of an optimized human policy. Actual native Thorton also needs the existing [paper-preservation hook](agent12-thorton-native-custody-paper-reversible-hook-20261103.md) before a full GX/Apex game can be trusted.

**Decision:** No proposed change to the frozen 60 or its rank. Route discovery alone does not justify replacing its natural strategy, and the field goal remains a single fixed winning deck. 29/32 original source 60s are authenticated, ranks23/25/28 remain missing, **zero competitively qualified games**, and no demonstrated 99.5% win rate.
