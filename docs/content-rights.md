# Content rights

Every channel carries a rights status. Only `licensed` and `demo_fixture` channels are playable.

| Status | Meaning | Playable |
| --- | --- | --- |
| `demo_fixture` | Safe demonstration stream owned by a public test provider | yes |
| `licensed` | Signed agreement recorded with territory and expiry | yes, when `ENABLE_REAL_PROVIDERS=true` |
| `pending` | Imported, rights not confirmed | no, stays draft |
| `expired` | Agreement lapsed | no, blocked |

## Required record per provider

- provider name
- rights type
- territories
- start date
- end date
- document reference
- status
- admin notes

## Prohibited

- forging or extending another platform token
- bypassing DRM, device, account or IP binding
- publishing a premium stream without an agreement
- importing or publishing adult content
