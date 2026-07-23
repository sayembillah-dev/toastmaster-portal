# Toastmasters Multi-Tenant Domain-Driven Design (DDD) Architecture Specification

This document outlines the Domain-Driven Design (DDD) architectural specification for transforming the existing single-tenant Next.js Toastmasters meeting application into a scalable, multi-tenant system. The architecture isolates bounded contexts, establishes clear domain aggregates, and defines multi-level organizational relationships ranging from individual members to division-level leadership.

## Chapter 1: Strategic Context & Architecture Foundations

### 1.1 Multi-Tenant Domain Boundary Strategy

The system transitions from a single-club application to a multi-tenant platform by scoping domain entities under explicit tenant boundaries. The top-level tenant boundary is defined by the ClubId, ensuring strict data isolation across clubs while enabling cross-context identity sharing.

### 1.2 Identity, Role Navigation, and Cross-Club Membership

A member is uniquely identified by their global Toastmasters Member ID (PN / Member Number). A single identity can maintain active memberships or administrative appointments across multiple clubs, areas, and divisions.

Organizational Level

Context Boundary Scope

Primary User Capabilities

Club Level

ClubId

Manage local meeting agendas, speech slots, officer roles, local member records, and club support tickets.

Area Level

AreaId (Aggregates multiple ClubIds)

Read-only oversight of club health metrics, guest retention rates, meeting frequency, and direct officer communication.

Division Level

DivisionId (Under Division PQD)

Deployment and availability management of 12 Elite Division Quality Supporters across affiliated clubs.

### 1.3 Annual Presidential Transition Invariants

Leadership rotates annually. The domain enforces the invariant that historical records—including executive meeting minutes, support tickets, financial reports, and DCP milestone tracking—remain immutable and fully accessible to incoming officers upon term transition.

## Chapter 2: President Bounded Context (Executive Oversight & Club Governance)

### 2.1 Bounded Context Overview

The President Bounded Context governs strategic direction, executive board management, club health monitoring, external relations, and conflict resolution. The President Aggregate Root holds ultimate authority over strategic decisions, executive meeting approvals, and ticket escalations.

### 2.2 Domain Aggregates & Modules

#### 1. Executive Board Aggregate

-   Meeting Minutes & Governance Automation: Captures formal executive board meetings incorporating parliamentary procedures (Motion Creation, Motion Seconding, Objections, Voting, and Final Resolution).
    
-   Officer Assignment & Term Transition: Manages term start/end dates, role assignments, and seamless succession handovers.
    
-   Secretary Module Integration: Automatically converts recorded meeting motions and decisions into published meeting minutes.
    

#### 2. Club Health & DCP Monitoring Aggregate

-   Distinguished Club Program (DCP) Tracking: Monitors educational progress, membership thresholds, and administrative goals in real time.
    
-   Key Performance Metrics: Tracks meeting attendance consistency, guest retention percentages, and role fulfillment health.
    

#### 3. Conflict Resolution & Support Ticket Aggregate

-   Scoped Access Control: Members can open support tickets for disputes, objections, or administrative queries. Ticket visibility is strictly restricted to assigned/tagged parties and the President.
    
-   Collaborative Threading: Ticket creators and tagged officers participate in open discussion within the ticket thread.
    
-   President Escalation & Resolution: The President can tag additional advisors, arbitrate discussions, and declare tickets resolved.
    

#### 4. Area & External Link Aggregate

-   Area Director High-Level Metrics View: Grants read-only visibility to the Area Director for key performance indicators without exposing internal club management controls.
    
-   Bidirectional Communication Channel: Enables Area Directors to post feedback on metrics, allowing the President and Vice President Education (VPE) to respond directly within the platform.
    

#### 5. Elite Supporter / Division PQD Support Module

-   Profile & Multi-Location Configuration: Tracks 12 appointed elite supporters under the Division Program Quality Director (PQD). Supports two distinct geo-coordinate profiles per supporter (Work and Home) plus weekly availability calendars.
    
-   Dynamic Proximity Recommendation Engine: Calculates travel distance between variable meeting venue coordinates and available supporter coordinates.
    
-   Invitation Flow: Allows the executive leadership trio (President, VPE, VPM) to issue direct meeting assistance invitations to the nearest available supporter to enhance meeting quality.
    

## Chapter 3: Vice President Education (VPE) Bounded Context (Meeting & Educational Operations)

### 3.1 Bounded Context Overview

The VPE Bounded Context handles speech scheduling, agenda formulation, meeting role assignments, and member educational progression. The Roster Aggregate Root governs the integrity of individual meeting agendas.

### 3.2 Core Aggregates & Collaborative Workflows

#### 1. Roster & Meeting Planner Aggregate

-   Meeting Event Lifecycle: Manages meeting dates, venue coordinates, themes, and open role slots (Speakers, Evaluators, Toastmaster of the Day, Table Topics Master, General Evaluator, Functionaries).
    
-   Dynamic Agenda Propagation: As role assignments are confirmed, the system auto-generates printable and shareable meeting agendas.
    

#### 3. Meeting Awards & Recognition Module

-   Live Voting & Feedback: Enables real-time, in-meeting voting by all members to award 'Best Prepared Speaker,' 'Best Table Topics Speaker,' 'Best Evaluator,' and 'Best Role Player.'
    
-   Results Compilation: Automatically tallies votes and records winners as part of the meeting summary.
    

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

-   Guest Intake Tracking: Records guest contact details, visit history, attendance frequency, and sponsor tracking.
    
-   Automated Follow-Up Workflows: Tracks communication logs, invitation statuses, and application progress.
    
-   Member Conversion Service: Converts a guest entity into an active Club Member entity upon fee payment and executive approval.
    

#### 2. Guest Participation Collaboration (VPM & VPE Cross-Context)

-   Guest Meeting Participation: VPM requests temporary meeting slots (e.g., Table Topics participant, minor functionary roles) from VPE to encourage guest engagement before formal induction.
    

  

#### 3. Retention & Finance Sync Service

-   Retention Tracking: Monitoring attendance and meeting participation metrics to identify and alert leadership about at-risk members.
    
-   Status Syncing: Interfacing with the Treasurer domain to automatically suspend or activate member profiles based on dues payments.
    

  

## 4. Identified Missing Domains (To Be Defined)

To achieve a comprehensive Domain-Driven Design architecture, the following domains represent the missing puzzle pieces that should be formalized in future iterations:

-   Identity & Member Profile Domain: Centralized user authentication, basic contact information, role-based access control (distinguishing between Guests, Members, and specific Officers), and a unified member dashboard.
    
-   Treasurer / Finance Domain: Managing club dues, generating renewal invoices, tracking payment statuses, and maintaining the club's budget and expense ledger (crucial for syncing with the VP Membership domain).
    
-   VP Public Relations (VPPR) Domain: Managing public-facing club information, meeting announcements, and social media integrations to feed leads directly into the VP Membership prospect pipeline.
    
-   Executive Committee / Secretary Domain: Managing the club's official records, meeting minutes (for both regular and executive meetings), and documenting club officer transitions.