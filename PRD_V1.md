# Voice Travel Agent

## Product Requirements Document --- V1

**Product area:** Post-Sales\
**Product type:** AI-led post-sales voice assistant\
**Status:** V1 --- Product Thinking & Working Prototype\
**Author:** Rishika Chaurasia

> **Prototype positioning:** Independent product prototype using
> synthetic corporate travel data. It demonstrates the proposed product
> approach and automation boundary; it is not positioned as a production
> MakeMytrip integration.

------------------------------------------------------------------------

## 1. Product Overview

** Voice Travel Agent** is a bounded conversational AI assistant
for corporate travel post-sales support.

The product is designed to help travellers and corporate bookers handle
routine requests such as:

-   Booking details
-   Cancellation
-   Cancellation fee and refund information
-   Refund lookup
-   Rescheduling
-   Cases requiring human support

The core product principle is:

> **Maximize safe autonomy --- not maximum automation.**

The assistant uses natural-language understanding to understand what the
customer wants, while structured booking context, business rules and
controlled actions determine what the system is actually allowed to do.

------------------------------------------------------------------------

## 2. Problem Statement

Corporate travellers contact post-sales support for a mix of routine
requests and cases that genuinely require human judgement.

Routine requests can include:

-   Finding booking details
-   Understanding cancellation terms
-   Checking refund information
-   Cancelling a booking

More complex cases can include:

-   Rescheduling
-   Policy or fee disputes
-   Exceptions
-   Unsupported requests

The product opportunity is therefore not simply to introduce a voice
bot. The product must determine:

1.  What can be safely resolved by AI
2.  What requires clarification
3.  What should move to a human

From the customer perspective, the desired experience is **fast, clear
and low-friction**.

From an operational perspective, the opportunity is to **reduce
avoidable agent workload and improve service efficiency**.

These objectives must be balanced with accuracy because an incorrect
automated action can create more frustration than an immediate human
handoff.

### Core product question

> **How can a voice-bot based AI agent increase autonomous resolution of
> deterministic post-sales requests while maintaining policy accuracy,
> transaction accuracy and customer trust?**

------------------------------------------------------------------------

## 3. Product Approach

The assistant is designed as a **bounded conversational AI assistant**,
rather than an unrestricted chatbot.

It combines:

-   Natural-language understanding
-   Structured booking context
-   Authoritative business rules
-   Controlled transactional actions
-   Human handoff when automation is inappropriate

### Automation boundary

  -----------------------------------------------------------------------
  Outcome                             Decision rule
  ----------------------------------- -----------------------------------
  **AUTOMATE**                        Supported request + unambiguous
                                      booking/context + deterministic
                                      outcome

  **CLARIFY**                         Insufficient information or
                                      multiple valid booking matches

  **HUMAN**                           Judgement, exception handling,
                                      dispute or unsupported/complex
                                      request
  -----------------------------------------------------------------------

This creates an explicit automation boundary rather than attempting to
automate every conversation.

------------------------------------------------------------------------

## 4. Target Users

### 4.1 Employee Traveller

The employee uses the assistant to:

-   View their travel bookings
-   Understand booking details
-   Check cancellation/refund information
-   Cancel an eligible booking
-   Request rescheduling

The employee should only be able to access bookings they are authorized
to view.

### 4.2 Central Booker

A Central Booker can manage or inspect broader company/team travel.

The prototype supports Central Booker behaviour including:

-   Company-level booking lookup
-   Team-based matching
-   Traveller-count matching

### 4.3 Travel Desk / Human Agent

The human agent handles:

-   Rescheduling
-   Policy disputes
-   Exceptions
-   Unsupported or complex requests
-   Cases where the assistant cannot safely complete the journey

The objective is not to eliminate handoffs. It is to make handoffs
**intentional, accurate and contextual**.

------------------------------------------------------------------------

## 5. V1 Use Cases

### P0 --- Booking Details

The assistant should allow users to retrieve booking information using
natural language.

Possible references include:

-   Booking / PNR
-   Route
-   City
-   Hotel
-   Date
-   Booking type
-   Team
-   Traveller count

If there is one clear match, the assistant can provide the booking
details.

If multiple bookings match, the assistant should ask the user to clarify
or select the correct booking.

------------------------------------------------------------------------

### P0 --- Cancellation

Cancellation is a controlled transactional flow.

### Cancellation flow

**Identify booking**\
↓\
**Check reschedule preference**\
↓\
**Retrieve cancellation fee and refund**\
↓\
**Explain financial impact**\
↓\
**Obtain explicit confirmation**\
↓\
**Execute cancellation**\
↓\
**Verify result**

