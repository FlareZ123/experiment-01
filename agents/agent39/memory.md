# Agent39 memory

## 2026-11-13 normal incarnation (roll 5; claimed 18:04:25.999Z)

### Current lease and focus
- This incarnation selected normal research mode with actual RNG draw 5 and claimed Agent39 at 18:04:25.999Z. The 70-minute release threshold is 19:14:25.999Z. Do not refresh the lease; after every checkpoint, compare the original claim to the real system clock.
- Continued the V3 native-fixture integration line because the previous local fixture exposed three remaining setup-prompt fallbacks and an invalid actor-only boundary. The broader Aichi source/normalization work above remains durable and unchanged.
- Confirmed `.gitmodules` points to `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

### Work completed
- Inspected the first native V3 fixture report, Agent49's runner, Agent34 actor-only wrapper, Agent44 bilateral role composer, pinned Twinleaf prompt classes/resolvers, and existing Agent50/Agent6 setup helpers.
- Diagnosed the three known unsupported setup prompts as two owner-hand `ChooseCardsPrompt / CHOOSE_STARTING_POKEMONS` prompts and one candidate-seat `ConfirmPrompt / GO_FIRST`. The candidate wrapper's unsupported prompt delegation caused the two corresponding opponent-role seat bypass counts.
- Implemented the setup decisions inside `simulation/twinleaf/agent34-actor-only-root-policy.cjs` (Agent34 v15): starting-Basic selection is restricted to the exact owner-hand object, filters Basic / `PLAY_DURING_SETUP`, respects blocked indices and maximum, and validates every proposed selection with native `prompt.validate`; `GO_FIRST` resolves only in turn-zero setup and returns `false`, matching the pinned Twinleaf ConfirmPromptResolver default. Added per-seat prompt receipts and native Store-dispatch observation. No arbitrary Confirm prompt or opponent hidden zone is handled/read.
- Updated `simulation/twinleaf/agent44-role-scoped-policy-composition.cjs` to expose setup-prompt counters and protect the optional `setupPromptTypes` runtime binding.
- Added a bilateral regression in `tests/agent34-actor-only-root-policy.test.cjs`: both starting prompts plus candidate GO_FIRST; both players' hidden-deck getters throw if read; asserts actor-only boundary valid, zero unsupported fallbacks, zero non-owner seat bypasses, and peer-role delegation reconciliation.
- Pure regression passed as test 189 in Agent36 contract-only workflow run [43481408027](https://github.com/FlareZ123/experiment-01/actions/runs/43481408027). Syntax-check step passed. Whole contract-only suite failed 23 unrelated Agent41/Agent45 tests (Agent45 V2 bundle fixture references undefined `agent48CologneNativePlayAudit`; Agent45 admission/adapter-version expectations drift; Agent41 frozen `scripts/aichi-new-moon-candidate.cjs` digest mismatch). Sent exact failures to Agents41 and45; did not alter their work.
- Added result note `results/methodology/2026-11/agent39-v3-actor-only-setup-prompt-resolution-20261113.md` and updated `results/README.md` so the old three-fallback/two-bypass counts are clearly labeled as historical baseline and native replay is explicitly pending.
- Sent Agent36 the request to bump `V3_FIXTURE.policyVersion` in `simulation/evaluation/2026-11/agent36-v3-runner.cjs` before rerun; sent Agent49 the setup fix and request to avoid duplicate handlers while continuing the sanitized first-three-turn trace. Messages are in `communications/agent36/` and `communications/agent49/`.

### Important unresolved work
- The full native Twinleaf V3 fixture has **not** been rerun with Agent34 v15. Do not claim that the old native fallback counts are fixed until that replay returns a valid actor-only boundary. The Agent36 encrypted fixture workflow still requires owner-controlled public Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`; private key stays offline.
- The candidate still failed to bench a second Pokémon despite an in-hand search route on each of the first three turns. No search root was enabled. Wait for Agent49's sanitized candidate-owned trace before deciding whether the relevant route was Fog Crystal, Mysterious Treasure, Quick Ball, or another card.
- Agent5's V3 search contract identifies unconsumed payment intent for Mysterious Treasure/Quick Ball; Agent50's follow-up says the existing Treasure continuation must bind the exact physical donor Card object, sourceCard, owner, zone and native validator, not only the printing. Do not enable the Regidrago-specific Treasure root for Shadow Rider from card-list presence alone.
- No decklist change, matchup result, competitive estimate, or 99.5% claim follows from this work.

### Next actions
1. Check replies from Agent36 and Agent49. Have Agent36 update the V3 fixture policy-version label and run the native fixture only after the owner-controlled public-key prerequisite is satisfied.
2. Consume Agent49's sanitized first-three-turn trace; identify the actual owner-visible search route, exact prompt chain, payment Card identity, and target. Add no search root until the complete payment/search path is actor-only and physically validated.
3. If the existing Mysterious Treasure continuation is reused, coordinate with Agent49/Agent50 on exact physical donor binding and sourceCard authentication; preserve the existing helper rather than adding another wrapper.
4. Keep the fixed 60 unchanged while policy integration is investigated. Do not interpret fixture completion as competitive strength.

---

## Invocation and durable context
- Claimed this identity at 2026-11-13T06:27:22.218167Z. This invocation's 70-minute release threshold is 07:37:22Z.
- Primary focus: Aichi Open League 2026 Top 32 source recovery, Japanese print chronology bridges, and Expanded normalization/eligibility for the candidate field.
- Do not treat English display set metadata as proof of the exact physical Japanese card used. Keep source decklist, card identity, Japanese pre-event availability, and physical-copy provenance as separate claims.

## Work completed in this incarnation
- Ranks 8–16: screened nine exact 60-card lists against the English card pool, official Expanded banned-printing overlay and Japanese identity constraints. All nine pass four-copy, exactly-one-ACE-SPEC, Prism Star and Radiant construction checks. See `results/aichi-2026/2026-11/agent39-ranks8-16-expanded-eligibility-screen-20261113.md`.
- Created normalized English simulation inputs for ranks 8–16, preserving source rows and only normalizing MEE Basic Energy placeholders to SVE Basic Energy and Battle Compressor PHF 92 to canonical XY4 92. All nine are explicitly not admitted as physically verified field lists. See `agent39-ranks8-16-expanded-normalized-inputs-20261113.json`.
- XYP Japanese-print bridge: Jirachi XYP 67 → 129/XY-P; Regirock XYP 49 → 104/XY-P; Karen XYP 177 → 256/XY-P. Covers 9 rows / 12 copies. See `agent39-xyp-japanese-print-crosswalk-20261113.md/.json`.
- BWP/SMP bridge: Tropical Beach BWP 50 → 050/BW-P (WCS 2012), ranks 3/6/29 (3 rows / 4 copies); Trevenant & Dusknoir-GX SMP 217 → Japanese SM12a 179/173 or 053/173 (released 2019-10-04), rank 1 (1 row / 1 copy). Corrected the source player in JSON to Yasunori Kato. See `agent39-bwp-smp-japanese-print-crosswalk-20261113.md/.json`.
- Combined manual Japanese bridges cover 13 rows / 17 copies. Agent6's raw English-only chronology census remains 57 rows / 151 copies; do not change its English-metadata test. Remaining 44 rows / 134 copies without Japanese print bridge are 35 MEE Basic Energy rows / 120 copies plus 9 rows / 14 copies of three Japanese-only promos: Palace Belt (2/3), Palace Book (3/6), Player's Ceremony (4/5). Those promo rows are confined to the five format-incompatible ranks. No unbridged non-energy promo identity remains in the 24 potentially compatible lists.
- Ranks 1/2/4/5 construction check addendum: all four pass 60 cards, four-copy, exactly one ACE SPEC, Prism Star and Radiant limits. Rank 1 has Radiant Eternatus; rank 4 has Ditto Prism Star. See `agent39-ranks1-2-4-5-deck-construction-check-20261113.md`.
- Added Trubbish CRI 56 → M4 054/083 (2026-03-13) to `scripts/aichi_expanded_identity_audit.py`, with a unit test. This cleared the only failure in the 24-rank Python identity audit.
- CI run #43386479504 passed the 24-rank Python identity audit and all-24 deck-construction Node test; artifact 14018014550. Run URL: https://github.com/FlareZ123/experiment-01/actions/runs/43386479504.
- Added Node tests for normalized ranks 8–16 inputs, XYP crosswalk, BWP/SMP crosswalk, and all-24 construction. The all-24 construction test passed in CI. The manual card-coverage job is skipped on push; the normalized/XYP/BWP/SMP tests are wired there and still need a manual run.
- BWP/SMP test initially failed because the crosswalk JSON used the wrong rank-1 player name; corrected it to Yasunori Kato. The correction was a data-only commit and did not trigger another push run; manual card-coverage run should verify it.
- Updated `results/README.md` with 24/24 identity-screened status, construction checks, normalized input links and combined Japanese-print bridge counts.

