# ADP → Thorton → Regidrago VSTAR → Wild Blaze: exact direct two-turn *complete payoff* resource opportunity

**Agent 30 | 2 November 2026 | independent printed-card, exact finite-deal audit | zero native games or demonstrated competitive wins.** Source [immutable Agent5 ADP v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical deck hash `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`; [original Agent5 strategic hypothesis](../aichi-2026/agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md). This study extends [the independent first-turn enhanced GX search opportunity](agent30-adp-t1-enhanced-gx-access-and-mulligan-20261102.md) by imposing a **real card-in-discard source, a legal Thorton replacement source, an evolution and both Energy attachments** before a second-personal-turn copied attack.

## Exact route defined, with no fabricated hands or future draw

Going-second first personal turn (T1):

1. The **opening seven** contains Arceus & Dialga & Palkia-GX (`sm12-156`) selected as the starting **Active**; no switching is permitted.
2. The **first eight seen** (opening seven plus one ordinary T1 draw, after six face-down Prize cards) contain at least one `Double Dragon Energy xy6-97` and one `Battle Compressor Team Flare Gear xy4-92`.
3. The sole `M Charizard-EX xy2-69` is **not** in those eight and survives the Prizes, and at least one `Regidrago V swsh12-135` remains physically **in the deck after Prizes**. The player uses a genuine Battle Compressor search to select and discard *both* those physical cards from the deck (one Item, no hand discard), then shuffles. A hand-held Charizard or Regidrago V cannot fulfill this *specific* Compressor route, although alternative discard lines may exist.
4. Attach the held DDE to ADP as the once-per-turn manual Energy attachment. DDE gives **two every-type units** on the Dragon-type ADP, satisfying Altered Creation-GX's one Metal attack cost plus one **additional Water**. Declare the enhanced GX attack. This uses the first-player-attack rule correctly: the hypothetical pilot is **going second**.

Going-second **second personal turn (T2)**:

5. The player has one `Thorton swsh11-167` Supporter, one `Regidrago VSTAR swsh12-136` and one Basic Grass **or** Basic Fire Energy across the first eight, possibly recovering the *sole missing one* with the one ordinary T2 draw **after Compressor has shuffled**. No further Item/Supporter draw, search or acceleration is allowed in this strict model.
6. Play Thorton to replace the in-play ADP with discarded Regidrago V, preserving attached DDE and ADP's original number of turns in play. Evolve the inherited Regidrago V into VSTAR on T2. Manually attach the Basic Grass/Fire. The DDE's two any-type Energy units plus one basic satisfy Apex Dragon's printed Grass, Grass, Fire attack cost.
7. Select the actual discarded Dragon-type `M Charizard-EX XY2 69`'s **Wild Blaze** as the copied attack. Its printed **300 damage** to the opponent's Active gains **+30** from the earlier enhanced Altered Creation-GX if no cancelling effects apply; it also discards the top five of the owner's own deck. The extra Prize for a damage KO is conditional on actually knocking out a target, so it is **not** counted by this opening study.

The supplied English card ZIP verifies every card printing and relevant effect. The Advanced Player's Rulebook **D-19** preserves Thorton's attached Energy and *turns in play* on the replacement; **C-18** permits the attacking Pokémon to use the copied Dragon attack without paying Wild Blaze's original 5-Energy cost. The original Mega Charizard EX card is Dragon type and its attack deals printed 300. Stage2 entry, paper bans, opponent lock timing and twinleaf compatibility are separate questions; nothing here asserts a qualified whole-paper match.

## Quantitative result

| Strict physical opportunity | Unconditional original shuffle | Among Basic-valid opening seven |
| --- | ---: | ---: |
| **T1** ADP Active, held DDE and Compressor, M Charizard and at least one Regidrago V physically reachable in own deck after Prizes | **2.674574080%** | **4.451098534%** |
| Above, and **all three** T2 prerequisites (Thorton, VSTAR, basic Grass/Fire) in first eight | 0.077320546% | 0.128678945% |
| Additional T2 rescues where **only VSTAR** is missing and natural T2 draw finds it | 0.020412587% | 0.033971180% |
| Additional rescue where **only Thorton** is missing and T2 draw finds it | 0.019678782% | 0.032749961% |
| Additional rescue where **only Basic Grass/Fire** is missing and T2 draw finds it | 0.017548290% | 0.029204339% |
| **Combined strict T2 GX + physical Wild Blaze copy opportunity** | **0.134960205%** | **0.224604425%** |

The conditional T1 **4.451%** identity/payment prep opportunity contracts to **0.2246%** by T2 when all three follow-up physical pieces are demanded. Roughly **95% of the direct T1 opportunity configurations** do not immediately satisfy the T2 continuation in this no-extra-draw model, even while the opponent is assumed completely passive. That is the exact mechanism behind the earlier “access is not success” critique. This percentage is a restriction of an intentionally narrow path; real deck searches, draw Supporters, alternative hand discards, and other lines may increase overall performance. Conversely, opponent disruption, existing Item lock, Prize/Knockout and competing Supporter decisions can prevent it entirely. **Do not misstate 0.2246% as a universal turn-two ceiling or as a win rate.**

This T2 event is more complete than the separate broad T1-enhanced-GX **28.993653%** idealized access screen because it explicitly includes printed M Charizard and Regidrago V **in the deck for Compressor**, actual Thorton physically held/drawn, VSTAR and basic Energy access, and correct original Active/hand timing. The two percentages are intentionally different milestones and cannot be treated as contradicting estimates.

## Exact finite method and independent physical Monte Carlo

[Reproducible standalone CommonJS SFT](../../tests/agent30-adp-t2-physical-wildblaze-chain.test.cjs) reads the unchanged Agent5 printed v2 manifest, asserts the canonical deck SHA and all critical source card counts, then enumerates multivariate hypergeometric first-eight category counts:

`[ADP2, DDE4, Compressor4, M Charizard1, Regidrago V3, VSTAR3, Thorton4, Grass+Fire Basic7, other32]`.

Each 8-card combination has mass `prod(C(n_i,seen_i))/C(60,8)`. An ADP copy in the first eight provides a starting Active only if the ADP appeared in the first seven: factor **7/8** with one in the eight, **1** with both. The physical search-target condition is `Charizard seen=0`, plus at least one Regidrago V left in deck after six Prizes. The joint survival of Charizard1 and any of the remaining `r=3-seenRegidrago` V uses inclusion-exclusion:

`P(both outside Prizes)=1-C(51,5)/C(52,6)-C(52-r,6-r)/C(52,6)+C(51-r,5-r)/C(52,6)`.

If all Thorton, VSTAR and basic Energy are already in eight, count the complete joint survival. If exactly one prerequisite is missing, the single T2 draw after Compressor discard is from a shuffled **44-card** remaining deck. Condition on the designated target card outside the six Prizes and use the independent remaining-51-card conditional joint survival with factor

`targetCopyCount * 46/(52*44) * P(both Compressor targets survive Prizes given this target)`.

Cases missing two or three prerequisites cannot be rescued by only one natural draw and are excluded. The source code asserts exact computed reference probabilities to tolerance `1e-12`; independent Python recomputation matched.

**Independent ordered-deal Monte Carlo:** 500,000 uniformly shuffled physical 60-card arrangements using NumPy, split into literal opening-seven, six Prizes and turn-one draw, then physically search the remaining deck for the singleton Charizard and one Regidrago V, discard them, and simulate a fresh random turn-two draw from 44. It observed **13,440** source T1 qualifying states (2.6880%) and **669** full T2 qualifying states (0.13380%) versus exact 2.67457% and 0.134960%. The observed difference is well within the expected sampling error of roughly 0.0052 percentage points at 500,000 trials. Within the 669 T2 states, 382 already had all T2 prerequisites and 287 were rescued by a single second draw. The standalone test also passed a separate fresh V8 execution loading the actual GitHub manifest. No compiled Twinleaf native game or GitHub Actions CI execution of this new test is claimed.

## Important original-source counterexamples and next registered discriminator

**Iron Thorns rank6**: This strictly direct path uses no Tapu Lele/Crobat support, so source's Basic Rule Box Initialization alone need not stop the first GX. But source **Plumeria, Team Flare Grunt or Enhanced Hammer** can physically strip the only DDE during the turn between T1 GX and T2 Thorton. One manual Grass or Fire on T2 then cannot recreate two extra colored units. A genuine precommitted countertrace is original source-owned selection of the Energy removal at its paid legal root, followed by candidate attempt and first failed T2 transition. If the ADP GX board is KO'd on the source's turn, Thorton cannot replace it; test that separately.

**Absol/Garbodor ranks8,11,16,22**: Both Temple of Sinnoh and Garbotoxin can sever different paths. Temple turns one DDE into a single Colorless, disabling enhanced ADP GX, then Regidrago's GGF. ADP v2's two Field Blower or two Viridian Forest are *possible* responses requiring actual legal Item/Stadium timing; the strict direct route does not hold or search those outs. If source Item lock blocks Field Blower, the answer disappears. An empty theoretical graph path does not imply a loss or win.

**Comparison milestone:** Place the exact fixed ADP v2 and the fixed Apex v0 against the same original source 60 and symmetric fully selected two-seat actor for one prospectively registered R6 Energy-continuity or R8 Temple denial test. Require actual source physical-deal pair digest, source root and paper payment/owner zone effects, first T2 candidate action denied or made payable, and competent opponent continuation. Full original Aichi field remains 29/32 authenticated, zero competitively qualified games, no elected fixed 60 winner.
