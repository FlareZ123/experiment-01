# Agent 11: reusable owner-only Basic and Energy Item tutor arbitration, pure prototype (3 November 2026)

**Status:** 10/10 local Node 22 pure tests passed; exact new source and tests are committed on `main`, and Git blob byte identities were independently checked. **No native Store dispatch, search prompt, paid action, complete game or competitively qualified win is established by this result.** This is an unselected developmental policy component.

## Motivation and registered source

The selected shared actor returns Pass when no implemented root plan is found. Agent5's read-only real Store census and Agent29's bilateral A/B/A replay demonstrate genuine held-Trainer Pass frontiers. Those are decision-opportunity observations, rather than evidence each held card is payable or preferred. The 3 November Critic direction asks for candidate selection across competing Trainer categories and channels. This study supplies one narrowly defined, reusable, K0 conservative example.

The exact **original Aichi rank-11 Absol/Garbodor 60** from `results/aichi-2026/full-decklists.json` is the test roster: four Battle VIP Pass FST, four Professor's Letter BKT, eight Darkness Energy MEE, eleven Basic Pokémon (three Mega Absol ex, two Trubbish, two Oranguru V, one each Latias ex, Tapu Lele-GX, Crobat V and Squawkabilly ex), with the remaining 33 physical cards unchanged. Roster identity and exact target printing classes are explicit test fixtures, not a physical deck read by the decision algorithm.

## Model

Implementation: [owner resource tutor planner](../../simulation/twinleaf/agent11-owner-resource-tutor-planner.cjs).
Pure tests: [ten test cases](../../tests/agent11-owner-resource-tutor-planner.test.cjs).

For an acting owner root and registered exact 60, let `R` be the registered physical copy count of a target type (Basic Pokémon or Basic Energy), `V` the owner's observed copy count in own hand, public field (including evolution stacks/attachments), discard, Lost Zone and resolving Supporter, and `P` the number of face-down unknown Prize cards. If visible per-print counts reconcile with the registered 60, the K0 guarantee is:

`minimumInDeck = max(0, R - V - P)`.

This is a **conservative lower bound** under ordinary ownership conservation, not a prediction of hidden Prize identities. It assumes no own cards have entered an opponent's concealed zones or another unmodeled zone. Only the owner-private hand, public zones and exact own pre-registered roster are read. The opponent's concealed contents are excluded.

The planner considers held **Battle VIP Pass FST**, **Professor's Letter BKT**, and two registered **Energy Search** printings. It retains separate physical hand indices. It explicitly records competing opportunities and rejections for Item lock, missing deck/Bench capacity, first-turn VIP window, absence of K0-guaranteed targets, the already-used Energy attachment, an Energy already held, and a stronger existing non-Pass intent. It never preempts a non-Pass actor action. Where both tutor families survive, the finite VIP window is preferred, followed by target capacity and physical hand order. These are **deterministic provisional heuristics**, not validated optimality claims. A proposed Tutor root consumes an Item and can displace alternatives: those opportunity costs remain to be modeled.

For the rank-11 sample where one Mega Absol ex is Active, a Letter is held, no Basic Energy is held and no other Basic/Energy is public, with six unknown Prizes: 11 registered Basics minus one visible minus six potentially Prized leaves a lower bound of **4 Basics**; eight registered Darkness Energy minus zero visible minus six potentially Prized leaves **2 Darkness Energy**. The planner proposes the held Letter only if the prior actor would Pass and a normal manual attachment is still available. A first-turn held VIP in that same geometry is prioritized over Letter, while VIP is excluded after the eligible turn window. This is an opportunity computation without a guarantee that a real native card action would settle correctly.

## Reproduction, tests and limitations

`node --test tests/agent11-owner-resource-tutor-planner.test.cjs` passed 10/10 locally on Node 22. Exact Git blob identities: source `f8fdafb35fd7e2bf009f3c8b4e0dbe72384b746d`, tests `230020e287def05e6b9c23d48388ffd72d9c4172`; these matched remote GitHub file blobs.

Tests cover complete unchanged rank-11 roster count, both K0 bounds, held Letter proposal, competing first-turn VIP, preservation of attacks/other incumbent actions, lock/Bench/deck vetoes, Energy attachment contention, conservative six-Prize uncertainty, impossible visible printing count, per-physical-copy hand indices and deliberate failure if opponent concealed zones are accessed.

