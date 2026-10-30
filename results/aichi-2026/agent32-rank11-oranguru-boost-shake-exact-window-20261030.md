# Exact rank-11 Oranguru V → Tool-Garbodor first-turn resource window

**Agent 32 | 30 October 2026 | evidence: exact finite-population arithmetic and an independent random-shuffle sanity check.** This is a restricted **unopposed, legally sequenced resource-access calculation** for the **fixed original** Aichi rank-11 Wataru Yano Absol/Garbodor 60. It is not a Twinleaf Store replay, an autonomous-bot decision, a tournament-clock result, a matchup probability, or a game win.

## Why this matters to the shared policy gate

The original 32-arm canonical source scout did not perform source-first rank-11 Tool-Garbodor setup. The later read-only native owner-hand census found Battle VIP Pass unplayed at the source's first-turn Pass on **five of six distinct source-first rank-11 physical deals**, and the opt-in native VIP bridge subsequently placed two exact Basics per Item in six distinct source physical deals. These are separate **retrospective action-coverage observations**, not a denominator for this calculation. See:

- [Original first-turn owner-held opportunities](agent1-original-source-held-opening-census-native-20261029.md)
- [Exact 32-arm native VIP bridge](agent9-original-32-vip-native-source-coverage-20261029.md)
- [Frozen canonical 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md)

A direct-first-eight resource count alone omits a line built around **Oranguru V's Active-Spot Back Order**, **Forest Seal Stone's Star Alchemy**, and **Boost Shake**. This note calculates one conservative subset of that line, accounting exactly for all six Prize cards and for whether Oranguru was in the *initial seven* rather than merely drawn on the first turn.

## Exact printed original-source inventory

From [full-decklists.json](full-decklists.json), rank 11:

| Group | Cards | Copies |
| --- | --- | ---: |
| O | Oranguru V ASR 133 | 2 |
| T | Trubbish FST 168 | 2 |
| V | Battle VIP Pass FST 225 | 4 |
| B | Boost Shake EVS 142 | 2 |
| F | Forest Seal Stone SIT 156 | 2 |
| S | Float Stone BKT 137 | 3 |
| G | Garbodor BKP 57 | 2 |
| X | All other printed cards | 43 |

The deck has **11 Basic Pokémon**: three Mega Absol ex, two Trubbish, two Oranguru V, and one each of Latias ex, Tapu Lele-GX, Crobat V and Squawkabilly ex. In particular, Garbodor BKP 57 is Stage 1 and excluded from Basic-valid opening detection. Mega Absol ex MEG 86 is Basic in the supplied English card database. The groups sum to 60 exactly.

## Sufficient deterministic line under the stated assumptions

1. Oranguru V is among the initial seven and is deliberately selected as Active.
2. On the first own turn, Back Order can search up to **two Tools**, getting Forest Seal Stone for Oranguru and Float Stone for Trubbish, unless either is already in hand. Both must be unprized where deck access is needed.
3. A Trubbish is Benched directly from the first eight, or from the deck using Battle VIP Pass. One Battle VIP Pass can be supplied by Star Alchemy when Boost Shake is already held.
4. Float Stone is attached to Trubbish; Forest Seal Stone is attached to Oranguru. Star Alchemy supplies Boost Shake if Shake is absent from the first eight, or supplies VIP when Shake is held and neither Trubbish nor VIP is held. It searches **at most one missing card**, and its VSTAR Power has not previously been used.
5. Boost Shake evolves the equipped Trubbish into **Garbodor BKP from the deck**, retaining Float Stone. Its printed first-turn exception permits this evolution, and its turn-ending clause is respected. With ordinary printed Garbotoxin conditions satisfied, the Item/Ability-locking interaction can then be evaluated by the source/opponent policy.

For this deliberately narrow path, Garbodor **must remain in the deck** for Boost Shake. Trubbish must remain there if VIP is required. Forest Seal Stone and Float Stone can be drawn or searched; the necessary Boost Shake/VIP must be in hand or searchable under the one-Star-Alchemy constraint. The line does **not** require Secret Box, Quick Ball, Carmine, an extra Tool search, a Supporter, a second-turn evolution, or an additional hand-discard payment.

This is a resource sufficiency condition in an **unopposed first-turn state**. It assumes the relevant Abilities and Items are functioning, both Pokémon have legal Bench/Tool destinations, an ordinary first-turn draw occurs, and any available resource is chosen appropriately. It does not model an opposing Iron Thorns Initialization, Tool/Item lock, attack or other earlier-turn interference. A source player starting second may already face these effects. Native Store and full paper legality still need testing.

## Exact combinatorial result

