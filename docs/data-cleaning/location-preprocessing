---
sidebar_position: 5
---

# Location Normalization & Geocoding Pipeline

This pipeline separates **job data** from **location data**, normalizes free-text location fields, enriches them using **OpenStreetMap (Nominatim)**, and produces a **relational, analysis-ready location model**.

It is designed for dashboards, geospatial analysis, and large-scale job market analytics.

---

## Overview

**Input**
- CSV file containing job postings with free-text locations (`jobs-final.csv`)

**Output**
- `jobs-final.csv` – jobs without location free text
- `location.csv` – normalized, hierarchical location table
- `job_location.csv` – many-to-many job ↔ location mapping
- `location_cache.json` – persistent geocoding cache

---

## Key Features

- ✅ Separation of job and location data
- ✅ Support for **multiple locations per job**
- ✅ Detection of **remote / hybrid / nationwide** jobs
- ✅ OpenStreetMap geocoding with **rate limiting**
- ✅ Persistent, migration-safe geocoding cache
- ✅ Hierarchical location model (Country → State → City)
- ✅ Deduplicated many-to-many relations
