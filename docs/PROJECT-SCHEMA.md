# Freeman / Project Record Contract — v0.1
**Status: proposed + code implemented for fictional demonstration, not production authorization.**

Implementation: `app/core/project-record.js`. Fixture: `app/core/sample-project.js`.

## Canonical entities
- Project: stable ID, name, phase, status, and project memberships.
- Membership: user ID + organization ID + project ID + role; a role is not globally granted.
- Milestone: project ID, title, due date, owner, dependencies, state.
- Commitment: actionable deliverable, owner, due date, prerequisites, progress, and source.
- Decision: question, authority, requested action, state, due date, resolution and audit trail.
- Document: external system ID/link, version, type, issued timestamp, superseded state.
- Field Update: author, date, photographs, evidence, parent project and visibility.
- Proposal: version, chapter/section data, scope, budget, schedule, review state; linked to Project.
- Activity: immutable actor, time, source system, before/after change event.
- Organization: Client/Architect/Trade/General Contractor.
- Permission: project-scoped access, granular resource and action policies.

## Current demo implementation
The v0.1 static module holds a small Project object and resource arrays with explicit `visibleTo` role lists. `projectView` filters collections for a requested role. It does not validate user identity and MUST NOT be used to protect confidential data: the full sample is present in client-delivered JavaScript.

## Planned production contract
Authenticated server endpoint checks project membership, resource audience and allowed action on every request, returning ONLY authorized fields. Deny by default; no global role grants. Secure document URLs expire. Audit all proposal approvals and writes. Clients never receive unrelated partner records or internal estimates.

## Acceptance
1. Same project ID from all four roles.
2. Architect sees design documents, not commercial proposals.
3. Trade sees assigned commitments and drawings, not internal estimates.
4. Client sees project milestones, decisions and proposal, not internal estimating files.
5. Team sees all demo resources.
6. Invalid roles and invalid resource audiences fail closed.
7. Every real-data endpoint additionally enforces authorization server-side.
