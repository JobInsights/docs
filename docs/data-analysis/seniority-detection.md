---
id: seniority-detection
title: Seniority & Role Classification
sidebar_label: Seniority Detection
description: Methodology for normalizing unstructured job titles into standardized career levels.
---

# Seniority & Role Classification

## Overview

One of the significant challenges in analyzing job market data is the lack of standardization in job titles. A string like "Senior Marketing Manager" contains two conflicting signals: "Senior" (Experience) and "Manager" (Responsibility).

To ensure accurate analytics, we implemented a **Heuristic Classification Pipeline** within our Python ETL layer. This process normalizes unstructured job titles and contract types into four distinct career levels:

1.  **Entry Level**
2.  **Mid Level**
3.  **Senior Level**
4.  **Management**

## Methodology: The "Hierarchy of Truth"

We utilize a **Weighted Priority System** to resolve ambiguities. Rather than discarding jobs with conflicting signals (e.g., "Senior Intern"), we apply a strict hierarchy where specific signals override others based on business logic.

### Priority 1: Contract Type (The Trump Card)
Legal contract definitions override all title keywords.
*   **Logic:** If a job is listed as `Werkstudent`, `Praktikum`, or `Ausbildung`, it is **Entry Level** regardless of the job title.
*   *Example:* "Director of Coffee Intern" $\rightarrow$ **Entry Level**.

### Priority 2: Management Responsibility
If not a student contract, leadership responsibility overrides individual contributor seniority.
*   **Logic:** Titles containing "Head of", "Director", "VP", or explicit management flags are classified as **Management**.
*   *Example:* "Senior Engineering Manager" $\rightarrow$ **Management** (Manage > Senior).

### Priority 3: Explicit Seniority
High-level individual contributor keywords.
*   **Logic:** Titles containing "Senior", "Lead", "Principal", or "Architect".
*   *Example:* "Senior Data Scientist" $\rightarrow$ **Senior Level**.

### Priority 4: Explicit Entry Level
*   **Logic:** Titles containing "Junior", "Graduate", or "Trainee".
*   *Example:* "Junior Developer" $\rightarrow$ **Entry Level**.

### Priority 5: Mid Level (Default)
Any role that does not match the above criteria is classified as **Mid Level**. This represents the standard professional tier.

---

## Detection Algorithms

The classification is performed during the Python pre-processing stage using `pandas` and Regex. We detect signals across both the `jobType` (Contract) and `title` fields.

### Keyword Dictionaries

| Category | Keywords / Signals |
| :--- | :--- |
| **Student / Intern** | `praktikum`, `student`, `werkstudent`, `trainee`, `ausbildung`, `bachelor`, `master`, `referendariat` |
| **Management** | `head of`, `director`, `vp`, `chief`, `c-level`, `teamlead`, '`leiter` |
| **Senior** | `senior`, `lead`, `principal`, `staff`, `expert`, `architect` |
| **Junior** | `junior`, `entry`, `graduate`, `apprentice` |

:::info Implementation Detail
We deliberately exclude generic terms like "Manager" from the Management detection unless accompanied by specific prefixes (e.g., "Product Manager" is often an Individual Contributor role, whereas "Engineering Manager" implies personnel responsibility).
:::

---

## Ambiguity Analysis & Validation

To validate the accuracy of our pipeline, we track an `is_ambiguous` flag for every job that triggers multiple detection buckets before resolution.

### Statistics
*   **Total Dataset:** 7,906 Jobs
*   **Ambiguous Cases:** 118 Jobs
*   **Conflict Rate:** ~1.5%

### Conflict Resolution Examples
The following table demonstrates how the Hierarchy of Truth resolves real-world edge cases found in our dataset:

| Job Title | Detected Signals | Final Classification | Reasoning |
| :--- | :--- | :--- | :--- |
| **Senior Manager Channel Partnership** | `[SENIOR, MANAGEMENT]` | **MANAGEMENT** | Priority 2 (Mgmt) > Priority 3 (Senior) |
| **Team Lead Machine Learning** | `[SENIOR, MANAGEMENT]` | **MANAGEMENT** | "Team Lead" implies personnel responsibility. |
| **Founders Associate - AI Lead** | `[SENIOR, MANAGEMENT]` | **MANAGEMENT** | Leadership role overrides contributor level. |
| **Senior Intern** (Hypothetical) | `[SENIOR, ENTRY]` | **ENTRY** | Priority 1 (Contract) overrides title. |

## Technical Implementation

By moving this logic to the ETL pipeline (Python) rather than calculating it on the frontend (JavaScript), we achieved:
1.  **Deterministic Data:** The database serves as the single source of truth.
2.  **Performance:** No regex processing is required at runtime; the frontend simply aggregates the `career_level` Enum.
3.  **Data Quality:** We can audit and refine the classification logic centrally without redeploying the application.

```python title="etl/pipeline/classifier.py"
# Simplified logic snippet
if 'ENTRY' in signals:
    return 'ENTRY'       # Contractual status (Werkstudent/Intern)
elif 'MANAGEMENT' in signals:
    return 'MANAGEMENT'  # Responsibility (Head of/Director)
elif 'SENIOR' in signals:
    return 'SENIOR'      # Experience (Senior/Principal)
else:
    return 'MID'         # Default