The assistant should not execute cancellation before explicit
confirmation.

If the customer disputes the cancellation fee or policy, the transaction
should stop and move to a human agent with context preserved.

------------------------------------------------------------------------

### P0 --- Refund Lookup

Refund information should be available as a read-only interaction.

The assistant can:

-   Identify the booking
-   Check whether it is cancelled
-   Show refund information
-   Explain cancellation fee/refund information where relevant

Refund lookup itself should not trigger a cancellation.

------------------------------------------------------------------------

### P0 --- Rescheduling

Rescheduling is treated as a human-led workflow in V1.

The assistant should:

1.  Identify the relevant booking
2.  Recognize the rescheduling request
3.  Avoid pretending to complete a date change
4.  Transfer the request to the Travel Desk
5.  Preserve relevant booking and conversation context

------------------------------------------------------------------------

### P0 --- Human Handoff

Human handoff should occur when:

-   The request requires judgement
-   The customer disputes a fee or policy
-   The request is unsupported
-   The booking cannot be safely resolved
-   The transaction cannot be completed deterministically
-   The customer needs an exception

The handoff should preserve context so the customer does not have to
unnecessarily repeat the entire problem.

------------------------------------------------------------------------

## 6. Current Prototype Experience

The working prototype provides a browser-based voice + AI experience.

### Main interface

The current interface includes:

-   **Start call**
-   **Speak**
-   **Mute bot**
-   **End call**
-   Demo caller / role selector
-   Test message input
-   AI language-understanding section
-   Gemini model selection
-   Call context
-   Frustration score
-   Decision trail

### Call context

The interface exposes:

-   Caller
-   Role
-   Intent
-   State
-   Booking
-   Decision

This makes the system's conversational state visible rather than
treating the assistant as a black box.

### Frustration score

The interface exposes a **0--100 frustration score**, where:

-   0 = calm
-   100 = highly frustrated

The score is intended as an interaction-friction signal, not as a claim
of perfect emotion detection.

### Decision trail

The prototype exposes the decision path so the user can understand
whether the system is:

-   Automating
-   Clarifying
-   Handing off to a human

------------------------------------------------------------------------

## 7. AI Language Layer

The prototype uses **Gemini** as the natural-language understanding
layer through a Vercel server-side API.

The AI layer is responsible for understanding requests such as:

-   View a booking
-   Cancel a booking
-   Reschedule a booking
-   Check refund information

Once the intent and relevant booking details are identified, predefined
booking data and business rules determine what action is allowed.

### Product principle

> **AI understands the conversation; deterministic product logic
> controls the actual booking actions and rules.**

This separation is important for:

-   Policy accuracy
-   Transaction accuracy
-   Explainability
-   Safety
-   Evaluation

The prototype also maintains a deterministic fallback path so core
interaction logic does not depend entirely on the AI layer.

------------------------------------------------------------------------

## 8. Booking Resolution

Natural-language booking resolution should support references such as:

-   PNR / booking reference
-   City
-   Route
-   Hotel
-   Date
-   Booking type
-   Team
-   Traveller count
-   Natural-language hotel or city aliases

### Resolution logic

**User request**\
↓\
**Identify intent**\
↓\
**Extract booking clues**\
↓\
**Filter accessible bookings**\
↓\
**One match → proceed**\
**Multiple matches → clarify**\
**No safe match → human / clarification**

The assistant must not invent a booking when a valid booking cannot be
grounded in the available data.

------------------------------------------------------------------------

## 9. Access & Role Control

Access should be determined by user role before an action is performed.

### Employee

Employee users should only access their own eligible bookings.

### Central Booker

Central Bookers can access broader company/team booking information
within the defined prototype rules.

### Product requirement

The AI language layer should never override deterministic access rules.

Authorization must remain a product/system responsibility rather than an
LLM decision.

------------------------------------------------------------------------

## 10. Evals & Quality Framework

Evals should be the quality-control layer for the voice experience.

The assistant should not be evaluated only on whether a response sounds
correct.

Evaluation should follow the complete customer journey.

### 10.1 Understanding

Measure:

-   Intent accuracy
-   Entity accuracy
-   Booking identification
-   Role recognition
-   Access accuracy

### 10.2 Decision

Measure:

-   Policy accuracy
-   Correct AUTOMATE / CLARIFY / HUMAN decision
-   Correct escalation boundary

### 10.3 Action

Measure:

-   Correct action
-   Correct booking
-   Correct tool/action parameters
-   Transaction verification

### 10.4 Resolution

Measure whether the customer's actual need was resolved.

### 10.5 Conversation Quality

Measure:

