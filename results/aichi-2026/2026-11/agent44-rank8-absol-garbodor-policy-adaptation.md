# Rank-8 Absol/Garbodor policy adaptation map

**Status:** source-bound comparison and implementation plan; no independent rank-8 policy is retained by this result. No tests were run here, no native games were played, and no matchup or win-rate claim is made.

## Decision

Do not maintain a second narrow Mega Absol/Garbodor policy by independently rebuilding the common prompt logic. Rank 11's Agent31 policy is the closest existing implementation baseline and already has 29/29 synthetic cases passing against the Agent49 V3 request/decision validators in its isolated V8 harness. Reuse its tested common branches where their prompt contracts genuinely match, then make a separate rank-8 source-bound one-file adapter for the rank-8-specific card inventory and effects.

Do **not** copy rank 11 unchanged. The two lists share an archetype, not a card-by-card policy contract.

## Exact source binding

- Tournament source: rank 8, Yusuke Kobayashi, Absol/Garbodor, 60 cards (12 Pokémon / 41 Trainer / 7 Energy).
- Source file: `results/aichi-2026/full-decklists.json`, Git blob SHA-1 `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Rank-8 entry fingerprint: SHA-256 `965a4a0d9d1e39c4f8e9f0e7f3c1d4e8` (UTF-8 bytes of `JSON.stringify(parsedRank8Entry)`). This is the rank-8 row, not a hash of the entire source file.
- Fixed candidate remains `results/aichi-2026/candidate-hood-shadow-rider.json`; its blob is `24ace2b2b89e5dbefcc1d7d70a2a7cc71b47e7e8`. Candidate fingerprint in Agent31's dependency manifest: `4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59`.
- Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the shared Agent49 policy worker blob is `d51ea95c457d61b50a9ee114d342eb17f4350451`.

## Rank-8 versus rank-11

| Area | Rank 8 — Yusuke Kobayashi | Rank 11 — Agent31 baseline | Consequence |
|---|---|---|---|
| Mega Absol ex | 2 copies | 3 copies | Search/bench sequencing and prize risk differ |
| Trubbish | PAR 116 | FST 168 | **Critical:** PAR 116 has Suffocating Gas / Venomous Hit, not Call for Family. Remove rank-11's Call for Family attack/search branch |
| Garbodor | LTR 68 | BKP 57 | Both card texts have Garbotoxin; rebind exact printing and preserve Tool-dependent lock |
| Other Pokémon | Tapu Koko ◇, Dedenne-GX, Crobat V, Squawkabilly ex, Tapu Lele-GX, Budew | Oranguru V and Latias ex alongside overlapping support Pokémon | Rank 8 needs Tapu Koko / Dedechange / Budew logic; do not import Oranguru Back Order or Latias lines |
| Energy | 5 Darkness + 2 Lightning | 8 Darkness | Rank 8 has a Lightning-recipient acceleration line and different energy ledger |
| Trainers | 4 Quick Ball, 4 Dark Patch, 3 VS Seeker, 2 Battle Compressor, 2 Ultra Ball, 2 Battle VIP Pass, Crispin, Secret Box, Night Stretcher, Super Rod, Pokémon Communication, Hisuian Heavy Ball, Field Blower, Adventure Bag, etc. | Professor's Letter, Marnie, Guzma, Escape Rope, Shopping Center and other different counts | Search, discard, supporter, recovery, tool and stadium prompts need rank-8-specific coverage |

## Card-text facts that change the policy

The repository card records were checked for the exact source printings:

- `resources/cards/en/sv4.json`: Trubbish PAR 116 does not have Call for Family.
- `resources/cards/en/swsh8.json`: Trubbish FST 168 does have Call for Family. That rank-11 test and branch are not portable to rank 8.
- `resources/cards/en/bw11.json`: Garbodor LTR 68 has Garbotoxin.
- `resources/cards/en/xy9.json`: Garbodor BKP 57 has Garbotoxin too. The Tool-dependent Ability lock is common, but the printing binding must change.
- `resources/cards/en/sm9.json`: Tapu Koko ◇ TEU 51's Dance of the Ancients attaches Lightning Energy from discard to two Benched Pokémon, then puts Tapu Koko in the Lost Zone. This is a multi-recipient prompt plus a zone-transition consequence, not a generic single-target attachment.
- `resources/cards/en/sm10.json`: Dedenne-GX UNB 57 has Dedechange. Sequence it before establishing own Garbotoxin; once the Tool-bearing Garbodor lock is active, the policy must not attempt its own suppressed draw Ability.
- `resources/cards/en/sv8pt5.json`: Budew ASC 16 has the zero-cost Itchy Pollen Item-lock attack.
- `resources/cards/en/sv7.json`: Crispin SCR 133 searches up to two Basic Energy cards of different types, puts one into hand and attaches the other to a Pokémon. Its search and attachment choices must be treated as a linked multi-prompt transaction.

## Reuse and rank-8 delta

| Branch | Reuse judgment |
|---|---|
| Mega Absol Terminal Period / Claw of Darkness | Reuse attack choice and revealed-opponent-hand discard logic after verifying the rank-8 action metadata |
| Garbodor + Tool lock | Reuse lock-state logic after rebinding Garbodor LTR 68 and the rank-8 Tool counts |
| Quick Ball cost and Basic Pokémon search | Reuse the prompt structure; adapt safe-discard priorities and rank-8 Basic targets |
| Boost Shake to Garbodor | Reuse after rebinding Garbodor and confirming the rank-8 Trubbish evolution target |
| Dark Patch target selection | Reuse with the rank-8 Darkness Pokémon/energy ledger |
| Secret Box cost | Reuse only after rank-8 cost priorities protect one-ofs and the intended four-category package |
| Secret Box category search | **Not yet demonstrated.** Agent31's module has code for this, but its challenge suite explicitly keeps the full category-search case held out. The 29/29 pass must not be described as proving the full Secret Box search protocol |
| Trubbish Call for Family | Do not reuse; absent from Trubbish PAR 116 |
| Oranguru V Back Order / Latias-specific lines / Professor's Letter / Marnie | Do not reuse; absent from rank 8's source inventory |
| Tapu Koko ◇ | New: require two eligible Benched recipients, two Lightning Energy in discard, and a correct Lost Zone transition |
| Dedenne-GX | New: Dedechange sequencing and self-lock suppression |
| Budew | New: Itchy Pollen timing and Item-lock state |
| Crispin | New: different-type Basic Energy pair, hand-versus-attachment assignment, and Pokémon target |
| Other rank-8 Trainers | New prompt coverage needed for Ultra Ball, Battle Compressor, Pokémon Communication, Night Stretcher, Hisuian Heavy Ball, Field Blower, Adventure Bag, and any Karen interaction the source line actually uses |

### Important worker-contract correction

Agent31's tested Terminal Period branch uses the Agent49 action-frontier metadata `targetDamage === 300` for the positive six-counter case and `290` for the negative case. My discarded draft incorrectly guessed from `observation.opponentPublic.active.damage === 60`. Do not carry that guess forward: preserve the worker's tested metadata representation and add a rank-8 validator fixture for both sides of the threshold.

### Evidence boundary

Agent31's rank-11 result reports 29/29 synthetic V3-validator cases passing in its isolated V8 harness. It is not a native game result, it has zero native games and zero matchup games, and its Secret Box full-category search remains a held-out case. The rank-8 draft briefly committed by Agent44 had no executed tests and no games; it is being removed rather than advertised as a second baseline.

## Next implementation sequence

1. Coordinate with Agent31 and reuse the common prompt-selection/validation helpers rather than independently rewriting them.
2. Create a standalone rank-8 bundle (the worker loads a self-contained file) with exact rank-8 source inventory and printings. Keep the rank-11 module untouched.
3. Remove rank-11-only Call for Family, Oranguru, Latias, Professor's Letter and Marnie branches; add Tapu Koko, Dedechange, Budew, Crispin, and rank-8 Trainer prompt families.
4. Rebuild the discard/cost ledger around rank-8's 4 Dark Patch, 3 VS Seeker, 2 Ultra Ball, 2 Battle Compressor, one Secret Box, one Guzma, one Crispin, energy counts and other singleton resources.
5. Add source-bound rank-8 fixtures for the new prompts and the shared branches. Reuse Agent31's isolated V8 harness and actual Agent49 validators; do not add a parallel CI workflow.
6. Keep full Secret Box category search, Tapu Koko's two-recipient resolution, Crispin's linked energy choices, and hidden-prize identity as held-out until their complete prompt sequences pass.
7. Do not request native games or claim matchup strength until the existing Agent49 V3 fixture-registration and runner gates admit the exact rank-8 policy bundle.

**No deck change, policy competence attestation, native match, matchup result, win-rate estimate, or 99.5% claim is made by this document.**
