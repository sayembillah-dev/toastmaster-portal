# Toastmasters Multi-Tenant Domain-Driven Design (DDD) Architecture Specification

This document outlines the Domain-Driven Design (DDD) architectural specification for transforming the existing single-tenant Next.js Toastmasters meeting application into a scalable, multi-tenant system. The architecture isolates bounded contexts, establishes clear domain aggregates, and defines multi-level organizational relationships ranging from individual members to division-level leadership.

## Chapter 1: Strategic Context & Architecture Foundations

### 1.1 Multi-Tenant Domain Boundary Strategy

The system transitions from a single-club application to a multi-tenant platform by scoping domain entities under explicit tenant boundaries. The top-level tenant boundary is defined by the ClubId, ensuring strict data isolation across clubs while enabling cross-context identity sharing.

### 1.2 Identity, Onboarding, and Cross-Club Membership

**Identity**: A member logs into the system using their Email and an individual Password (stored securely as a `passwordHash`). Sessions are established per individual member, enabling customized role-based views.
**Onboarding**: The system enforces a strict top-down, invitation-only hierarchy (Super Admin → Area Director → Club President → Members). There is no open signup to prevent duplicate identities.
**Invitation Delivery & Password Setup**: Initial onboarding utilizes an email-based flow. Members receive a setup link (mocked to the server console initially) containing a secure `resetToken` to establish their individual password.

Organizational Level

Context Boundary Scope

Primary User Capabilities

Super Admin Level

Global System

Full global oversight. Can generate Context-Aware Invites to directly onboard any user (e.g., Area Director, President, or Member) into a specific organizational context.

Club Level

ClubId

Manage local meeting agendas, speech slots, officer roles, local member records, and club support tickets.

Area Level

AreaId (Aggregates multiple ClubIds)

Read-only oversight of club health via an Area Director Dashboard. (Note: The automated monitoring dashboard is explicitly deferred to v2 pending further requirement gathering; v1 provides structural hierarchy only).

Division Level

DivisionId (Under Division PQD)

Deployment and availability management of 12 Elite Division Quality Supporters across affiliated clubs. Also includes administrative capabilities to assign clubs to specific Area Directors and change Area Director assignments.

### 1.3 Annual Presidential Transition Invariants

Leadership rotates annually. The domain enforces the invariant that historical records—including executive meeting minutes, support tickets, financial reports, and DCP milestone tracking—remain immutable and fully accessible to incoming officers upon term transition.

## Chapter 2: President Bounded Context (Executive Oversight & Club Governance)

### 2.1 Bounded Context Overview

The President Bounded Context governs strategic direction, executive board management, club health monitoring, external relations, and conflict resolution. The President Aggregate Root holds ultimate authority over strategic decisions, executive meeting approvals, and ticket escalations.

### 2.2 Domain Aggregates & Modules

#### 1. Executive Board Aggregate

-   Meeting Minutes & Governance Automation: Captures formal executive board meetings incorporating parliamentary procedures (Motion Creation, Motion Seconding, Objections, Voting, and Final Resolution).
    
-   Officer Assignment & Member Management: Manages term start/end dates, role assignments, and seamless succession handovers. The President has specific capabilities to assign club officer roles and, if necessary, remove members from the club.
    
-   Secretary Module Integration: Automatically converts recorded meeting motions and decisions into published meeting minutes.
    

#### 2. Club Health & DCP Monitoring Aggregate

-   Distinguished Club Program (DCP) Tracking (v2 Scope): Full automation of educational progress, membership thresholds, and administrative goals is deferred to v2.
    
-   Key Performance Metrics (v1 Scope): Tracks meeting attendance consistency, guest retention percentages, and role fulfillment health.
    

#### 3. Internal Affairs & Support Ticket Aggregate

-   **Open Creation via Dashboard**: Any member (or Area Director) can create a ticket from the dashboard against a club to flag challenges, track club health, or manage internal affairs. Tickets carry varying levels of seriousness.
    
-   **Hierarchical & Tag-Scoped Visibility**: Ticket visibility is strictly restricted to the creator and explicitly tagged roles/actors. *Exception:* Division Directors and Area Directors automatically inherit visibility to all tickets within their respective jurisdictions to monitor follow-ups.
    
-   **Collaborative Lifecycle & Mutual Resolution**: Tickets move through Open, Active, and Resolved states. They are not for external escalation, but for collaborative problem-solving. Any tagged party can mutually resolve the ticket via a button press. The system maintains an immutable audit trail of who resolved the ticket and when.
    

#### 4. Area & External Link Aggregate