-   Unnecessary questions
-   Repetition
-   Recovery from misunderstandings
-   Confirmation behaviour
-   Conversation friction

### 10.6 Handoff Quality

Measure:

-   Whether escalation was necessary
-   Whether escalation was correctly triggered
-   Whether the relevant context was preserved

### Continuous Evals

Production conversations can become regression Evals.

This creates a measurable quality gate for changes to:

-   Prompts
-   Models
-   Policies
-   Tools
-   Conversation flows

------------------------------------------------------------------------

## 11. Customer Frustration Scoring

Customer frustration should be treated as a **product signal connected
to the journey**, not simply as a standalone sentiment label.

The V1 prototype uses an explainable **0--100 interaction-friction
score**.

Potential observable signals include:

-   Repeated requests
-   Corrections
-   Unnecessary clarification
-   Escalation language
-   Failed actions
-   Unusually long interactions
-   Repeat contact

### Important principle

The score should identify **where the conversation is breaking down**,
rather than simply labelling the customer as frustrated.

For example:

If customers repeatedly provide a booking reference because the
assistant fails to retain or resolve it, the signal should identify an
underlying **entity/state failure** rather than treating the eventual
human transfer as the root cause.

### Calibration

A production score should eventually be calibrated against outcomes such
as:

-   CSAT
-   Repeat contact
-   Complaints
-   Agent disposition

The prototype score is therefore a product diagnostic signal, not a
validated emotion model.

------------------------------------------------------------------------

## 12. Agent Handoff Measurement

Agent handoff should be measured as an outcome to make the system more
intelligent over time.

A lower handoff rate is **not automatically a success** if the assistant
incorrectly handles cases that require human judgement.

### Core metrics

  -----------------------------------------------------------------------
  Metric                              What it tells the product team
  ----------------------------------- -----------------------------------
  **Agent Handoff Rate**              How often eligible conversations
                                      are transferred

  **Autonomous Resolution Rate**      How often eligible requests are
                                      resolved without an agent

  **Unnecessary Handoff Rate**        How often the bot transfers a
                                      request that could have been safely
                                      resolved

  **Handoff Precision**               Whether transferred conversations
                                      genuinely required human
                                      intervention

  **Handoff Recall**                  Whether cases requiring human
                                      intervention were correctly
                                      escalated

  **First-Pass Resolution**           Whether the customer was resolved
                                      without repeat contact/correction
  -----------------------------------------------------------------------

### Product objective

> Reduce unnecessary handoffs without increasing missed handoffs,
> incorrect actions or customer frustration.

------------------------------------------------------------------------

## 13. Use-Case Prioritization

Automation should expand based on evidence rather than simply on how
many use cases an LLM can technically handle.

### Prioritization framework

**Impact × Automation Feasibility × Customer Friction × Volume × Risk**

Where:

-   **Impact** = customer + operational value
-   **Automation Feasibility** = deterministic rules, reliable data and
    executable actions
-   **Customer Friction** = delay, repetition and handoff pain
-   **Volume** = size of the opportunity
-   **Risk** = financial, policy, access and transaction consequences

### Implication

High-volume, high-friction and deterministic journeys such as:

-   Booking information
-   Refund lookup

are natural early automation candidates.

Discretionary exceptions should remain human-led until sufficient
controls and evidence exist.

------------------------------------------------------------------------

## 14. Safety & Guardrails

V1 should follow these guardrails:

### Grounding

Actions must be tied to valid accessible booking data.

### Authorization

Booking access must be determined by deterministic role/access rules.

### Financial transparency

Cancellation fee and refund information should be shown before
confirmation.

### Explicit confirmation

Cancellation must require explicit customer confirmation.

### No false automation

The assistant should not claim to have completed a reschedule when it
has only initiated a human handoff.

### Dispute protection

A disputed fee or policy should stop the automated transaction and
trigger human support.

### Fallback

If the AI language layer fails, deterministic fallback logic should
continue to support the core interaction where possible.

------------------------------------------------------------------------

