---
sidebar_position: 2
---

# Combining Multiple Scrapes: Data Integration Strategy

## Challenge Overview

Our data collection process generated multiple separate datasets that needed to be intelligently combined for comprehensive analysis:

- **Instant Data Scraper**: Structured CSV with job titles, companies, locations, salaries
- **WebScraper.io**: JSON/CSV with detailed job descriptions and metadata
- **Format variations**: Different column names, data types, and structures

## Integration Requirements

### Data Alignment Goals

- **Complete job profiles**: Combine structured metadata with detailed descriptions
- **Consistent schema**: Unified data structure across all jobs
- **Relationship preservation**: Maintain connections between related data points
- **Quality assurance**: Validate data integrity during merging

### Technical Challenges

- **Key matching**: Identifying corresponding records across datasets
- **Field mapping**: Translating between different column naming conventions
- **Data type harmonization**: Converting between string, numeric, and date formats
- **Conflict resolution**: Handling discrepancies between data sources

## Methodology: Intelligent Data Integration

### Multi-Source Data Architecture

Our data collection generated complementary datasets that required sophisticated merging:

- **Instant Data Scraper**: Structured tabular data (titles, companies, salaries, metadata)
- **WebScraper.io**: Rich textual content (detailed descriptions, requirements, benefits)
- **Manual collections**: Specialized datasets for specific job categories

### Integration Strategy

| Integration Method   | Use Case              | Complexity         | Reliability | Our Choice     |
| -------------------- | --------------------- | ------------------ | ----------- | -------------- |
| **Exact Matching**   | Identical records     | ✅ Simple          | ⚠️ Limited  | ❌ Primary     |
| **Key-Based Join**   | Clean keys available  | ✅ Straightforward | ⚠️ Brittle  | ❌ Primary     |
| **Fuzzy Similarity** | Text-based matching   | ⚠️ Complex         | ✅ Robust   | ✅ **Primary** |
| **Rule-Based Merge** | Domain-specific logic | ⚠️ Maintenance     | ✅ Accurate | ✅ Secondary   |

## Technical Implementation

The data combination pipeline is implemented in the ETL layer:

- **Combined Jobs Builder**: `https://github.com/JobInsights/etl-pipeline/steps/98.%20Data%20Combined/build_combined_jobs_file.py`

### Intelligent Record Matching

#### TF-IDF Similarity Approach

- **Character n-grams**: 3-5 character sequences for robust matching
- **Composite keys**: Title + Company + Location combinations
- **Similarity threshold**: 0.85 confidence for automated merging
- **Manual review**: Edge cases with 0.7-0.85 similarity scores

#### Matching Quality Metrics

| Similarity Range | Match Type      | Review Required  | Automation Rate |
| ---------------- | --------------- | ---------------- | --------------- |
| **0.95+**        | High confidence | ❌ No            | ✅ Auto-merge   |
| **0.85-0.95**    | Good match      | ⚠️ Spot check    | ✅ Auto-merge   |
| **0.70-0.85**    | Possible match  | ✅ Manual review | ⚠️ Queue        |
| **&lt;0.70**        | Different jobs  | ❌ No            | ✅ Separate     |

## Schema Harmonization

### Field Mapping Strategy

| Source Field                | Target Field  | Priority | Merge Logic                 |
| --------------------------- | ------------- | -------- | --------------------------- |
| `Job Title` / `job_title`   | `title`       | Highest  | Prefer longer/more specific |
| `Company Name` / `employer` | `company`     | Highest  | Standardization required    |
| `Location` / `job_location` | `location`    | High     | Geocoding normalization     |
| `full_description`          | `description` | High     | Only from WebScraper.io     |
| `compensation`              | `salary`      | Medium   | Format standardization      |
| `employment_type`           | `jobType`     | Medium   | Category normalization      |

### Data Type Harmonization

- **Salary formats**: "€50,000-€70,000", "50000-70000 EUR", "Competitive" → structured ranges
- **Date formats**: Multiple international formats → ISO 8601 standard
- **Location formats**: "München", "Munich", "Muenchen" → consistent naming
- **Employment types**: "Vollzeit", "Full-time", "Full time" → standardized categories

## Quality Assurance Framework

### Validation Metrics

| Quality Dimension | Target | Measurement            | Action                  |
| ----------------- | ------ | ---------------------- | ----------------------- |
| **Completeness**  | 95%+   | Non-null ratios        | Flag incomplete records |
| **Accuracy**      | 98%+   | Manual spot checks     | Correct mapping errors  |
| **Consistency**   | 100%   | Cross-field validation | Standardize formats     |
| **Uniqueness**    | 95%+   | Duplicate detection    | Merge/remove duplicates |

### Source Attribution

- **Data source tracking**: Every record tagged with contributing sources
- **Match confidence scores**: Similarity scores for merged records
- **Audit trail**: Complete history of merge decisions
- **Fallback handling**: Graceful degradation for unmatched records

## Results & Impact

### Dataset Statistics

- **Total jobs**: 8,500+ unique job postings
- **Matched records**: 6,200 jobs with both structured and detailed data
- **Single-source jobs**: 2,300 jobs from individual scrapers
- **Match accuracy**: 92% average confidence score

### Data Completeness Improvements

- **Job descriptions**: 85% coverage (up from 0% in structured-only data)
- **Detailed requirements**: 78% coverage for skill requirements
- **Company benefits**: 65% coverage for workplace information

### Analysis Enablement

- **Text analysis foundation**: Complete descriptions for NLP processing
- **Clustering readiness**: Rich textual data for embedding generation
- **Dashboard capabilities**: Comprehensive data for filtering and visualization

## Challenges Overcome

### Fuzzy Matching Complexity

- **Text variations**: Handled different capitalizations, abbreviations, special characters
- **Location formats**: Standardized "München", "Munich", "Muenchen" to consistent format
- **Company name variations**: Matched "Google Inc." with "Google" and "Google LLC"

### Data Type Harmonization

- **Salary formats**: Converted "€50,000 - €70,000" and "50000-70000 EUR" to structured ranges
- **Date standardization**: Unified various date formats (DD/MM/YYYY, MM-DD-YY, etc.)
- **Employment types**: Normalized "Vollzeit", "Full-time", "Full time" to standard categories

### Performance Optimization

- **Efficient matching**: Used TF-IDF vectorization for scalable similarity computation
- **Memory management**: Processed large datasets in chunks
- **Parallel processing**: Distributed matching across multiple CPU cores