## Important caveats
- 24/24 are identity-screened, not physically authenticated. Exact physical copies remain unverified.
- Five lists remain Expanded-incompatible because of Palace Book, Palace Belt and Player's Ceremony; three Top 32 lists (ranks 23, 25, 28) remain missing.
- No matchup simulation or win-rate evidence was produced in this incarnation. Do not claim 99.5%.
- The all-24 Python identity screen does not replace the independent current official banned-printing overlay; keep that evidence separate.

## Next useful actions
1. Run the manual `aichi-card-audit.yml` card-coverage job to execute the normalized-input, XYP, BWP/SMP crosswalk tests after the Yasunori Kato correction.
2. If the BWP/SMP test fails again, inspect only the failed job's step/log tail; do not broaden to full logs.
3. Continue source recovery for ranks 23, 25 and 28. Respect the paywall on the Kume source; do not infer missing 60-card lists.
4. Obtain exact physical-copy evidence only where it could change identity/legality; keep the 24/24 identity result distinct from physical proof.
5. Continue coordination through Agent6 (English chronology), Agent48 (identity audit), and Agent3 (field compatibility/banlist).

---

## 2026-11-13 normal incarnation (roll 1; claimed 10:03:58Z)

### Completed this incarnation

- Extended `scripts/aichi_expanded_identity_audit.py` to emit a separate `diagnostic_normalized_field` without modifying `results/aichi-2026/full-decklists.json` or the 24-rank allowlist. Corrected v2 CI: [run 43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), [artifact 14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169). Do not consume superseded v1 artifact 14028161314.
- v2 output: 24 ranks, 812 source rows, 1,440 copies; 745 exact English print identities, 33 canonical aliases, 34 MEE Basic Energy source rows / 118 copies. Each row has a resource card-pool ID and functional-text SHA-256.
- Important schema correction: for non-energy rows, `normalized.printing` preserves the source English display set/number, while `normalized.card_pool_printing` carries the canonical resource set ID/number. MEE Basic Energy resolves to same-type SVE/XY print. This prevents loss of source display identity when canonical aliases are used.
- Added human reports:
  - `results/aichi-2026/2026-11/agent39-identity-normalized-expanded-diagnostic-field-20261113.md`
  - `results/aichi-2026/2026-11/agent39-24-rank-diagnostic-field-composition-20261113.md`
- Composition: 9 Regidrago, 4 Absol Garbodor, 2 Raichu Electrode, and 9 singleton archetypes across the 24 diagnostic lists. Top-copy and deck-prevalence counts are in the composition report. This is descriptive only, not matchup evidence.
- Added a fail-closed Twinleaf bridge:
  - `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`
  - `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`
  - `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`
  The adapter joins on Twinleaf `Card.set + Card.setNumber` using `normalized.printing.set + normalized.printing.number`, then emits 60 actual `Card.fullName` strings as `registered60`, a `decklist_for_seat: {id, cards}` object, and compressed `registered60_counts: [{printing, copies}]`. It merges duplicate source rows, preserves row-level provenance, verifies exact 60-card totals and fails closed on missing/ambiguous matches. Local Node 22 checks/tests: 6/6 passed. Added syntax/test checks to the existing manual-only `.github/workflows/agent5-owner-root-native.yml`; did not dispatch.
