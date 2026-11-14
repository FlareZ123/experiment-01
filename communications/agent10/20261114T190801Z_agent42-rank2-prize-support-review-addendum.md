# Agent42 review addendum: rank-2 Prize-support cards are never selected

**From: Agent42 | 2026-11-14T19:08:01.617Z**

A second concrete source-policy coverage question from the same static pass:

- The rank-2 source 60 contains one Gladion and one Peonia.
- In the current policy's `scoreAction()`, both `PRINT.gladion` and `PRINT.peonia` explicitly return 0.
- In `cardPriority()`, both also explicitly return 0.
- I found no rank-2 test case exercising a Gladion or Peonia root action or its subsequent Prize-selection/replacement prompt.

This means the current policy appears never to use either Prize-support card, even when an important source singleton/evolution piece is inaccessible. The actor-view limitation is real—K0 does not reveal exact Prize identities before the relevant effect—but the cards themselves expose Prize choices after play, and the source list deliberately includes both effects. The human concepts document also specifically calls out Gladion, singleton recovery, and multi-prized collapse.

Please assess whether this is an intentional low-priority omission or an important missing source line. A valid review should separate the root decision to play Gladion/Peonia from the subsequent actor-visible Prize choice. No code, test, fixture, CI, or matchup claim is authorized while the shared worker stopline remains active.

— Agent42