-   Area Director High-Level Metrics View: Grants read-only visibility to the Area Director for key performance indicators without exposing internal club management controls.
    
-   Bidirectional Communication Channel: Enables Area Directors to post feedback on metrics, allowing the President and Vice President Education (VPE) to respond directly within the platform.
    


## Chapter 3: Vice President Education (VPE) Bounded Context (Meeting & Educational Operations)

### 3.1 Bounded Context Overview

The VPE Bounded Context handles speech scheduling, agenda formulation, meeting role assignments, and member educational progression. The Roster Aggregate Root governs the integrity of individual meeting agendas.

### 3.2 Core Aggregates & Collaborative Workflows

#### 1. Roster & Meeting Planner Aggregate

-   Meeting Event Lifecycle: Manages meeting dates, venue coordinates, themes, and open role slots (Speakers, Evaluators, Toastmaster of the Day, Table Topics Master, General Evaluator, Functionaries).
    
-   Dynamic Agenda Propagation: As role assignments are confirmed, the system auto-generates printable and shareable meeting agendas.
    
-   Role-Keyed Attendance: To prevent headcount duplication, attendance is manually recorded by a designated officer (VPE or Secretary) during the meeting, directly mapping the member to their specific role for that session.
    

#### 3. Meeting Evaluation & Awards Module

-   **Selective Live Voting**: The VPE or President explicitly activates real-time voting during a live meeting. Officers can choose to enable voting for all modules (Prepared Speaker, Table Topics, Evaluator, Role Player) simultaneously, or selectively toggle specific modules. Members cast votes, while results are restricted from guest view. Results are automatically tallied and compiled into the meeting summary.
    
-   **Official Evaluation Feedback**: Transitions away from paper forms by natively integrating the standard Toastmasters International evaluation criteria. Evaluators submit targeted feedback through the portal, including:
    - Numerical/Likert scale indicators (e.g., audience engagement, eye contact, vocal variety).
    - Standardized textual blocks: "What you excelled at", "You may want to work on", and "To challenge yourself".
    
-   **Comprehensive Performance Snapshot**: A dedicated `SpeechEvaluation` model links to the `Member`, `Event`, and `PathwayProgress`. This aggregate model stores the evaluator's feedback form, along with the speaker's specific Ah-Counter metrics and Timer data from that exact speech, providing a holistic snapshot for long-term development tracking.
    
-   **Table Topics Evaluation**: Similar feedback and tracking mechanics are extended to Table Topics participants, recording impromptu performance metrics systematically.
    

#### 3. Speaker Progress & Recognition Aggregate

-   Pathways Progress Data Model: Tracks active pathway(s), current level status, and maintains a historical log of completion dates for all levels and individual speeches.
    
-   Automated Level Completion Recognition: A reactive workflow triggered upon level completion that flags the member's profile, generates a digital certificate, and notifies the Executive Committee.
    

#### 2. Slot Reservation & Approval Collaboration Service

Step

Actor

Domain Action & State Change

1. Pinpoint Request

Club Member

Selects specific meeting date, meeting slot, and speech project. State: SlotRequested (Pending).

2. Review & Validation

VPE Software Engine

Checks schedule conflicts, speech pathway prerequisites, and member availability.

3. Final Approval

VP Education

Approves or declines request. On approval, State changes to SlotConfirmed and agenda updates automatically.

## Chapter 4: Vice President Membership (VPM) Bounded Context (Guest Intake & Pipeline)

### 4.1 Bounded Context Overview

The VPM Bounded Context focuses on prospective member growth, guest tracking, onboarding workflows, and member retention analytics. The Prospect Pipeline Aggregate Root encapsulates guest records from initial contact to induction.

### 4.2 Core Aggregates & Cross-Context Integration

#### 1. Prospect & Guest Pipeline Aggregate

-   Guest Intake Tracking: Guests are non-persistent, local entities (no login, no global profile). Their minimal info (name, phone, WhatsApp) is stored purely as a club-local "lead", visible only to the VPM.
    
-   Prospecting Pipeline (Kanban): A dedicated visual board (`/vpm-pipeline`) organizes guests based on their `FollowUpStatus` (New, Contacted, Interested, Not Interested, Joined). This allows the VPM to easily manage leads via drag-and-drop or status updates.
    
-   Automated Follow-Up Workflows: Tracks communication logs, invitation statuses, and application progress. Guests interact with the platform entirely via lightweight, invitation-based quick links (meeting invite, form fill).
    
-   Member Conversion Service: Converts a guest lead into an active Club Member entity upon fee payment and executive approval.
    

