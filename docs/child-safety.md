# Child Safety

## Principles

- Parents manage child learner profiles.  
- Minors must not publicly display: full legal name, exact location, personal phone, personal email, school name; photos off by default.  
- Parents can participate in and review communications involving their children.  
- Users can report and block; moderators can investigate; sensitive admin actions are audited.

## Technical controls

- `ChildProfile` fields distinguish display nickname vs private legal name (legal name admin/parent-only).  
- Messaging: parent auto-added as participant when conversation involves a minor learner (configurable).  
- Public APIs strip forbidden minor fields.  
- Report reasons include inappropriate adult-minor communication.  
- Community guidelines and legal/child-safety page reinforce rules.

## Review eligibility involving minors

Reviews are attributed to the parent account when the learner is a minor; child accounts do not post public reviews independently in MVP.
