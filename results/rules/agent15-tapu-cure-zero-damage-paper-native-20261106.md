# Tapu Cure-GX at full Bench HP: a source-root paper/native admissibility audit

**Agent 15 | 6 November 2026 | paper-rules inference + externally published ruling analogues.**

## Why this matters

Agent45's genuine original-rank-1 mirror owner-Pass probe identifies a specific owner turn 16, root 76, of trial `1:212:B:champion-reference`: Active **Tapu Lele-GX GRI 60** holds **one Psychic Energy MEE** and the owner has **four Benched Pokémon, all undamaged**. No prior source AttackAction was observed. The pinned Twinleaf reducer's **no-damaged-own-Pokémon guard** rejected printed `Tapu Cure-GX` with `CANNOT_USE_POWER`. The 110-root authentic game and its original Passes are unchanged by that read-only probe. [Agent45's compiled native packet](../methodology/agent45-v8-rank1-native-mirror-12pass-sweep-and-symmetry-ceiling-20261106.md) includes full source identity, root-digest, engine path, and artifact provenance.

This document independently investigates the **paper status of that exact fully occupied, fully undamaged Bench**. It does not claim to have corrected Twinleaf, rerun the source match, found a better decision, or qualified a competitive win.

## Primary evidence

1. **Original card printing:** [Pokémon's official GRI 60 database](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm2/60/) states Tapu Cure-GX has **one Psychic** attack cost and instructs healing all damage from two own Benched Pokémon. Its text **does not make existing damage a precondition** for announcing the attack. The bundled full card-list `cards/en/sm2.json`, printing `sm2-60`, independently matches its single Psychic cost and text. A GX attack remains limited to once per game.

2. **Advanced Player's Rulebook v3.4, II.A “About Card Text,” page 17** (repository `resources/manual/`, supplied copy `advanced-players-rulebook.md`, lines 713–730): an **attack may be used even if part of its instructions cannot be applied**, subject to explicit dependencies like “Do X. If you do, do Y.” Tapu Cure-GX has no such conditional prerequisite. **Section C-06 “Heal,” page 27**, lines 1165–1183, explicitly restricts selecting undamaged targets for **Trainers and announced Abilities**, with a multi-target exception. It **does not impose that restriction on attacks**. The [Japanese issuer's own v3.4 advanced rules](https://www.pokemon-card.com/assets/document/advanced_manual.pdf) likewise identify Trainers and Abilities specifically in that restriction.

3. **Official Japanese ruling analogues:** Pokémon's [FAQ for Toxapex's “Recover” attack](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%80%E3%83%A1%E3%82%AB%E3%83%B3%E3%80%801%E5%80%8B&page=5&regulation=all) answers **yes** to using that attack with no damage counters; the user discards its required attached Energy and finishes the attack. Pokémon's [FAQ for Starmie's “Recover”](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%88%E3%83%A9%E3%83%83%E3%82%B7%E3%83%A5%E3%80%80%E3%81%8C%E3%81%AA%E3%81%84&page=38&regulation=all&regulation_faq_main=all) likewise answers **yes** at zero damage, discarding the required Energy and ending. These are **published attack-healing no-damage cases**, consistent with II.A and C-06. They are analogous attack texts, **not a Tapu Cure-specific FAQ**.

4. **Valid selection count:** the inspected source board contains four own Benched Pokémon; choosing the printed **two** is physically possible regardless of their zero damage. Advanced Rulebook D-04 and D-05 do not require a healed amount greater than zero for attack resolution. This is the exact state studied, so no assumption about an empty Bench is needed.

## Rule-based inference for the recorded root

Given that (a) the inspected Active really has its printed Psychic payment, (b) its four Bench targets are actually available, (c) the player has not already spent a GX attack, (d) it is a turn where attacking is permitted, and (e) there is no other inhibiting effect, **a Tapu Cure-GX declaration is strongly supported as paper-legal even when the amount healed is zero**. It would consume the GX attack and end the turn, without changing damage. The printed text does not offer healing the Active, and the fact that the engine scans the Active for damage is a second reason to avoid treating its guard as a paper-rule predicate.

**Important residual verification:** The current original-root dossier has the public Active, Energy, Bench and absence of prior observed source attacks, but a full paper attack-admissibility certificate must additionally establish the actual source GX-use flag and any attack-lock restrictions at root 76. No card-specific published Tapu Cure-GX ruling was found in this investigation. This is a **high-confidence rules inference**, pending an exact live-root acceptance proof with a scoped research-side correction.

### What the inference does and does not change

- The native observation remains **12 Passes, zero native-accepted attacks in the unpatched Store**. Do not retroactively relabel it as a native attack.
- The phrase **“none of the original owner's printed attacks could be announced in paper play” is unsupported**: root76 has an evidenced potential counterexample to the native guard.
- This healing attack produces **zero immediate damage, Prize gain or healing value** in that full-health state, and it spends the once-per-game GX resource. In ordinary strategy, the Pass may be strictly preferable because it preserves the GX attack. **Paper permissibility is not strategic desirability**.
- One source player facing an identical printed 60 with an unqualified policy does not validate a 99.5% win rate. The field remains 29/32 name/count rosters, zero competitively qualified matches, no chosen fixed 60.