#### 2. Guest Participation Collaboration (VPM & VPE Cross-Context)

-   Guest Meeting Participation: VPM requests temporary meeting slots (e.g., Table Topics participant, minor functionary roles) from VPE to encourage guest engagement before formal induction.
    

  

#### 3. Retention & Finance Sync Service Dashboard

-   Dedicated Dashboard (`/retention-finance`): A unified view accessible by the VP Membership, Treasurer, and President that aggregates cross-domain health metrics.
    
-   Retention POV: Monitoring attendance and meeting participation metrics to identify and alert leadership about at-risk members (e.g., active `RetentionAlert`s).
    
-   Finance POV (Treasurer Sync): Interfacing with the Treasurer domain to display recent transaction summaries, pending dues, and automatically suspend or activate member profiles based on dues payments.
    

  

## Chapter 5: Secretary Bounded Context (Official Records & Governance)

### 5.1 Bounded Context Overview
The Secretary Bounded Context manages the club's official records, meeting minutes, and document archives.

### 5.2 Versioning Strategy
- **v1 Scope (MVP)**: No active features for the Secretary are implemented. The bounded context and database relationships (e.g., `MeetingMinutes` references to `Event`) are reserved in the architecture to ensure seamless future integration.
- **v2 Scope**: Implementation of formal Executive Committee meetings (motions, voting, parliamentary procedures), automated minutes publishing, and a centralized document repository.

## Chapter 6: Additional Supporting Domains

To achieve a comprehensive Domain-Driven Design architecture, the following domains have been formalized to support the core contexts:

### 6.1 Identity, Authentication & Role-Based Navigation
- **Multi-Tenant Identity Architecture**: The system utilizes separate `Member` records for each club context, linked relationally across the platform. Members authenticate via individual Email and Password (`passwordHash`), producing a JWT session that encodes their `memberId` and `clubRole`.
- **Role-Based Left Navigation**: The application navigation dynamically adapts to the authenticated session's role:
    - **Standard Members (Non-Officers)**: See a restricted subset of public modules (Events, Planner, Resources, Members list).
    - **Officers (e.g., VPM, Treasurer, President)**: See additional role-specific modules (like Guest Pool, Funds, Prospecting Pipeline, and Retention/Finance Dashboards) layered on top of the standard view.

### 6.2 Treasurer / Finance Domain
- **Dues Management & Status Sync**: The domain utilizes the existing `Transaction` model for tracking dues and club finances. To synchronize with the VP Membership domain, Mongoose post-save middleware on the `Transaction` model automatically evaluates and updates the associated `Member`'s active/suspended status when a dues transaction is recorded.

## Chapter 7: VP Public Relations (VPPR) Bounded Context (Public Facing & Lead Gen)

### 7.1 Bounded Context Overview
The VPPR Bounded Context manages public-facing club information, meeting announcements, and social media integrations to feed leads directly into the VP Membership prospect pipeline.

### 7.2 Versioning Strategy
- **v1 Scope (MVP)**: No active automated features. A `leadSource` field is added to the `Guest` pipeline model, allowing the VP Membership to manually track where leads originate from. This lays the data foundation for future automation.
- **v2 Scope**: Automated inbound lead ingestion (from social media or public websites), automated marketing broadcast tools, and public-facing club page management.

## Chapter 8: Cross-Club Support & Geo-Location Bounded Context

### 8.1 Bounded Context Overview
This domain breaks down isolation between clubs by allowing members to opt into a broader support network. It enables clubs to find and invite external members for mentorship or to fill standard meeting roles (Timer, Ah-Counter, Evaluator, etc.).

### 8.2 Database Architecture & Privacy
- **Unified Member Geo-Profiles**: The legacy `EliteSupporter` model is deprecated. Instead, geo-profiles (Home and Office coordinates) and a `supportRole` flag (e.g., 'Normal', 'Elite_Mentor') are embedded directly into the unified `Member` model.
- **Default Opt-In & Privacy**: Any member who provides their location via their phone is searchable by default in the cross-club directory, though they retain the ability to decline any incoming role invitations.

### 8.3 Core Modules
- **Dynamic Proximity Recommendation Engine**: Calculates travel distance between variable meeting venue coordinates and the available members' geo-profiles.
- **Cross-Club Invitation Flow**: Allows the executive leadership trio (President, VPE, VPM) to issue direct meeting assistance invitations to the nearest available members to fill vacant roles or provide expert mentorship.
- **Role-Scoped Visibility (No Achievement Credit)**: External members pulled in for a role receive function-based visibility exclusively for that meeting. Cross-club participation does not accrue achievement, credit, or educational path points.