**Next test gate:** Wire this pure decision layer as a default-off reversible native adapter, under a bilateral symmetric selected experimental policy; prove real Store owner-root typed PlayCardAction acceptance, private owner deck-search prompt target selection, complete deck-to-hand physical card movement, native paper-valid effect and no hidden-information leakage; then prove an opponent reply and compare full same-deal control/selected traces including regressions and caps. Use exact registered 60s and both physical seats. Do not regard native `canPlay` or an enumerated action as paper legality.

## Competitive boundary

29/32 original opposing sixties are authenticated; ranks 23, 25, 28 remain without verified original sixty. No fixed contender is selected, no paper-clock-qualified games exist, and no 99.5% win rate is demonstrated. The present result changes only reusable planning capability and its pure tests.
## First pinned native A/B result: 3 November 2026, 12:06 UTC

The first bounded **pre-registered** genuine pinned-Twinleaf development run [GitHub Actions 41632331095](https://github.com/FlareZ123/experiment-01/actions/runs/41632331095) completed successfully as a CI job at commit `1af7b5cde5b78be65d12e60ddb9482d9e9328521`. Its [complete eight-arm result artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41632331095/artifacts/13228628077) was uploaded; artifact SHA256 is `e89196712582daf3078ed3b5e68e0f46aced21c78deb0caab33d69872ca22eb2`. The CI gate also passed the 18 source-level and native-like fixture tests against the committed tree.

The **real-native development result was negative**: eight attempted arms (four paired original-rank5/original-rank11 original-sixty conditions); **0 native Tutor Item acceptances**, **0 physically settled Tutor targets**, **0 native terminal games**. Six arms ended at the 90-action cap. Both control and treatment arms of the seed `11312031`, with rank 5 in seat 1, aborted at native `NO_BENCH_SLOTS_AVAILABLE` during an AttackAction, respectively after 58 and 49 actions. Initial full physical-deal parity was independently attested in **3 of 4 pairs**; the fourth lacks complete root fingerprints due to those two aborts. The differing action counts on this failed pair require investigation and should not be interpreted as a successful intervention or a stable no-interference demonstration. No competitive win estimate follows from this pilot.

The paired evidence points to an **unreached** planning frontier in these small fixed seeds rather than an established gameplay benefit. The exact selected bridge still requires a genuine native PlayCardAction and owner-authorized settled prompt witness. Follow-up should report planner opportunities, proposals, typed printings in both 60s and acting-owner Pass contexts before increasing the number of whole games. No result above changes the missing-three-field or final-deck status.

## Exact native printing defect discovered and repaired at 12:11 UTC

The initial v1 bridge and fixture used the human-display spelling `Professor's Letter BKT` as a native `fullName`. Inspection of the **actual pinned upstream reducer** [Breakthrough other-prints](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-breakthrough/other-prints.ts) establishes that BKT #146 is represented as **`Professors Letter BKT`** (without apostrophe), implemented by extending the XY `ProfessorsLetter` reducer. Both source-print identity and native exact ID must be preserved as separate fields. The original opponent sixty is unchanged; this is an integration identifier correction.

The prototype's 18 tests initially passed because their fake exact-printing roster repeated the same incorrect native string. Thus those tests could not detect the missing real native candidate, even though they validated internal code behavior. **This is an important test-fidelity failure.** The real-native v1 zero-accepted count is not evidence against resource tutors until the exact fullName mismatch is corrected. Replaced the erroneous BKT identifier in the pure proposer and both tests; 18/18 tests pass again locally. The unchanged first v1 native pilot and its signed outputs remain archived as negative integration evidence.

A fresh immutable [v2 registration](registrations/agent11-owner-resource-tutor-bilateral-v2.json) fixes eight new independent seed values and both physical rank5/rank11 orientations, producing 32 paired development arms. Its runner includes an explicit gate that `planAichi(5)` resolves **exactly four** pinned `Professors Letter BKT` and four `Battle VIP Pass FST` in original rank11, to prevent silent no-op tests caused by printing IDs again. The updated runner prints real actor Pass counts, held tutor opportunities, native Item proposals, native acceptances, search prompts and actual physical target movement separately.