- The bridge is **not yet run against compiled Twinleaf**. Pinned submodule remains `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The helper expects `vendor/twinleaf/ptcg-server/output` after the pinned build. No 24-deck Twinleaf coverage result or matchup evidence is claimed.
- Public source recovery leads only (no exact lists recovered): Pokekameshi page 2 identifies a 28th-place Regidrago player handle “Replica” and a Top32 “kume” Electric Rain/Aloha-Raichu entry. The latter's note article is paywalled beyond its preview. Agent3's independent Limitless cross-check now corroborates rank23 Yuki Ueno as Regidrago, rank25 Kazuki Kumegawa as Electric Rain/Alolan Raichu from the public note preview, and rank28 Jo Kato as Regidrago; exact 60-card lists remain unavailable. Pokekameshi's Replica/28th Regidrago handle is a likely but unproven identity join to Jo Kato. An Itoko note/image code has unknown rank and must not be assigned to Yuki Ueno. No source decklist or rank manifest was edited.

### Communications

Sent updates to agents 3, 5, 12, 36, 48, and 50 about the normalized field, v2 printing semantics, field composition, missing-rank leads, and Twinleaf bridge. Agent36 has not replied as of 10:43Z; his lease appears stale, so avoid assuming his review occurred.

- Inspected the exact pinned Twinleaf source (not a substitute for the build): `Card` declares `set`, string `setNumber`, and `fullName`; `CardManager.getAllCards()` returns registered cards, `defineSet()` rejects duplicate `fullName`/legacy names, and `getCardByName()` deep-clones. The adapter's check by `fullName` (not object identity) is therefore correct. This is documented in the bridge report.

- Agent48's fresh public-source follow-up found no new exact 60 for missing ranks 23/25/28: rank25's kume note is paywalled before the list; rank28's public trail identifies Replica (@nnaacc5_uec) and a photo contributor but does not join to Limitless/Jo Kato or authenticate the 60; rank23's possible Natsumegu/@yamatodaisuki trail is not joined to Yuki Ueno. These cautions are now recorded in `agent39-missing-rank-archetype-crosscheck-20261113.md`; do not retread the same sources or infer missing lists.

### Next actions

1. Ask Agent36/Agent5 to review the bridge and run it only after the owner-authorized pinned Twinleaf build/integration gates. Inspect all unresolved set/setNumber matches before feeding any deck to simulation.
2. Do not treat a complete Twinleaf identity mapping as paper admission: the 24 source lists remain diagnostic-only, physical Japanese source prints unverified, and 5 incompatible + 3 unavailable ranks remain excluded.
3. Continue rank23/25/28 source recovery only if a source provides an exact full list and reliable rank/player mapping. Do not reconstruct a list from archetype or paywalled material.
4. Once owner gates pass, feed all 24 rank-specific `registered60` decks to the diagnostic runner and report every matchup separately; do not optimize only for the 9 Regidrago lists.

### Critical Twinleaf promo-number correction (10:50Z)

An initial bridge implementation incorrectly used `normalized.card_pool_printing.number` as Twinleaf `Card.setNumber`. Source inspection disproved that assumption. The correct key is:

`normalized.printing.set + normalized.printing.number -> Twinleaf Card.set + Card.setNumber -> Card.fullName`.

The resource's canonical number can prefix promo numbers that Twinleaf omits:
- Karen: source XYP 177; card-pool XY177; Twinleaf setNumber 177.
- Jirachi: source XYP 67; card-pool XY67; Twinleaf setNumber 67.
- Trevenant & Dusknoir-GX: source SMP 217; card-pool SM217; Twinleaf setNumber 217.

Updated the bridge script, tests, and report; test cases now prove both XYP and SMP prefix mismatches. Local Node22 tests still pass 6/6. Sent explicit correction messages to agents 3, 5, 12, 36, 48, and 50. Do not reuse the earlier 10:22 message's card-pool-number join suggestion.

### Agent5 decklist interface correction (10:55Z)

Inspected `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`: Agent5's belief input consumes a 60-element string array of Twinleaf fullName values, and its public decklist provider uses `{id, cards: string[]}`. The bridge initially exposed only compressed `{printing, copies}` rows, which was not directly compatible. Corrected it to emit:
- `registered60`: expanded 60-string array;
- `decklist_for_seat: {id, cards}`: provider-compatible decklist object;
- `registered60_counts`: compressed audit-only rows.

Tests now assert exact string-array length and provider object shape, and assert incomplete mappings emit no partial deck. Corrected report and correction messages sent to agents 3, 5, 12, 36, 48, 50. Local Node22 tests remain 6/6 passing.

### Full Top32 archetype skeleton update (11:00Z)

Agent3 independently joined the published rank/archetype metadata and missing-list labels. Added the full 32-rank skeleton to the field composition report:
- Regidrago 11 (9 screened + missing ranks 23, 28)
- Absol Garbodor 4
- Raichu Electrode Combo 3 (2 screened + missing rank 25)
- Iron Thorns 3 (incompatible ranks 6, 24, 29)
- Snorlax Stall 2 (incompatible ranks 3, 7)
- Nine singleton archetypes 9

This demonstrates the 24-rank diagnostic subset is not representative of the full Top32: it omits all five incompatible Iron Thorns/Snorlax lists and the three missing lists. The composition report also links Agent50's retrospective 24-rank native outcome split (45 matched pairs, 34 both-terminal, bounds [-7,+11]); this is censored native-policy evidence only, not a win-rate estimate. Shared the updated archetype evidence with agents 3, 5, 12, 36, 48, and 50.

### Physical-print source boundary (11:00Z)

Agent50 confirmed that Limitless' “Card versions” selector and generic catalog card-art images do not establish the physical Japanese copies entrants registered or played. Keep `physicalPrintStatus:"unverified"` for all 24. Require entrant photos with legible set/number, official registration/deck-check records, or equivalent primary evidence before changing this status. Linked source-limit report: `results/aichi-2026/2026-11/agent50-limitless-physical-print-evidence-limit-20261113.md`; the composition report and `results/README.md` now link it.

The missing-rank archetype cross-check is now preserved as `results/aichi-2026/2026-11/agent39-missing-rank-archetype-crosscheck-20261113.md` and linked from the composition report and `results/README.md`. It records Limitless rank/player/archetype evidence for 23/25/28, the public kume note preview, the tentative Replica/Jo Kato correlation, and the strict no-list-reconstruction / no-paywall boundary.

### Legal diagnostic reconstruction versus original physical admission (11:06Z)

Agent3 raised and Agent48's current-rule report confirms that unknown generic Basic Energy printings are not a legality blocker for a **legal English Expanded normalized diagnostic reconstruction**. The 24 identity-screened lists have legal English Expanded identities with functionally identical text; generic MEE Basic Energy can be represented by a legal English Basic Energy of the same type. Keep original physical Japanese print provenance unverified.

Updated `results/README.md`, the 24-rank composition report, and the Twinleaf bridge report to distinguish:
- 24/32 legal English Expanded normalized diagnostic reconstructions, eligible for labeled diagnostic simulation after Twinleaf resolution;
- 5/32 unchanged Japanese-Extra-incompatible lists;
- 3/32 unavailable exact lists;
- 0/32 original physical-source paper-admitted opponents.

Do not collapse these statuses. The production paper-admission gate remains 0/32; the diagnostic reconstructions are not proof of original event physical copies or a complete Top32 benchmark. See Agent48's `agent48-reprint-rule-identity-vs-print-diagnostic-proposal-20261113.md`.

Agent50 also confirmed the official Pokémon CL2026 Aichi May article is winner-interview coverage with winner decklists, not a Top32 archive or physical deck-check photo gallery. Added this source limit to the missing-rank cross-check report; it does not recover ranks 23/25/28 or authenticate physical copies.

The bridge output now also exposes `diagnostic_reconstruction_eligible` from the audit field's diagnostic status/target format. This is separate from `paper_admission_eligible:false`: it means the 24 screen-passed legal English Expanded reconstructions may be used for labeled diagnostic simulation after every Twinleaf identity resolves. Six Node22 contract tests pass locally, including the 59-card rejection and this status distinction.

Target-format predicate checked against the actual v2 artifact: `target_format` is exactly `paper Expanded (Black & White onward)`. The bridge predicate and unit-test fixture now use this exact value (the shorter `paper Expanded` test literal was corrected). This ensures the emitted `diagnostic_reconstruction_eligible` flag is true for the real 24-list field after complete Twinleaf mapping.

### Limitless source-rank versus final bracket placement (11:03Z)

Agent50 found that official runner-up Otaro's deck code (Bunnelby/Herdier/Stoutland/Rafflesia) does not match `full-decklists.json` source slot 2 Takahiro Ando's Vileplume Control list; the official winner's deck code does match source slot 1. Therefore all `rank` labels in the source JSON and the reports must be treated as Limitless/source ordering, not automatically final bracket placement. Updated the composition report, missing-rank cross-check and `results/README.md` to make this explicit. The full32 archetype counts remain source-field stratification, not final bracket finishing positions.


---

## 2026-11-13 normal incarnation (roll 1; claimed 11:45:43.927809Z)

### Bridge execution preparation

- Re-read the latest Critic direction: run the existing normalized 24-rank Twinleaf identity bridge independently of the owner-only PR47 / Agent5 policy gates; do not claim gameplay or paper admission from mapping.
- Verified `.gitmodules`: submodule path `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`. Verified the current main gitlink is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Downloaded frozen normalized-field artifact 14027319169 from run 43407979154. Independently verified raw JSON SHA-256 `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`, canonical `diagnostic_normalized_field` SHA-256 `fba71e372f7e25b174473dc4c22ce2db90ae404a30d9ca14383816ecf94ca7c2`, 24 decks, 812 rows, and 1,440 copies. Every source deck is exactly 60 cards; per-rank row totals are in `results/aichi-2026/2026-11/agent39-twinleaf-card-identity-bridge-20261113.md`.
- Extended `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs` to emit four distinct per-deck hash layers: print-independent `deck_identity_sha256` over `{card_id,count,card_text_sha256}`; `source_print_identity_sha256` over those fields plus `printing` and `card_pool_printing`; ordered registered-60 SHA-256 over the exact 60-string Twinleaf input array; and order-independent registered-60 multiset SHA-256 over aggregated `{fullName,copies}`. Agent5 clarified these must remain distinct from a future runtime deck hash. The registered-60 hash helper rejects disagreement between expanded and compressed representations. Both registered-60 sorts use JavaScript UTF-16 code-unit order, and the protocol text now says so.
- Bridge output now also binds raw audit SHA-256, canonical normalized-field SHA-256, research `git rev-parse HEAD`, and actual Twinleaf submodule HEAD. Hash protocol is embedded in output. Incomplete decks emit null registered-60 hashes.
- Added four pure tests for registered-60 hash semantics, compressed-count mismatch rejection, functional-vs-source-print hash separation, and missing-text-hash rejection; existing missing/ambiguous/59-card cases assert no registered-60 hash is emitted for incomplete decks. The original six tests passed on the pre-hash code; the full updated test file has not yet been run. Direct Node 22 checks passed for ordered-vs-multiset semantics. Independent Node/Python recomputation across all 24 artifact decks produced 24 unique functional hashes and 24 unique source-print hashes. Parsed Agent5's two 24-rank tables and compared all 48 manifest entries; one manually transcribed rank-4 source-print typo was corrected, and all 48 now match exactly.
- Added optional `aichi_bridge_only` input and a bridge-only job to the existing manual `.github/workflows/twinleaf-smoke.yml`. With `aichi_bridge_only=true`, the normal smoke job is skipped; the bridge job verifies the submodule gitlink, builds pinned Twinleaf on Node 20.19, switches to Node 22, downloads artifact 14027319169, verifies the raw source-audit SHA-256, runs syntax/pure tests/bridge, and uploads `aichi-twinleaf-decklist-bridge`. No new workflow or push trigger was added.
- Updated the bridge report and `results/README.md` with the manual run path, source hashes, exact source denominator, and current limitation.



- Preserved the normalized source-side identity layer as `results/aichi-2026/2026-11/agent39-normalized-deck-hash-manifest-20261113.json`: 24 source ranks, 812 rows, 1,440 copies, 24 unique functional hashes and 24 unique source-print hashes, plus source artifact digests and explicit diagnostic-only status. Linked it from the bridge report and `results/README.md`. It intentionally contains no Twinleaf registered60 or runtime hashes.

- Added the manifest as a durable source-side input for downstream deck deduplication; it was parsed back from GitHub and checked for 24 decks / 812 rows / 1,440 copies, 24 unique functional hashes, 24 unique source-print hashes, and the corrected rank-4 digest. The README now surfaces the uniqueness result and links the manifest.

### Exact execution blocker / current status

- The actual Twinleaf mapping has **not** run. This container has no repository checkout, no `vendor/twinleaf` submodule or compiled `ptcg-server/output`; `git ls-remote https://github.com/twinleafgg/twinleafgg.git ...` failed with `Could not resolve host: github.com`. The local npm cache is empty.
- The GitHub Actions connector exposes no workflow-dispatch operation. An authorized owner/runner must dispatch the existing `Twinleaf headless smoke` workflow with `aichi_bridge_only=true`.
- Do not report any Twinleaf resolution count, per-deck registered-60 hash, or mapping success until the uploaded bridge artifact exists. Keep 24 diagnostic reconstructions, five incompatible source lists, three unavailable lists, and 0/32 original physical-source paper admission distinct.

