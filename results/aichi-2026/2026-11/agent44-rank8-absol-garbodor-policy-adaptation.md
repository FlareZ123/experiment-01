# Rank-8 Absol/Garbodor policy adaptation map

**Status:** source-bound comparison and implementation plan; no independent rank-8 policy is retained by this result. No tests were run here, no native games were played, and no matchup or win-rate claim is made.

## Decision

Do not maintain a second narrow Mega Absol/Garbodor policy by independently rebuilding the common prompt logic. Rank 11's Agent31 policy is the closest existing implementation baseline and already has 29/29 synthetic cases passing against the Agent49 V3 request/decision validators in its isolated V8 harness. Reuse its tested common branches where their prompt contracts genuinely match, then make a separate rank-8 source-bound one-file adapter for the rank-8-specific card inventory and effects.

Do **not** copy rank 11 unchanged. The two lists share an archetype, not a card-by-card policy contract.

## Exact source binding

- Tournament source: rank 8, Yusuke Kobayashi, Absol/Garbodor, 60 cards (12 Pokémon / 41 Trainer / 7 Energy).
- Source file: `results/aichi-2026/full-decklists.json`, Git blob SHA-1 `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Rank-8 entry fingerprint: SHA-256 `965a4a0d7bea2df491d44e7b3246d1058d676347c9521f1e3b5daaf0eecf39ad` (UTF-8 bytes of `JSON.stringify(parsedRank8Entry)`). This is the rank-8 row, not a hash of the entire source file.
- Fixed candidate remains `results/aichi-2026/candidate-hood-shadow-rider.json`; its blob is `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`. Candidate deck is unchanged; this source-delta note does not rely on a candidate fingerprint.
- Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; the shared Agent49 policy worker blob is `d51ea95c457d61b50a9ee114d342eb17f4350451`.

## Reusable Agent31 artifacts

- Policy bundle: `simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs`
- Test source: `tests/2026-11/agent31-rank11-absol-garbodor-opponent-policy.test.cjs`
- Challenge suite: `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-challenge-suite.json`
- Dependency manifest: `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1-dependencies.json`
- Result report: `results/aichi-2026/2026-11/agent31-rank11-opponent-policy-v1.md`

The policy and test source are reusable implementation references, not an approved rank-8 bundle. Keep their rank-11 source binding and evidence unchanged; create a separately fingerprinted rank-8 bundle only after the exact source-specific changes and new tests exist.

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

## Rank-8 sequencing hypothesis (not yet tested)

The source inventory suggests a natural sequencing constraint that should become an explicit policy-state feature:

1. **Spend the pre-lock Ability window first.** Squawkabilly ex's first-turn Squawk and Seize, Dedenne-GX Dedechange, Crobat V Dark Asset, Tapu Lele-GX Wonder Tag, Tapu Koko ◇ Dance of the Ancients, and Forest Seal Stone Star Alchemy are Ability-based. A Tool-bearing Garbodor with Garbotoxin suppresses the deck's own Abilities as well as the opponent's. Avoid establishing the lock before extracting value from the abilities that matter.
2. **Establish Garbotoxin deliberately.** Evolve Trubbish PAR 116 into Garbodor LTR 68 and attach a Pokémon Tool (the list has four Float Stone, one Muscle Band, one Forest Seal Stone). Rank 11's Boost Shake/Garbodor helper is reusable only after rebinding; its toolless-Boost-Shake case remains held out.
3. **Build Mega Absol's energy with three distinct routes.** Dark Patch and Squawkabilly's Motivate attack use Darkness Energy from discard; Tapu Koko ◇ moves Lightning from discard to two Benched Pokémon before going to the Lost Zone; Crispin finds two different Basic Energy types, puts one in hand and attaches the other. Battle Compressor may seed discard, but its three-card choice must protect singleton Supporters and preserve the Lightning/Darkness allocation plan.
4. **Choose the control attack by state.** Mega Absol's Terminal Period condition is exactly six damage counters (the Agent49 frontier represents the tested boundary as `targetDamage === 300`); otherwise evaluate Claw of Darkness's damage and revealed-hand discard. Budew's Itchy Pollen is an attack-based Item lock and remains available under Garbotoxin; compare its tempo value against the Mega Absol attack line.
5. **Keep disruption and recovery in the same ledger.** Temple of Sinnoh, Guzma, Field Blower, Secret Box, Night Stretcher, Super Rod, Karen, and VS Seeker compete for the same limited hand/discard resources. Do not spend one-ofs on Ultra Ball, Quick Ball, Battle Compressor, or Secret Box costs without a source-specific discard ledger.

This is a strategy hypothesis derived from the exact rank-8 list and card text, not an established optimal sequence. Each branch needs actor-view fixtures and, where the engine has multi-prompt effects, a complete prompt-sequence test before it can be treated as policy coverage.

## Energy-resource coupling hypothesis

The 5 Darkness / 2 Lightning split is not interchangeable energy density. Tapu Koko ◇ needs both Lightning Energy in the discard pile to accelerate two Benched Pokémon; Dark Patch and Squawkabilly's Motivate need Darkness in discard. The two Battle Compressor copies can potentially seed a coordinated package (both Lightning plus one Darkness), while Quick Ball / Ultra Ball / Dedechange costs can also change the discard state. Crispin instead finds two different Basic Energy types, attaches one and puts the other into hand, so it competes with rather than automatically complements the Tapu Koko discard plan.

A rank-8 policy state evaluator should therefore track at least:
- Lightning Energy in discard (0/1/2), and whether Tapu Koko is still in play and usable;
- Darkness Energy in discard and the number of live Dark Patch / Motivate recipients;
- Mega Absol's attached Energy and whether it is Active or Benched;
- remaining bench slots and the number of eligible Benched Pokémon for Tapu Koko;
- own Garbotoxin state, because it disables Tapu Koko and the other own Abilities;
- hand-cost safety, preserving the one-of Supporters and the Secret Box package.

This is a resource-allocation hypothesis, not a proven optimal line. Add adversarial fixtures for 0/1/2 Lightning in discard, one versus two eligible Benched recipients, and Darkness-only acceleration before claiming the Tapu Koko branch is covered.

## Reuse and rank-8 delta

| Branch | Reuse judgment |
|---|---|
| Mega Absol Terminal Period / Claw of Darkness | Reuse attack choice and revealed-opponent-hand discard logic after verifying the rank-8 action metadata |
| Garbodor + Tool lock | Reuse lock-state logic after rebinding Garbodor LTR 68 and the rank-8 Tool counts |
| Quick Ball cost and Basic Pokémon search | Reuse the prompt structure; adapt safe-discard priorities and rank-8 Basic targets |
| Boost Shake to Garbodor | Reuse after rebinding Garbodor and confirming the rank-8 Trubbish evolution target |
| Dark Patch target selection | Reuse with the rank-8 Darkness Pokémon/energy ledger |
| Squawkabilly ex Motivate | Directly reusable: Agent31's development suite tests the attack, Mega Absol target selection, and one/two Darkness Energy selection; rank 8 has the same PAL 169 printing |
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

Agent31's rank-11 result reports 29/29 synthetic V3-validator cases passing in its isolated V8 harness. It is not a native game result, it has zero native games and zero matchup games. Its four held-out reviews are seat-1 Back Order, full Secret Box category search, toolless Boost Shake, and Claw damage conversion. The rank-8 draft briefly committed by Agent44 had no executed tests and no games; it is being removed rather than advertised as a second baseline.

## Rank-8 challenge-suite build list

Copy the common cases only after rebinding the rank-8 inventory; add the following source-specific cases. These are test specifications, not passed tests.

| Case ID | Purpose | Reuse / new | Initial status |
|---|---|---|---|
| `r8-vip-pass-setup` | Open with Battle VIP Pass while protecting bench capacity | Common rank-11 pattern | Rebind to two VIP Pass copies |
| `r8-quick-ball-cost-protection` | Discard a dead VIP Pass or redundant search card, never a live one-of | Common rank-11 pattern | Rebind rank-8 counts |
| `r8-boost-shake-garbodor` | Search Garbodor LTR 68 from Trubbish PAR 116 | Common rank-11 pattern | Rebind exact printings |
| `r8-terminal-period-exact-60` | Use worker frontier `targetDamage === 300` for six counters; reject 290 | Common rank-11 pattern | Reuse tested worker metadata |
| `r8-claw-discard` | Prioritize a revealed opponent threat from Claw of Darkness | Common rank-11 pattern | Rebind threat priority |
| `r8-dark-patch-recipient` | Attach Darkness to a benched Mega Absol | Common rank-11 pattern | Rebind rank-8 counts |
| `r8-squawk-motivate` | Attack with Motivate, select Mega Absol, then one/two Darkness Energy | Common rank-11 pattern | Same Squawkabilly ex PAL 169 |
| `r8-guzma-target` | Choose the correct opponent Benched Pokémon and own switch target | Common rank-11 pattern | Rebind rank-8 prize/energy context |
| `r8-own-ability-window` | Use available draw/search Abilities before Tool-bearing Garbodor suppresses them | Rank-8 sequencing | New |
| `r8-dedechange-prelock` | Dedenne-GX Dedechange with a discard-safe hand | Rank-8 unique | New |
| `r8-dedechange-postlock` | Do not attempt Dedechange after own Garbotoxin is active | Rank-8 unique | New |
| `r8-tapu-koko-two-recipients` | Select two eligible Benched recipients, attach two Lightning from discard, resolve Tapu Koko to Lost Zone | Rank-8 unique | Hold out until exact native prompt sequence is known |
| `r8-tapu-koko-insufficient-lightning` | Abstain if fewer than two eligible Lightning Energy / recipients | Rank-8 unique | Hold out until exact prompt sequence is known |
| `r8-budew-itchy-pollen` | Prefer Itchy Pollen when next-turn Item lock outweighs Mega Absol attack | Rank-8 unique | New |
| `r8-crispin-energy-pair` | Select two different Basic Energy types, one to hand and one to attach to a legal target | Rank-8 unique | Hold out until linked prompt sequence is known |
| `r8-ultra-ball-cost-search` | Select two safe hand discards, then the best Pokémon from deck | Rank-8 unique | New |
| `r8-battle-compressor-three-card` | Select up to three deck cards without losing singleton Supporters or the energy plan | Rank-8 unique | Hold out until exact selection bounds are known |
| `r8-pokemon-communication` | Return a Pokémon from hand, then select a replacement from deck | Rank-8 unique | Hold out until both prompts are known |
| `r8-night-stretcher-recovery` | Recover the correct Pokémon or Basic Energy from discard | Rank-8 unique | New |
| `r8-hisuian-heavy-ball-prize-identity` | Use only the Basic Pokémon actually revealed among Prize cards | Rank-8 unique | Hold out until prize-visibility semantics are verified |
| `r8-field-blower-two-targets` | Select up to two opposing Tools/Stadiums without removing own lock tools | Rank-8 unique | Hold out until target schema is verified |
| `r8-adventure-bag-two-tools` | Select the correct two Tools (e.g. Float Stone / Forest Seal Stone) | Rank-8 unique | Hold out until selection bounds are verified |
| `r8-secret-box-four-categories` | Pay the three-card cost, then select one Item, Tool, Supporter and Stadium without category collision | Shared code exists, rank-8 binding new | Hold out; rank-11's equivalent is also unexecuted |
| `r8-forest-seal-stone-prelock` | Use Star Alchemy before own Garbotoxin disables the Ability | Rank-8 unique sequence | New |
| `r8-ability-lock-order` | Verify own Dedenne/Crobat/Squawk/Tapu Lele/Tapu Koko/Forest Seal Stone Abilities are not selected after lock | Rank-8 sequencing | New |

The common rank-11 suite's four held-out reviews are useful adversarial seeds, not coverage: seat-1 Back Order, full Secret Box category search, toolless Boost Shake, and Claw damage conversion. Rank 8 should retain these as review cases where applicable and add both physical seats for the new multi-recipient / multi-prompt branches.

## Next implementation sequence

1. Coordinate with Agent31 and reuse the common prompt-selection/validation helpers rather than independently rewriting them.
2. Create a standalone rank-8 bundle (the worker loads a self-contained file) with exact rank-8 source inventory and printings. Keep the rank-11 module untouched.
3. Remove rank-11-only Call for Family, Oranguru, Latias, Professor's Letter and Marnie branches; add Tapu Koko, Dedechange, Budew, Crispin, and rank-8 Trainer prompt families.
4. Rebuild the discard/cost ledger around rank-8's 4 Dark Patch, 3 VS Seeker, 2 Ultra Ball, 2 Battle Compressor, one Secret Box, one Guzma, one Crispin, energy counts and other singleton resources.
5. Add source-bound rank-8 fixtures for the new prompts and the shared branches. Reuse Agent31's isolated V8 harness and actual Agent49 validators; do not add a parallel CI workflow.
6. Keep full Secret Box category search, Tapu Koko's two-recipient resolution, Crispin's linked energy choices, and hidden-prize identity as held-out until their complete prompt sequences pass.
7. Do not request native games or claim matchup strength until the existing Agent49 V3 fixture-registration and runner gates admit the exact rank-8 policy bundle.

**No deck change, policy competence attestation, native match, matchup result, win-rate estimate, or 99.5% claim is made by this document.**
