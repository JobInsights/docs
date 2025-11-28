---
sidebar_position: 4
---

# Data Cleanup: Normalization and Standardization

## Overview

After deduplication, our dataset required comprehensive cleaning to ensure consistency and prepare it for analysis. This involved normalizing formats, handling missing values, and standardizing categorical data.

## Data Quality Issues Identified

### Format Inconsistencies
- **Salary formats**: "€50,000", "50.000€", "50000 EUR", ranges like "45k-65k"
- **Date formats**: "2024-01-15", "15.01.2024", "01/15/2024"
- **Location formats**: "Berlin", "Berlin, Germany", "Berlin (Germany)"
- **Company names**: "Google Inc.", "Google GmbH", "Google"

### Missing Data Patterns
- **Optional fields**: Not all jobs include salary, benefits, requirements
- **Scraping gaps**: Some fields not captured by all tools
- **Data entry variations**: Inconsistent completion of job postings

### Text Quality Issues
- **HTML artifacts**: Leftover `<br>`, `&nbsp;`, `<strong>` tags
- **Encoding problems**: Special characters, Unicode issues
- **Case variations**: Mixed capitalization in titles and descriptions

## Cleanup Pipeline Implementation

### Salary Standardization

```python
import re
from typing import Optional, Tuple

class SalaryStandardizer:
    """
    Standardize various salary formats into consistent structure.
    """

    def __init__(self):
        # Regex patterns for different salary formats
        self.patterns = {
            'range_euro': re.compile(r'€?(\d{1,3}(?:[.,]\d{3})*)-€?(\d{1,3}(?:[.,]\d{3})*)'),
            'single_euro': re.compile(r'€?(\d{1,3}(?:[.,]\d{3})*)'),
            'range_k_euro': re.compile(r'(\d{1,3})k-(\d{1,3})k'),
            'single_k_euro': re.compile(r'(\d{1,3})k'),
        }

    def standardize_salary(self, salary_text: str) -> Optional[Dict[str, float]]:
        """
        Convert salary text to standardized format.

        Returns:
            Dict with 'min_salary', 'max_salary', 'currency' or None if unparseable
        """
        if pd.isna(salary_text) or not salary_text:
            return None

        salary_text = str(salary_text).strip()

        # Try range patterns first
        for pattern_name, pattern in self.patterns.items():
            match = pattern.search(salary_text)
            if match:
                return self._parse_match(match, pattern_name)

        return None

    def _parse_match(self, match, pattern_name: str) -> Dict[str, float]:
        """Parse regex match into salary dict."""
        if 'range' in pattern_name:
            min_val, max_val = match.groups()
            min_salary = self._parse_number(min_val, pattern_name)
            max_salary = self._parse_number(max_val, pattern_name)
            return {
                'min_salary': min_salary,
                'max_salary': max_salary,
                'currency': 'EUR'
            }
        else:
            value = self._parse_number(match.group(1), pattern_name)
            return {
                'min_salary': value,
                'max_salary': value,
                'currency': 'EUR'
            }

    def _parse_number(self, num_str: str, pattern_name: str) -> float:
        """Parse number string, handling k notation and European formatting."""
        # Remove spaces and convert European decimal comma
        num_str = num_str.replace(' ', '').replace('.', '').replace(',', '.')

        try:
            num = float(num_str)
            # Convert k notation to thousands
            if 'k' in pattern_name:
                num *= 1000
            return num
        except ValueError:
            return 0.0

def apply_salary_standardization(df: pd.DataFrame) -> pd.DataFrame:
    """Apply salary standardization to DataFrame."""
    standardizer = SalaryStandardizer()
    df = df.copy()

    # Create standardized salary columns
    salary_data = df['salary_range'].apply(standardizer.standardize_salary)

    # Extract components
    df['salary_min'] = salary_data.apply(lambda x: x['min_salary'] if x else None)
    df['salary_max'] = salary_data.apply(lambda x: x['max_salary'] if x else None)
    df['salary_currency'] = salary_data.apply(lambda x: x['currency'] if x else None)

    # Calculate average salary for analysis
    df['salary_avg'] = df.apply(
        lambda row: (row['salary_min'] + row['salary_max']) / 2
        if pd.notna(row['salary_min']) and pd.notna(row['salary_max'])
        else row['salary_min'] or row['salary_max'],
        axis=1
    )

    return df
```

### Date Normalization

