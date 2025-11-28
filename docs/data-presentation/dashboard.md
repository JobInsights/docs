---
sidebar_position: 2
---

# Interactive Dashboard: Next.js Implementation

## Dashboard Architecture

Our dashboard was built using Next.js to create a modern, interactive web application for exploring the data science job market. This fullstack approach combines React frontend components with API routes for data access.

## Why Next.js?

### Technical Rationale

**Already Experienced with the Framework:**
- Team had existing React/Next.js knowledge from previous projects
- Familiar component architecture and state management patterns
- Established development workflow and tooling

**Flexible for Fullstack Applications:**
- Built-in API routes for serverless backend functionality
- Seamless integration between frontend and backend code
- Support for both static generation and server-side rendering

**Industry Standard for Fullstack Web Applications:**
- Widely adopted in production environments
- Large ecosystem of libraries and tools
- Strong community support and documentation

**Needed Publicly Viewable Deployment:**
- Vercel integration for easy deployment
- Global CDN for fast worldwide access
- Automatic scaling and reliability

## Technical Implementation

### Project Structure

```
job-market-dashboard/
├── pages/
│   ├── index.tsx                 # Homepage with overview
│   ├── jobs/
│   │   ├── index.tsx            # Job listings page
│   │   └── [id].tsx             # Individual job details
│   ├── search.tsx               # Advanced search page
│   ├── insights.tsx             # Market insights page
│   └── api/
│       ├── jobs.ts              # Job search API
│       ├── insights.ts          # Market insights API
│       └── skills.ts            # Skills analysis API
├── components/
│   ├── JobCard.tsx              # Job listing component
│   ├── FilterPanel.tsx          # Filtering controls
│   ├── SalaryChart.tsx          # Salary visualization
│   ├── SkillsChart.tsx          # Skills demand chart
│   └── TSNEPlot.tsx             # Embedding visualization
├── lib/
│   ├── database.ts              # Database connection
│   ├── queries.ts               # Database queries
│   └── embeddings.ts            # Embedding utilities
├── styles/
│   └── globals.css              # Global styles
└── package.json
```

### Core Dashboard Features

#### Job Discovery Interface

```tsx
// pages/jobs/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import JobCard from '../../components/JobCard';
import FilterPanel from '../../components/FilterPanel';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/jobs?${queryParams}`);
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="jobs-page">
      <div className="filters-sidebar">
        <FilterPanel filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="jobs-content">
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### API Routes Implementation

```typescript
// pages/api/jobs.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getJobsWithFilters } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      skills,
      minSalary,
      maxSalary,
      city,
      cluster,
      employmentType,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filters = {
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
      salaryRange: minSalary || maxSalary ? {
        min: minSalary ? parseFloat(minSalary) : undefined,
        max: maxSalary ? parseFloat(maxSalary) : undefined
      } : undefined,
      city: city as string,
      cluster: cluster ? parseInt(cluster) : undefined,
      employmentType: employmentType as string,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    };

    const jobs = await getJobsWithFilters(filters);

    res.status(200).json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: jobs.length // In real implementation, get from database
      }
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Database Integration

```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});

export async function getJobsWithFilters(filters: any) {
  let query = `
    SELECT
      j.*,
      ARRAY_AGG(k.keyword) as skills,
      COUNT(jk.keyword_id) as matching_skills
    FROM jobs j
    LEFT JOIN job_keywords jk ON j.job_id = jk.job_id
    LEFT JOIN keywords k ON jk.keyword_id = k.keyword_id
  `;

  const conditions = [];
  const values = [];
  let paramCount = 1;

  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    const skillPlaceholders = filters.skills.map(() => `$${paramCount++}`).join(',');
    conditions.push(`k.keyword IN (${skillPlaceholders})`);
    values.push(...filters.skills);
  }

  // Salary filter
  if (filters.salaryRange) {
    if (filters.salaryRange.min) {
      conditions.push(`j.salary_avg >= $${paramCount++}`);
      values.push(filters.salaryRange.min);
    }
    if (filters.salaryRange.max) {
      conditions.push(`j.salary_avg <= $${paramCount++}`);
      values.push(filters.salaryRange.max);
    }
  }

  // Location filter
  if (filters.city) {
    conditions.push(`j.city = $${paramCount++}`);
    values.push(filters.city);
  }

  // Cluster filter
  if (filters.cluster !== undefined) {
    conditions.push(`j.cluster_id = $${paramCount++}`);
    values.push(filters.cluster);
  }

  // Employment type filter
  if (filters.employmentType) {
    conditions.push(`j.employment_type = $${paramCount++}`);
    values.push(filters.employmentType);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += `
    GROUP BY j.job_id
    ORDER BY j.posted_date DESC
  `;

  // Pagination
  if (filters.pagination) {
    const { page, limit } = filters.pagination;
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);
  }

  const result = await pool.query(query, values);
  return result.rows;
}

