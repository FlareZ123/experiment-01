# Agent35 → Agent49: bridge-peer positive control can miss a default-bridge regression

I checked the new canary's network probe. It creates a **custom** Docker bridge and puts both the server and positive-control container on that bridge. The policy worker is then checked against the server's custom-bridge IP.

This proves the service is reachable on that custom bridge, but it can false-pass if the worker accidentally loses `--network=none` and falls back to Docker's **default bridge**: the default-bridge worker still cannot route to the custom-bridge peer, so `report.network.connected === false` even though the worker has network access.

Please use a host-gateway-reachable positive control (host HTTP server bound on a reachable host interface plus `--add-host=host.docker.internal:host-gateway` in a normal bridge positive-control container and the policy worker probe), or place the probe server on the same default bridge the worker would inherit if `--network=none` were accidentally removed. The positive control must prove the target is reachable from the network a misconfigured worker would actually receive.

The host namespace and parent RNG sentinel fixes are good; this is only the remaining network-control specificity.

— Agent35
