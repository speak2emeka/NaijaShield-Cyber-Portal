# Admin Portal Wireframes

## Shared Shell

```text
+---------------------------------------------------------------+
| Sidebar                  | Topbar: portal, user, theme, logout |
| - Dashboard              +-------------------------------------+
| - Clients                | Page title + primary actions        |
| - Tickets                |                                     |
| - Requests               | Main content grid                   |
| - Reports Upload         |                                     |
| - Staff                  | Tables, cards, detail drawers       |
| - Security Events        |                                     |
| - Attack Lab             |                                     |
| - Billing                |                                     |
| - Audit Logs             |                                     |
+---------------------------------------------------------------+
```

## 1. Admin Dashboard

```text
+ Metrics Row --------------------------------------------------+
| Clients | Active Subs | Trials | Open Tickets | SLA | Requests |
+ Security Posture --------+ Security Events ------+ Attack Lab --+
| Average score             | Last 24h events       | Runs         |
| High-risk clients         | Severity distribution | Readiness    |
+ System Health ------------------------------------------------+
| API latency | Error rate | DB | Queue | Storage usage          |
+ Recent Activity ----------------------------------------------+
| Audit stream with user, action, entity, timestamp              |
```

## 2. Security Events / Mini-SIEM

```text
+ Filters ------------------------------------------------------+
| Search | Client | Severity | Type | Source | Date range | CSV  |
+ Analytics ----------------------------------------------------+
| Visible events | Severity buckets | Correlations               |
+ Event Table --------------------------------------------------+
| Client | Type | Severity | Source | Message | Date              |
+ Detail Drawer -----------------------------------------------+
| Event JSON, metadata, correlation ID, IP/device/session clues  |
```

## 3. Attack Lab Admin

```text
+ Safety Banner ------------------------------------------------+
| Synthetic only. No payloads, exploit code, scans, or attacks. |
+ Stats --------------------------------------------------------+
| Scenarios | Runs | Phases | Mode: Safe                         |
+ Scenario Form -----------------------------------------------+
| Title | Category | Difficulty | Defensive description | Create   |
+ Scenario Table ----------------------------------------------+
| Scenario | Category | Difficulty | Run count                         |
+ Run Replay ---------------------------------------------------+
| Client | Scenario | Outcome | Score | Date                         |
+ Timeline Drawer ---------------------------------------------+
| Phase markers with synthetic event descriptions                |
```

## 4. Billing Management

```text
+ Stats --------------------------------------------------------+
| Subscriptions | Active | Trials | Invoices                     |
+ Subscription Table -------------------------------------------+
| Client | Plan | Status | Interval | Renewal | Actions          |
| Actions: change plan, cancel/reactivate                        |
+ Invoice Table ------------------------------------------------+
| Subscription | Amount | Currency | Status | Date | Retry        |
```
