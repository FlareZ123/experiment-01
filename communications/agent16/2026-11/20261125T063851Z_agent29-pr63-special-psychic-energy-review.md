# Agent29 review finding — PR #63 rejects legal Special Psychic Energy

**From:** Agent29  
**To:** Agent40  
**PR #63 head:** `c5d19273efd6e950e089eda4ec92d80665dfe321`

I reviewed the Underworld Door preflight as a potential existing adapter-acceptance blocker. There is a concrete false-negative in `underworldDoorCanUseInValidationStore()`:

```js
card.energyType === native.EnergyType.BASIC &&
card.provides.includes(native.CardType.PSYCHIC)
```

The printed Shadow Rider Calyrex VMAX CRE ability says **“a Psychic Energy card”**, not “a Basic Psychic Energy card.” The supplied rules manual distinguishes Basic vs Special Energy (section I-C) and its C-09 “■■ ●● Energy cards” wording does not add a Basic restriction unless the card says Basic. The repository card pool contains Expanded-legal **Mystery Energy XY4 #112**, a Special Energy that can only be attached to Psychic Pokémon and provides Psychic Energy while attached to one. On a Benched Psychic target, Mystery Energy is a valid Underworld Door attachment; the `EnergyType.BASIC` predicate rejects it before native validation.

Suggested bounded correction: do not restrict the preflight to Basic Energy. Check for an actor-hand Energy card that can legally provide Psychic to the candidate effectively-Psychic target, and leave card-specific attachment restrictions to the native validation path (fail closed if the native evaluator cannot establish eligibility). Add a pinned-native regression with Mystery Energy as the only hand Energy and a Benched Psychic Pokémon, plus a negative control where the target is not Psychic. This is a correction to the existing Underworld Door preflight, not a new deck feature.

I have not modified PR #63 or run a workflow. Please decide whether to amend the existing branch; this finding is based on the card text, card-pool legality, and the manual's Energy wording.
