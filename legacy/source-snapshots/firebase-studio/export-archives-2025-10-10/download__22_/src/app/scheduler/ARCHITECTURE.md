
# Architecture Plan: Advanced Content Scheduler & Auto-Poster

This document outlines the proposed architecture for an advanced content scheduling and auto-posting system. The system is designed to handle a high volume of posts (up to 100 per day) and integrate with multiple social media platforms, leveraging Firebase and Google Cloud for scalability, reliability, and security.

## 1. Core Objectives

- **Scalability**: Reliably schedule and publish up to 100 posts per day.
- **Automation**: Minimize manual intervention from content scheduling to final posting.
- **Flexibility**: Support multiple social media platforms (e.g., Instagram, Facebook, Twitter).
- **Intelligence**: Use generative AI to repurpose and create variations of content from a single source product.
- **Security**: Store sensitive API keys and access tokens securely.
- **Resilience**: Ensure posts are not missed due to transient errors or service downtime.

## 2. Recommended Technology Stack

| Component               | Google Cloud / Firebase Product                                | Purpose                                                                                                   |
| ----------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Database**            | `Firestore`                                                    | Store post schedules, content variations, platform credentials, and post statuses.                        |
| **Scheduling Engine**   | `Cloud Functions for Firebase (2nd Gen)` with `Cloud Scheduler` | A time-triggered (cron) function to check for due posts every minute.                                     |
| **Task Queuing**        | `Cloud Tasks`                                                  | Reliably queue individual posting jobs, manage retries, and control the rate of posting.                  |
| **Posting Engine**      | `Cloud Functions for Firebase (2nd Gen)` (HTTP Trigger)        | An HTTP-triggered function that receives tasks from Cloud Tasks and executes the posting logic.           |
| **Secrets Management**  | `Secret Manager`                                               | Securely store and manage API keys, tokens, and other credentials for social media platforms.             |
| **Content Repurposing** | `Genkit` with `Gemini Models`                                  | Generate unique text, hashtags, and content angles for each post to avoid duplicate content.              |
| **User Interface**      | `Next.js / React` (Existing App)                               | Provide the UI for users to schedule products, connect accounts, and view posting history.                |

## 3. High-Level Architectural Flow

Here is the step-by-step data flow from scheduling to posting:

![Architectural Diagram](https://storage.googleapis.com/gweb-dev-screenshots/firebase-studio/scheduler-architecture.png)

1.  **User Schedules Post (in Next.js App)**
    -   The user selects an "approved" product from the `/products` page.
    -   They choose a date range, frequency (e.g., 5 times a day), and target social platforms.
    -   This action calls a dedicated Genkit flow (`schedulePostsFlow`).

2.  **Content Generation & Scheduling (`schedulePostsFlow`)**
    -   The Genkit flow receives the product details and scheduling parameters.
    -   It uses an AI prompt (Gemini) to generate multiple unique content variations (e.g., different hooks, captions, hashtag sets).
    -   It calculates the exact `scheduledAt` timestamp for each post within the user's defined range.
    -   It writes each post variation as a separate document to a new `/scheduled_posts` collection in Firestore. Each document has a status of `pending`.

3.  **Cron Job Execution (`scheduler-tick` Function)**
    -   A Cloud Scheduler job triggers the `scheduler-tick` Cloud Function every minute.
    -   The function queries Firestore for all documents in `/scheduled_posts` where `status` is `pending` and `scheduledAt` is in the past.

4.  **Task Queuing (`scheduler-tick` to `Cloud Tasks`)**
    -   For each post found, the `scheduler-tick` function creates a new task in a pre-configured Cloud Tasks queue.
    -   The task's payload contains the Firestore document ID of the post.
    -   The target for the task is the URL of our `poster-execute` HTTP Cloud Function.
    -   After creating the task, the function updates the post's status in Firestore to `queued`. This prevents it from being picked up again.

5.  **Post Execution (`poster-execute` Function)**
    -   Cloud Tasks invokes the `poster-execute` HTTP function with the post ID.
    -   The function reads the full post data from Firestore using the ID.
    -   It fetches the required API keys and tokens for the target social platform from **Secret Manager**.
    -   It connects to the social media platform's API and publishes the content.

6.  **Update Status (`poster-execute` to Firestore)**
    -   If the API call is successful, the function updates the post's status in Firestore to `complete`.
    -   If the API call fails, Cloud Tasks' built-in retry mechanism will re-trigger the function later. If it fails permanently, the status is updated to `failed` and an error is logged.

## 4. Why This Architecture is Optimal

-   **Decoupling**: The cron job (`scheduler-tick`) is only responsible for queuing tasks, not for the time-consuming work of posting. This makes the scheduler very fast and reliable. If a social media API is down, it doesn't stop the cron job from scheduling other posts.
-   **Durability**: Cloud Tasks guarantees that a task will be executed at least once. If the `poster-execute` function crashes or times out, Cloud Tasks will automatically retry it according to the configured policy. This ensures no posts are missed.
-   **Rate Limiting**: Cloud Tasks can be configured to control the rate at which it dispatches tasks. This is crucial for respecting the rate limits of social media APIs and preventing account suspension.
-   **Security**: By using Secret Manager, sensitive credentials are never stored in the database or hard-coded in the application. The `poster-execute` function is granted specific IAM permissions to access only the secrets it needs at runtime.
-   **Scalability**: This event-driven architecture scales effortlessly. As the number of posts increases, the system simply creates more tasks in the queue, and Cloud Functions will automatically scale the number of `poster-execute` instances to handle the load.

This architecture provides a professional, enterprise-grade foundation for building a powerful and reliable content scheduling system.
