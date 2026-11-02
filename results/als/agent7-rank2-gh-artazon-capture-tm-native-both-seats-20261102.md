# Agent 7: original rank-2 Guzma & Hala + Artazon + Capture Energy to two TM Evolution attacks

**2 November 2026 | 2/2 native original-60-conserving staged seats PASS | zero natural games or competitive wins**

## Question

Can the original Aichi rank-2 Vileplume Control 60 establish **Vileplume AOR 3 and Pidgeot ex OBF 164 on the first turn going second** with a single Guzma & Hala, Artazon, Capture Energy, TM Evolution and Ω Barrage Bunnelby PRC121? This route does not require holding either Oddish or Pidgey before searches. It extends Agent 40's already documented *Jet Energy variant* by proving the complete three-channel Trainer/Bench search prefix natively.

## Exact original source and staged physical deal

[Test and fixture](../../tests/agent7-native-gh-artazon-capture-stage.test.cjs) uses [the authenticated rank-2 printed 60](../aichi-2026/full-decklists.json), Git blob ae773f6201d7aa69d31914dbfee66f3fba692200, card-name alias resolution, and the pinned original Twinleaf Store revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

The conditioned first source turn going second starts with **Bunnelby PRC Active**, seven source-printed cards in hand including Guzma & Hala CEC and two ordinary discard fillers, **six actual face-down Prizes**, and the other 46 original-printed cards in deck. The test asserts all 60 unique exact source physical copies remain in owner-visible or concealed zones. No card is duplicated or conjured. Source opponent is the authenticated original rank-1 Shadow Rider 60 (no opposing discretionary actions before the first source attack).

The test intentionally chooses the initial favorable physical deal and good decisions. It does not estimate their natural frequency, model mulligans, claim an original tournament player made these choices, or compare games.

## Both real Store seats: physically settled sequence

1. **Guzma & Hala CEC from original owner hand:** actual Supporter PlayCardAction, SelectOptionPrompt mode 1, two validated source-hand discards, actual ChooseCardsPrompt from owner deck for **Artazon PAL + TM Evolution PAR + Capture Energy RCL**, shuffled and moved into hand. Discarded original cards remain in physical discard.
2. **Artazon PAL:** actual Stadium PlayCardAction, genuine UseStadiumAction, owner-deck ChooseCardsPrompt for **Oddish UNB**, native Bench entry and deck shuffle. Five real Bench slots modeled; empty slots do not count as occupied.
3. **Capture Energy RCL:** actual from-hand PlayCardAction to Active Bunnelby, native attached Energy with true Colorless payability, owner-deck ChooseCardsPrompt for **Pidgey MEW**, native Bench entry and shuffle.
4. **TM Evolution PAR:** actual Tool PlayCardAction on Bunnelby, then **AttackAction Evolution**. Native Stage searches progress Oddish/Pidgey to **Gloom UNB + Pidgeotto TEU**.
5. **Bunnelby Ω Barrage second attack:** genuine native ConfirmPrompt consent and ChooseAttackPrompt selecting **Evolution** again, native searches progressing them to **Vileplume AOR + Pidgeot ex OBF**. Both physical seat cases finish with the correct fully evolved Bench, **Capture Energy still attached to Active Bunnelby**, no outstanding prompts, and the native active turn passed to the original opponent.

The native prompt trace per seat includes Stage target selection, two actual deck card selections and shuffles for the first attack, a consent and second printed attack selection, two target searches and second shuffles, and animation settlements. The first/second attacks were resolved in the real Store with source-aware constrained SimpleTacticsAi prompt decisions; the initial card, Supporter, Stadium and Energy selections were deliberately staged and dispatched explicitly from genuine owner cards. This is a validated *constructed favorable physical turn*.

## CI record and reproducibility

[Successful full run 41403888361](https://github.com/FlareZ123/experiment-01/actions/runs/41403888361), head **16ada33ba70e71afc537c6de7a4bb8b10915dc9e**, job **125141468149**, compiled pinned original Store, named test step **2/2 passing**, complete manual Bunnelby workflow overall SUCCESS. The actual two emitted native receipts have identical summary results and the expected distinct owner physical seat identifiers (0 and 1).

A first attempt [41403362003](https://github.com/FlareZ123/experiment-01/actions/runs/41403362003) failed a test-only occupied-Bench assertion after **the original Artazon source search had already worked**: the assertion accidentally included four empty bench slots. This was corrected. The follow-up [41403644876](https://github.com/FlareZ123/experiment-01/actions/runs/41403644876) passed both seats for G&H / Artazon / Capture. The last test extension added paid TM and the two actual attacks, then passed as above. No original-source card, deck inventory, or opponent card printing was changed to repair the first assertion.

## Relation to quantitative work and boundaries

The companion [physical-card availability screen](agent7-vileplume-artazon-capture-three-channel-20261102.md) independently estimates **13.64909% ±0.01159 percentage points**, conditional on valid rank2 initial seven, for the named *resource availability* conditions across **40 million physical shuffles**. Original rank15's analogous resource screen estimates **11.34296% ±0.01068 pp**, but rank15 has **one** Capture Energy rather than rank2's two and has **not yet had this exact native turn staged**. Both opening estimates are opportunity models only; they require separate owner-visible policy conversion and never imply a realized setup or win rate.

The native turn currently begins with Guzma & Hala already held. The **Tag Call → Guzma & Hala** connector, actual owner-root proposal of the actions rather than a forced favorable choice, and opposing original-source response after the Stage2 board are future tests. The original rank1 opposing player has the immediate next-turn decision; the staged test only confirms the transfer. Actual game clock, full paper legality, source matchups and win-rate qualification remain open.

**Field status:** 29/32 authenticated original opposing sixties (missing 23, 25, 28), 0 competitively qualified games, unchanged fixed-60 contender decision, 99.5% not established.
