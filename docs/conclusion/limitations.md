---
sidebar_position: 1
---

# Limitations & Future Work

## Project Limitations

While our **Job Market Insights** project successfully demonstrates a comprehensive approach to data science career analysis, several limitations should be acknowledged to provide context for the results and guide future improvements.

## Data Source Limitations

### Platform and Geographic Scope

- **Single platform focus**: Analysis based primarily on Indeed.com job postings
- **Geographic limitation**: Predominantly German market data (despite Indeed's international scope)
- **Platform-specific posting patterns**: Different companies have varying posting frequencies and detail levels

### Temporal Constraints

- **Snapshot nature**: Data represents a specific time period (2024-2025)
- **Market volatility**: Job market conditions change rapidly
- **Seasonal variations**: Hiring patterns may vary by season or economic conditions

## Data Quality Limitations

### Completeness Issues

- **Missing salary data**: Only ~65% of jobs include salary information
- **Inconsistent descriptions**: Varying levels of detail in job postings
- **Unstructured data**: Natural language processing challenges with inconsistent formatting

### Consistency and Accuracy Issues

- **Tag vs. description mismatches**: Job descriptions may mention "Homeoffice möglich" but tags don't reflect remote work options
- **Filter inconsistency**: Jobs not appearing in expected filter categories despite meeting criteria in description
- **Metadata discrepancies**: Platform tags and extracted information may contradict job content
- **Temporal inconsistencies**: Job posting metadata may not match current job status or requirements
- **Full Homeoffice data limitations**: Full Homeoffice data was lost/only accessible via filters and given the amount, is unlikely to represent real full remote jobs. Therefore, we decided to group full and partial homeoffice into one category

### Salary Data Anomalies

Some job postings contain implausible salary values (e.g. extremely high placeholder numbers) that are syntactically valid but semantically incorrect. These entries may arise from data entry errors or deliberate attempts to increase ranking visibility on job platforms.

While basic range checks can detect missing salary fields, detecting strategic misreporting is substantially harder without external ground truth or without making assumptions like (no job pays more than x amount). Such outliers can disproportionately affect aggregate statistics, percentile-based rankings, and salary-driven visualizations.

## Data Collection Technical Limitations

### Scraping and Access Constraints

- **Tool selection compromise**: Chose user-friendly tools over custom scraping for reliability
- **Rate limiting**: Respectful scraping may miss high-frequency updates
- **Data freshness**: Trade-off between comprehensive coverage and real-time updates
- **Anti-bot detection**: Platform restrictions limit collection frequency and completeness

## Analysis Limitations

### Embedding and Clustering Constraints

#### Dimensionality Reduction Trade-offs

- **Information loss**: 725D → 2D/3D t-SNE reduction loses nuanced relationships
- **Parameter sensitivity**: t-SNE results vary with perplexity and learning rate choices
- **Computational complexity**: High-dimensional embeddings require significant processing

#### Clustering Validation Challenges

- **Subjective cluster interpretation**: Meaningful labels depend on domain expertise
- **Cluster stability**: Different random seeds may produce varying results
- **Optimal K determination**: Elbow method and silhouette analysis provide guidance but not definitive answers

### Skill Extraction Limitations

#### Keyword Matching Constraints

- **Context dependency**: Same skill terms may have different meanings
- **Synonym handling**: Multiple ways to express the same skill (e.g., "data science" vs "data scientist")
- **Emerging terminology**: New tools and frameworks may not be captured

#### LLM Alternative Trade-offs

- **Cost scalability**: LLM-based extraction becomes expensive with large datasets
- **Consistency vs. flexibility**: Rule-based approaches are more predictable than LLM outputs
- **Domain adaptation**: Cluster-based keywords are specifically tuned to job market data

## Technical Limitations

### Performance and Scalability

#### Database Query Optimization

- **Complex joins**: Multi-table queries for skill-based filtering can be slow
- **Indexing trade-offs**: Balancing query speed with storage requirements
- **Caching limitations**: Real-time updates reduce cache effectiveness

#### Frontend Rendering Challenges

- **Large datasets**: Rendering thousands of data points in t-SNE visualization
- **Browser limitations**: Memory constraints for complex 3D visualizations
- **Mobile optimization**: Reduced functionality on smaller screens

## Methodological Limitations

### Academic Context Constraints

#### Tool Selection for Learning

- **Educational balance**: Prioritized learning over optimization in some cases
- **Resource limitations**: Academic project constraints vs. production requirements
- **Timeline pressures**: Comprehensive analysis within semester timeframe

### Validation Challenges

#### Ground Truth Limitations

- **Lack of labeled data**: No "correct" clustering or skill extraction to validate against
- **Subjective evaluation**: User satisfaction and perceived usefulness as primary metrics
- **Longitudinal validation**: Difficulty assessing real-world career impact

## Future Work and Improvements

### Data Collection Enhancements

#### Multi-Platform Integration

- Collect data from more than one plattform to prevent bias

#### Real-time Data Pipeline

- **Automated updates**: Continuous data collection and processing
- **Change detection**: Identify new jobs and updated postings
- **Data quality monitoring**: Automated validation and cleaning

### Analysis Improvements

#### Advanced NLP Techniques

- **Transformer models**: BERT-based embeddings for better semantic understanding
- **Named entity recognition**: Precise skill and technology extraction
- **Sentiment analysis**: Job description tone and company culture insights

#### Enhanced Clustering Methods

- **Hierarchical clustering**: Multi-level job categorization
- **Semi-supervised learning**: Incorporate domain expert knowledge
- **Dynamic clustering**: Time-aware clustering for trend analysis

### Technical Enhancements

#### Scalable Architecture

- **Microservices**: Separate concerns for data processing, API, and frontend
- **Cloud deployment**: AWS/GCP for scalable processing and storage
- **CDN integration**: Global content delivery for international users

#### Advanced Visualizations

- **WebGL optimizations**: Smooth 3D t-SNE navigation
- **Real-time filtering**: Instant visualization updates
- **Custom dashboards**: Personalized user experiences

### User Experience Improvements

#### Personalized Recommendations

- **Skill gap analysis**: Compare user profiles with job requirements
- **Career path modeling**: Suggest progression routes based on market data
- **Learning recommendations**: Curated courses and resources for skill development

#### Community Features

- **User contributions**: Community-validated skill categorizations
- **Discussion forums**: Peer insights and job market discussions
- **Mentorship matching**: Connect job seekers with industry professionals

## Impact Assessment

### Current Project Value

Despite limitations, the project successfully demonstrates:

- **Comprehensive methodology**: End-to-end data science workflow
- **Practical insights**: Actionable job market intelligence
- **Technical competence**: Advanced analysis techniques
- **Educational impact**: Valuable learning experience and portfolio piece

### Real-world Applicability

- **Career guidance**: Helps students understand job market requirements
- **Industry insights**: Provides companies with competitive intelligence
- **Research foundation**: Establishes baseline for future studies
- **Tool validation**: Demonstrates effectiveness of chosen methodologies

## Conclusion

The limitations identified above provide valuable context for interpreting the project's results and guide future improvements. While no single project can perfectly capture the complexity of the job market, our approach successfully balances academic learning objectives with practical utility.

The most critical insight is that **methodological transparency and continuous improvement** are more valuable than perfect results. By openly acknowledging limitations and providing clear paths for enhancement, this project serves as both a practical tool and a foundation for future work in job market analysis.