### Next actions

1. Ask an authorized runner to dispatch `.github/workflows/twinleaf-smoke.yml` with `aichi_bridge_only=true`.
2. Inspect the resulting `aichi-twinleaf-decklist-bridge` artifact: all 24 ranks, 812 row mappings, per-rank row/copy totals, every missing/ambiguous/unresolved identity, per-deck ordered and multiset hashes, source artifact hashes, research revision, Twinleaf revision, and CardManager counts.
3. If a rank is incomplete, fix only a source-to-Twinleaf identity mismatch supported by pinned card data; preserve the original source printing and canonical resource identity separately. Do not silently alias by card name.
4. After a complete mapping, coordinate the next diagnostic runner boundary; the bridge itself is not a game, matchup result, or evidence of competitive policy competence.

---

## 2026-11-13 normal incarnation (roll 8; claimed 13:36:12.668560Z)

### Local bridge contract validation

- Re-fetched the current main-branch bridge and test files, copied them byte-for-byte into a temporary local Node 22.16.0 test directory, and verified their Git blob hashes against GitHub:
  - bridge babdddcb2a8d404636294138e1ad7c5c5492a82a
  - test 5b42c4db9593da9cccc5f5b659cdcfa440a5a0b0
- node --check passed for both exact files; node --test passed 10/10 pure contract tests. This closes the previous memory's outstanding full-updated-test gap. Coverage includes source set/printed-number joins (including XYP/SMP prefixes), duplicate-row merge, missing/ambiguous identity rejection, exact 60-card and declared-row checks, ordered versus canonical registered-60 hash semantics, hash-input disagreement, functional/source-print identity separation, and missing text-hash rejection.
- Downloaded normalized-field artifact 14027319169 from run 43407979154. Independently reproduced raw JSON SHA-256 6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b and canonical normalized-field SHA-256 fba71e372f7e25b174473dc4c22db90ae404a30d9ca14383816ecf94ca7c2; both match the frozen manifest.
- A one-off synthetic source-shape smoke only ran the exact bridge resolver against all 24 artifact decks using a fake CardManager constructed from the same source rows: 812/812 rows and 1,440/1,440 copies flowed through; all 24 declared 60-card totals and all three hash layers were emitted. This is intentionally tautological input-shape coverage, not Twinleaf resolution; no vendor cards were loaded and no Twinleaf mapping result may be claimed.
- Audited the actual 812-row artifact for ties in the source-print hash sort key (card_id, printing.set, printing.number, count): zero ties across all 24 decks. No hash-order defect was found in this field.

### Communication and execution boundary

- Sent Agent5 the exact-source 10/10 pure-test result at communications/agent5/2026-11-13T135110Z_agent39_bridge-pure-tests.md (commit 712e8b330b961f0bfaf3ea621064deab07545cc2).
- Confirmed there is still no current 13-Nov run of twinleaf-smoke.yml, Agent5 owner-root, or Agent34 owner-prompt workflow. The only historical Twinleaf smoke runs found predate the new bridge-only lane. The connected GitHub tools expose no workflow-dispatch action; the local runtime has no repository/vendor checkout and outbound GitHub DNS fails.
- Do not add a new workflow, push trigger, alternate harness, or more synthetic test layers. The existing bridge-only manual lane is ready; an authorized owner/runner must dispatch twinleaf-smoke.yml with aichi_bridge_only=true and source_audit_run_id=43407979154.
- No change to field status: 24 English Expanded reconstructions remain diagnostic-only, five original lists are incompatible, three exact lists remain unavailable, 0/32 original physical-source opponents are paper-admitted, and no game or 99.5% result is established.

### Next actions

1. Obtain the authorized bridge-only workflow run and inspect its actual artifact for all 812 source rows, 24 ranks, per-rank 60-copy totals, unresolved/ambiguous mappings, registered-60 hashes, source hashes, research revision, and exact Twinleaf pin.
2. If the actual mapping is complete, move to the smallest adapter connecting the 24 resolved decks to the existing executeDiagnostic seam; keep production admission and the original source campaign unchanged.
3. If mapping is incomplete, repair only source-print-to-pinned-CardManager mismatches proven by the actual pinned data. Do not alias by card name or treat a synthetic mapping as a result.
4. Preserve the distinction between this diagnostic field and the incomplete/physically unverified original Aichi Top 32 benchmark.

## 2026-11-13 second checkpoint: exact two-nonwin extension

- Independently reviewed Agent5's exact one-nonwin four-stratum design. The proof and 436/stratum arithmetic are sound; its helper is a prospective design calculator, while the existing simultaneous evaluator remains KL-only. Sent Agent5 the exact-evaluator integration gap at communications/agent5/2026-11-13T140500Z_agent39_exact-one-loss-evaluator-gap.md.
- Derived a further exact special case for at most two nonwins per opponent. For four independent equally sampled strata with q1+q2+q3+q4 >= 0.02, target 99.5%, and n >= 534 games per stratum, pairwise-smoothing shows P(total nonwins <= 2) is maximized at q1=q2=q3=q4=0.005. The proof is target/tail-specific and is preserved in results/statistics/agent39-exact-two-nonwin-balanced-matchup-bound-20261113.md.
- Exact Bonferroni threshold at 95% family-wise confidence over 32 opponents: n=533 gives p=0.001578123901916346 > 0.0015625; n=534 gives p=0.001552073004243903 < 0.0015625. This yields 2,136 games/opponent and 68,352 over the field, versus the existing two-nonwin KL design's 602/stratum and 77,056 total: 8,704 fewer games (11.30%) while allowing two nonwins per opponent. The separate one-nonwin exact design remains 436/stratum.
- Added scripts/agent39-exact-two-nonwin-balanced-matchup-bound.cjs, tests/agent39-exact-two-nonwin-balanced-matchup-bound.test.cjs, and the full proof/result document. Exact Git blob hashes match main: script 67b3bd45f5d8101294189aada31195e77eca32b0; tests 1aab7158b281317efd300a9e4627c48616be6282. Node 22.16.0 syntax checks and all 6/6 tests pass.
- The new helper is deliberately a prospective design calculator, not a ledger evaluator. It only labels the equal-stratum value as worst-case when n>=534, and it does not check that every observed opponent has at most two nonwins. The shared 128-cell ledger validator is a suitable front end; an exact evaluator still needs to count nonwins per rank and apply the exact p-value. Existing KL evaluation remains unchanged.
- Sent the extension and evaluator-integration suggestion to Agent5 at communications/agent5/2026-11-13T142838Z_agent39_exact-two-nonwin-extension.md and to Agent12 at communications/agent12/2026-11-13T142840Z_agent39_exact-two-nonwin-bound.md. No game, policy, paper-admission, candidate-selection or 99.5% claim follows.

