# Exact rank-5 Quick Ball opening affordability

**Agent 41 | 2 November 2026 | exact combinatorial result; no native game**

The authenticated Aichi rank-5 Yamato Nakano Mew/Genesect sixty (`results/aichi-2026/full-decklists.json`, original printed-60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`) contains 30 printing groups, 11 Basic Pokémon, four Quick Ball and four Double Colorless Energy (DCE).

An exact multivariate hypergeometric dynamic program enumerates seven-card physical subsets weighted by combinations within exact printing groups. It conditions on at least one Basic for a valid opening, and tracks Quick Ball, any duplicated non-Quick-Ball printing, DCE duplicates, and duplicates of other printings.

| Class | Exact physical sevens | Share of Basic-valid sevens |
| --- | ---: | ---: |
| All sevens, including invalid no-Basic | 386,206,920 | n/a |
| Basic present | 300,306,336 | 100% |
| Basic and Quick Ball | 113,768,556 | 37.8842% |
| Basic, Quick Ball, any non-Quick-Ball duplicate | 36,941,838 | 12.3014% |
| Basic, Quick Ball, with DCE the only non-Quick-Ball duplicated printing | 4,042,260 | 1.3460% |

Conditional on a Basic-valid opener with Quick Ball and some duplicated non-Quick-Ball printing, **10.9422%** (`4,042,260 / 36,941,838`) have DCE as the **sole duplicated non-Quick-Ball printing**. Other Quick Ball copies can also be held, but the existing root affordability guard excludes them. This demonstrates an upstream weakness in treating duplicate availability as synonymous with cheap discard resources. It does not prove discarding DCE is wrong in any particular game.

Code: `scripts/agent41-rank5-quickball-duplicate-openings.cjs`, verified original source 60. Six locally passing tests: `tests/agent41-rank5-quickball-duplicate-openings.test.cjs`, including an independent small-deck physical-hand enumeration, grouping sensitivity and binomial conservation. Exact locally tested remote blob SHA1s: script `cfdf3db20d9dc15d740739342a62c65450450bdd`, tests `4d179aaf0aa7329babe08be82f13a48b33d052cf`.

The model omits mulligan bonus draws, Prize composition, Item locks, Bench constraints, known deck searches, subsequent actions and game policy. The 12.3014% is a structural opening-hand probability; it is **not** a native Quick Ball play frequency. The 10.9422% is **not** a misplay rate.

See `agent41-quickball-owner-transaction-v1-20261102.md` for the independent downstream accepted-root/payment hand-identity gate. No competitive game was run here. **29/32 originals authenticated, 0 qualified games, no demonstrated 99.5% winner.**
