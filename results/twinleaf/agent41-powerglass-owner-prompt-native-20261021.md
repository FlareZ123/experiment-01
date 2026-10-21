# Owner-safe Powerglass prompt: genuine pinned Store both-seat native contract

**Agent 41 | 21 October 2026 UTC.** A testable research-side owner decision for the Powerglass optional Basic Energy attachment. The scope is mechanical prompt execution, **not** a qualified game result.

## Gap and printed/native definition

The original source-first rank-11 New Moon game had an owned Mewtwo & Mew-GX UNM without Energy at global T42, a Powerglass SFA held, Basic Psychic in its discard, and Gengar & Mimikyu-GX TEU accessible as donor. Agent 30 subsequently confirmed genuine staged Powerglass equip → Pass → optional attach. His separately registered original Store historical pair has also advanced beyond that stage to actual copied GX attack declarations; see his branch `agent30-powerglass-sourcefirst-pair-20261021` and its own qualification boundaries. Thus the narrow existing **prompt-legality** question must not be conflated with a claim that generic fallback always chooses an empty option.

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, the source `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/power-hourglass.ts` creates an `AttachEnergyPrompt` on `EndTurnEffect` whose actual signature is:
- owner perspective and `playerId`;
- source: that player's discard `CardList`;
- message `GameMessage.ATTACH_ENERGY_TO_ACTIVE`;
- `playerType=PlayerType.BOTTOM_PLAYER` and **only** `[SlotType.ACTIVE]`;
- filter `{superType:SuperType.ENERGY,energyType:EnergyType.BASIC}`;
- options `{allowCancel:false,min:0,max:1}`.

Because other effects could use the same public discard, the prototype initially matching only a source-zone and Tool condition was tightened to the exact pinned prompt signature at commit `9d6a550`, with negative tests at `c6551e5`. Unmodeled prompt patterns delegate to the original policy. This protects the original Store from a different card's legal Energy prompt being inadvertently hijacked.

## Independent owner-only decision and adapter

- `simulation/twinleaf/agent41-owner-powerglass-attach-prompt.cjs` exports a pure `ownerPowerglassAttachInput`, `chooseOwnerPowerglassAttach`, and a **default-OFF**, reversible `withOwnerPowerglassAttachPrompt` hook for a genuine Store.
- The decision sees only the detached authenticated actor observation, the owner's **public** discard / filtered prompt offer, and the face-up Active Mewtwo & Mew-GX with its Powerglass Tool. The source card itself remains a physical native Card instance outside the pure decision.
- The prototype picks one eligible physical Basic Psychic, disallows blocked source indices or an excluded Active recipient, constructs native `ResolvePromptAction`, calls the independent strict geometric `assertValidPromptAction`, and records native physical movement and discarded-card removal.
- It delegates all other native prompts and all hypothetical cloned-game decisions without assigning them decision-policy competence. No hidden deck, face-down Prize or opposing hand identities enter the decision.

## Tests and genuine native evidence

**Successful manual CI [39693544316](https://github.com/FlareZ123/experiment-01/actions/runs/39693544316)**, job `canonical-four-arm` completed successfully on research revision `31338d69565014a8b5302b7ab0836778d92b627f`. The following separate steps returned **success**:

1. Existing pure adapter suite including `tests/agent41-owner-powerglass-attach-prompt.test.cjs`; our file's **4 test cases** exercise both physical seats, visible filtering, wrong Tool/zone/message/printed filter, blocked index/target, strict opponent-hidden invariance, physical mock dispatch and original prototype restoration.
2. Previously independent genuine staged Powerglass-after-Pass native receipt.
3. **New** `simulation/twinleaf/agent41-powerglass-owner-native-contract.cjs`, a real compiled pinned Store test with **two physical seat cases**, each performing genuine `PlayCardAction` to equip Powerglass, `PassTurnAction` to trigger its own native prompt, owner-decision projection, exact Basic Psychic selection, strict `ResolvePromptAction` geometry validation, and successful native physical attachment.
4. Original unchanged four-arm retrospective native development control.

The genuine test includes both `Double Colorless Energy SUM` and `Psychic Energy MEE` in the owner's public discard. It asserts that the owner-only policy sees the Special but marks it ineligible; the exact Basic Psychic native card is removed from discard and attached to Mewtwo, while the Special stays in discard. Neither opposing Active nor its Energy receives the selected card. Both owner seats pass. No upstream Twinleaf code, deck list or automated push-run trigger was modified.

**Limits:** The genuine native test directly calls the two pure prompt stages and dispatches a real Store action. The reversible SimpleTacticsAi hook itself has mock lifecycle tests, but its full native `withOwnerPowerglassAttachPrompt` integration into the canonical full-game composition is **not** currently enabled or independently tested. Owner prompt selection in Agent 30's separate actual source game uses its own baseline resolver. Our native stage therefore establishes a compatible manual decision/dispatch seam, not a demonstrated improvement over the generic bot, a full paid copied-attack follow-up, a paper-clock win, or an estimated win rate.

## Follow-up gate

Before integrating this additional hook, compare it only against a verified **source-game prompt where generic fallback actually chooses empty or an invalid Special Energy**. If the existing baseline attaches a legal Basic, a second overriding hook adds complexity without observed benefit. Preserve genuine source-owner action, opponent response, print-specific GX restrictions, attack settlement, censors, exact source deal and every run's revision. Stronger rank-11 source policies already overturn some retrospective candidate wins, so source-policy competence is the immediate broader priority.

**Field status unchanged:** 29/32 exact Aichi Top32 opposing source 60s, zero competitively qualified games and no 99.5% decklist proven.
