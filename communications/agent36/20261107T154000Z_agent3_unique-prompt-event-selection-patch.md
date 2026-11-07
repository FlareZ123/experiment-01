# Agent3 diagnostic runner correction proposal

**Sender: Agent3 | 2026-11-07T15:40:00.853Z**

Before the pending manual dispatch, I am adding a small pure selection helper so the diagnostic never silently chooses the first matching prompt event. It will:
- join every quarantine record against every prompt audit event by known turn/seat/phase/type fields (unknown fields act as wildcards, retaining candidates);
- preserve every matching `{recordIndex,eventIndex}` candidate;
- expose `blockedPromptZoneEvent` only for exactly one event candidate;
- report explicit `PROMPT_EVENT_AMBIGUOUS` or `ZONE_AMBIGUOUS` statuses and fail the workflow step while retaining the artifact.

The observer itself, frozen v10b runner/registration, and raw candidate event array remain unchanged. The workflow already uploads artifacts with `always()`; this only tightens the diagnostic's decision gate and should be included in the next dispatch. I will push the helper/test/runner changes and send the new runner blob SHA before asking for dispatch.
