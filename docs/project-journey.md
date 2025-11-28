---
sidebar_position: 2
---

# Project Journey: From Concept to Interactive Dashboard

## Overview

This page provides a high-level overview of the complete **Job Market Insights** project journey. The project evolved through multiple phases, from initial brainstorming and data collection challenges to advanced analysis and interactive visualization.

## Project Process Flow

```mermaid
flowchart TD
    A[Brainstorming Phase] --> B{Topic Selection}
    B --> C[News Media Biases]
    B --> D[Job Market Analysis]
    D --> E[Selected: Job Market<br/>for Data Science]

    E --> F[Initial Data Collection<br/>Stepstone Attempt]
    F --> G[Cloudflare Challenges<br/>IP Blocking]
    G --> H[Attempted Solutions<br/>Proxies & VPNs]
    H --> I[Challenges Too Complex<br/>Not Automatable]

    I --> J[Switch to Indeed<br/>No Anti-Bot Detection]
    J --> K[Multiple Scraping Approaches]
    K --> L[Instant Data Scraper<br/>Fast Table Data]
    K --> M[WebScraper.io<br/>Full Descriptions]

    M --> N[Data Preprocessing Pipeline]
    N --> O[Combine Multiple Scrapes<br/>Titles, Pay, Parameters]
    O --> P[Deduplication &<br/>Data Cleanup]

    P --> Q[Text Analysis & Embeddings]
    Q --> R[725-Dimensional Embeddings<br/>for Job Descriptions]
    R --> S[K-means Clustering<br/>Identify Skill Groups]

    S --> T[Keyword Extraction<br/>& Tagging]
    T --> U[Database Storage<br/>Complex Data Structure]

    U --> V[Interactive Dashboard<br/>Next.js Implementation]
    V --> W[t-SNE Visualization<br/>725D → 2D/3D]
    W --> X[Filtering & Exploration<br/>Skills Overview]

    style E fill:#e1f5fe
    style J fill:#e8f5e8
    style V fill:#fff3e0
```

## Phase Breakdown

### 1. Brainstorming & Topic Selection
- **Initial ideas**: News media biases vs. Job market analysis for data science
- **Decision factor**: Relevance to students' lives and career planning
- **Selected topic**: Job market analysis for data science degrees

### 2. Data Collection Challenges
- **Initial attempt**: Stepstone scraping
- **Challenges encountered**:
  - Cloudflare captcha every 10 job posts
  - IP blocking after limited requests
  - Proxy/VPN solutions too complex and costly
- **Solution**: Switch to Indeed (no anti-bot detection)

### 3. Multi-Tool Scraping Approach
- **Instant Data Scraper**: Fast collection of job names, companies, locations, pay
- **WebScraper.io**: Comprehensive job description scraping
- **Rationale**: Balance speed vs. depth, strategic tool usage

### 4. Data Preprocessing Pipeline
- **Data integration**: Combine multiple scrapes (titles, pay, industry parameters)
- **Quality assurance**: Deduplication and cleanup processes
- **Foundation**: Prepare clean dataset for advanced analysis

### 5. Advanced Text Analysis
- **Embeddings**: 725-dimensional vector representations of job descriptions
- **Clustering**: K-means algorithm to identify skill-based job groups
- **Keyword extraction**: Automated tagging from cluster analysis

### 6. Data Architecture
- **Database storage**: Handle complex, timestamped, multi-layer keyword data
- **Scalability**: Support for growing dataset and analysis requirements

### 7. Interactive Visualization
- **Next.js dashboard**: Fullstack web application with public deployment
- **t-SNE visualization**: Dimensionality reduction for embedding exploration
- **Filtering system**: Degree requirements, pay ranges, job types, locations

## Key Technical Decisions

### Why Multiple Scraping Tools?
- **Speed vs. Depth**: Instant Data Scraper for bulk data, WebScraper.io for details
- **Academic integrity**: Demonstrated Python knowledge while using appropriate tools
- **Practical constraints**: Balance between automation and reliability

### Why 725-Dimensional Embeddings?
- **Rich representation**: Capture semantic meaning beyond simple keywords
- **Clustering effectiveness**: Sufficient dimensionality for meaningful groupings
- **Analysis capability**: Support complex pattern recognition in job descriptions

### Why t-SNE for Visualization?
- **Dimensionality reduction**: Transform 725D embeddings to 2D/3D for visualization
- **Non-linear relationships**: Preserve local structure in high-dimensional space
- **Interactive exploration**: Enable users to navigate job market clusters

## Detailed Documentation Sections

Explore each phase in detail:

- **[Data Collection](./data-collection/intro)**: Technical challenges and solutions
- **[Data Cleaning](./data-cleaning/intro)**: Preprocessing and analysis pipeline
- **[Data Presentation](./data-presentation/intro)**: Dashboard and visualization features
- **[Limitations](./conclusion/limitations)**: Project constraints and future improvements

## Project Outcomes

The journey resulted in a comprehensive job market analysis tool that provides:
- Real-time insights into data science career opportunities
- Interactive exploration of skill requirements and salary ranges
- Practical experience with modern data science workflows
- Demonstrated ability to overcome technical challenges in web scraping and analysis
