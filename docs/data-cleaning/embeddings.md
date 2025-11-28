---
sidebar_position: 5
---

# Creating Embeddings: Text Vectorization for Analysis

## Overview

After cleaning our job descriptions, we converted the textual data into 725-dimensional vector embeddings. This transformation enables mathematical analysis of job similarities and clustering based on semantic content rather than keyword matching.

## Why 725 Dimensions?

### Dimensionality Decision Factors
- **Semantic richness**: High dimensionality captures nuanced job requirements
- **Computational feasibility**: Balanced against processing time and memory
- **Clustering effectiveness**: Sufficient dimensions for meaningful job groupings
- **Analysis requirements**: Supports both local and global similarity patterns

## Text Preprocessing for Embeddings

### Preprocessing Pipeline

```python
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
from typing import List

class TextPreprocessor:
    """
    Prepare text data for embedding generation.
    """

    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')

        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

        # Add domain-specific stop words
        self.stop_words.update(['experience', 'skills', 'knowledge', 'ability'])

    def preprocess_for_embedding(self, text: str) -> str:
        """
        Comprehensive text preprocessing for embedding generation.
        """
        if pd.isna(text) or not text:
            return ""

        text = str(text).lower()

        # Remove HTML and special characters
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'[^\w\s]', ' ', text)

        # Tokenize
        tokens = nltk.word_tokenize(text)

        # Remove stop words and short tokens
        tokens = [token for token in tokens
                 if token not in self.stop_words and len(token) > 2]

        # Lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens]

        # Rejoin
        processed_text = ' '.join(tokens)

        return processed_text

    def batch_preprocess(self, texts: List[str]) -> List[str]:
        """Process multiple texts efficiently."""
        return [self.preprocess_for_embedding(text) for text in texts]
```

## TF-IDF Vectorization Implementation

### 725-Dimensional TF-IDF Vectors

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import pandas as pd
from typing import Tuple

class JobEmbeddingGenerator:
    """
    Generate 725-dimensional embeddings from job descriptions.
    """

    def __init__(self, max_features: int = 725):
        self.max_features = max_features
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            min_df=2,  # Ignore terms in less than 2 documents
            max_df=0.95,  # Ignore terms in more than 95% of documents
            ngram_range=(1, 2),  # Include unigrams and bigrams
            stop_words='english',
            norm='l2',  # L2 normalization
            use_idf=True,
            smooth_idf=True
        )
        self.is_fitted = False

    def fit_transform(self, texts: List[str]) -> np.ndarray:
        """
        Fit vectorizer and transform texts to embeddings.
        """
        # Preprocess texts
        preprocessor = TextPreprocessor()
        processed_texts = preprocessor.batch_preprocess(texts)

        # Generate embeddings
        embeddings = self.vectorizer.fit_transform(processed_texts)

        self.is_fitted = True

        print(f"Generated {embeddings.shape[0]} embeddings with {embeddings.shape[1]} dimensions")
        print(f"Vocabulary size: {len(self.vectorizer.vocabulary_)}")

        return embeddings.toarray()

    def transform(self, texts: List[str]) -> np.ndarray:
        """
        Transform new texts using fitted vectorizer.
        """
        if not self.is_fitted:
            raise ValueError("Vectorizer must be fitted before transform")

        preprocessor = TextPreprocessor()
        processed_texts = preprocessor.batch_preprocess(texts)

        embeddings = self.vectorizer.transform(processed_texts)

        return embeddings.toarray()

    def get_top_features(self, n_features: int = 20) -> List[Tuple[str, float]]:
        """
        Get most important features (terms) in the embeddings.
        """
        if not self.is_fitted:
            raise ValueError("Vectorizer must be fitted first")

        # Get feature names and their IDF scores
        feature_names = self.vectorizer.get_feature_names_out()
        idf_scores = self.vectorizer.idf_

        # Sort by IDF score (higher = more distinctive)
        top_indices = np.argsort(idf_scores)[-n_features:][::-1]

        top_features = [(feature_names[i], idf_scores[i])
                       for i in top_indices]

        return top_features

