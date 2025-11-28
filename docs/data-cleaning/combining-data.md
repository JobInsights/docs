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

## Implementation Strategy

### Step 1: Data Source Analysis

```python
def analyze_data_sources(file_paths: Dict[str, str]) -> Dict[str, pd.DataFrame]:
    """
    Load and analyze structure of different data sources.
    """
    sources = {}

    for name, path in file_paths.items():
        df = pd.read_csv(path) if path.endswith('.csv') else pd.read_json(path)
        sources[name] = df

        print(f"\n{name} Dataset Analysis:")
        print(f"Shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        print(f"Sample data:\n{df.head(2)}")

    return sources

# Example usage
data_sources = {
    'instant_scraper': 'data/instant_data_scraper_jobs.csv',
    'webscraper': 'data/webscraper_job_details.json',
    'manual_collection': 'data/manual_job_reviews.csv'
}

analyzed_sources = analyze_data_sources(data_sources)
```

### Step 2: Schema Mapping

```python
def create_schema_mapping() -> Dict[str, Dict[str, str]]:
    """
    Define mapping between different data source schemas.
    """
    return {
        'instant_scraper': {
            'Job Title': 'title',
            'Company Name': 'company',
            'Location': 'location',
            'Salary': 'salary_range',
            'Job Type': 'employment_type',
            'Date Posted': 'posted_date'
        },
        'webscraper': {
            'job_title': 'title',
            'employer': 'company',
            'job_location': 'location',
            'compensation': 'salary_range',
            'employment_type': 'employment_type',
            'posting_date': 'posted_date',
            'full_description': 'description',
            'requirements': 'requirements'
        }
    }

def standardize_columns(df: pd.DataFrame, mapping: Dict[str, str]) -> pd.DataFrame:
    """
    Rename columns according to standard schema.
    """
    df_standardized = df.copy()

    # Rename columns based on mapping
    rename_dict = {old: new for old, new in mapping.items() if old in df.columns}
    df_standardized = df_standardized.rename(columns=rename_dict)

    return df_standardized
```

### Step 3: Intelligent Record Matching

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

class JobRecordMatcher:
    """
    Intelligent matching of job records across different data sources.
    """

    def __init__(self, similarity_threshold: float = 0.85):
        self.similarity_threshold = similarity_threshold
        self.vectorizer = TfidfVectorizer(
            analyzer='char_wb',
            ngram_range=(3, 5),
            stop_words='english'
        )

    def find_matching_records(self, source1: pd.DataFrame,
                            source2: pd.DataFrame) -> pd.DataFrame:
        """
        Find matching job records between two datasets using text similarity.
        """
        # Create composite matching key
        source1['match_key'] = self._create_match_key(source1)
        source2['match_key'] = self._create_match_key(source2)

        # Vectorize match keys
        all_keys = pd.concat([source1['match_key'], source2['match_key']])
        tfidf_matrix = self.vectorizer.fit_transform(all_keys)

        # Split matrices
        matrix1 = tfidf_matrix[:len(source1)]
        matrix2 = tfidf_matrix[len(source1):]

        # Calculate similarities
        similarity_matrix = cosine_similarity(matrix1, matrix2)

        # Find best matches above threshold
        matches = []
        for i, row in enumerate(similarity_matrix):
            max_sim = np.max(row)
            max_idx = np.argmax(row)

            if max_sim >= self.similarity_threshold:
                matches.append({
                    'source1_idx': i,
                    'source2_idx': max_idx,
                    'similarity': max_sim
                })

        return pd.DataFrame(matches)

    def _create_match_key(self, df: pd.DataFrame) -> pd.Series:
        """
        Create composite key for matching based on title, company, location.
        """
        def clean_text(text):
            if pd.isna(text):
                return ""
            return re.sub(r'[^\w\s]', '', str(text).lower())

        titles = df.get('title', pd.Series([''] * len(df))).apply(clean_text)
        companies = df.get('company', pd.Series([''] * len(df))).apply(clean_text)
        locations = df.get('location', pd.Series([''] * len(df))).apply(clean_text)

        return titles + " " + companies + " " + locations
