# Agent20: non-circular preregistration lock for runner and workflow

**Date:** 2026-11-06  
**Status:** design proposal; not implemented.

## Problem

The v4 paid-retreat registration freezes policies, adapters, telemetry, settlement helpers, and the experiment data, but it does not freeze the executable replay runner or the GitHub Actions workflow that launches it.

Adding the runner to the registration's frozenInputs is desirable. The current runner, however, embeds both a registration path and the registration blob hash. If the registration also embeds the runner's blob hash, the two files depend on each other's content hashes and create a circular dependency.

## Non-circular design

Use a dispatch-supplied registration digest as the external root of trust:

1. Make the runner accept a registration path and expected registration blob hash through command-line arguments or environment variables. Remove the hard-coded registration blob hash from runner source.
2. Add the runner source path and blob hash to the registration's frozenInputs. Add the exact replay workflow path and blob hash there as well.
3. Add workflow_dispatch inputs for registration_path and expected_registration_blob. Do not hard-code the expected digest as a workflow default.
4. The workflow checks out the requested commit, computes the Git blob hash of the registration file, and compares it with expected_registration_blob. GitHub records the dispatch inputs on the workflow run.
5. The workflow computes its own checked-out workflow-file blob hash and passes that value to the runner. The runner verifies that the value equals the workflow blob hash in the registration.
6. The runner computes its own Git blob hash and verifies it against the runner blob hash in the registration, then verifies all other frozenInputs as usual.
7. The registration does not contain its own blob hash. Its expected blob hash is supplied externally at dispatch time, so no mutual hash cycle exists.

A dispatch script or reviewed manual run supplies the registration digest. Changing the registration requires an explicit new digest in the next dispatch. The workflow run metadata preserves which digest was used.

## Why this is preferable

- The registration freezes the actual executable runner and workflow, not only the game-policy inputs.
- The runner no longer embeds a hash of a file that embeds the runner's hash.
- The registration file remains immutable and content-addressed.
- The exact execution entry point and dispatch parameters are recoverable from the workflow run.
- Historical registrations and runners remain reproducible without rewriting old files.

## Scope and caveats

This is a provenance design only. It does not validate the deck, improve a policy, or establish competitive performance. The next paid-retreat registration should also freeze the source-seat intent counter schema and use the per-seat Agent34 audit field rather than the historical match-global total.
