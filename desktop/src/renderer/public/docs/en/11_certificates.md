# 11. Certificates and Attestations

The **Certificates** page has two tabs: **Templates** and **Issued**. At the top you find the **New Template** and **Issue Certificate** buttons.

## 11.1 Templates

For each template the table shows name, type, layout (orientation / size) and status **Active** or **Inactive**. The actions are the **pencil** icon (edit) and the **trash** icon (delete, after the **Are you sure?** confirmation).

> If the template has already been used to issue certificates, deletion fails and a database error message appears. There is no dedicated warning.

## 11.2 Creating a template

Press **New Template**. On the left there are four tabs, on the right the **Preview**.

### General
- **Name** (required: without a name **Create** stays disabled). It also becomes the certificate title.
- **Type**: Participation, Attendance, Training, Membership or Custom.
- **Active**: toggle.

> The **Active** status is informational only: inactive templates also appear when issuing and can be used.

### Body
Write the text in **Body Template**. The buttons above the field insert a dynamic field at the cursor position:

| Field | Replaced with |
|-------|----------------------|
| `{{firstName}}`, `{{lastName}}` | recipient's first and last name |
| `{{fiscalCode}}` | recipient's fiscal code |
| `{{associationName}}` | association name |
| `{{date}}` | issue date |
| `{{activityName}}`, `{{activityCategory}}` | activity name and category (activity issuing only) |
| `{{eventName}}`, `{{eventType}}` | event name and type, as an internal code (event issuing only) |

Activity and event fields stay as literal text if the certificate is not issued from an activity or an event. In the PDF the body becomes plain text: any HTML tags are removed.

### Layout
- **Orientation**: **Landscape** or **Portrait**.
- **Paper Size**: A4, A3 or Letter.

> The paper size is saved but not used: the PDF is always A4, in the chosen orientation.

### Signatories
Tick the **Signatory Roles**: President (preselected), Secretary, Treasurer. In the PDF each role has a signature block with the image, name and office taken from **Settings › Signatures** (chapter 16); if there is no saved signature for a role, the name from the **Organization Chart** (**Settings › Association Profile**) appears above a blank line.

### Preview
Shows the title, the body with sample data (e.g. "Mario Rossi") and a signature line for each ticked role. It follows the chosen orientation.

Press **Create** (or **Save** when editing).

## 11.3 Issuing certificates

Press **Issue Certificate** and choose the **Template**.

### To a member
1. In **Member** choose a name from the association's member list.
2. Press **Issue**.

### To all participants
Under **Or issue in batch for all participants:**
- choose an **Activity** and press **Batch Issue for Activity**: active participants enrolled as members receive the certificate;
- or choose an **Event** and press **Batch Issue for Event**: participants registered as members receive the certificate; guests are skipped.

The buttons only appear after you choose a template and an activity or event. You can also batch-issue from the **Certificates** tab of an activity (chapter 3).

> There is no duplicate check: if you repeat the issue, each recipient receives a new certificate.

Each certificate gets a sequential number in the format **CERT-YEAR-NNNN**. The text and title are frozen at the time of issue: changing the template afterwards does not change certificates already issued. Signatures, instead, are read on every download, according to the template's roles.

## 11.4 Issued certificates and PDF

The **Issued** tab (with the counter) lists **Certificate** (number), **Recipient** (member name) and **Issued At**. The **download** icon downloads the PDF (A4, with number and date in the interface language), which contains:
- title (template name), number and issue date;
- body with the data filled in;
- a signature block for each signatory role (image, name and office);
- a QR code in the bottom right with number, association and date.

> On each download a SHA-256 checksum of the PDF is calculated and saved, but it is not printed on the document or shown in the interface.
