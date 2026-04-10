# 11. Certificates and Attestations

The **Certificates** section allows you to create customizable templates and issue certificates for members, activity participants, and event participants.

## 11.1 Overview

The page is divided into two main tabs:
- **Templates**: The templates from which certificates are generated.
- **Issued**: The list of all certificates already generated, with the option to download them as PDF.

## 11.2 Template Management

### Creating a New Template
Click **"New Template"** to open the creation dialog. The dialog is organized into four sections:

#### General
- **Name**: The identifying name of the template (e.g., "Basic Course Participation Certificate").
- **Type**: Select the type from:
  - *Participation* — for those who participated in an activity or event.
  - *Attendance* — for those who completed a course with minimum attendance.
  - *Training* — for training courses with certification.
  - *Membership* — certificate of association membership.
  - *Custom* — free format for specific needs.
- **Active**: Toggle to enable/disable the template. Only active templates can be used for issuance.

#### Body
This is where you write the certificate text. A row of **dynamic field buttons** allows you to insert placeholders that will be automatically replaced with actual data:

| Field | Description |
|-------|-------------|
| `{{firstName}}` | Member's first name |
| `{{lastName}}` | Member's last name |
| `{{fiscalCode}}` | Tax identification number |
| `{{associationName}}` | Association name |
| `{{date}}` | Issue date |
| `{{activityName}}` | Linked activity name |
| `{{activityCategory}}` | Activity category |
| `{{eventName}}` | Linked event name |
| `{{eventType}}` | Event type |

Click a button to insert the field at the current cursor position in the text.

#### Page Layout
- **Orientation**: Horizontal (landscape) or Vertical (portrait).
- **Paper Size**: A4, A3, or Letter.

#### Signatories
Select which institutional officers should sign the certificate:
- President
- Secretary
- Treasurer

The signatures will be placed at the bottom of the generated PDF certificate, automatically pulling the signature images configured in Settings > Signatures.

### Real-Time Preview
On the right side of the dialog, a **preview panel** shows how the certificate will look. Dynamic fields are replaced with sample data (e.g., "Mario Rossi") to give an idea of the final result. The preview also reflects the orientation and active/inactive status.

### Editing a Template
Click the **pencil** icon on the template row to open the dialog with all data pre-filled.

### Deleting a Template
Click the **trash** icon. Confirmation will be requested before deletion. Templates with already issued certificates cannot be deleted.

## 11.3 Issuing Certificates

### Single Issuance
1. Click **"Issue Certificate"**.
2. Select the **template** from the dropdown menu.
3. Enter the **member ID** of the recipient.
4. Click **"Issue"**.

The system generates a certificate with a unique number (format: CERT-YEAR-NNNN) and associates it with the member.

### Batch Issuance
To issue certificates to all participants of an activity or event:
1. Select the template.
2. In the lower section, choose an **activity** or an **event** from the dropdown menu.
3. Click **"Batch issue for Activity"** or **"Batch issue for Event"**.

All active participants will receive a certificate.

## 11.4 PDF Download
In the **Issued** tab, each certificate has a **download** button. The generated PDF includes:
- Certificate title and body with filled-in data.
- Unique certificate number.
- Issue date.
- Institutional signatures.
- SHA-256 checksum for authenticity verification.
