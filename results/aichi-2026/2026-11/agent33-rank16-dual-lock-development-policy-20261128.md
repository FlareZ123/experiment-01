# Original Aichi rank 16: source-exact dual-lock opponent policy — executable development

**Agent33 · 28 November 2026 · Branch `agent33/rank16-dual-lock-policy-20261128` · [draft PR #103](https://github.com/FlareZ123/experiment-01/pull/103)**

## Decision this work advances

The single fixed-60 candidate must eventually beat **every** Aichi Top32 original list, including rank16 Absol/Garbodor/Budew. Earlier source work identified rank16's genuine simultaneous lock: a Pokémon Tool-equipped Psychic Garbodor's **Garbotoxin**, then Budew ASC16's **Itchy Pollen** from the Active Spot. The available opponent-panel v2 manifest lacked a rank-specific executable rank16 worker; this branch supplies one while preserving the original source list unchanged. This improves a potentially adversarial opponent, **not** the candidate deck itself or any measured matchup.

## Original 60 and game-text anchors

`results/aichi-2026/full-decklists.json` source `rank=16` is a 29-printing, 60-card original inventory; the worker's `SOURCE_INVENTORY` was compared programmatically against every printing/count, **29/29 exact and sum 60** (original Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`). Highlights:

| Source printing | Source count | Relevant interaction |
|---|---:|---|
| Mega Absol ex MEG 86 | 2 | **Terminal Period** Knocks Out if the opposing Active has **exactly 6 damage counters = 60 damage**, not 300; **Claw of Darkness** deals 200 damage and discards a revealed opposing hand card |
| Trubbish CRI 56 | 2 | **Acid Spray** deals 10 and on heads discards an opposing Active Energy |
| Garbodor LTR 68; Garbodor BKP 57 | 2; 1 | Both have **Garbotoxin**, live when equipped with a Pokémon Tool unless suppressed |
| Budew ASC 16 | 2 | **Itchy Pollen** is a zero-Energy 10-damage attack imposing next-turn Item-from-hand lock |
| Crobat V DAA 104; Dedenne-GX UNB 57; Tapu Lele-GX GRI 60; Squawkabilly ex PAL 169 | 2; 1; 1; 1 | Relevant own draw/search Abilities; Crobat/Dedenne/Tapu Lele are **play-to-Bench triggers**, not independent root `use-ability` actions |
| Float Stone BKT 137; Forest Seal Stone SIT 156; Muscle Band XY 121 | 4; 1; 1 | Garbotoxin activation through Tools; simultaneous Bench slot and mobility costs |
| Plumeria BUS 120; Karen XYP 177; VS Seeker PHF 109 | 1; 1; 3 | Source-specific Supporter and discard-recovery decisions; Plumeria costs **two discards** before one opposing Energy removal |

Card text for Mega Absol (`me1-86`), Garbodor (`bw11-68`, `xy9-57`), Trubbish (`xy9-56`) and Budew (`me2pt5-16`) was inspected directly in the bundled `card-list.zip` card pool. The Advanced Player's Rulebook defines ten-damage damage counters. See also `results/aichi-2026/2026-11/agent17-rank16-budew-garbotoxin-sequencing-20261127.md`.

## Implemented strategic decisions (all contingent on actually offered actor actions)

1. **Setup before self-lock:** prefer a source Crobat/Dedenne/Tapu Lele/Squawk Bench play and/or actually offered useful own Ability before a Garbodor Tool activates Garbotoxin. Do not treat a play-to-Bench trigger as an independent root Ability. After a live Garbotoxin, do not consume scarce Bench capacity on disabled Ability-only Pokémon.
2. **Physical Bench reservation:** preserve room for the missing Budew, Trubbish/Garbodor line and Mega attacker, rather than fill five slots with theoretically useful draw support. Boost Budew deck-search priority as remaining Bench space shrinks.
3. **Double lock as a conditional line:** Tool on source LTR/BKP Garbodor, legal Budew promotion, then Itchy Pollen. A Tool can be present while its Garbotoxin is **not live**, due to Jamming Tower, public Tool suppression, or projected card-specific Ability suppression; do not hallucinate lock uptime.
4. **Attack quality:** Mega Absol Terminal Period requires target at **60 current damage**; reject a conflicting public target/frontier damage report and an unpayable attack, and do not mistake **300** for the threshold. If at 60, an immediate KO outranks an avoidable setup. Trubbish's actual Acid Spray can be a fallback against attached Energy when physically payable; its flip is **not** assumed to succeed.
5. **Source Supporter continuity:** Plumeria root requires two disposable own-hand cards and a public opposing Energy; staged source-specific own-hand two-card choice, powered opponent target and attached Energy choice use opaque host tokens. VS Seeker may recover source Marnie, Plumeria and Karen; the Plumeria/VS dynamic discard value is guarded against recursive re-evaluation.

## Development checks and explicit unproved boundaries

| Evidence | Current outcome | What it **does not** establish |
|---|---|---|
| Exact original 60 printing/count comparison | 29/29 match, 60/60 cards | International paper legality of the original Japanese Extra deck, physical card copy certification |
| `tests/2026-11/agent33-rank16-dual-lock-opponent-policy.test.cjs` | 72 constructed both-seat decisions passed in isolated V8 CommonJS runner as of latest source | Official `node --test`, native action availability, prompt settlement |
| `tests/2026-11/agent33-rank16-strict-worker-protocol.test.cjs` | 25 strict constructed actor projection/decision cases passed in isolated V8 runner invoking **actual current Agent49 protocol validators** before later source corrections | Actual Node IPC, sandbox initialization, game |
| `tests/2026-11/agent33-rank16-real-worker-ipc.test.cjs` | Syntax checked; committed both-seat genuine restricted Agent49 child-worker root→Tool prompt harness | **Not executed**. Real subprocess response and pinned Twinleaf Store **unverified** |
| Pinned native Twinleaf Store, natural original60 games, per-matchup results | **None** | No policy admission, no opponent competence attestation, no win-rate claim |

Further source-specific policy coverage: Karen against visible Regidrago discard payload (plus a clean-discard negative control), Wobbuffet Psychic exception versus Iron Thorns ex Initialization, native-projector energy zone for Plumeria (`sourceZone='energy'`), Battle Compressor's up-to-three Dark Patch fuel route, and coherent turn-ending order. An initially too-broad "play useful cards before attacks" rule was corrected so a fully functional Budew+Garbodor+Mega board **attacks instead of unnecessarily paying Quick Ball/Ultra Ball/Secret Box discard costs**; the same cards take priority if a genuinely missing core board axis remains. Each policy branch is deliberately contingent on an actual offered action and public-state evidence.

**Important source limit:** Trubbish CRI56 Acid Spray requires Psychic Energy, while this exact original source list's 7 Energy are Darkness and it has no Psychic Energy. Its implemented attack fallback is merely guarded behind a native `attackCostPayable` offer and should normally be absent; **do not infer that it is playable from the deck as built**. Mega Absol's Terminal Period costs Darkness+Colorless (two supplied Darkness can pay); Claw of Darkness costs Darkness+Darkness+Colorless (three).

The strict protocol caught a genuine inherited ABI bug: `ChoosePokemonPrompt` with `selectionType='pokemon'` requires a `select-choices` array even for one Tool recipient; singleton `select-choice` fails `MULTI_SELECT_REQUIRES_SELECT_CHOICES`. Inherited custom abstention codes outside the finite strict codebook also fail. Both were repaired in **this fork only** and communicated to Agent44. Separately, the inherited attack scorer's `targetDamage===300` Terminal Period gate was source-inaccurate and replaced with 60.

## Smallest next actual go/no-go

Keep PR#103 draft, unadmitted, out of `results/README.md` canonical coverage. Request independent coordinator/host review for one **exact original rank16 60** pinned native Store: two physical seats, one root with competing legal Tool/Crobat actions → **actual Strict Agent49 worker** → true `ChoosePokemonPrompt` Tool recipient → native Store effect settled. The source printing/collector-number mismatch dependency in candidate PR #94 must be resolved or separately reviewed before claiming source-exact native identity. A real native Plumeria step is a later, separate source-specific continuation. Do **not** preempt higher-priority candidate Underworld Door CI authorization, dispatch V3/Stage-A fixture/game, merge this developmental worker, or describe the synthetic tests as a competitive matchup.

**Benchmark status unchanged:** only 29/32 authenticated source lists, missing 23/25/28, **0/32 qualified Aichi matchups**, no final fixed 60, and no demonstrated 99.5% win rate.
