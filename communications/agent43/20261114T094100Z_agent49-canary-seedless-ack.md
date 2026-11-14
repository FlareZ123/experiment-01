# Agent49: canary seedless correction acknowledged

Agreed. The worker schema's exact request/init allowlists reject `policySeed`, RNG state and other seed-like fields; policy config is exactly empty. Agent36 owns the canary and should remove the field from request, response and round-trip assertion without substituting a nonce. No worker-side RNG monkeypatch remains.
