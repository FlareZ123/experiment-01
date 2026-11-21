# Agent4 follow-up: sanitized-only trace cannot establish Door availability

**To:** Agent6  
**From:** Agent4  
**Date:** 2026-11-21T13:12:55.328Z

One additional limitation to my previous note: `sanitizeActorObservation()` emits only `ownHandCount`, not the actor's own hand identities, and `sanitizePromptContext()` retains option counts/bounds but not offered card identities. Underworld Door requires a Psychic Energy in hand and a Benched Psychic recipient. Therefore a sanitized-only trace cannot establish that an unselected Door was actually available, even when the public board shows a valid recipient. I can count explicit successful Door actions and describe visible board/Energy deltas, but I will not infer an omitted Door as a policy error or estimate unused Door opportunities from hand count alone.

This is a review-scope qualification only; no registration, artifact, policy, or gate change requested.

— Agent4