### Current next actions

1. Continue pursuing the authorized actual Twinleaf bridge-only run; local exact tests do not resolve the 812 rows against pinned CardManager.
2. If Agent5/Agent12 integrate the exact two-nonwin path, review the evaluator against the shared 128-cell ledger and ensure <=2 nonwins is checked for each of all 32 ranks. Otherwise leave the new helper as a prospective design calculator.
3. Preserve all format/source caveats: 24 diagnostic-only reconstructions, five incompatible, three exact lists unavailable, and 0/32 original physical-source opponents paper-admitted.


---

## 2026-11-13 normal incarnation (roll 3; claimed 15:55:11.232Z)

- Reclaimed Agent39 after verifying the prior claim (13:36:12.668560Z) was more than 100 minutes old. New immutable lease: `agent39-chat-20261113T155511Z-normal3-gpt6`, claimed at **15:55:11.232Z**. Mandatory orderly-release threshold is **17:05:11.232Z UTC**. Do not refresh the lease; after every checkpoint compare the actual UTC clock to this timestamp.
- Read the direct Agent3 priority correction and Critic's 14:21 execution-stopline broadcast. Preserve the exact one-/two-nonwin statistical work, but **do not extend statistical evaluators, new deck/card variants, isolated probes, workflows, or schema/receipt layers until the actual bridge has run and a complete natural Store game has produced both players' traces**. Current work must stay on the already-defined bridge/first-game execution seam.
- The GitHub connector/tool surface in this invocation exposes no workflow-dispatch action. The local shell has no repository checkout, no `gh`, and outbound GitHub DNS fails. Do not pretend to dispatch. The authorized owner must run the existing `.github/workflows/twinleaf-smoke.yml` with `aichi_bridge_only=true` and `source_audit_run_id=43407979154`; the exact command remains in root README. Critic's 14:21 report found no recent manual dispatch, and current runs still show no bridge or V3 fixture run.
- Downloaded actual source-audit artifact **14027319169** from run **43407979154** (not a synthetic fixture). Verified `aichi-expanded-identity-audit.json` SHA-256 exactly matches the workflow's frozen digest `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`. Parsed artifact: 24 decks, 812 source rows, 1,440 copies; 34 generic MEE Basic Energy rows / 118 copies.
- Verified all 34 generic MEE Energy rows preserve the MEE placeholder in `source.printing` while `normalized.printing` and `normalized.card_pool_printing` use same-type SVE proxies: Grass SVE/1, Fire SVE/2, Lightning SVE/4, Psychic SVE/5, Fighting SVE/6, Darkness SVE/7. This resolves the apparent MEE/13 mismatch: the bridge joins `normalized.printing`, not the raw `source.printing`.
- Independently fetched the actual pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The pinned Scarlet & Violet Energy set index exports the six required Basic Energy classes; their source files declare exactly SVE/1, /2, /4, /5, /6, /7 with matching Energy names/types and canonical `fullName`. This is source/artifact-level validation, not a CardManager runtime result.
- Reviewed Agent35's V3 source-to-engine commits `af92cda1efc51bb1d0e78dee4b63d110d71aec86` and `517679f40ff5d86e9d73480608d2d1f5e12d373f`: the fixture's raw printed 60s retain MEE/13, while the V3 resolver records a narrow Psychic Energy MEE/13 → SVE/5 engine proxy separately. The new test also guards unrelated Psychic MEE/12 and Darkness MEE/13 rows from being rewritten. This is consistent with the bridge normalizer; no bridge contract change is needed.
- Sent Agent5 the bridge/V3 normalization alignment at `communications/agent5/20261113T155821Z_agent39_bridge-energy-normalization-alignment.md`; sent Agent44 the pinned six-energy source verification at `communications/agent44/20261113T160021Z_agent39_pinned-sve-energy-bridge-check.md`. Both commits were verified on main.
- Static review of `.github/workflows/twinleaf-smoke.yml`, Agent36's manual V3 workflow, runner and encrypted-artifact path found no new source-level blocker after the Energy proxy fix. The bridge-only job checks out the gitlink, builds pinned Twinleaf, verifies the frozen artifact digest, runs pure tests and resolves all 812 rows. The secure fixture remains a separate owner-dispatched action and requires the owner-controlled public key variable; private key stays offline. No game, CardManager resolution count, matchup, paper admission or win-rate claim is established.
- Next: monitor for the actual owner bridge dispatch; once available, inspect all row mappings, all 24 deck totals and hashes, unresolved identities, research revision and Twinleaf pin. Then coordinate the already-defined secure non-admitting V3 fixture only after bridge completion and owner key provisioning. Preserve Critic's freeze until a complete natural Store game yields both player traces.


### 16:08 UTC — second V3 source→engine blocker (Night Stretcher)

- After my earlier 16:05 note saying the V3 fixture had no further source-level blocker, Agent1 and Agent48 found a second mismatch that occurs **before** Psychic Energy in both frozen lists: Night Stretcher ASC/196 is not registered in pinned Twinleaf; the engine registers only Night Stretcher SFA/61.
- Independently verified pinned Twinleaf file `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/nightly-stretcher.ts`: class `NightlyStretcher` declares name Night Stretcher, set SFA, setNumber 61, fullName Night Stretcher SFA, and is exported by the Shrouded Fable index. The pinned recursive tree has no ASC Night Stretcher source file.
- Independently fetched repository resource records `me2pt5-196` (ASC/196) and `sv6pt5-61` (SFA/61): both are Trainer/Item, have identical complete rules text, and are Expanded Legal. The exact proxy is source ASC/196 → engine SFA/61; preserve source identity and separately record engine identity. Do not use name-only or broad fallback.
- Because the resolver processes source rows in order and Night Stretcher precedes Psychic Energy, current V3 preflight fails on ASC/196 before reaching the existing MEE/13 → SVE/5 correction. **Both aliases are required** for candidate and rank-1 opponent.
- Agent35 owns the active V3 runner/test patch and has a live lease (claimed 15:44:36.505217140Z; release threshold 16:54:36.505217140Z). Agent48 explicitly asked Agent35 to confirm ownership; I sent Agent35 an independent source verification at `communications/agent35/20261113T160701Z_agent39-night-stretcher-alias-confirmation.md` and corrected Agent3 at `communications/agent3/20261113T160800Z_agent39-corrected-v3-preflight-blocker.md`. Do not edit Agent35's runner/test while their active lease and ownership remain in force.
- Correction to earlier memory statement: the V3 fixture has **not** yet cleared source-level preflight; do not dispatch until Agent35's narrow ASC/196 → SFA/61 helper and candidate/rank-1 regression are committed, then run the existing actual-CardManager preflight. No workflow, broad alias or new probe is warranted.


### 16:13–16:17 UTC — bridge-side Night Stretcher engine proxy committed

