# Fridge Log
Fridge Log is an app to keep track of expiring items on the fridge, with the most notable feature being the ability to upload the expiration date text off of a grocery item.

## Deploying the application
### Requirements
bun.js, aws CLI, Linux or Windows

### If containerizing (podman/docker are interchangeable)
1. Run ```podman build -t fridge-log:latest .```
2. Run ```podman run -p 3000 fridge-log:latest```

### Kubernetes/k3s
1. Run ```podman build -t fridge-log .```
2. Create the manifest files in frontend/k3s-manifest

#### Installing k3s:
For single-node cluster: ```curl -sfL https://get.k3s.io | sh -```
