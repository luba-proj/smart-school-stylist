# Security Policy & Architecture Review

This document provides a comprehensive security review for the **Smart School Stylist** assistant, outlining identity, access control, data protection, privacy compliance, and path to production security.

---

## 1. Identity & User Context
- **User Roles**: The parent acts as the primary account owner and system user. Children do not have direct access or separate login identities.
- **Child Profiles**: Children's profiles (name, age, styling preferences, sensory dislikes) are stored as sub-records associated with the parent's unique account ID.

## 2. Authentication (AuthN)
- **Current MVP State**: No authentication is implemented in the current local MVP code; all routes on the FastAPI wrapper are public. The React frontend demo runs entirely locally with mock data.
- **Production Target**: Integrate **Firebase Authentication**. The frontend client (e.g., React Native app) will handle parent logins and obtain a JSON Web Token (JWT). The FastAPI backend will intercept and validate the `Authorization: Bearer <JWT>` header using a verification middleware.

## 3. Authorization (AuthZ)
- **Data Access Control**: Implement strict **Row-Level Security (RLS)** in the database.
- **Validation**: The backend will verify that the parent requesting recommendations or updates is authorized to access the specific child profile.
- **Command Security**: Agent execution routes are restricted to the authorized parent.

## 4. Data Protection
- **Encryption in Transit**: All communications between the mobile application and the FastAPI server, and between the server and Google GenAI APIs, must use TLS 1.3.
- **Encryption at Rest**: Databases (Cloud Firestore) and object storage (Google Cloud Storage) use GCP's default customer-managed or Google-managed encryption keys.
- **PII Scrubbing**: Prompt-response logging and telemetry must scrub raw PII (like child names, specific routines, or photos). Telemetry configuration defaults to `NO_CONTENT` to upload metadata only.

## 5. Client-Side Data Security
- **Feedback Memory**: The React frontend stores feedback memory (liked colors, liked tags, disliked outfit combos, warmth offset) in `localStorage`. This data:
  - Is stored per-child and per-browser only.
  - Contains no personally identifiable information beyond styling preferences.
  - Is not transmitted to any external server.
  - Can be cleared by the user at any time via browser settings.
- **No External API Calls**: The frontend demo makes zero external network requests — all data is local mock data.
- **Production Migration**: In production, feedback memory will be migrated from `localStorage` to a server-side database with authentication and encryption.

## 6. Audit & Monitoring
- **Log Auditing**: Record all key administrative events, including login attempts, profile creations, and changes to styling rules.
- **Observability**: OpenTelemetry tracing maps service bottlenecks, while safe workflow node logging logs node state transitions (`STARTED`, `COMPLETED`, `FAILED`) and targets.

## 7. Governance & Human Oversight
- **Human-in-the-Loop (HITL)**: The styling system acts as an advisory concierge assistant. The parent (and child) reviews and makes the final decision on what to wear.
- **Rule Engine Guardrails**: The 477-line rule engine enforces strict programmatic limits — weather safety rules, school activity constraints, and sensory dislikes cannot be overridden by styling preferences.
- **Parent Validation**: Every generated outfit passes an "experienced parent" validation check before display. Invalid outfits are flagged with a smart alert and can be regenerated with one click.
- **System Guardrails**: The styling engine has strict programmatic limits preventing it from overriding safety settings or parent-defined constraints.

## 8. Child Data Privacy Considerations
- **COPPA Compliance**: The app targets parents rather than children under 13 directly. Clear disclosures and parental consent are required during registration.
- **Data Minimization**: Avoid storing unnecessary identifying child data. Last names, specific school names, school locations, or exact addresses should not be requested or stored in the database.
- **Mock Data Only**: The current demo uses entirely fictional child profiles (Emma and Mia) with no real personal data.

## 9. Current MVP Limitations
- Public, unauthenticated routes on the backend.
- In-memory mock database that resets on server restart.
- Frontend `localStorage` feedback memory (browser-specific, clearable).
- Credentials loaded via local environment variables rather than a secure secrets manager.
- Lacks input validation to protect prompts against prompt injection attacks.

## 10. Future Production Requirements
1. **Firebase Auth Integration**: Secure FastAPI endpoints with JWT verification.
2. **Google Cloud Secret Manager**: Securely load Gemini and external API keys.
3. **Input Sanitization**: Validate and filter user query strings before LLM prompt injection.
4. **Consent Management**: Implement a parental consent flow in the app.
5. **Server-Side Feedback Storage**: Migrate `localStorage` feedback memory to Cloud Firestore with auth-gated access.
6. **Rate Limiting**: Add API rate limiting to prevent abuse of styling endpoints.
7. **Content Security Policy**: Configure CSP headers for the production frontend deployment.
