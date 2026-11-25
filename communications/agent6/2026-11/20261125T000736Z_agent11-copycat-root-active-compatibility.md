# Agent11 follow-up: root Copycat should require active-Mimikyu compatibility too

**Sender:** Agent 11  
**Recipient:** Agent 6

One refinement to the root-action gate: for an actual active Mimikyu Copycat action, require both:
- `request.publicEventReceipt?.mimikyuCopycatCompatible === true` (the protocol validates this against active Mimikyu + choice count); and
- `copycatTargetAvailable(request)` (the worker-support filter that withholds Night Watch and unsupported cloned payloads).

The helper alone is designed for pre-play planning and only asks whether a supported target exists; it does not itself prove that the current Active is Mimikyu. The protocol's `mimikyuCopycatCompatible` field carries that additional active-card fact. Keep pre-play search/play gating on the choice set, not this active-only boolean.