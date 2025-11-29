---
sidebar_position: 5
sidebar_label: Cluster Analysis & Recommendations
---

# Cluster Analysis & Recommendations

## Overview

This page provides a detailed analysis of the clustering results from our job market data analysis. We examine the quality and purity of different clusters, identify error rates, and provide actionable recommendations for data analysis goals.

## Dataset Context

This analysis is based on a rich dataset derived from job descriptions in both German and English. The clustering algorithm performed well in grouping semantic concepts, though some overlap exists between clusters.

## Part 1: Cluster Analysis & Error Rates

We have analyzed the contents of the clusters to determine their "Purity."

**Definition of Error:** An item that does not fit the dominant theme of the cluster (e.g., a company name appearing in a list of programming languages).

### Category: Technology & Hard Skills (Most Important for Analysis)

| Cluster ID      | Dominant Theme                    | Error Rate (Est.) | Notes                                                                                                                          |
| :-------------- | :-------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **cluster_56**  | **Coding Languages & Frameworks** | **~5%**           | **Gold standard.** Contains Python, Java, React, AWS, etc. Errors are minor (e.g., "clean code" is a concept, not a language). |
| **cluster_67**  | **DevOps & CI/CD**                | **~2%**           | Very clean. Jenkins, Docker, Kubernetes, Git.                                                                                  |
| **cluster_163** | **Databases**                     | **~0%**           | SQL, Oracle, MongoDB, Postgres. Extremely clean.                                                                               |
| **cluster_107** | **Cloud & Infrastructure**        | **~5%**           | AWS, Google Cloud, Azure. Some overlap with general architecture terms.                                                        |
| **cluster_109** | **Data Engineering Stack**        | **~10%**          | Kafka, Spark, Hadoop. Some noise with generic terms like "pipeline".                                                           |
| **cluster_112** | **SAP Ecosystem**                 | **~2%**           | SAP HANA, ABAP, S/4HANA. Very specific.                                                                                        |
| **cluster_189** | **Microsoft/Office Tools**        | **~0%**           | Excel, PowerPoint, Sharepoint, Azure.                                                                                          |
| **cluster_57**  | **General Tools/Software**        | **~15%**          | Mixed bag of "AI tools", "BI tools", and generic "tools". Less specific than cluster_56.                                       |

### Category: Soft Skills & Personal Traits

| Cluster ID      | Dominant Theme               | Error Rate (Est.) | Notes                                                  |
| :-------------- | :--------------------------- | :---------------- | :----------------------------------------------------- |
| **cluster_134** | **Core Soft Skills**         | **~5%**           | Communication, problem-solving, organizational skills. |
| **cluster_171** | **Analytical/Communication** | **~5%**           | Analytical thinking, communication skills.             |
| **cluster_53**  | **Teamwork**                 | **~0%**           | Team player, team spirit.                              |
| **cluster_135** | **Mindset**                  | **~10%**          | "Positive attitude", "Hands-on mentality".             |
| **cluster_193** | **Responsibility/Autonomy**  | **~5%**           | Ownership, self-organized, independent working.        |
| **cluster_8**   | **Customer Focus**           | **~5%**           | Customer centricity, customer journey.                 |

### Category: Education, Certifications & Experience

| Cluster ID      | Dominant Theme              | Error Rate (Est.) | Notes                                                                                                 |
| :-------------- | :-------------------------- | :---------------- | :---------------------------------------------------------------------------------------------------- |
| **cluster_98**  | **University Degrees**      | **~2%**           | Bachelor, Master, PhD, Diploma. Very clean.                                                           |
| **cluster_226** | **Years of Experience**     | **~5%**           | "3 years", "relevant experience". Good for filtering seniority.                                       |
| **cluster_156** | **Acronyms/Mixed Entities** | **~40%**          | **High noise.** Contains Certs (ITIL, CISM) but also Company Names (Zeiss, Siemens). Needs filtering. |
| **cluster_247** | **Compliance/Standards**    | **~10%**          | GDPR, ISO standards. Good for regulatory analysis.                                                    |

### Category: Benefits & Work Culture