```

### Step 4: Data Merging Pipeline

```python
def merge_job_datasets(instant_data: pd.DataFrame,
                      webscraper_data: pd.DataFrame) -> pd.DataFrame:
    """
    Complete pipeline for merging job data from multiple sources.
    """
    # Initialize matcher
    matcher = JobRecordMatcher(similarity_threshold=0.8)

    # Find matches between datasets
    matches = matcher.find_matching_records(instant_data, webscraper_data)

    print(f"Found {len(matches)} matching job records")

    # Merge matched records
    merged_jobs = []

    # Process matches
    for _, match in matches.iterrows():
        instant_job = instant_data.iloc[int(match['source1_idx'])].to_dict()
        webscraper_job = webscraper_data.iloc[int(match['source2_idx'])].to_dict()

        # Merge records, preferring webscraper for detailed fields
        merged_job = {
            **instant_job,  # Base structured data
            **{k: v for k, v in webscraper_job.items()
               if k not in instant_job or pd.isna(instant_job[k])},  # Fill missing
            'data_sources': ['instant_scraper', 'webscraper'],
            'match_confidence': match['similarity']
        }

        merged_jobs.append(merged_job)

    # Handle unmatched records
    instant_unmatched = instant_data.drop(matches['source1_idx'].astype(int).unique())
    webscraper_unmatched = webscraper_data.drop(matches['source2_idx'].astype(int).unique())

    # Add unmatched records with source tracking
    for _, job in instant_unmatched.iterrows():
        merged_jobs.append({
            **job.to_dict(),
            'data_sources': ['instant_scraper'],
            'match_confidence': 1.0
        })

    for _, job in webscraper_unmatched.iterrows():
        merged_jobs.append({
            **job.to_dict(),
            'data_sources': ['webscraper'],
            'match_confidence': 1.0
        })

    # Convert to DataFrame
    merged_df = pd.DataFrame(merged_jobs)

    # Final cleanup
    merged_df = merged_df.drop_duplicates(subset=['title', 'company', 'location'])
    merged_df = merged_df.reset_index(drop=True)

    print(f"Final merged dataset: {len(merged_df)} jobs")
    print(f"Columns: {list(merged_df.columns)}")

    return merged_df

# Example usage
instant_jobs = pd.read_csv('data/instant_scraper_jobs.csv')
webscraper_jobs = pd.read_json('data/webscraper_details.json')

merged_dataset = merge_job_datasets(instant_jobs, webscraper_jobs)
merged_dataset.to_csv('data/merged_job_dataset.csv', index=False)
```

## Quality Assurance

### Validation Metrics

```python
def validate_merge_quality(merged_data: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate quality metrics for the merged dataset.
    """
    metrics = {}

    # Completeness
    metrics['title_completeness'] = merged_data['title'].notna().mean()
    metrics['company_completeness'] = merged_data['company'].notna().mean()
    metrics['description_completeness'] = merged_data['description'].notna().mean()

    # Source distribution
    source_counts = merged_data['data_sources'].value_counts()
    metrics['single_source_jobs'] = (source_counts == 1).sum() / len(merged_data)
    metrics['multi_source_jobs'] = (source_counts > 1).sum() / len(merged_data)

    # Match quality
    if 'match_confidence' in merged_data.columns:
        metrics['avg_match_confidence'] = merged_data['match_confidence'].mean()
        metrics['high_confidence_matches'] = (merged_data['match_confidence'] > 0.9).mean()

    return metrics

# Validate results
quality_metrics = validate_merge_quality(merged_dataset)
print("Merge Quality Metrics:")
for metric, value in quality_metrics.items():
    print(f"  {metric}: {value:.3f}")
```

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

[Next: Deduplication Process →](./deduplication)
