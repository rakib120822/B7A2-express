# DevPulse Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions efficiently. 

**Live URL:** [https://your-live-project-url.com](https://your-live-project-url.com) *(Replace with your actual deployment link)*

---

## 🚀 Features

* **User Authentication & Authorization:** Secure registration and login handling utilizing JWT and password hashing.
* **Role-Based Access Control:** Separate logic for `contributor` and admin/team roles to manage visibility and editing rights.
* **Issue Reporting:** Full CRUD capabilities for tracking technical bugs and incoming feature requests.
* **Dynamic Sorting & Filtering:** Easily retrieve issues filtered by `status` or `type`, sorted chronologically or alphabetically.
* **Input Sanitization & Validation:** Ensures robust application-level validation rules (e.g., minimum character length requirements).

---

## 🛠️ Tech Stack

* **Backend Framework:** Node.js with Express (v5.2.1)
* **Language:** TypeScript
* **Database:** PostgreSQL (via `pg` driver)
* **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
* **Development Tools:** `tsx` (TypeScript Execute watch mode), `dotenv`

---

## 📋 Database Schema Summary

The relational PostgreSQL database contains two main entities, maintaining implicit application-level references:

### 1. `users` Table
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(50) | NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL |
| `role` | VARCHAR(20) | DEFAULT 'contributor' |
| `create_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

### 2. `issues` Table
| Column | Type | Constraints |
| :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(150) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `type` | VARCHAR(20) | NOT NULL (`bug`, `feature_request`) |
| `status` | VARCHAR(20) | DEFAULT 'open' (`open`, `in_progress`, `resolved`) |
| `reported_id` | INT | NOT NULL (References `users.id`) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | DEFAULT NOW() |

---

## 🗺️ API Endpoints Summary

### Authentication Routes
* `POST /api/auth/register` - Register a new user account.
* `POST /api/auth/login` - Authenticate user and issue authorization token.

### Issue Tracker Routes
* `POST /api/issues` - Create a new bug report or feature request.
* `GET /api/issues` - Get all filtered and sorted issues.
    * *Query Parameters:* `?status=open&type=bug&sortBy=created_at&sortOrder=desc`
* `GET /api/issues/:id` - Fetch single issue details.
* `PUT /api/issues/:id` - Update issue criteria (Title, description, type, status).
* `DELETE /api/issues/:id` - Delete an entry from the tracking cycle.

---

## 💻 Setup & Installation Steps

Follow these instructions to set up the project locally on your machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/devpulse-tracker.git](https://github.com/your-username/devpulse-tracker.git)
cd devpulse-tracker