## 15. Functional Requirements

  -----------------------------------------------------------------------
  ID                      Requirement             V1
  ----------------------- ----------------------- -----------------------
  FR-01                   Start and end a call    Required
                          session                 

  FR-02                   Support browser voice   Required
                          input where available   

  FR-03                   Support typed           Required
                          interaction as fallback 

  FR-04                   Identify supported      Required
                          post-sales intents      

  FR-05                   Resolve bookings        Required
                          against accessible data 

  FR-06                   Ask for clarification   Required
                          when multiple bookings  
                          match                   

  FR-07                   Apply Employee vs       Required
                          Central Booker access   
                          behaviour               

  FR-08                   Show cancellation fee   Required
                          and refund before       
                          confirmation            

  FR-09                   Require explicit        Required
                          cancellation            
                          confirmation            

  FR-10                   Support refund lookup   Required
                          without triggering      
                          cancellation            

  FR-11                   Route rescheduling to   Required
                          human support           

  FR-12                   Route                   Required
                          unsupported/complex     
                          cases to human support  

  FR-13                   Display frustration     Required
                          score                   

  FR-14                   Display decision trail  Required

  FR-15                   Maintain deterministic  Required
                          fallback when AI        
                          understanding fails     

  FR-16                   Capture structured      Next iteration
                          interaction signals for 
                          future Evals            
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Non-Functional Requirements

### Accuracy

The system should prioritize correct booking identification and
policy/action decisions over aggressive automation.

### Safety

No irreversible transaction should occur without the required
confirmation and deterministic validation.

### Explainability

The system should make its decision state visible enough for product
evaluation and debugging.

### Reliability

The core deterministic interaction path should remain usable when the AI
language layer is unavailable.

### Privacy

Production implementation should use appropriate authentication,
authorization and secure handling of booking/customer information.

------------------------------------------------------------------------

## 17. Analytics & Product Metrics

The V1 product should establish measurement around the complete journey.

### Primary metrics

-   Autonomous Resolution Rate
-   Agent Handoff Rate
-   Unnecessary Handoff Rate
-   Handoff Precision
-   Handoff Recall
-   First-Pass Resolution
-   Booking Resolution Accuracy
-   Cancellation Completion Rate
-   Frustration Score
-   AI Fallback Rate

### Suggested event model

  Event                       Key properties
  --------------------------- --------------------------------------------
  `session_started`           session_id, role, channel
  `intent_detected`           intent, confidence, model_version
  `booking_resolved`          booking_id, resolution_method, attempts
  `clarification_requested`   reason, intent
  `policy_shown`              booking_id, fee, refund
  `action_confirmed`          action, booking_id
  `action_completed`          action, booking_id, outcome
  `handoff_started`           reason, intent, booking_id
  `frustration_updated`       score, trigger
  `ai_fallback`               error_type, fallback_intent
  `session_completed`         resolution, handoff, frustration, duration

------------------------------------------------------------------------

## 18. Continuous Improvement Loop

The product should create a closed loop between customer conversations
and product improvement:

**Conversation**\
↓\
**Resolution / Handoff**\
↓\
**Eval**\
↓\
**Failure Taxonomy**\
↓\
**Prioritize**\
↓\
**Improve**\
↓\
**Regression Eval**\
↓\
**Controlled Release**\
↓\
**Measure**

### Failure taxonomy

Failures should be classified into actionable categories such as:

-   Intent failure
-   Entity failure
-   Ambiguity failure
-   Policy failure
-   Action failure
-   Unnecessary handoff
-   Missed handoff
-   Conversation friction

Repeated high-volume failures can then be prioritized using the use-case
prioritization framework.

------------------------------------------------------------------------

## 19. Cross-Functional Product Model

The product requires collaboration across:

### Business / Operations

Provides:

-   Post-sales pain points
-   Policies
-   Agent workflows
-   Agent disposition context

### Product

Owns:

-   Prioritization
-   Automation boundaries
-   Product outcomes
-   Roadmap

### Technology / AI

Owns:

-   Voice
-   Model orchestration
-   APIs
-   Guardrails
-   Eval infrastructure

### Design / Conversation

Owns:

-   Conversation flows
-   Prompts
-   Confirmations
-   Recovery experiences

### Analytics

Owns:

-   Baselines
-   Handoff measurement
-   Resolution measurement
-   Frustration measurement
-   Release impact

------------------------------------------------------------------------

## 20. V1 Prototype Scope

The working prototype uses synthetic corporate travel data and
demonstrates the proposed automation boundary.

### Included

-   Voice interaction
-   Typed interaction
-   Booking-detail lookup
-   Cancellation
-   Cancellation-fee calculation
-   Refund calculation
-   Read-only refund lookup
-   Ambiguity handling
-   Employee vs Central Booker behaviour
-   Natural-language hotel/city aliases
-   Central Booker team/traveller-count matching
-   Controlled human handoff
-   Frustration score
-   Decision trail
-   Gemini language layer
-   Deterministic business rules

### Cancellation demonstration

**Identify booking → Check reschedule preference → Show fee/refund →
Obtain confirmation → Execute → Verify**

### Human-led scenarios

-   Rescheduling
-   Fee/policy disputes
-   Unsupported/complex requests

------------------------------------------------------------------------

## 21. V1 Prototype Architecture