Let the first eight accessible cards comprise the starting seven and first-turn ordinary draw. Enumerate their eight-group count vectors \(h\), weighting each by \(\prod_i\binom{n_i}{h_i}\). Oranguru must already be among the initial seven: if exactly one Oranguru occurs in the first eight, only **7/8** of relative orders are acceptable; with two, all are. For each qualifying vector, determine the group set \(R(h)\) that must still contain a card in the 46-card **post-Prize deck**.

For the remaining 52 physical cards before the six unknown Prizes are taken, exact inclusion-exclusion counts the legal Prize sets:

\[
Q(h,R)=\sum_{S\subseteq R}(-1)^{|S|}
  \binom{52-\sum_{i\in S}(n_i-h_i)}
        {6-\sum_{i\in S}(n_i-h_i)}.
\]

Out-of-range binomial coefficients are zero. Exact BigInt enumeration covers **2,430** possible grouped first-eight count vectors, preserving all joint six-Prize failures, including multi-prized Forest Stone, Float Stone, Garbodor, VIP or Shake as applicable.

| Strict route category, mutually exclusive | Fraction of Basic-valid openings |
| --- | ---: |
| Trubbish in first eight; Star Alchemy can supply Shake | **6.0722023413%** |
| No Trubbish in first eight; VIP held; Star can supply Shake | **8.5824266555%** |
| Neither Trubbish nor VIP held; Shake held; Star fetches VIP | **2.9982590779%** |
| **Combined resource opportunity** | **17.6528880747%** |

The Basic-valid opening-seven probability is **77.7578858504%**, or precisely \(1-\binom{49}{7}/\binom{60}{7}\). With no conditioning, the sufficient window is **13.7265125584% of all initial shuffles**. Its exact fractions are:

\[
P(\mathrm{window})=\frac{841188685937797}{6128203958276400}
\]

\[
P(\mathrm{window}\mid\mathrm{Basic\text{-}valid})=
\frac{841188685937797}{4765161838557120}.
\]

The mere opportunity to choose Oranguru Active is **28.4818606025% of Basic-valid starting hands**, so this restricted resource condition is satisfied in approximately **61.9794% of Basic-valid openings which contain Oranguru in their initial seven**. These are exact card-location probabilities under stated assumptions; they do not estimate actual bot execution.

## Verification and reproducibility

- [Exact CJS evaluator](../../scripts/agent32-rank11-oranguru-boost-shake-window.cjs)
- [Deterministic regression tests](../../tests/agent32-rank11-oranguru-boost-shake-window.test.cjs), locally passed on Node 22 before repository publication. Test includes exact fractions, the 2,430 grouped vectors, six-Prize inclusion-exclusion, and route partition reconciliation.
- Independently derived the same exact fractions with Python's \`math.comb\` and \`Fraction\`. A separate 350,000-shuffle Monte Carlo sanity check with fixed seed 77322 estimated **13.8011% unconditional**, close to the exact 13.7265% within sampling fluctuation. The independent checker was not committed because the BigInt CJS evaluator is the canonical reproducible artifact.
- The model uses the original rank-11 printed counts and the uploaded card database texts for Oranguru V ASR 133, Forest Seal Stone SIT 156, Boost Shake EVS 142, Battle VIP Pass FST 225, Garbodor BKP 57 and Float Stone BKT 137; no inferred Japanese substitution is required for these named search steps. Paper printing identity and source deck provenance should still be checked by the common arm gate.

## Integration handoff and limitations

**Do not convert 17.65% into a prediction that rank11 will establish Garbotoxin in 17.65% of actual competitive games.** It is a favorable deterministic *access opportunity* conditional on absent opposing interference and optimal use of this limited line. The actual source bot must recognize the line, sequence two Tool attachments and a one-card Star search without abandoning Trubbish, satisfy live Store prompts, evolve a source-printed Garbodor from the right deck, establish Garbotoxin with Float Stone, and survive an adversarial candidate response.

Agent 41's common chooser should treat this as a **registration and debugging prior**: add an owner-visible staged or genuinely source-dealt input where starting Oranguru sees this resource combination; test native **Back Order → Tools → Star Alchemy → VIP/Shake → equipped Garbodor**, including source-first and source-second with an actual enemy reply and the native rank-6 Iron Thorns negative case. Measure each strict phase separately: held/remaining resource; ability legal; Store action/prompt acceptance; physical Tool and evolution placement; Garbotoxin public effect; opponent suppression/recovery; native game terminal/cap. Avoid duplicating a full-game runner or altering the frozen 60.

**Status unchanged:** 29 of 32 exact complete Aichi lists, zero competitively qualified games, no demonstrated 99.5% fixed-60 win rate.