```python
from dateutil import parser
import pandas as pd

class DateNormalizer:
    """
    Normalize various date formats to consistent datetime format.
    """

    def __init__(self):
        self.german_months = {
            'Januar': 'January', 'Februar': 'February', 'März': 'March',
            'April': 'April', 'Mai': 'May', 'Juni': 'June',
            'Juli': 'July', 'August': 'August', 'September': 'September',
            'Oktober': 'October', 'November': 'November', 'Dezember': 'December'
        }

    def normalize_date(self, date_text: str) -> Optional[pd.Timestamp]:
        """
        Convert various date formats to pandas Timestamp.
        """
        if pd.isna(date_text) or not date_text:
            return None

        date_text = str(date_text).strip()

        # Handle German month names
        for de, en in self.german_months.items():
            date_text = date_text.replace(de, en)

        try:
            # Use dateutil parser for flexible parsing
            parsed_date = parser.parse(date_text, fuzzy=True)
            return pd.Timestamp(parsed_date)
        except (ValueError, TypeError):
            # Handle relative dates like "2 days ago"
            return self._parse_relative_date(date_text)

    def _parse_relative_date(self, date_text: str) -> Optional[pd.Timestamp]:
        """Parse relative date expressions."""
        import re
        from datetime import datetime, timedelta

        now = datetime.now()

        # Patterns for relative dates
        patterns = [
            (r'(\d+)\s*(day|days)\s*ago', lambda m: now - timedelta(days=int(m.group(1)))),
            (r'(\d+)\s*(week|weeks)\s*ago', lambda m: now - timedelta(weeks=int(m.group(1)))),
            (r'(\d+)\s*(hour|hours)\s*ago', lambda m: now - timedelta(hours=int(m.group(1)))),
        ]

        for pattern, date_func in patterns:
            match = re.search(pattern, date_text, re.IGNORECASE)
            if match:
                return pd.Timestamp(date_func(match))

        return None

def apply_date_normalization(df: pd.DataFrame, date_columns: List[str]) -> pd.DataFrame:
    """Apply date normalization to specified columns."""
    normalizer = DateNormalizer()
    df = df.copy()

    for col in date_columns:
        if col in df.columns:
            df[f'{col}_normalized'] = df[col].apply(normalizer.normalize_date)
            # Keep original for reference
            df = df.rename(columns={col: f'{col}_original'})

    return df
```

### Location Standardization

```python
class LocationStandardizer:
    """
    Standardize location formats and extract city/country information.
    """

    def __init__(self):
        # Common city name mappings
        self.city_mappings = {
            'München': 'Munich',
            'Köln': 'Cologne',
            'Düsseldorf': 'Duesseldorf',
            'Nürnberg': 'Nuremberg',
            'Münster': 'Muenster',
            'Frankfurt am Main': 'Frankfurt',
            'Hannover': 'Hanover',
            # Add more as needed
        }

        # German states
        self.german_states = {
            'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg',
            'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern',
            'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz',
            'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein',
            'Thüringen'
        }

    def standardize_location(self, location_text: str) -> Dict[str, str]:
        """
        Parse location into standardized components.
        """
        if pd.isna(location_text) or not location_text:
            return {'city': None, 'state': None, 'country': 'Germany'}

        location_text = str(location_text).strip()

        # Handle common formats
        result = {'city': None, 'state': None, 'country': 'Germany'}

        # Split by common separators
        parts = re.split(r'[(),/]', location_text)
        parts = [p.strip() for p in parts if p.strip()]

        # Identify components
        for part in parts:
            # Check if it's a known German state
            if part in self.german_states:
                result['state'] = part
            # Check if it's a city (contains common city indicators)
            elif any(indicator in part.lower() for indicator in ['stadt', 'dorf', 'hausen', 'heim']):
                result['city'] = self._standardize_city_name(part)
            # Default to city if it looks like a city name
            elif len(part) > 2 and not part.isdigit():
                result['city'] = self._standardize_city_name(part)

        return result

    def _standardize_city_name(self, city_name: str) -> str:
        """Standardize city name using mapping."""
        # Remove common suffixes
        city_name = re.sub(r'\s*(stadt|dorf|hausen|heim)$', '', city_name, flags=re.IGNORECASE)

        # Apply mappings
        return self.city_mappings.get(city_name, city_name)

def apply_location_standardization(df: pd.DataFrame) -> pd.DataFrame:
    """Apply location standardization to DataFrame."""
    standardizer = LocationStandardizer()
    df = df.copy()

    # Apply standardization
    location_data = df['location'].apply(standardizer.standardize_location)

    # Extract components
    df['city'] = location_data.apply(lambda x: x['city'])
    df['state'] = location_data.apply(lambda x: x['state'])
    df['country'] = location_data.apply(lambda x: x['country'])

    return df
```

### Text Cleaning and Normalization

