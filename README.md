# AssociaGo
![5.svg](desktop/src/renderer/src/assets/5.svg)


AssociaGo is a comprehensive management software designed for associations, non-profit organizations, and clubs. It provides a robust platform for managing members, finances, events, activities, inventory, and volunteers. The application is built using a modern technology stack, featuring a Spring Boot backend and a React-based frontend wrapped in Electron for a seamless desktop experience.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3). See the LICENSE file for details.

## Copyright

Copyright © 2026 Lorenzo De Marco (Lorenzo DM). All rights reserved.


## Architecture

AssociaGo follows a monolithic architecture with a clear separation between the backend and frontend, packaged together as a desktop application.

### Backend
The backend is built with Java 21 and Spring Boot 3.3.x. It exposes a RESTful API consumed by the frontend.
- **Framework:** Spring Boot (Web, Data JPA, Security, Validation, Actuator)
- **Database:** SQLite (for local deployment) with support for MariaDB/MySQL.
- **Migration:** Flyway is used for database schema version control.
- **Reporting:** Apache PDFBox and Apache POI are used for generating PDF and Excel reports.
- **Logging:** SLF4J with Logback, configured for file and console output with daily rotation.

### Frontend
The frontend is a Single Page Application (SPA) built with React 18.
- **Build Tool:** Vite
- **UI Framework:** Tailwind CSS
- **Routing:** React Router (HashRouter for Electron compatibility)
- **State Management:** React Hooks and Context API (local state) / Zustand (global state where applicable).

### Desktop Wrapper
Electron is used to wrap the React frontend and bundle the Spring Boot backend, providing a native desktop application experience for Linux, Windows, and macOS.
- **IPC:** Inter-Process Communication is used for system-level operations.
- **Splash Screen:** A dedicated splash screen handles the backend startup process before launching the main application window.

## Modules

The application is structured into several core modules, each responsible for a specific domain of association management.

### 1. Member Management
Handles the registration, modification, and deletion of association members.
- **Features:** Personal details, contact information, membership status tracking.

### 2. Financial Management
A double-entry bookkeeping system adapted for associations.
- **Features:** Transaction recording (income/expense), fiscal dashboards, year-over-year comparison, and PDF financial reports with SHA-256 checksums for integrity verification.

### 3. Activity Management
Manages recurring activities such as courses and workshops.
- **Features:** Scheduling, participant registration, cost management.

### 4. Event Management
Handles one-off events like meetings, parties, or fundraisers.
- **Features:** Event planning, participant tracking, public/private status, cost analysis.

### 5. Assembly Management
Facilitates the organization and documentation of general assemblies.
- **Features:** Call for assembly, quorum calculation (first and second call), motion voting, and minutes recording.

### 6. Inventory Management
Tracks the association's physical assets.
- **Features:** Item cataloging, condition tracking, loan management (check-out/check-in).

### 7. Volunteer Management
Manages the volunteer workforce.
- **Features:** Volunteer profiles, skills inventory, availability tracking, and shift scheduling.

### 8. Attendance System
Tracks participation in activities and events.
- **Features:** Session creation, check-in/check-out recording, attendance status (present, absent, excused).

## Technical Setup

### Prerequisites
- Java Development Kit (JDK) 21
- Node.js (v18 or later)
- Gradle

### Build Instructions

1.  **Backend Build:**
    Navigate to the root directory and run:
    ```bash
    ./gradlew build
    ```

2.  **Frontend Build:**
    Navigate to the `desktop` directory and run:
    ```bash
    npm install
    npm run build
    ```

3.  **Run Application (Development):**
    - Start the Spring Boot backend:
      ```bash
      ./gradlew bootRun
      ```
    - In a separate terminal, start the Electron frontend:
      ```bash
      cd desktop
      npm run dev
      ```

## Logging

The application implements a dual-layer logging system:
- **Backend:** Logs are stored in the `logs/` directory. `associago-backend.log` contains general application logs, while `associago-errors.log` captures error-level events. Logs are rotated daily.
- **Frontend:** A custom `Logger` utility outputs structured logs to the browser console. User actions (clicks, navigation) are tracked to assist in debugging.

## Database Schema

The database schema is managed via Flyway migrations located in `src/main/resources/db/migration`. The schema includes tables for:
- `users` / `members`
- `transactions` / `financial_records`
- `activities` / `activity_participants`
- `events` / `event_participants`
- `assemblies` / `assembly_participants` / `assembly_motions`
- `inventory_items` / `inventory_loans`
- `volunteers` / `volunteer_shifts`
- `attendance_sessions` / `attendance_records`
