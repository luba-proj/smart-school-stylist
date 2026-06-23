# Security Policy & Architecture Review

This document provides a comprehensive security review for the **Smart School Stylist** assistant, outlining identity, access control, data protection, privacy compliance, and path to production security.

---

## 1. Identity & User Context
- **User Roles**: The parent acts as the primary account owner and system user. Children do not have direct access or separate login identities.
- **Child Profiles**: Children's profiles (name, age, styling preferences) are stored as sub-records associated with the parent's unique account ID.

## 2. Authentication (AuthN)
- **Current MVP State**: No authentication is implemented in the current local MVP code; all routes on the FastAPI wrapper are public.
- **Production Target**: Integrate **Firebase Authentication**. The frontend client (e.g., React Native app) will handle parent logins and obtain a JSON Web Token (JWT). The FastAPI backend will intercept and validate the `Authorization: Bearer <JWT>` header using a verification middleware.

## 3. Authorization (AuthZ)
- **Data Access Control**: Implement strict **Row-Level Security (RLS)** in the database.
- **Validation**: The backend will verify that the parent requesting recommendations or updates is authorized to access the specific child profile.
- **Command Security**: Agent execution routes are restricted to the authorized parent.

## 4. Data Protection
- **Encryption in Transit**: All communications between the mobile application and the FastAPI server, and between the server and Google GenAI APIs, must use TLS 1.3.
- **Encryption at Rest**: Databases (Cloud Firestore) and object storage (Google Cloud Storage) use GCP's default customer-managed or Google-managed encryption keys.
- **PII Scrubbing**: Prompt-response logging and telemetry must scrub raw PII (like child names, specific routines, or photos). Telemetry configuration defaults to `NO_CONTENT` to upload metadata only.

## 5. Audit & Monitoring
- **Log Auditing**: Record all key administrative events, including login attempts, profile creations, and changes to styling rules.
- **Observability**: OpenTelemetry tracing maps service bottlenecks, while safe workflow node logging logs node state transitions (`STARTED`, `COMPLETED`, `FAILED`) and targets.

## 6. Governance & Human Oversight
- **Human-in-the-Loop (HITL)**: The styling system acts as an advisory concierge assistant. The parent (and child) reviews and makes the final decision on what to wear.
- **System Guardrails**: The styling engine has strict programmatic limits preventing it from overriding safety settings or parent-defined constraints.

## 7. Child Data Privacy Considerations
- **COPPA Compliance**: The app targets parents rather than children under 13 directly. Clear disclosures and parental consent are required during registration.
- **Data Minimization**: Avoid storing unnecessary identifying child data. Last names, specific school names, school locations, or exact addresses should not be requested or stored in the database.

## 8. Current MVP Limitations
- public, unauthenticated routes.
- In-memory mock database that reset on server restart.
- Credentials loaded via local environment variables rather than a secure secrets manager.
- Lacks input validation to protect prompts against prompt injection attacks (e.g., trying to override the dress constraint).

## 9. Future Production Requirements
1. **Firebase Auth Integration**: Secure FastAPI endpoints.
2. **Google Cloud Secret Manager**: Securely load Gemini and external API keys.
3. **Input Sanitization**: Validate and filter user query strings before they are injected into LLM prompts.
4. **Consent Management**: Implement a parental consent flow in the app.