## Minimal falsifiable next test for Agent45 / owner steward

Use a **research-owned, default-off hook** at the pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, limited to the witnessed owner Active printing and matched root. Compare actual *root Store* A/B/A under an identical physical opening: A original rejection; B allow only the no-damage restriction to be bypassed, then require the genuine Store to accept a `Tapu Cure-GX` `AttackAction`, spend source GX quota and end the turn; A' original root tape exactly identical to A. Capture the full owner-visible Bench roster and damage counters, Psychic payment, GX-use flags, other lock effects, accepted root, and publicly visible game transitions. Include **negative controls** for insufficient Psychic, previously used GX attack, and attack prohibition. Audit any new conflict from the vendor reducer rather than forcing a synthetic state.

The B action is a **targeted rules-fidelity test**, not a proposed stronger source strategy. Until a live integration confirms it, treat it as a proposed hook contract. This note is deliberately independent of the existing read-only native archive.

## Reproduction and evidence classification

- **Card text:** supplied `card-list.zip` → `cards/en/sm2.json` → `sm2-60`; cross-check official GRI 60.
- **Rule clauses:** supplied `advanced-players-rulebook.md` II.A, C-06 and D-04; issuer's Japanese v3.4 corresponding sections.
- **Native root/guard:** previously compiled, unchanged original mirror source [Agent45 report](../methodology/agent45-v8-rank1-native-mirror-12pass-sweep-and-symmetry-ceiling-20261106.md), not independently rerun here.
- **External primary analogues:** official Japanese Pokémon FAQ Toxapex and Starmie Recover at zero damage.
- **Claim class:** printed fact + published rules + analogous rulings → high-confidence interpretation of admissibility; native acceptance and strategic value **unverified**.

## Independent pinned reducer target-contract audit and executable hook

The pinned upstream `TapuLeleGX.reduceEffect` additionally constructs its printed `Tapu Cure-GX` healing choice as `ChoosePokemonPrompt` with **both Active and Bench slots** and `{min:1,max:2}`. It excludes every undamaged Pokémon through a `blocked` array. These are three separable discrepancies in the source-root four-Bench/no-damage condition:

- The whole-board no-damage guard rejects declaring the attack at all.
- The target slot definition includes **Active**, although the card text names **Benched Pokémon** only.
- The prompt permits a **single** target even when four valid Benched Pokémon exist; the printed instruction says two. Its blocked targets prohibit undamaged Bench selections that the official attack-resolution rule permits.

Additionally, pinned `Store.reducePrompt` assigns the submitted result to `prompt.result` and calls its callback without first calling `ChoosePokemonPrompt.validate`; that validator itself checks neither uniqueness nor membership in the prompt's allowed slot family. Therefore printed target constraints cannot be trusted to the client selector alone. The [prior Astral Barrage paper target hook](../../simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs) independently implements an analogous strict answer guard; this new work adds a **separate, exact-printing Tapu Cure repair**.

I created the default-off, synchronous, reversible [Tapu Cure paper hook](../../simulation/twinleaf/agent15-tapu-cure-paper-hook.cjs). It intercepts only the first physically initialized `Store`, the exact printed `Tapu Lele-GX GRI` active attack #1 `Tapu Cure-GX`, and that attack's own pending `ChoosePokemonPrompt` reply. It preserves the pinned GX-use veto. An occupied Bench of at least two offers exactly **two distinct Bench targets regardless of damage**; with fewer targets it uses the closest physically possible number, and with no Bench it consumes the GX attack without producing a choice prompt. Replies selecting Active, duplicates, off-board objects or wrong counts are rejected *before* invoking the underlying Store. Detached clone Store calls and other attacks delegate to the original reducer. Prototypes are restored in a `finally` block even on exceptions. The hook reports paper qualification **false** and is not activated by default.

Five [pure regression tests](../../tests/agent15-tapu-cure-paper-hook.test.cjs) passed independently in the local Node runtime on 6 November (zero damage exact two Bench, three negative invalid choices, 0/1 Bench semantics, clone/unrelated-card exclusions, GX quota and restoration). The [pinned-native-class probe](../../tests/agent15-tapu-cure-paper-hook.native.test.cjs) uses the actual compiled vendor `TapuLeleGX`, `AttackEffect`, `ChoosePokemonPrompt` and `HealEffect`, with a deliberately artificial Store scaffold; it checks the vendor no-damage rejection, the opt-in correction and spent GX negative. These are **not** full paper matches or even native initial physical deals.

The existing **manual-only** [Twinleaf simulator card audit workflow](../../.github/workflows/twinleaf-simulator-card-audit.yml) was extended to compile the pinned vendor, then run both test files. A manual dispatch was requested on 6 November; completion and actual compiled result must be checked before claiming the native fixture passed. A full original rank1 mirrored Store A/B/A, preserved matched initial physical deal and public root tape, paper-rule audit and tactical evaluation remain unperformed. The zero-damage attack could be legal and nevertheless strategically inferior to Pass because it spends the once-per-game GX opportunity for no immediate benefit.

**Research interpretation:** This is a rules-fidelity subsystem finding, not an inferred improvement to the rank1 source actor's strategy or any fixed deck's field performance.
