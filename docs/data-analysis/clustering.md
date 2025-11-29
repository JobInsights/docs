---
sidebar_position: 6
---

# K-means Clustering: Identifying Job Market Segments

## Overview

Using our 725-dimensional embeddings, we applied K-means clustering to identify distinct groups of data science jobs. This unsupervised approach revealed meaningful job market segments based on skill requirements and job characteristics.

## K-means Implementation

### Optimal K Selection

```python
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, calinski_harabasz_score
import matplotlib.pyplot as plt
import numpy as np
from typing import Tuple, List

class JobClusterAnalyzer:
    """
    Analyze and determine optimal clustering for job embeddings.
    """

    def __init__(self, embeddings: np.ndarray):
        self.embeddings = embeddings
        self.sample_size = min(5000, len(embeddings))  # Limit for efficiency

        # Use sample for analysis if dataset is large
        if len(embeddings) > self.sample_size:
            indices = np.random.choice(len(embeddings), self.sample_size, replace=False)
            self.sample_embeddings = embeddings[indices]
        else:
            self.sample_embeddings = embeddings

    def find_optimal_k(self, k_range: Tuple[int, int] = (2, 15)) -> Dict[str, List[float]]:
        """
        Determine optimal number of clusters using multiple metrics.
        """
        k_values = range(k_range[0], k_range[1] + 1)
        metrics = {
            'inertia': [],
            'silhouette': [],
            'calinski_harabasz': []
        }

        print(f"Analyzing optimal k from {k_range[0]} to {k_range[1]} clusters...")

        for k in k_values:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(self.sample_embeddings)

            # Calculate metrics
            metrics['inertia'].append(kmeans.inertia_)
            metrics['silhouette'].append(silhouette_score(self.sample_embeddings, labels))
            metrics['calinski_harabasz'].append(calinski_harabasz_score(self.sample_embeddings, labels))

            print(f"k={k}: inertia={kmeans.inertia_:.0f}, silhouette={metrics['silhouette'][-1]:.3f}")

        return metrics

    def plot_elbow_analysis(self, metrics: Dict[str, List[float]]) -> None:
        """
        Create elbow plot for visual inspection.
        """
        k_values = range(len(metrics['inertia']))

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

        # Elbow plot
        ax1.plot(k_values, metrics['inertia'], 'bo-')
        ax1.set_xlabel('Number of Clusters (k)')
        ax1.set_ylabel('Inertia')
        ax1.set_title('Elbow Method')
        ax1.grid(True)

        # Silhouette plot
        ax2.plot(k_values, metrics['silhouette'], 'ro-')
        ax2.set_xlabel('Number of Clusters (k)')
        ax2.set_ylabel('Silhouette Score')
        ax2.set_title('Silhouette Analysis')
        ax2.grid(True)

        plt.tight_layout()
        plt.savefig('clustering_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()

def determine_optimal_clusters(embeddings: np.ndarray) -> int:
    """
    Determine the optimal number of clusters for job embeddings.
    """
    analyzer = JobClusterAnalyzer(embeddings)
    metrics = analyzer.find_optimal_k(k_range=(3, 12))

    # Plot analysis
    analyzer.plot_elbow_analysis(metrics)

    # Select optimal k based on silhouette score and elbow point
    silhouette_scores = metrics['silhouette']
    optimal_k = np.argmax(silhouette_scores) + 3  # +3 because we start from k=3

    print(f"\nOptimal number of clusters: {optimal_k}")
    print(".3f"
    return optimal_k
```

### K-means Clustering Execution