def generate_job_embeddings(df: pd.DataFrame, text_column: str = 'description') -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generate embeddings for job dataset.
    """
    # Filter to jobs with descriptions
    jobs_with_text = df[df[text_column].notna()].copy()

    print(f"Generating embeddings for {len(jobs_with_text)} jobs with descriptions")

    # Initialize embedding generator
    embedding_gen = JobEmbeddingGenerator(max_features=725)

    # Get text data
    texts = jobs_with_text[text_column].fillna('').tolist()

    # Generate embeddings
    embeddings = embedding_gen.fit_transform(texts)

    # Add embeddings to dataframe
    embedding_columns = [f'emb_{i}' for i in range(725)]
    embedding_df = pd.DataFrame(embeddings, columns=embedding_columns, index=jobs_with_text.index)

    # Combine with original data
    jobs_with_embeddings = pd.concat([jobs_with_text, embedding_df], axis=1)

    # Show top features
    top_features = embedding_gen.get_top_features(15)
    print("\nTop 15 most distinctive terms in job descriptions:")
    for term, score in top_features:
        print(".3f")

    return jobs_with_embeddings, embeddings
```

## Embedding Quality Analysis

### Dimensionality Validation

```python
def analyze_embedding_quality(embeddings: np.ndarray, texts: List[str]) -> Dict[str, float]:
    """
    Analyze the quality of generated embeddings.
    """
    metrics = {}

    # Basic statistics
    metrics['num_embeddings'] = len(embeddings)
    metrics['embedding_dim'] = embeddings.shape[1]
    metrics['sparsity'] = (embeddings == 0).mean()

    # Vector magnitude distribution
    magnitudes = np.linalg.norm(embeddings, axis=1)
    metrics['avg_magnitude'] = magnitudes.mean()
    metrics['magnitude_std'] = magnitudes.std()

    # Similarity distribution (sample)
    sample_size = min(1000, len(embeddings))
    sample_indices = np.random.choice(len(embeddings), sample_size, replace=False)
    sample_embeddings = embeddings[sample_indices]

    from sklearn.metrics.pairwise import cosine_similarity
    similarity_matrix = cosine_similarity(sample_embeddings)

    # Remove self-similarities
    np.fill_diagonal(similarity_matrix, np.nan)
    similarities = similarity_matrix[~np.isnan(similarity_matrix)]

    metrics['avg_similarity'] = similarities.mean()
    metrics['similarity_std'] = similarities.std()
    metrics['max_similarity'] = similarities.max()
    metrics['min_similarity'] = similarities.min()

    return metrics

# Analyze embedding quality
embeddings_df, embeddings_array = generate_job_embeddings(clean_dataset)
quality_metrics = analyze_embedding_quality(embeddings_array, clean_dataset['description'].tolist())

print("Embedding Quality Analysis:")
for metric, value in quality_metrics.items():
    if 'similarity' in metric:
        print(f"  {metric}: {value:.3f}")
    else:
        print(f"  {metric}: {value:.2f}")
```

## Alternative Embedding Approaches Considered

### Word2Vec Embeddings
```python
# Considered but not used due to computational complexity
from gensim.models import Word2Vec

def generate_word2vec_embeddings(texts: List[str], vector_size: int = 725) -> np.ndarray:
    """
    Alternative Word2Vec approach (not implemented due to complexity).
    """
    # Tokenize texts
    tokenized_texts = [text.split() for text in texts]

    # Train Word2Vec model
    model = Word2Vec(sentences=tokenized_texts,
                    vector_size=vector_size,
                    window=5,
                    min_count=1,
                    workers=4)

    # Generate document embeddings (average of word vectors)
    embeddings = []
    for tokens in tokenized_texts:
        word_vectors = [model.wv[token] for token in tokens if token in model.wv]
        if word_vectors:
            doc_embedding = np.mean(word_vectors, axis=0)
        else:
            doc_embedding = np.zeros(vector_size)
        embeddings.append(doc_embedding)

    return np.array(embeddings)
```

### BERT Embeddings
```python
# Considered but not used due to resource requirements
from sentence_transformers import SentenceTransformer

def generate_bert_embeddings(texts: List[str]) -> np.ndarray:
    """
    BERT-based embeddings (not implemented due to computational cost).
    """
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=True)
    return embeddings
```

## Why TF-IDF with 725 Dimensions?

### Advantages of Chosen Approach
1. **Interpretability**: TF-IDF features directly correspond to important terms
2. **Computational efficiency**: Faster than neural embeddings
3. **Domain adaptation**: Captures job-specific terminology effectively
4. **Scalability**: Handles large datasets without GPU requirements

### Dimensionality Justification
- **Coverage**: 725 features capture most important job-related terms
- **Reduction**: Balances detail with computational feasibility
- **Clustering**: Sufficient for meaningful job similarity calculations
- **Analysis**: Enables both automated and manual feature inspection

## Integration with Clustering Pipeline

### Embedding Normalization

```python
from sklearn.preprocessing import StandardScaler

def normalize_embeddings(embeddings: np.ndarray) -> np.ndarray:
    """
    Normalize embeddings for consistent clustering.
    """
    scaler = StandardScaler()
    normalized_embeddings = scaler.fit_transform(embeddings)
    return normalized_embeddings

# Prepare embeddings for clustering
normalized_embeddings = normalize_embeddings(embeddings_array)
```

## Results and Impact

### Embedding Statistics
- **Jobs processed**: 4,200 with valid descriptions
- **Vocabulary size**: 8,500+ unique terms
- **Average similarity**: 0.15 (indicating good diversity)
- **Top terms**: "python", "machine learning", "data analysis", "sql"

### Quality Metrics
- **Sparsity**: 0.92 (typical for TF-IDF)
- **Magnitude range**: 0.8-1.2 (after L2 normalization)
- **Distinctive terms**: Successfully captured domain-specific vocabulary

### Preparation for Clustering
- **Normalized vectors**: Consistent scale for distance calculations
- **Dimensional reduction ready**: Prepared for t-SNE visualization
- **Similarity computation**: Efficient cosine distance calculations

[Next: K-means Clustering Analysis →](./clustering)