| Cluster ID      | Dominant Theme         | Error Rate (Est.) | Notes                                     |
| :-------------- | :--------------------- | :---------------- | :---------------------------------------- |
| **cluster_231** | **Work Models**        | **~5%**           | Hybrid, Remote, Flexible hours.           |
| **cluster_63**  | **Vacation**           | **~0%**           | 30 days, Sabbatical.                      |
| **cluster_52**  | **Office Environment** | **~5%**           | Home office, equipment, ergonomic chairs. |
| **cluster_133** | **Mobility/Transport** | **~5%**           | JobRad, Ticket, Bahncard.                 |
| **cluster_140** | **Salary**             | **~5%**           | Competitive salary, bonus.                |

## Part 2: Recommendation for Data Analysis

To extract the specific insights you mentioned (Languages, Frameworks, Soft Skills, Certifications), you should filter your data using the items found in the following clusters.

**Action:** Create a mapping in your code where you merge these clusters into "Super-Categories."

### 1. The "Tech Stack" Filter (Languages, Frameworks, Tools)

_Use these to find what hard skills are required._

- **Primary:** `cluster_56` (General Tech), `cluster_163` (Databases), `cluster_67` (DevOps).
- **Secondary:** `cluster_107` (Cloud), `cluster_109` (Big Data), `cluster_112` (SAP).
- _Note:_ `cluster_56` is your most valuable cluster here.

### 2. The "Soft Skills" Filter

_Use these to analyze cultural fit and personality requirements._

- **Merge these:** `cluster_134` (General), `cluster_171` (Analytical), `cluster_53` (Teamwork), `cluster_8` (Customer Focus), `cluster_193` (Autonomy).

### 3. The "Qualifications" Filter (Certs & Education)

_Use these to analyze seniority and educational barriers._

- **Education:** `cluster_98` (Degrees).
- **Certifications:** Check `cluster_156` but **be careful**. You must apply a secondary filter to this list because it contains company names. Look for items in this list that are 3-4 letters long and uppercase (e.g., CISM, ITIL, AWS, PMP).
- **Experience:** `cluster_226` (Years of experience) and `cluster_110` (Specific time durations like "5+ years").

### 4. The "Benefits" Filter (Bonus Analysis)

_If you want to analyze what companies are offering._

- **Merge these:** `cluster_231` (Flexibility), `cluster_63` (Time off), `cluster_133` (Transport), `cluster_199` (Sports/Fitness).

## Summary of Clusters to IGNORE (High Noise)

Do not use these for keyword matching as they contain generic words, prepositions, or company names that will skew your data:

- `cluster_212` (Company names and random nouns)
- `cluster_27` (Pronouns like "you", "we")
- `cluster_227` (Generic words like "position", "place")
- `cluster_86` (Generic fillers like "the", "der", "das")
- `cluster_148` (Quantifiers like "a lot", "one")

## Implementation Recommendations

### Code Structure for Filtering

```python
# Example implementation for cluster filtering
class ClusterFilter:
    def __init__(self):
        # Define super-categories based on cluster analysis
        self.tech_stack_clusters = ['cluster_56', 'cluster_163', 'cluster_67']
        self.secondary_tech = ['cluster_107', 'cluster_109', 'cluster_112']

        self.soft_skills_clusters = ['cluster_134', 'cluster_171', 'cluster_53',
                                   'cluster_8', 'cluster_193']

        self.qualifications_clusters = ['cluster_98', 'cluster_226']

    def get_tech_keywords(self, cluster_data):
        """Extract technology-related keywords from primary clusters"""
        tech_keywords = set()
        for cluster_id in self.tech_stack_clusters:
            if cluster_id in cluster_data:
                tech_keywords.update(cluster_data[cluster_id]['keywords'])
        return tech_keywords

    def get_soft_skills_keywords(self, cluster_data):
        """Extract soft skills keywords"""
        soft_keywords = set()
        for cluster_id in self.soft_skills_clusters:
            if cluster_id in cluster_data:
                soft_keywords.update(cluster_data[cluster_id]['keywords'])
        return soft_keywords
```

### Quality Assurance Tips

1. **Always validate cluster content** before using in analysis
2. **Filter out high-noise clusters** from automated processing
3. **Use confidence scores** when applying cluster-based filtering
4. **Regularly audit** cluster quality as new data is added

### Performance Considerations

- **Pre-compute cluster mappings** for faster analysis
- **Cache filtered results** to avoid repeated processing
- **Use set operations** for efficient keyword matching
- **Consider hierarchical filtering** (primary → secondary clusters)