- Important correction: the Night Stretcher mismatch was not only in the Agent36 V3 fixture. The actual normalized artifact 14027319169 has `Night Stretcher ASC/196` in ranks 1, 8, 19 and 22 (1 + 1 + 2 + 2 = six copies). For these non-energy rows, `normalized.printing` remains ASC/196; the bridge's old direct `normalized.printing.set/number` join therefore failed against pinned Twinleaf, which registers only SFA/61.
- Added a narrow private `enginePrintingForNormalizedRow` helper in `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`, keyed on all four exact facts: `card_id=me2pt5-196`, `name=Night Stretcher`, source set ASC, source number 196. Only this exact identity maps to engine SFA/61. All other rows keep their normalized set/number unchanged; no name-only fallback.
- Existing row output already preserves source printing and card-pool printing separately from resolved Twinleaf `set`/`set_number`, so no schema addition was needed. `deck_identity_sha256` and `source_print_identity_sha256` remain based on unchanged normalized rows; `registered60` hashes the actual engine fullName (SFA). Updated the `identity_join` protocol string accordingly.
- Added bridge regression tests: positive ASC/196→SFA/61 mapping with source/card-pool identities unchanged and hash equality against `normalizedDeckIdentityHashes`; three negative controls (wrong source number, wrong card ID, wrong name) all fail closed. Commits: resolver `067bf94821da7b35602c2e8da68a8dcdb7ef9384`; tests `c2dc0f0f7af6451d44323cb74ff5ef9bdf07d407`.
- A local Node helper smoke (recreated exact proxy function, not full repo test suite) passed 7 assertions. The actual Node test suite, pinned CardManager mapping and bridge workflow remain unexecuted; no claim of a complete bridge or 24 registered decks yet.
- Updated root `README.md`, `results/README.md`, and the Agent39 normalized-field report to distinguish source, normalized and engine printings and to state that the bridge alias is committed while actual CardManager execution is pending. Commits: `38ffbe3962cd010bc7cbddcad28afafb9bd6175f`, `01ba313f6ce4d445a737c4d830cb5d338357504f`, `0ae0385b823fe5b19c0459356e97d68916fa7fb0`.
- Notified Agent3, Agent44, Agent48 and Agent35 of the bridge-side defect and fix. Agent48's 16:15 ownership broadcast was stale by the time it landed: bridge alias now committed; Agent35 still owns the separate Agent36 fixture alias.
- Critic's 16:16 correction retracts the alleged peer-role counter-routing defect. Treat it as a retracted claim; do not change counters or add a pre-run role-wrapper integration test. The existing owner-controlled native fixture remains the factual integration test. This does not affect the bridge mapping patch.
- Current next action: the 24-deck bridge-only lane is now ready for the **owner** to dispatch via existing `twinleaf-smoke.yml` (`aichi_bridge_only=true`, source run `43407979154`). The connector still exposes no workflow-dispatch action. After it runs, inspect actual CardManager output for 812/812 rows, all 24 exact 60s and hashes. Separately, wait for Agent35's matching Night Stretcher ASC/196→SFA/61 helper/test in the Agent36 V3 runner; its existing MEE/13→SVE/5 mapping remains required. Do not dispatch V3 until that patch lands and the owner public key variable is configured.


### 16:19 UTC — exact-print precedence hardened

- Hardened the bridge proxy so it does **not** override a future exact Twinleaf print. `resolveNormalizedRow` now tries the exact normalized set/number first; only if no exact match exists does it consult the exact source-keyed Night Stretcher proxy. Ambiguous exact matches still fail closed and do not fall back.
- Added a regression proving that if both ASC/196 and SFA/61 are present, ASC/196 wins. Existing proxy positive case and three negative controls remain. Commits: exact-first resolver `7b7ceb7ea120272662f67d49f3bca1a03ca7b5f0`; exact-first test `13e7f1bc406940bf583842fc53a05ac39139fc99`.
- Re-ran the local helper smoke with exact-print precedence: **9 assertions passed** (proxy when only SFA/61 exists, exact ASC/196 preferred when present, source identity immutability, and three fail-closed negative controls). This still does not execute the committed full Node test file or the pinned CardManager.
- Updated root README, results README and the Agent39 field report to state exact-print precedence and current test/runtime limits. Commits: `47ee582e3d20b05be1ebbb36dc5b83b783f4da09`, `fc7575fa2b9584a91241298d3a349558d7a2154c`, `5f81f53d8f82aa59fb762e6bb72c229c21dc6cd4`.


### 16:28 UTC — exact proxy checked against frozen artifact rows

- Ran a Node22 artifact-level check against the downloaded `aichi-expanded-identity-audit.json` (artifact 14027319169), not a fabricated row. It found exactly four `me2pt5-196 / Night Stretcher / ASC/196` rows at ranks 1, 8, 19, 22; six copies total. All four preserve raw `source.printing=ASC/196`, `normalized.printing=ASC/196`, and `card_pool_printing=me2pt5/196`; the exact engine fallback is SFA/61. Assertions passed.
- The bridge-only workflow file confirms the existing job checks out the submodule, compiles pinned Twinleaf, runs `node --test tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`, then invokes the bridge. The job has `actions: read` for cross-run artifact download. No workflow modification is needed.
- Current actions run list still has no Twinleaf bridge or Agent36 fixture run. Owner dispatch remains the only way to execute the existing manual lane in this chat.
- Agent48 acknowledged the bridge fix in `communications/agent39/20261113T1619Z_agent48_bridge-alias-review-ack.md`; no further bridge code changes requested.
- Agent35 still has an active lease from 15:44:36Z and has not yet committed the separate V3 Night Stretcher alias or replied to ownership confirmation. Continue to avoid editing their runner/test while their lease is active; if it remains unaddressed after lease release, reassess handoff.


### 16:31 UTC — manual-run monitoring handoff

- Agent27 supplied the precise read-only run-history endpoint: `GET https://api.github.com/repos/FlareZ123/experiment-01/actions/runs?event=workflow_dispatch&per_page=20`. Verified it directly. Latest manual run remains `42740669498` (Agent26 rank-5 copied Energy Mix continuation), created `2026-11-10T02:08:32Z`; no bridge-only or Agent36 fixture dispatch exists.
- Confirmed the existing `twinleaf-smoke.yml` `aichi-bridge` job explicitly grants `actions: read` and `contents: read`, downloads the source audit artifact from run `43407979154`, compiles the pinned submodule, runs the updated bridge test file, and invokes the bridge script. No workflow/permission changes needed.
- Browser skill was read because UI dispatch is the only remaining execution path besides owner CLI; this Chat-mode tool surface has no Work-mode handoff/control tool. If owner wants the assistant to click Run workflow, they must switch to Work mode and reconnect the GitHub browser. Otherwise they can run the exact CLI command already in root README.
- Agent36 lease is still present (claimed 14:58:41.161Z; identity not yet eligible for reclaim), Agent35 lease is still present (claimed 15:44:36.505Z). Agent35 has not yet replied or committed the V3 Night Stretcher alias; I notified Agent36 directly at `communications/agent36/20261113T163138Z_agent39-night-stretcher-v3-status.md`. Do not race active runner ownership.


### 16:42 UTC — bridge failure artifact and rank-1 progression

- Agent27 confirmed `runCli()` writes `aichi-twinleaf-decklist-bridge.json` before returning nonzero for overall incomplete resolution, and the existing `aichi-bridge` upload step uses `if: always()`. Thus an incomplete/failed bridge job should still upload its machine-readable per-deck mapping artifact (missing file remains warn).
- After owner dispatch, inspect the uploaded JSON even if the workflow conclusion is failure. Check rank 1 specifically: if rank 1 resolves to a complete registered 60 and Agent36's own V3 source→engine preflight passes, the first natural Store game need not wait for all 24 diagnostic ranks. Do not call that a complete 24-rank bridge or full-field admission. Sent this progression guidance to Agent48 and Agent35 at `communications/agent48/20261113T164228Z_agent39-bridge-partial-artifact-progression.md` and `communications/agent35/20261113T164228Z_agent39-bridge-partial-artifact-progression.md`.



## 14 November 2026, 07:55 UTC — normal2 continuation and statistical proof review

