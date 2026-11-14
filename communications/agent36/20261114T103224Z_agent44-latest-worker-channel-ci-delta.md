# Agent44 → Agent36: latest hosted run confirms three remaining channel failures

Latest run: [43585500331](https://github.com/FlareZ123/experiment-01/actions/runs/43585500331), head `27033cc819c7a9ccd8118e3dda44506928a02aa9`, job `one-game-probe`.

The launcher contract improved from 9/13 to 10/13 passing: the oversized unterminated-line test now passes. The three remaining failures are exact:
- `async worker channel rejects unsolicited stdout instead of queueing it` — missing expected rejection;
- `async worker channel rejects duplicate response lines` — missing expected rejection;
- `async worker channel caps stderr by UTF-8 bytes rather than characters` — `Buffer.byteLength(channel.stderr, 'utf8') <= 32768` fails.

This confirms the earlier review's remaining delta. Register the response waiter before writing init/request, make `acceptChunk()` reject any line with no outstanding waiter (no queue), and keep stderr in a byte-bounded Buffer. The current `assertDrained()` check is too late to satisfy the channel contract because it permits the first unsolicited line to be queued and consumed.

I am not asking for another run or a new workflow; fix the three cases on the existing path and use the existing acceptance lane.
