# 15. Communications

The **Communications** section allows you to send institutional emails to members, manage predefined templates, and track delivery status.

## 15.1 Overview
The page is divided into two tabs:
- **Messages**: The list of communications created and sent.
- **Templates**: Reusable templates to speed up message creation.

## 15.2 Template Management

### Creating a Template
1. From the **Templates** tab, click **"New Template"**.
2. Fill in:
   - **Name**: Identifying name (e.g., "Assembly Convocation").
   - **Subject**: The email subject line.
   - **HTML Body**: The message text.
   - **Text Body**: Plain text version (for email clients that do not support HTML).
   - **Category**: General, Renewal, Event, Activity, Assembly, Fiscal.
3. Use **merge fields** in the text:
   - `{{name}}` — Recipient's full name.
   - `{{associationName}}` — Association name.
4. Click **"Save"**.

### Applying a Template
When creating a new message, you can select a template from the dropdown menu. The subject and body will be pre-filled with the template data.

## 15.3 Creating and Sending Messages

### Creating a Message
1. From the **Messages** tab, click **"New Message"**.
2. Fill in:
   - **Subject**: The email subject line.
   - **Body**: The message content.
   - **Recipient filter**: Filter members by status (e.g., Active only).
3. Click **"Save as Draft"** or proceed to send.

### Resolving Recipients
Before sending, click **"Resolve Recipients"** to:
- View the complete list of members who will receive the message.
- Verify email addresses.
- Check the total number of recipients.

### Sending
1. Click **"Send"**.
2. The system sends the emails through the SMTP server configured in the settings.
3. The status changes from **Draft** to **Sending** and then to **Sent**.

## 15.4 Delivery Statistics
For each sent message, the detail view shows:
- **Total recipients**: Number of emails sent.
- **Delivered**: Emails successfully delivered.
- **Failed**: Emails not delivered (with error details).
- **Send date**: Timestamp of the send operation.

## 15.5 Message Statuses
| Status | Meaning |
|--------|---------|
| Draft | Message saved but not yet sent. |
| Sending | Send in progress. |
| Sent | All messages have been processed. |
| Failed | The send encountered errors. |

> **Note**: To use email communications, you need to configure an SMTP server in the application settings (environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
