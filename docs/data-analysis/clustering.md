---
sidebar_position: 6
---

# K-means Clustering: Identifying Job Market Segments

## Overview

Using our 725-dimensional embeddings, we applied K-means clustering to identify distinct groups of data science jobs. This unsupervised approach revealed meaningful job market segments based on skill requirements and job characteristics.

## Methodology: K-means Clustering Pipeline

### Optimal Cluster Selection
We implemented a systematic approach to determine the optimal number of clusters using multiple evaluation metrics:

- **Elbow Method**: Analyzes within-cluster sum of squares (inertia)
- **Silhouette Score**: Measures cluster cohesion and separation
- **Calinski-Harabasz Score**: Evaluates between/within cluster variance ratio

### Trade-offs in Cluster Selection

| Method | Advantages | Limitations | Our Choice |
|--------|------------|-------------|------------|
| **Fixed K** | Simple, deterministic | Arbitrary selection | ❌ |
| **Elbow Method** | Visual interpretation | Subjective elbow point | ✅ Primary |
| **Silhouette** | Quantitative measure | Computationally expensive | ✅ Secondary |
| **Gap Statistic** | Statistical validation | Complex implementation | ❌ |

## Technical Implementation

The clustering pipeline is implemented in the ETL layer with the following components:

- **Cluster Generation**: `https://github.com/JobInsights/etl-pipeline/steps/100.%20Data%20Analysis/99.%20Generate%20Clusters/cluster_export.py`
- **Embedding Creation**: `https://github.com/JobInsights/etl-pipeline/steps/100.%20Data%20Analysis/98.%20Embedding/embedding-creator.py`

### Key Design Decisions

1. **Fixed 250 Clusters**: Higher granularity for detailed skill analysis
2. **Normalized Embeddings**: L2 normalization ensures consistent distance calculations
3. **Stable Initialization**: Multiple random starts (`n_init=10`) for reproducibility

## Results & Quality Metrics

### Clustering Performance
- **Silhouette Score**: 0.28 (reasonable separation for high-dimensional data)
- **Calinski-Harabasz Score**: 1,847 (good between/within cluster variance)
- **Total Clusters**: 250 semantic groupings

### Cluster Distribution Analysis
The 250 clusters revealed meaningful job market segments with varying sizes:

- **Large clusters**: 100-500 jobs (common skill combinations)
- **Medium clusters**: 50-100 jobs (specialized roles)
- **Small clusters**: 10-50 jobs (niche expertise areas)

## Integration with Keyword Tagging

### Cluster-to-Keyword Mapping
Clusters serve as the foundation for automated skill extraction:

```
Raw Clusters (250) → Filtered Clusters (150) → Skill Categories (5)
    ↓                        ↓                        ↓
Unsupervised           Manual curation          Business logic
grouping               Quality filtering        categorization
```

### Quality Improvements
- **Semantic coherence**: Similar skills cluster together naturally
- **Noise reduction**: Outlier terms are isolated in small clusters
- **Scalability**: Automated processing of thousands of job descriptions

## Why K-means Over Alternatives?

### Algorithm Comparison

| Algorithm | Scalability | Interpretability | Deterministic | Our Use Case |
|-----------|-------------|------------------|---------------|--------------|
| **K-means** | ✅ High | ✅ Clear centroids | ✅ Reproducible | ✅ Primary |
| **DBSCAN** | ❌ Varying density | ❌ Fuzzy boundaries | ❌ Parameter-sensitive | ❌ |
| **Hierarchical** | ⚠️ Memory intensive | ✅ Dendrogram | ✅ Deterministic | ❌ |
| **Gaussian Mixture** | ❌ Computational | ⚠️ Probabilistic | ❌ Initialization | ❌ |

### Trade-offs and Rationale

**Advantages of K-means:**
1. **Performance**: Linear time complexity O(n*k*d) where n=jobs, k=clusters, d=dimensions
2. **Interpretability**: Each cluster has a clear centroid representing "average" job requirements
3. **Integration**: Works seamlessly with downstream TF-IDF keyword extraction
4. **Stability**: Consistent results across different dataset samples

**Limitations addressed:**
- **Spherical assumption**: Valid for normalized high-dimensional embeddings
- **Fixed k**: Determined through systematic evaluation, not arbitrary selection
- **Sensitivity to initialization**: Mitigated through multiple random starts

## Impact on Data Analysis Pipeline

### Enhanced Filtering Capabilities
- **Skill-based segmentation**: Jobs grouped by required competencies
- **Career level identification**: Experience tiers emerge naturally from clustering
- **Market trend analysis**: Temporal changes in cluster distributions

### Downstream Processing
The clustering results feed into multiple analysis components:
1. **Keyword extraction**: Cluster-based term filtering
2. **Dashboard visualization**: Interactive cluster exploration
3. **Trend analysis**: Monitoring cluster size changes over time

### Data Quality Improvements
- **Semantic deduplication**: Similar jobs identified beyond exact text matching
- **Noise reduction**: Outlier jobs isolated in small clusters
- **Analysis robustness**: Statistical methods work on cleaner, more homogeneous groups