``` text
                 USER
                  │
          Voice / Typed Input
                  │
                  ▼
        ┌─────────────────────┐
        │ Conversational UI   │
        │ Voice + Text        │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ AI Language Layer   │
        │ Gemini              │
        │ Intent + Entities   │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Booking Resolution  │
        │ + Access Rules      │
        └──────────┬──────────┘
                   │
             ┌─────┼─────┐
             ▼     ▼     ▼
          AUTOMATE CLARIFY HUMAN
             │     │     │
             ▼     ▼     ▼
        Deterministic   Travel Desk
        Action / Rule   Handoff
             │
             ▼
        Decision Trail
        + Frustration
```

### Architecture principle

The AI layer interprets language.

The deterministic product layer controls:

-   Access
-   Booking grounding
-   Policy
-   Fees
-   Refunds
-   Confirmation
-   Transaction state
-   Handoff boundaries

------------------------------------------------------------------------

## 22. Prototype Limitations

The V1 prototype should not be interpreted as a production
travel-servicing system.

### Current limitations

-   Uses synthetic corporate travel data
-   No production booking-system integration
-   No real payment/refund rail
-   No production authentication/SSO
-   Rescheduling is human-led rather than automatically executed
-   Frustration score is heuristic and not statistically validated
-   Formal production Evals infrastructure is not implemented
-   Prototype transaction state is controlled rather than connected to
    live booking systems
-   Production analytics and audit infrastructure are not implemented

These limitations are intentional within the prototype scope.

------------------------------------------------------------------------

## 23. V1 Roadmap

### V1 --- Working Prototype

**Objective:** Demonstrate the safe-automation concept.

Includes:

-   Voice + text interaction
-   Booking resolution
-   Cancellation
-   Refund lookup
-   Human handoff
-   Frustration signal
-   Decision trail
-   Gemini language layer
-   Deterministic business rules

### V1.1 --- Quality Layer

**Objective:** Make the product measurable.

Potential additions:

-   Versioned golden Eval set
-   Regression testing
-   Intent accuracy measurement
-   Booking-resolution accuracy
-   Safe-action evaluation
-   Handoff precision/recall
-   Frustration calibration
-   Failure taxonomy

### V2 --- Production Readiness

**Objective:** Connect the assistant to real operational systems.

Potential additions:

-   Authentication / SSO
-   Live booking APIs
-   Authoritative policy engine
-   Refund integration
-   Agent-routing integration
-   Persistent transaction state
-   Audit logs
-   Production analytics

### V3 --- Expanded AI Servicing

**Objective:** Expand safe autonomous servicing based on evidence.

Potential additions:

-   More post-sales use cases
-   Proactive servicing
-   Conversation analytics
-   Failure clustering
-   Next-best action
-   Richer multilingual voice support

------------------------------------------------------------------------

## 24. Open Product Questions

1.  Which post-sales journeys have the highest volume and lowest policy
    complexity?
2.  Which actions should always require human review?
3.  What is the acceptable automation threshold for cancellation/refund
    actions?
4.  What is the authoritative source for booking status, fees and refund
    timelines?
5.  How should the frustration score be calibrated against real customer
    outcomes?
6.  What context must be passed to the human agent to avoid asking the
    customer to repeat information?
7.  Which languages and accents should be prioritized for future voice
    support?
8.  Which use cases should be promoted from HUMAN to AUTOMATE after
    sufficient Eval evidence?

------------------------------------------------------------------------

## 25. Success Definition

The product should not be considered successful simply because it has a
high automation rate.

V1 success should be defined as:

> **Increasing autonomous resolution of deterministic post-sales
> requests while maintaining policy accuracy, transaction accuracy and
> customer trust.**

The key product trade-off is therefore:

**More automation**\
without\
**more incorrect actions, missed handoffs or customer frustration.**

------------------------------------------------------------------------

## 26. Demo Flow

A short demonstration can validate the core product concept:

1.  Start call
2.  Select **Employee**
3.  Ask: **"What all bookings do I have?"**
4.  Ask: **"Can you get rid of my Bombay flight?"**
5.  Let the assistant identify the booking
6.  Observe the reschedule preference check
7.  Review cancellation fee and refund
8.  Confirm cancellation
9.  Observe the decision trail
10. Try an unsupported or disputed request to demonstrate human handoff
11. Repeat using **Central Booker** to demonstrate broader booking
    access

------------------------------------------------------------------------

## 27. Product Principle

> **The goal is not to build a chatbot that can answer everything.**
>
> **The goal is to build a voice agent that knows what it can safely
> resolve, when it needs clarification, and when a human should take
> over.**
