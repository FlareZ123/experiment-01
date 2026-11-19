# Rank-7 Snorlax Stall opponent policy v1

**Status:** synthetic actor-view prototype only; not a matchup result, not a signed policy bundle, and not a native-playability attestation.

## Exact binding

- Canonical challenge suite SHA-256: 4dca93dc306ea906870964f6f9772771c84f765912e26ed566b1650729b7555e.
- Dependency manifest SHA-256: 7b73724eccec3d79a96befed55382a3002a9a56ea1f896b12784920a7fbb223c.
- Common constraints SHA-256: 9b36f1fee8046676a86e565a1a035f292c33c0da485c9760fb6e39ceb215e93d.

- Opponent: Aichi Open League 2026 rank 7, Hiroto Fuji, Snorlax Stall; exact source list is 60 cards.
- Source list blob SHA-1: ae773f6201d7aa69d31914dbfee66f3fba692200.
- Rank-entry JSON SHA-256: a66fa49dbeaa886c5509ff5edff727577bba5e4c9f4bbe9800b152975f8b4734.
- Fixed candidate: Hood Shield v1; fingerprint 1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4.
- Twinleaf: vendor/twinleaf, https://github.com/twinleafgg/twinleafgg.git, pinned a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Decision protocol: Agent49 policy worker blob d51ea95c457d61b50a9ee114d342eb17f4350451.

## Policy focus

The high-specificity line is Faba -> Jet Energy -> Active Wobbuffet -> Nest Ball. The policy only proposes it when the actor-visible state contains exactly one Hood-protected Vileplume target, the required Faba/Jet/Nest cards, a source Wobbuffet and open Bench space, an available Supporter and Energy attachment, and no public Power of Alchemy counter-lock. It selects the Tool branch, targets the exact visible Vileplume, promotes Wobbuffet only after all public Vileplume Hoods are gone, and searches a source Basic only after the Item lock is cleared.

Other bounded priorities cover Snorlax/Tool Jammer setup, Mimikyu against V/ex attackers, Megaton Blower and Field Blower removal, Girafarig Get Lost against public discard recovery, and a limited set of draw/recovery/switch prompts. They are heuristic action scores, not trained values or an optimized policy.

## Fail-closed boundaries

- Multiple Hood-protected Vileplumes do not get treated as one removable lock.
- Public Alolan Muk with Power of Alchemy blocks the Wobbuffet unlock line.
- Jet promotion is declined while a Hood remains or Temple of Sinnoh blocks the Special Energy line.
- Gladion Prize selection abstains when Prize identities are not owner-visible.
- Palace Book SMP NAN25 is treated as a no-prompt Item: draw three and end the turn. The policy scores it minimally only with hand size <=2, deck count >=4, and the public Item lock cleared; it yields to any higher-scored action/attack. No native effect receipt has been collected for this policy.
- Unknown prompt families and unsupported multi-Pokémon prompts abstain.
- No opponent hand, deck, Prize identity, or other private field is read.

## Validation scope

The test file calls the actual Agent49 validateInit, validateRequest, and validateDecision functions. The focused Actions workflow runs only this test file under Node 22. The cases are synthetic actor-view requests and prompts; they do not execute Twinleaf or settle a real Store prompt. The exact-head workflow run 44551743934 on 9e308a03b830378886d04a469e3b2c5097f7a3a3 passed 39/39 tests (0 failed). The revision adds an explicit Vileplume-derived Item-lock guard, blocks Wobbuffet priority under Power of Alchemy, tests Temple of Sinnoh as a Jet Energy counter, and treats Palace Book as a low-priority draw-three/end-turn action. Earlier intermediate failures were corrected before this passing run.

Existing rank-7 work provides useful but separate context:
- Agent40's staged native tests cover a Faba/Jet/Nest sequence and real owner prompts under prepared conditions.
- Agent33's Artazon/Jet work is a conditioned native test, not a natural-game sample.
- Agent22's stateful Steven study is a separate 18-arm development experiment with zero competitively qualified games.
- Agent17's resource-war report identifies the candidate's Tool-removal pressure.

None of those results validates this policy's decisions, and none is credited as a win-rate observation here.

## Outcome and next experiment

- Policy unit-test coverage: see the versioned challenge suite.
- Native policy games: 0.
- Rank-7 matchup outcomes: not measured.
- Competitively qualified games: 0.
- Estimated win rate: not estimated.
- 99.5% Top 32 target: no evidence of attainment.

Next experiment: adapt the policy through the existing Agent49 worker into the native runner, replay the exact Faba/Jet/Nest owner-prompt chain in both seats, then run preregistered source-dealt complete games against the unchanged candidate. Preserve censored/error outcomes and compare the policy with a lexical control on identical source deals before claiming any strength.