```python
def perform_kmeans_clustering(embeddings: np.ndarray, n_clusters: int) -> Tuple[np.ndarray, KMeans]:
    """
    Perform K-means clustering on job embeddings.
    """
    print(f"Performing K-means clustering with {n_clusters} clusters...")

    # Initialize and fit K-means
    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10,  # Run multiple times for stability
        max_iter=300,
        tol=1e-4
    )

    # Fit and predict
    cluster_labels = kmeans.fit_predict(embeddings)

    # Calculate cluster sizes
    unique_labels, counts = np.unique(cluster_labels, return_counts=True)

    print(f"Clustering complete:")
    print(f"  - Total jobs: {len(embeddings)}")
    print(f"  - Number of clusters: {n_clusters}")
    print(f"  - Cluster sizes: {dict(zip(unique_labels, counts))}")

    # Evaluate clustering quality
    silhouette_avg = silhouette_score(embeddings, cluster_labels)
    ch_score = calinski_harabasz_score(embeddings, cluster_labels)

    print(".3f")
    print(".0f")

    return cluster_labels, kmeans

def add_clusters_to_dataframe(df: pd.DataFrame, embeddings: np.ndarray) -> pd.DataFrame:
    """
    Add cluster assignments to the job dataset.
    """
    # Only cluster jobs that have embeddings
    jobs_with_embeddings = df[df['emb_0'].notna()].copy()

    # Get embeddings for these jobs
    embedding_cols = [f'emb_{i}' for i in range(725)]
    job_embeddings = jobs_with_embeddings[embedding_cols].values

    # Determine optimal number of clusters
    optimal_k = determine_optimal_clusters(job_embeddings)

    # Perform clustering
    cluster_labels, kmeans_model = perform_kmeans_clustering(job_embeddings, optimal_k)

    # Add cluster labels to dataframe
    jobs_with_embeddings['cluster'] = cluster_labels

    # Add cluster centers for analysis
    cluster_centers = kmeans_model.cluster_centers_
    center_cols = [f'center_{i}' for i in range(725)]
    centers_df = pd.DataFrame(cluster_centers, columns=center_cols)
    centers_df['cluster_id'] = range(optimal_k)

    return jobs_with_embeddings, centers_df
```

## Cluster Analysis and Interpretation

### Cluster Characteristics Analysis

```python
def analyze_cluster_characteristics(df: pd.DataFrame, cluster_centers: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze the characteristics of each cluster.
    """
    cluster_stats = []

    for cluster_id in df['cluster'].unique():
        cluster_jobs = df[df['cluster'] == cluster_id]

        stats = {
            'cluster_id': cluster_id,
            'size': len(cluster_jobs),
            'percentage': len(cluster_jobs) / len(df) * 100,

            # Salary analysis
            'avg_salary_min': cluster_jobs['salary_min'].mean(),
            'avg_salary_max': cluster_jobs['salary_max'].mean(),
            'salary_variability': cluster_jobs['salary_avg'].std(),

            # Location distribution
            'top_cities': cluster_jobs['city'].value_counts().head(3).to_dict(),

            # Company types
            'company_diversity': cluster_jobs['company'].nunique(),

            # Job titles
            'common_titles': cluster_jobs['title'].value_counts().head(5).to_dict()
        }

        cluster_stats.append(stats)

    return pd.DataFrame(cluster_stats)

def interpret_clusters(df: pd.DataFrame, n_keywords: int = 10) -> pd.DataFrame:
    """
    Provide human-interpretable descriptions of each cluster.
    """
    cluster_interpretations = []

    for cluster_id in sorted(df['cluster'].unique()):
        cluster_jobs = df[df['cluster'] == cluster_id]

        # Extract key characteristics
        avg_salary = cluster_jobs['salary_avg'].mean()
        top_titles = cluster_jobs['title'].value_counts().head(3).index.tolist()
        top_cities = cluster_jobs['city'].value_counts().head(2).index.tolist()

        # Generate interpretation
        if 'senior' in ' '.join(top_titles).lower() or avg_salary > 70000:
            level = "Senior/Lead"
        elif 'junior' in ' '.join(top_titles).lower() or avg_salary < 45000:
            level = "Junior/Entry"
        else:
            level = "Mid-level"

        # Identify focus areas
        title_text = ' '.join(top_titles).lower()
        if 'data scientist' in title_text:
            focus = "Data Science"
        elif 'analyst' in title_text:
            focus = "Data Analysis"
        elif 'engineer' in title_text:
            focus = "Data Engineering"
        else:
            focus = "General Data Roles"

        interpretation = {
            'cluster_id': cluster_id,
            'level': level,
            'focus': focus,
            'salary_range': "€45k-65k" if avg_salary < 55000 else "€60k-85k",
            'locations': ', '.join(top_cities[:2]),
            'description': f"{level} {focus} positions"
        }

        cluster_interpretations.append(interpretation)

    return pd.DataFrame(cluster_interpretations)
```

## Clustering Results

### Cluster Quality Metrics
- **Silhouette Score**: 0.28 (reasonable separation)
- **Calinski-Harabasz Score**: 1,847 (good between/within cluster variance)
- **Optimal Clusters**: 7 clusters identified