- Claimed Agent39 in normal mode after the previous lease at 2026-11-13T18:04:25.999Z was >100 minutes old. New immutable lease: `agent39-chat-20261114T075537Z-normal2-gpt6-7b31d2b0`, `claimed_at=2026-11-14T07:55:37.297265Z`; claim commit `bee433ce53c8939bf4c480fdefd805c25bef2772` was remotely read back. **70-minute release threshold: 2026-11-14T09:05:37.297265Z**. Do not refresh. After every checkpoint compare the original claim timestamp with the actual UTC clock; do not voluntarily exit before measured 70-minute age.
- Re-read the current decision board and source-coverage status. The 29/32 source list boundary is unchanged; ranks 23/25/28 remain exact-list missing, and the rank28 Replica photo remains provisional because Swiss qualifier rank does not prove the Limitless identity/registration join. Do not repeat old social-source searches or promote a reconstructed list without a direct source join.
- Responded to Agent12's outstanding request for independent review of the 128-stratum, 10-games-per-cell, at-most-two-nonwin aggregate field-mean proof. Independently reconstructed the pair generating polynomial and derivative, checked the Jensen/superadditivity bounds, and verified all three region inequalities. No mathematical defect found. The independent review is `results/statistics/agent39-audit-agent12-two-loss-field-mean-proof-20261114.md` (commit `c85831da4c8e7af730ddf0b75cd48e22e839cea2`); response sent in `communications/agent12/20261114T080010Z_agent39_two-loss-field-mean-proof-review.md` (commit `55841fe8556c3309210a83cda01b432f16197968`).
- Exact design remains prospective only: aggregate field mean, 128 equal strata, 10 independent i.i.d. games per stratum, fixed sample, no optional stopping, no per-opponent guarantee. It does not validate source admission, policy competence, physical-game independence, or deck strength. Do not use this proof to claim any actual 99.5% result.
- Next: monitor Agent12's response if useful; avoid further duplicative statistical variants. Resume the most valuable independent field-source or policy-isolation dependency only after checking current main and relevant ownership/lease state. The current Critic stopline remains no new V3 fixture until the full actor-only worker boundary passes its hostile hosted canary and the owner chooses the seed-disclosure model. Do not modify Agent36/Agent49 active worker paths without coordination.


### 14 November 2026, 08:04 UTC — Twinleaf updater race guard

- Reviewed the existing weekly/manual `.github/workflows/twinleaf-reviewed-upstream.yml`. It already validates the exact upstream SHA in a read-only build/test job and publishes a review-only gitlink PR in a separate write job; no new workflow or upstream change was needed.
- Found a reproducibility race: the proposal job verified only that the submodule base SHA matched the validation job. If research `main` advanced between jobs, it could publish the candidate pin atop untested research code.
- Patched the existing workflow in commit `2cd6794759cd8d0e7b6b983901c8a7d6e3343a7f`: validation now exports the exact repository `HEAD`, proposal publication fails closed unless its checked-out main SHA is identical, and the PR body records that tested source commit. No workflow dispatch was made and no Twinleaf gitlink was advanced; main remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Sent Agent2 the ownership handoff at `communications/agent2/20261114T080406Z_agent39_twinleaf-upstream-validation-base-binding.md` (commit `dd7f3c041f338652d0e04efa82dd7179d502c95a`).


### 14 November 2026 19:53 UTC — rank-2 Peonia / Prize-knowledge static review

- **Current immutable lease:** actual initial RNG draw **5/10** selected normal mode. Agent39 claimed successfully at `2026-11-14T19:44:44.947602Z`, run `agent39-chat-20261114T194444Z-normal5-gpt6-8fe90b8a69d368d4`, claim commit `bf9589f5ffa5ce1de68fd5934f8497b3104f6ce2`. Do not refresh. Earliest voluntary release is **2026-11-14T20:54:44.947602Z**. After every checkpoint compare actual runtime UTC to this original claim; continue while younger than 70 minutes.
- **Agent42 request answered:** static review at `communications/agent42/20261114T1949Z_agent39_rank2_peonia_static_review.md` (commit `4542b56fe29fbc1897f6fbe0c254ba8a0658edd9`), replacement-count clarification `communications/agent42/20261114T1952Z_agent39_peonia_projection_followup.md` (commit `09d70a70db1f11b7b33880127659ad42d54ff0ab`), and Gladion addendum `communications/agent42/20261114T1953Z_agent39_gladion_prize_knowledge_addendum.md` (commit `8b10fbb514b0d6d5494f1e4b93bc205a6d505f18`). Direct Agent10 handoff at `communications/agent10/20261114T1951Z_agent39_peonia_rank2_review_handoff.md` (commit `b088fbebc8b21164ecb95afaf0fc4f0372c37fdf`). All messages verified on remote main.
- **Critical source correction:** `results/aichi-2026/full-decklists.json`, rank 2 Takahiro Ando, contains Peonia CRE149 ×1, Lusamine CIN96 ×1, Gladion CIN95 ×1. Agent42's “two Lusamine” premise conflated rank29, whose source list does have two Lusamine. Rank2 therefore has one direct Lusamine-mediated Peonia replay (first Peonia to discard, one Lusamine to recover it), not an assumed two-Lusamine loop. Further recycling through Team Yell's Cheer/search is a separate unproven route.
- `agent39-peonia-owner-visited-slots.cjs` is reusable as an owner-only index ledger if updated only after a complete accepted Peonia payment/replacement/order chain. Its `safeReplacementCount` is a policy-derived reservation, not simply hand size. Preserve indices across Peonia and Lusamine because Lusamine itself does not move Prizes; invalidate/rebuild on untracked Prize movement, shuffle, reorder, slot compaction/reindexing, reset, or uncertain/aborted settlement.
- Existing rank2 `tests/root-k1-peonia-prize-sampling.test.cjs` stages the exact source 60 and a full three-Prize Peonia chain, but not 1/2 or repeated Peonia via Lusamine. Existing rank29 native fixture/report covers 1/2/3 in both seats; it is same-card mechanics evidence but not rank2 source/policy evidence. Its native fixture confirms Peonia's follow-on `ChooseCardsPrompt.options.min/max` equal selected Prize count and the OrderCardsPrompt contains that many cards, so current generic `projectChooseCards` min/max and order count are adequate if source provenance survives the continuation.
- Current projection gap: `projectChoosePrize` emits filtered `selectionIndex`, not the original physical Prize-slot index; it uses the original index only in a label. Add separate `slotIndex/originalSlotIndex` while retaining filtered index for native decoding. It exposes native `requiredCount` but no Peonia-specific paper minimum/maximum; only a typed actor-owned Peonia prompt should get paper range 1–3, preserving native count separately. Do not globally expose hidden Prize identities.
- Current Agent10 rank2 policy is not Peonia-capable: Peonia/Gladion have zero card score; Lusamine does not prioritize Peonia in its recovery selection; Peonia is absent from recognized card-effect sources for replacement/order prompts; the Prize branch uses `requiredCount` and `choiceIndex`, while projection emits `selectionIndex`. The policy has no visited-slot or safe-replacement decision.
- **Gladion is separate and invalidates Peonia slot history:** Gladion CIN95 lets its owner look at face-down Prizes, take one, then shuffles Gladion into the remaining Prizes and puts them face down. This is an owner-authorized reveal followed by a shuffle; it destroys the prior slot-to-card map. It is not a Peonia-style selected-slot replacement and the played Gladion is not in discard for Lusamine. Current `projectChoosePrize` hardcodes `isOwnerVisible:false`; any future Gladion policy needs a source-scoped owner-only reveal, never global opponent/Prize disclosure.
- **No implementation was requested or made:** no code, tests, fixtures, CI, decklist, matchup, or win-rate changes. The review is static and not competitive evidence. Benchmark remains 29/32 authenticated source sixties, zero competitively qualified games, no final fixed 60, and no 99.5% result.
- **Next:** check Agent42/Agent10 replies. If implementation is requested, coordinate ownership and wait for the active worker acceptance stopline to clear. Before adding fields, ensure prompt provenance is retained through the Peonia replacement/order continuation; current provenance tests cover only a prompt created synchronously inside `callReduceEffect`, not the full multi-prompt chain. Do not duplicate Agent36/Agent49 worker work or dispatch any blocked fixture.


### 14 November 2026 20:02 UTC — worker/projection state contract and existing Gladion work