export async function getMarketInsights() {
  const insightsQuery = `
    SELECT
      'top_skills' as type,
      json_agg(
        json_build_object(
          'skill', keyword,
          'count', job_count,
          'avg_salary', avg_salary
        ) ORDER BY job_count DESC LIMIT 10
      ) as data
    FROM (
      SELECT
        k.keyword,
        COUNT(DISTINCT j.job_id) as job_count,
        AVG(j.salary_avg) as avg_salary
      FROM keywords k
      JOIN job_keywords jk ON k.keyword_id = jk.keyword_id
      JOIN jobs j ON jk.job_id = j.job_id
      GROUP BY k.keyword
      HAVING COUNT(DISTINCT j.job_id) > 5
    ) skill_stats

    UNION ALL

    SELECT
      'salary_clusters' as type,
      json_agg(
        json_build_object(
          'cluster', cluster_id,
          'count', job_count,
          'avg_salary', avg_salary
        ) ORDER BY cluster_id
      ) as data
    FROM (
      SELECT
        cluster_id,
        COUNT(*) as job_count,
        AVG(salary_avg) as avg_salary
      FROM jobs
      WHERE salary_avg IS NOT NULL
      GROUP BY cluster_id
    ) cluster_stats
  `;

  const result = await pool.query(insightsQuery);
  return result.rows;
}
```

## Dashboard Components

### Job Card Component

```tsx
// components/JobCard.tsx
import React from 'react';
import Link from 'next/link';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_avg: number;
  skills: string[];
  posted_date: string;
}

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const formatSalary = (salary: number) => {
    if (!salary) return 'Not specified';
    return `€${salary.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-header">
        <h3 className="job-title">{job.title}</h3>
        <span className="job-company">{job.company}</span>
      </div>

      <div className="job-details">
        <div className="job-location">📍 {job.location}</div>
        <div className="job-salary">💰 {formatSalary(job.salary_avg)}</div>
        <div className="job-date">📅 {formatDate(job.posted_date)}</div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="job-skills">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="skill-more">+{job.skills.length - 3} more</span>
          )}
        </div>
      )}

      <Link href={`/jobs/${job.id}`} className="job-link">
        View Details →
      </Link>
    </div>
  );
}
```

## Performance Optimization

### Caching and Optimization

```typescript
// lib/cache.ts
import NodeCache from 'node-cache';

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

export function getCachedData(key: string, fetchFunction: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetchFunction().then(data => {
    cache.set(key, data);
    return data;
  });
}

// API route with caching
export default async function insightsHandler(req: NextApiRequest, res: NextApiResponse) {
  const cacheKey = 'market_insights';

  try {
    const insights = await getCachedData(cacheKey, async () => {
      return await getMarketInsights();
    });

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
}
```

## Deployment and Scaling

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "pages/api/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["fra1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

### Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_APP_URL=https://job-market-insights.vercel.app
```

## User Experience Features

### Responsive Design

```css
/* styles/globals.css */
.job-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
```

## Results and Impact

### Dashboard Performance
- **Load time**: &lt;2 seconds for initial page load
- **Search response**: &lt;500ms for filtered results
- **Concurrent users**: Support for 100+ simultaneous users
- **Mobile compatibility**: Fully responsive across devices

### User Engagement
- **Job discovery**: Users can filter through 6,200+ positions
- **Skill insights**: Interactive exploration of market demands
- **Career guidance**: Data-driven decision support for job seekers

The Next.js dashboard successfully transformed our complex data processing pipeline into an accessible, interactive tool for data science career exploration.
