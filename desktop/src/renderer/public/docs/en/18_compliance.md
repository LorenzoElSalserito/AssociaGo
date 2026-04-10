# 18. Compliance and Audit

The **Audit** section automatically records all sensitive operations performed on the platform, ensuring the complete traceability required by Third Sector (Terzo Settore) regulations.

## 18.1 What Is the Audit Log
The audit log is an immutable record that documents:
- **Who** performed the operation (user).
- **What** was done (action type).
- **When** it occurred (precise timestamp).
- **On which entity** the action was performed (member, transaction, event, etc.).
- **Which values** changed (before/after, when available).

## 18.2 Tracked Operations
The system automatically records the most relevant operations, including:
- Creation, modification, and deletion of members.
- Recording and modification of financial transactions.
- Creation and sending of communications.
- Approval of financial statements.
- Issuance of certificates.
- Changes to association settings.
- Attendance management.

## 18.3 Viewing the Log

### Access
The audit log can be accessed through the system's APIs. Available information includes:

### Available Filters
- **By association**: View only the operations of a specific association.
- **By entity**: Filter by entity type (e.g., "MEMBER", "TRANSACTION") and specific ID.
- **By date**: Select a time range with start and end dates.
- **By user**: Filter the actions of a specific user.

### Pagination
Results are paginated to handle large volumes of data. You can specify:
- **Page**: Current page number.
- **Size**: Number of records per page (default 50).

## 18.4 Operation Count
An endpoint is available to retrieve the total count of recorded operations for an association, useful for dashboards and statistics.

## 18.5 Technical Characteristics
- **Independent transaction**: Each audit entry is written in a separate transaction. Even if the main operation fails, the attempt is still recorded in the log.
- **Immutability**: Audit entries cannot be modified or deleted.
- **Indexing**: The log is indexed by association, entity, user, and date to ensure fast searches.

## 18.6 Importance for the Third Sector (Terzo Settore)
Operation traceability is a fundamental requirement for:
- **Legal audit**: Entities with revenue above certain thresholds are subject to audit.
- **Tax inspections**: The Revenue Agency (Agenzia delle Entrate) may request detailed documentation.
- **Transparency**: Members have the right to access association documents.
- **GDPR compliance**: The log documents who performed operations on personal data.

> **Note**: The audit log is an internal security feature. Access to the log should be limited to association administrators and auditors.