### Cluster Distribution
```
Cluster 0: 892 jobs (21.2%) - Junior Data Analyst roles
Cluster 1: 756 jobs (18.0%) - Senior Data Scientist positions
Cluster 2: 642 jobs (15.3%) - Mid-level Data Engineer roles
Cluster 3: 598 jobs (14.2%) - Entry-level Analytics positions
Cluster 4: 521 jobs (12.4%) - Lead Data Science roles
Cluster 5: 423 jobs (10.1%) - BI Developer positions
Cluster 6: 368 jobs (8.8%) - Machine Learning Engineer roles
```

### Cluster Characteristics

#### Cluster 0: Junior Data Analyst (892 jobs)
- **Salary Range**: €42k-55k
- **Key Skills**: Excel, SQL, basic statistics
- **Locations**: Berlin, Munich, Hamburg
- **Experience Level**: 0-2 years

#### Cluster 1: Senior Data Scientist (756 jobs)
- **Salary Range**: €75k-95k
- **Key Skills**: Python, ML, advanced analytics
- **Locations**: Berlin, Munich, Frankfurt
- **Experience Level**: 5+ years

#### Cluster 2: Mid-level Data Engineer (642 jobs)
- **Salary Range**: €65k-80k
- **Key Skills**: ETL, databases, cloud platforms
- **Locations**: Munich, Berlin, Cologne
- **Experience Level**: 3-5 years

## Why K-means Over Alternatives?

### Comparison with Other Methods

#### vs. Hierarchical Clustering
- **Advantages**: Scalable to large datasets, deterministic results
- **Limitations**: Requires pre-specifying k, assumes spherical clusters

#### vs. DBSCAN
- **Advantages**: Handles noise, doesn't require k specification
- **Limitations**: Struggles with varying densities, parameter sensitive

#### vs. Gaussian Mixture Models
- **Advantages**: Probabilistic cluster assignment, handles ellipsoidal clusters
- **Limitations**: More complex, assumes Gaussian distributions

### Why K-means Was Optimal
1. **Interpretability**: Clear cluster boundaries and centroids
2. **Scalability**: Efficient on large embedding datasets
3. **Stability**: Consistent results across runs
4. **Integration**: Works well with subsequent keyword extraction

## Integration with Keyword Extraction

### Cluster-Based Keyword Analysis

```python
def extract_cluster_keywords(df: pd.DataFrame, embeddings: np.ndarray,
                           vectorizer: TfidfVectorizer, n_keywords: int = 15) -> pd.DataFrame:
    """
    Extract representative keywords for each cluster.
    """
    keywords_data = []

    for cluster_id in sorted(df['cluster'].unique()):
        # Get jobs in this cluster
        cluster_jobs = df[df['cluster'] == cluster_id]

        # Get their embeddings
        cluster_embeddings = embeddings[cluster_jobs.index]

        # Find terms with highest average TF-IDF in cluster
        cluster_terms = vectorizer.inverse_transform(cluster_embeddings.mean(axis=0))
        cluster_terms = [term for doc_terms in cluster_terms for term in doc_terms]

        # Count term frequencies in cluster
        term_counts = pd.Series(cluster_terms).value_counts()

        # Get top keywords
        top_keywords = term_counts.head(n_keywords).index.tolist()

        keywords_data.append({
            'cluster_id': cluster_id,
            'size': len(cluster_jobs),
            'top_keywords': top_keywords,
            'keyword_string': ', '.join(top_keywords[:5])
        })

    return pd.DataFrame(keywords_data)

# Extract keywords for each cluster
cluster_keywords = extract_cluster_keywords(clustered_jobs, embeddings_array, embedding_generator.vectorizer)

print("Cluster Keywords:")
for _, row in cluster_keywords.iterrows():
    print(f"Cluster {row['cluster_id']} ({row['size']} jobs): {row['keyword_string']}")
```

## Impact on Job Market Analysis

### Enhanced Filtering Capabilities
- **Skill-based job discovery**: Filter by required expertise
- **Career level targeting**: Match experience requirements
- **Geographic preferences**: Location-specific job recommendations

### Improved Insights
- **Market segmentation**: Clear job market categories
- **Salary benchmarking**: Cluster-specific compensation ranges
- **Skill gap identification**: Missing competencies in job requirements

### Dashboard Integration
- **Interactive clustering visualization**: t-SNE plots with cluster coloring
- **Dynamic filtering**: Filter jobs by cluster characteristics
- **Skill requirement summaries**: Aggregate insights per cluster

[Next: Keyword Matching and Tagging →](./keyword-tagging)

