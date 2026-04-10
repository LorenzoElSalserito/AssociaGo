# 17. Notifications

The AssociaGo **Notifications** system provides real-time updates about important association events.

## 17.1 Notification Bell
In the page header, next to the user profile, there is a **bell** icon:
- A **red badge** with a number indicates unread notifications.
- Clicking the bell opens the notifications panel.

## 17.2 Notifications Panel
The panel shows the list of notifications ordered from most recent:

For each notification, the following is displayed:
- **Title**: Brief description of the event.
- **Message**: Additional details.
- **Date and Time**: When the notification was generated.
- **Status**: Read (grayed out) or Unread (highlighted).

### Available Actions
- **Mark as read**: Click on an individual notification to mark it as read.
- **Mark all as read**: Button at the top of the panel to mark all notifications as read in a single action.

## 17.3 Notification Types
The system generates automatic notifications for various events:

| Type | Description |
|------|-------------|
| **INFO** | General information (e.g., "New member registered"). |
| **WARNING** | Warnings requiring attention (e.g., "Membership cards expiring"). |
| **ALERT** | Urgent situations (e.g., "Upcoming tax deadline"). |
| **REMINDER** | Scheduled reminders (e.g., "Assembly tomorrow"). |

## 17.4 Automatic Refresh
Notifications are automatically refreshed every **30 seconds** without the need to reload the page. The badge on the bell updates in real time.

## 17.5 Linked Notifications
Some notifications are linked to specific entities (member, event, activity). The system records the type and ID of the related entity to facilitate direct navigation to the notification's context.

> **Note**: Notifications are generated automatically by the system in response to actions and deadlines. It is not currently possible to create manual notifications.
