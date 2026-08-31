# Sprintiverse — DPDP Data Breach Response Plan

**Version:** 2026-08-31  
**Purpose:** Internal operational SOP aligned to the uploaded DPDP Act 2023 technical checklist.

## 1. Detection

Treat suspected unauthorized access, disclosure, alteration, destruction or loss of personal data as a potential incident. Sources include authentication alerts, database/security logs, hosting alerts, vendor notices and user reports.

## 2. Escalation

1. Record discovery timestamp.
2. Notify the internal technical/security owner immediately.
3. Contain affected credentials, integrations, sessions or infrastructure.
4. Identify affected workspaces, users, records and categories of personal data.
5. Preserve relevant logs and evidence.
6. Determine whether a regulatory/user notification is required.

## 3. Regulatory and User Notification

The checklist calls for a plan to notify the Data Protection Board within 72 hours of confirmed detection and to notify affected Data Principals with the nature of the incident, likely consequences and remediation steps. Regulatory instructions and notification mechanisms must be checked at the time of an incident.

## 4. Incident Record

The `data_breach_incidents` Supabase table stores detection time, severity, affected record count, data categories, root cause, containment, notification timestamps and resolution.

## 5. Post-Incident Review

After containment, document root cause, remediation, affected processors, security changes and a post-breach security review. Update controls and vendor contracts where necessary.

## 6. Ownership

Before production launch, the service operator must designate the incident-response owner and named Grievance Officer and publish required contact details.