- Further static audit found a **worker-level count veto**: current `simulation/evaluation/2026-11/agent49-policy-worker.cjs` allows `slotIndex`, `minimumCount`, and `maximumCount` in `PROMPT_META_KEYS`, but `multiSelectBounds` hardcodes `prize-slots` min=max to `requiredCount`; `validateDecision` enforces it. Therefore projection min/max alone cannot admit paper-valid 1/2 Peonia selections. Keep ordinary Prize prompts exact; permit 1..N only for typed actor-owned Peonia CRE, preserve native `requiredCount` separately, and coordinate after Agent49's active VM/globalThis acceptance stopline clears. Handoffs: `communications/agent42/20261114T1955Z_agent39_peonia_worker_protocol_veto.md`, `communications/agent49/20261114T1955Z_agent39_peonia_worker_protocol_veto.md`.
- **No persistent owner Prize-slot history reaches the current policy.** `simulation/twinleaf/actor-observation-contract.cjs` exposes face-down own Prize slots as index-only geometry and prints only face-up Prizes; its only optional knowledge snapshot is `ownerK1Snapshot` (deck-membership knowledge). `agent49-policy-worker.cjs` has no owner Prize ledger in `ACTOR_KEYS` or public event receipt. Agent10's `createPolicy` returns a stateless `decide(request)`. Thus the pure Peonia helper cannot maintain visited physical indices across repeated prompts from current actor-view inputs. Host should maintain an owner-only authenticated snapshot (epoch, visited physical indices, invalidation reason) and pass it into actor observation; update only after complete accepted Store chain + postconditions; keep all face-down identities private. Do not overload ownerK1. Handoffs: `communications/agent42/20261114T1956Z_agent39_peonia_owner_ledger_contract.md`, `communications/agent49/20261114T1956Z_agent39_owner_prize_ledger_handoff.md`.
- **Existing Gladion work discovered; reuse it.** `simulation/twinleaf/gladion-root-prize-choice-evidence.cjs` authenticates an actor-owned Gladion `ChoosePrizePrompt` only when Gladion CIN is the live Supporter and every remaining own Prize is actually exposed; it captures revealed slot/printing and verifies the selected physical card reaches hand. `tests/agent24-gladion-owner-context.test.cjs` tests owner context, no concealed deck/opponent-hand reads, all-Prizes-exposed precondition, and detached snapshot. `simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs` uses exact rank2 source 60, seed 20261024, source seat 1, turn 5/action ordinal 47; the observed choice is Relicanth TEF, with Technical Machine: Evolution among alternatives. It asserts the observer leaves baseline deck hashes, root action ledger, and outcome unchanged. This is retrospective read-only evidence, not a policy decision, no competitive result, and not a dedicated test/workflow in current main. Agent24 has been asked whether a policy-facing reveal path was evaluated: `communications/agent24/20261114T1958Z_agent39_gladion_policy_integration_question.md`. Agent42 handoff: `communications/agent42/20261114T2000Z_agent39_existing_gladion_rank2_evidence.md`.
- Keep knowledge dimensions separate: Gladion's reveal can establish owner-known Prize identities/multiset, but its subsequent shuffle destroys **slot-position mapping** and must invalidate Peonia visited indices. A known Gladion card entering Prizes was previously visible, so exact deck-membership knowledge need not automatically be invalidated; `root-prize-knowledge-observer.cjs` explicitly distinguishes hidden Prize ingress from re-prizing a previously visible card. Do not equate positional ledger invalidation with ownerK1 invalidation.
- `human_concepts.md` prior work on UDP/DCI/AMR supports a dynamic hand replacement value rather than using raw hand size: protect state-dependent critical lock/setup pieces, Supporter/energy resources and future lines; consider matchup, turn, K0/K1 knowledge, recovery, and search connectivity. This is a heuristic framework, not an established rank2 strategy result. Safe replacement count is the number of currently acceptable Prize placements, not simply number of cards in hand.
- **Next:** check replies from Agent24, Agent42, Agent10, and Agent49; avoid more duplicate messages. If no response, continue useful static integration analysis without modifying worker/CI during the active stopline. Any implementation should first add owner-only position state, source-aware worker bounds, and provenance propagation across continuation prompts; Gladion needs a distinct source-scoped temporary owner reveal and post-shuffle slot invalidation.


### 14 November 2026 20:13 UTC — exact rank-2 Prize access analysis and reuse audit

- Created `results/aichi-2026/agent39-rank2-prize-access-combinatorics-20261114.md` (commit `eaf4d1e4a04f8f4d35c1d0f39d6a12a6f1a33c70`; updated with policy-value and slot-map caveats) and linked it from `results/README.md` (commit `a6f5a97...`; verify exact commit in main history if needed). The report gives exact hypergeometric initial-Prize distributions for the rank-2 source 60 and K0/K1 Peonia hit probabilities; no simulation or matchup claim.
- Verified rank-2 inventory: 60 cards; Peonia ×1, Lusamine ×1, Gladion ×1, Team Yell's Cheer ×1, Pidgeot ex ×2, Bunnelby ×2. Direct Lusamine retrieval is one route, not the total Peonia reuse cap: Team Yell's Cheer can recycle Supporters to deck, Bunnelby Rototiller can recycle one discard card to deck, and Pidgeot ex Quick Search can fetch any card from deck. Current Agent10 scoring/target priority omits Peonia across Lusamine, Team Yell's Cheer, Rototiller, and Quick Search; Peonia/Gladion themselves are zero-scored. Handoff to Agent10: `communications/agent10/20261114T2008Z_agent39_prize_access_result_handoff.md`; Agent42 has the full route correction at `communications/agent42/20261114T2003Z_agent39_peonia_recycle_routes_correction.md`.
- Exact initial-six-Prize probabilities (uniform sample without replacement): among four singleton access Supporters (Peonia/Lusamine/Gladion/Team Yell's Cheer), 0/1/2/3/4 Prized = 64.8540/30.5195/4.4019/0.2215/0.0031%; at least one 35.1460%, at least two 4.6264%. Peonia+Gladion both Prized 0.84746%, exactly one 18.3051%, neither 80.8475%. Both copies of Pidgeot ex or both Bunnelby Prized 0.84746%. Pure combinatorics only.
- Added a candidate (unvalidated) state-dependent Prize replacement cost model to the report: protect immediate/unique lock/setup and energy/supporter resources; account for K0/K1 and actual Prize access, and do not count discard recursion (Lusamine/Team Yell/Bunnelby) as direct retrieval from the Prize zone. `safeReplacementCount` is not hand size. The supplied human concepts' UDP/DCI/AMR are heuristic inputs, not proven rank2 strategy.
- The Peonia helper's visited-index set is sufficient for fresh-first sampling but not a full owner Prize map: it does not retain `slotIndex -> replacement printing`. If policy must later target/avoid a known replacement, a host-owned owner-only map is needed. Follow-up: `communications/agent42/20261114T2013Z_agent39_peonia_known_slot_identity_gap.md`.
- Reused prior work rather than duplicating: `simulation/twinleaf/gladion-root-prize-choice-evidence.cjs` authenticates Gladion owner reveal and verifies the selected physical Prize reaches hand; `tests/agent24-gladion-owner-context.test.cjs` tests the helper. `simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs` records a source-rank2 native run (seed 20261024, source seat 1, turn 5/action ordinal 47) selecting Relicanth TEF from the exposed Prizes; baseline/observer action and outcome fields remain unchanged. This is audit evidence, not an Agent10 decision or competitive result, and no dedicated test/workflow was found. Asked Agent24 for policy-integration context: `communications/agent24/20261114T1958Z_agent39_gladion_policy_integration_question.md`; no reply as of this checkpoint.
- Other existing work: `agent21-owner-first-prize-reveal` concerns ordinary KO Prize-taking and explicitly excludes card-specific Prize manipulation; `agent3-owner-ko-prize-settlement-evidence` can inform accepted own Prize-take settlement; `agent3-prize-shuffle-ignored-return-hook` says the pinned Gladion shuffle return assignment is correct (no patch), so Gladion still invalidates positional mapping. Agent23 bounded hidden-Prize exchange work concerns opponent hidden-hand exchanges, not the owner Peonia flow.
- README link added to the rank-2 Prize-access result. No code, tests, fixtures, CI, decklists, or matchups changed. Experimental inputs remain frozen under the current worker acceptance stopline.
