# Original rank-11 vs New Moon: first candidate Pass, Lillie eight-card Energy opportunity

**Agent 43 | 7 November 2026 | archived-source-locked mathematical screen, not a game counterfactual.** The material decision is the first candidate Pass at native root **93**, global turn **14**, in the already exposed original rank11 vs New Moon Lockbreaker v1 historical fixed-60 trial. This report independently audits the physical owner-hand/public-board observation and quantifies one possible **resource access** outcome if a valid Lillie's Determination were played instead. The same-deal native treatment is being investigated separately by Agent7, and no causal improvement or winner change is asserted here.

## Native custody, fixed trial, reproducibility

- [Real v9 full native archive, run 42332015390](https://github.com/FlareZ123/experiment-01/actions/runs/42332015390), artifact **13558301530**, archived JSON `issue25-common-v9.json`, SHA256 `ad78b652d48015329109ac333f4401b1e44458b8b8f66d79a6d24d9c839c676f`. Original source rank11 and New Moon v1 were frozen, unchanged. Registered trial `11:1000:B:new-moon-lockbreaker-v1`, physical source seat0 and candidate seat1, physical seed `626469135`. The full-deal SHA is `94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7`, and source-deal SHA is `a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317`.
- Archived 209 accepted Store-root ledger SHA256 `696c0f66624c5ee51026f0d006ce80e8ca9e48dcc435c338f5b6617231d75176`. It recorded a **native-terminal source win, Prize [0,5]**, under a weak, unqualified opposing policy. That winner is **not** a paper-competitive result.
- At root93, candidate owner hand has 10 physical cards: Battle VIP Pass FST ×2, Secret Box TWM ×1, Rescue Carrier EVS ×2, Powerglass SFA ×1, Lillie's Determination M1L ×2, Forest Seal Stone SIT ×1, Mysterious Treasure FLI ×1. Its Active Unown AOR and four Benched Pokémon have zero Energy attached. The source Active is Trubbish FST. The source took a Prize at attack root86, but the candidate still has **six** Prizes. The acting candidate has played no Supporter on this turn. Global lock and payment eligibility have not independently been paper-certified.
- The [unchanged New Moon English mechanics proxy](../als/new-moon-lockbreak-english-proxy-60.json) has six Energy, three Basic Psychic and three Telepathic Psychic. The candidate played two Basic Psychic at roots25/38; both were on a subsequently Knocked Out Unown. Prior owner roots show one played Fog Crystal at root19, as well as Duskull, Trevenant & Dusknoir, and Mewtwo in play. At root93, the public zone census implies six Prize, ten hand, five board, four discard, **35 deck** cards, with **four Energy** still distributed across the deck and unknown candidate Prize cards. Neither opponent hidden hand contents nor actual Prize Energy identities were read.

## Exact conditional draw calculation

If a Lillie's Determination is legal and resolves as printed on this turn, the remaining nine hand cards are shuffled into 35 deck cards, yielding a 44-card randomized deck before drawing **eight** because the owner has exactly six Prizes. The four Energy absent from hand/board/discard may reside in the deck or Prize cards. Conditional on `p` of the four being Prized:

`P(>=1 Energy in draw8 | p) = 1 - C(44-(4-p),8)/C(44,8)`.

| Energy Prized (`p`) | Energy in deck | Conditional eight-card Energy hit |
|---:|---:|---:|
| 0 | 4 | **56.60805445%** |
| 1 | 3 | **46.08879493%** |
| 2 | 2 | **33.40380550%** |
| 3 | 1 | **18.18181818%** |
| 4 | 0 | **0%** |

Under an **extra hypothetical** assumption that these four Energy occupy uniformly exchangeable places among the 35 deck and six Prize positions, the marginal hit probability is **50.20994317%**. This is not the probability for the actual fixed physical deal. A skilled player who searched their deck earlier may know its Prize composition (K1), while this public archived receipt does not preserve that owner-private information. The conditional rows are the robust output.

## Strategic interpretation and scope

A candidate *Pass* facing available Lillie is a plausible owner-policy omission, particularly because its board was unpowered and it had two unusable late Battle VIP Pass cards. But even a successful one-card Energy draw may produce only an Energy attachment, without immediately powering any multi-Energy attacker. Shuffling other owner-held resources, notably Secret Box and Forest Seal Stone, also has an opportunity cost. Secret Box itself requires **three other physically disposable hand cards**; its theoretical Item/Supporter connectivity cannot establish an affordable superior line without comparing the sacrificed cards and connector competition. These are AMR/DCI and tactical sequencing questions, not mathematical consequences of the Energy screen.

This is a **retrospective opportunity analysis**. We did **not** execute an alternate Lillie root, verify Store's full draw/shuffle payment, establish whether the candidate's next meaningful attack improves, or validate the opponent's next response. The underlying 209-root native match fails bilateral policy/clock/paper qualification. **Zero competitive games qualify; no winner flip, win-rate change or optimized fixed 60 is claimed.**

## Reproduction

- [Source-locked CJS calculator and original archive validator](../../simulation/evaluation/agent43-v9-root93-energy-screen.cjs)
- [Five pure/optional native-archive regression cases](../../tests/agent43-v9-root93-energy-screen.test.cjs). Local Node22 test run with the independently downloaded **real** archive: **5/5 pass**. Four pure tests pass without the optional archive input; the fifth is skipped if `AGENT43_ROOT93_ARCHIVE` is unset. No GitHub CI success is claimed for this new test.
- [Agent8 prior owner-held Pass audit](agent8-independent-agent36-v9-native-terminal-bilateral-weakness-audit-20261107.md) independently enumerates the held Trainers. [Agent7 separate bilateral Lillie wrapper](../../simulation/evaluation/agent7-v9-bilateral-lillie-pass-retro.cjs) is the already active native-replay route. This report should inform its **exact first-root payment and source-reply analysis**, avoiding duplicate rank-specific policy development.

**Project status:** original 29/32 named 60 inventories authenticated, ranks23/25/28 missing, no selected fixed 60, no demonstrated 99.5%.


## 7 November addendum: actual Lillie treatment missed Energy in its eight-card refresh

While this conditional screen was being prepared, Agent7's **separate** both-seat owner-only Lillie policy ran on the exact already-exposed source deal. Agent35 independently audited the treatment against the same baseline in [his full paired report](agent35-v9-lillie-pair-pass-regret-20261107.md). I subsequently downloaded both raw archives and added a stricter, read-only companion observation to the source calculator, with a sixth archive-optional test.

**Treatment evidence:** [CI 42333343834](https://github.com/FlareZ123/experiment-01/actions/runs/42333343834), artifact **13558074462**, ZIP SHA256 `cb92cf1cc592ad2e4b2324de35469308c974c5653da5bd56b8fa68f460ddea5a`, JSON SHA256 `7c9c95e37cf9c466d87e053f8ed481844d7acdbc54a619415e8a9d8ab8e5d659`, treatment public ledger SHA256 `a3c7bcba914a233f7ae99831a8e0bca135a819524004cbe7d965cbd874efdc16`. The **first 93 complete accepted Store-root objects are equal** between baseline and treatment. At ordinal93 treatment physically played Lillie instead of baseline Pass, root95 resolved the native ShuffleDeckPrompt, root97 Benched **Squawkabilly ex**, and root98 was a Pass with **seven held cards and zero Energy among them**; all six owner Active/Benched Pokémon also held zero Energy.

Only one card-root after Lillie was the Squawkabilly Bench play, with no other hand-discard/energy-attachment roots before Pass. The seven held non-Energy after the Bench play, together with the printed eight-card refresh, support the conclusion that **this actual eight-card Lillie draw found zero Energy**. The recorded post-play owner hand and board are the evidence. **Full individual physical object transfer is still not independently attested.** This outcome fits every conditional row in the table, with the miss probability depending on how many Energy were actually Prized. One selected draw cannot be used to estimate success frequency.

The subsequent treatment **never attacked again after ordinal93** and ended a **186-root native source victory, Prize [0,6]**; the baseline ended a **209-root native source victory, Prize [0,5]**. These are distinct post-Lillie future shuffles in an exposed deal, with weak opponent policies and unqualified official clock. The result shows that a successful owner Supporter play can fail to produce immediate Energy access and downstream attack conversion. It provides no valid claim that Lillie is a harmful or beneficial card slot. Agent35 additionally identifies later held Escape Rope/Secret Box Pass opportunities, which now deserve a funded-attack-and-opponent-reply test.

The updated [same-source validator](../../simulation/evaluation/agent43-v9-root93-energy-screen.cjs) requires the full-deal hashes, both public root-ledger hashes, predecision **93-root equality**, exact roots93–98, and zero Energy at root98. **Six Node22 local tests passed with both original downloaded artifacts**, with raw SHA verified. The newer sixth test is skipped when its two optional archive environment variables are absent. No new CI qualification, prospective game, or win-rate evidence arises here.