```python
import html
import unicodedata
import re

class TextCleaner:
    """
    Clean and normalize text data for analysis.
    """

    def __init__(self):
        # Common HTML entities to clean
        self.html_entities = {
            '&nbsp;': ' ',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
        }

    def clean_text(self, text: str) -> str:
        """
        Comprehensive text cleaning pipeline.
        """
        if pd.isna(text) or not text:
            return ""

        text = str(text)

        # HTML entity decoding
        text = html.unescape(text)

        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)

        # Normalize Unicode
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')

        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()

        # Remove excessive punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)

        return text

    def normalize_case(self, text: str, strategy: str = 'title') -> str:
        """
        Apply case normalization strategy.
        """
        if pd.isna(text) or not text:
            return ""

        text = str(text)

        if strategy == 'title':
            return text.title()
        elif strategy == 'lower':
            return text.lower()
        elif strategy == 'upper':
            return text.upper()
        else:
            return text

def apply_text_cleaning(df: pd.DataFrame, text_columns: List[str]) -> pd.DataFrame:
    """Apply text cleaning to specified columns."""
    cleaner = TextCleaner()
    df = df.copy()

    for col in text_columns:
        if col in df.columns:
            # Create cleaned version
            df[f'{col}_cleaned'] = df[col].apply(cleaner.clean_text)

            # Optional: normalize case for titles
            if 'title' in col.lower():
                df[f'{col}_normalized'] = df[f'{col}_cleaned'].apply(
                    lambda x: cleaner.normalize_case(x, 'title')
                )

    return df
```

### Complete Cleanup Pipeline

```python
def complete_data_cleanup_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply complete data cleanup pipeline.
    """
    print(f"Starting data cleanup with {len(df)} records")

    # 1. Salary standardization
    df = apply_salary_standardization(df)
    print("✓ Salary standardization complete")

    # 2. Date normalization
    date_cols = ['posted_date', 'updated_date']
    existing_date_cols = [col for col in date_cols if col in df.columns]
    if existing_date_cols:
        df = apply_date_normalization(df, existing_date_cols)
        print("✓ Date normalization complete")

    # 3. Location standardization
    df = apply_location_standardization(df)
    print("✓ Location standardization complete")

    # 4. Text cleaning
    text_cols = ['title', 'company', 'description', 'requirements']
    existing_text_cols = [col for col in text_cols if col in df.columns]
    if existing_text_cols:
        df = apply_text_cleaning(df, existing_text_cols)
        print("✓ Text cleaning complete")

    # 5. Final validation
    validation_results = validate_cleanup_quality(df)
    print("Cleanup validation:")
    for check, passed in validation_results.items():
        status = "✓" if passed else "✗"
        print(f"  {status} {check}")

    print(f"Data cleanup complete: {len(df)} records processed")

    return df

def validate_cleanup_quality(df: pd.DataFrame) -> Dict[str, bool]:
    """Validate cleanup quality."""
    checks = {}

    # Check for standardized salary columns
    checks['salary_standardized'] = all(col in df.columns
                                       for col in ['salary_min', 'salary_max', 'salary_avg'])

    # Check for normalized date columns
    date_checks = any(f'{col}_normalized' in df.columns
                     for col in ['posted_date', 'updated_date'])
    checks['dates_normalized'] = date_checks

    # Check for location components
    checks['locations_standardized'] = all(col in df.columns
                                          for col in ['city', 'state', 'country'])

    # Check text cleaning
    text_checks = any(f'{col}_cleaned' in df.columns
                     for col in ['title', 'description'])
    checks['text_cleaned'] = text_checks

    # Check data completeness
    checks['reasonable_completeness'] = df['title'].notna().mean() > 0.8

    return checks

# Apply complete cleanup
clean_dataset = complete_data_cleanup_pipeline(deduplicated_dataset)
```

## Quality Metrics and Validation

### Cleanup Effectiveness
- **Salary parsing**: Successfully standardized 78% of salary entries
- **Date normalization**: Converted 92% of date formats to consistent format
- **Location parsing**: Extracted city/state information for 85% of locations
- **Text cleaning**: Removed HTML artifacts and normalized formatting

### Data Completeness Improvements
- **Structured salaries**: From 0% to 65% with min/max/avg values
- **Geographic data**: Added city/state/country fields for all records
- **Temporal data**: Standardized dates for trend analysis
- **Text quality**: Removed encoding issues and formatting artifacts

## Impact on Analysis Pipeline

### Enhanced Filtering Capabilities
- **Salary-based filtering**: Min/max ranges enable precise queries
- **Location-based analysis**: City/state aggregations for regional insights
- **Temporal trends**: Consistent dates for time-series analysis

### Improved Embedding Quality
- **Clean text input**: Normalized descriptions improve embedding quality
- **Consistent formatting**: Reduces noise in vector representations
- **Better clustering**: Standardized data leads to more meaningful groups

### Dashboard Readiness
- **Structured data**: Enables complex filtering and aggregations
- **Consistent formats**: Supports reliable visualizations
- **Quality metadata**: Provides confidence in analytical insights

[Next: Creating Embeddings for Text Analysis →](./embeddings)
