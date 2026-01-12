---
sidebar_position: 5
---

# Data Inconsistencies: Quality Issues & Known Problems

## Overview

Despite comprehensive data cleaning and standardization efforts, several significant inconsistencies remain in our dataset. These issues affect data reliability and require special handling in analysis and filtering logic.

## Work Arrangement Filtering Inconsistency

### The "Homeoffice Möglich" Problem

**Issue Description:**

- Over 4,000 jobs contain "homeoffice möglich" (home office possible) in their work arrangement field
- However, these jobs are not captured by the standard home office filter
- This creates a significant gap in remote work analysis

### Root Cause Analysis

| Potential Cause              | Likelihood | Impact | Mitigation          |
| ---------------------------- | ---------- | ------ | ------------------- |
| **Text parsing issues**      | Medium     | High   | Regex improvements  |
| **Field mapping errors**     | Low        | High   | Field validation    |
| **Scraping inconsistencies** | High       | Medium | Source verification |
| **Business logic gaps**      | High       | High   | Filter expansion    |

### Affected Data Scope

- **Total jobs with work arrangement text**: 8,200+
- **Jobs containing "homeoffice möglich"**: 4,200+
- **Jobs captured by home office filter**: 3,800
- **Missing jobs**: ~400 (approximately 10% of potential remote jobs)

### Example Cases

**Jobs that should be included but aren't:**

```
Work Arrangement: "Homeoffice möglich, flexible Arbeitszeiten"
→ Not captured by filter

Work Arrangement: "Teilweise Home-Office möglich"
→ Not captured by filter

Work Arrangement: "Vollzeit, Homeoffice nach Absprache"
→ Not captured by filter
```

**Jobs that are correctly included:**

```
Work Arrangement: "Home-Office"
→ Correctly captured

Work Arrangement: "Remote work"
→ Correctly captured
```

## Category Classification Issues

### Ambiguous Seniority Levels

**Problem:** Jobs with conflicting seniority signals that bypass our hierarchy rules.

| Title                       | Detected Signals    | Assigned Level | Issue            |
| --------------------------- | ------------------- | -------------- | ---------------- |
| "Senior Manager Digital"    | Senior + Management | Management     | Correct          |
| "Junior Team Lead"          | Junior + Management | Management     | Incorrect        |
| "Principal Engineer Intern" | Senior + Entry      | Entry          | May be incorrect |

### Industry-Specific Terminology

**Issue:** Domain-specific terms that don't match our keyword dictionaries.

- **Finance:** "AVP" (Assistant Vice President) not recognized as senior level
- **Consulting:** "Manager" often means senior individual contributor, not management
- **Tech:** "Staff Engineer" seniority varies significantly by company

## Salary Data Quality Issues

### Format Parsing Edge Cases

**Unparseable salary formats:**

- "Competitive" (too vague)
- "Marktgerecht" (market rate in German)
- "VHB" (very good benefits - German abbreviation)
- Ranges with non-numeric components: "45k-65k plus bonus"

### Currency and Period Issues

**Ambiguous salary information:**

- "€50,000 p.a." vs "€50 per hour"
- Mixed currencies in single fields
- Annual vs monthly specifications
- Gross vs net salary confusion

## Location Data Inconsistencies

### Geographic Ambiguities

**Multi-location jobs:**

- "Berlin/Munich" - single field contains multiple cities
- "Germany-wide" - national scope without specific location
- "European locations" - continental scope

### Administrative Boundaries

**State vs City confusion:**

- "Bayern" (state) vs "Munich" (city in Bayern)
- "NRW" (North Rhine-Westphalia abbreviation)
- Missing state information for cities

## Text Encoding and Language Issues

### Mixed Language Content

**German/English mixing:**

- Job titles in German, descriptions in English
- Technical terms in English within German text
- Company-specific terminology in native language

### Encoding Artifacts

**Remaining encoding issues:**

- Special characters: "München" vs "Muenchen" vs "MÃ¼nchen"
- HTML entities not fully cleaned: "&nbsp;", "&#39;"
- Line break artifacts: "\n", "\r", "&lt;br&gt;"

## Company Name Standardization Problems

### Legal Entity Variations

**Different company representations:**

- "Google Inc." vs "Google GmbH" vs "Google"
- "Siemens AG" vs "Siemens Healthineers"
- "Daimler AG" vs "Mercedes-Benz Group"

### Subsidiary Confusion

**Parent company relationships:**

- "BMW Group" vs "BMW Motorrad"
- "Volkswagen AG" vs "Audi AG" (both Volkswagen Group)
- "Deutsche Bank" vs "DB Systel"

## Temporal Data Quality Issues

### Date Parsing Limitations

**Ambiguous date formats:**

- "Recently posted" (relative time)
- "ASAP" (as soon as possible)
- "Immediate start" (no specific date)

### Update Frequency Issues

**Stale data concerns:**

- Jobs posted months ago still appearing as "active"
- No reliable "last updated" timestamps
- Reposted jobs with new dates vs actual updates

## Impact on Analysis & Filtering

### Dashboard Filtering Limitations

**Inaccurate results due to inconsistencies:**

- **Remote work analysis:** Missing ~10% of potential remote jobs
- **Seniority filtering:** Incorrect level assignments for edge cases
- **Location-based queries:** Geographic ambiguity affects regional analysis
- **Salary analysis:** Unparseable formats excluded from compensation insights

### Statistical Analysis Bias

**Data quality effects on insights:**

- **Undercounting:** Remote work opportunities significantly underestimated
- **Misclassification:** Career level distributions skewed
- **Geographic bias:** Location-based trends affected by parsing issues
- **Salary analysis:** Compensation insights limited by format inconsistencies

## Mitigation Strategies

### Short-term Fixes

**Filter Logic Improvements:**

- Expand home office detection patterns
- Add fuzzy matching for seniority terms
- Improve location parsing for multi-city entries

**Data Validation:**

- Automated checks for common inconsistencies
- Manual review queues for high-impact edge cases
- Confidence scoring for uncertain classifications

### Long-term Solutions

**Data Collection Improvements:**

- Enhanced scraping patterns for work arrangements
- Multi-language processing pipeline
- Structured data validation at source

**Quality Assurance Pipeline:**

- Automated inconsistency detection
- Regular data quality audits
- Feedback loops for continuous improvement

## Recommendations for Users

### Working with Inconsistent Data

**Best Practices:**

1. **Use multiple filters:** Combine work arrangement text search with formal filters
2. **Cross-validate results:** Check both automated classifications and raw data
3. **Apply confidence thresholds:** Prefer high-confidence results for critical analysis
4. **Document assumptions:** Clearly state data quality limitations in reports

### Analysis Caveats

**Important Limitations:**

- Remote work statistics may underestimate actual opportunities by 10%
- Seniority classifications have edge cases requiring manual review
- Geographic analysis limited by location parsing inconsistencies
- Salary analysis excludes jobs with non-standard formats

## Future Data Quality Improvements

### Planned Enhancements

**Priority Improvements:**

1. **Enhanced home office detection** - Regex pattern expansion
2. **Multi-language processing** - German/English term standardization
3. **Location disambiguation** - Geographic entity resolution
4. **Salary format expansion** - Support for additional formats

### Quality Metrics Tracking

**Ongoing Monitoring:**

- Inconsistency detection rates
- Filter accuracy validation
- User-reported issues tracking
- Data quality improvement over time
