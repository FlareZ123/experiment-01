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
