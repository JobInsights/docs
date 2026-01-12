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
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import JobCard from "../../components/JobCard";
import FilterPanel from "../../components/FilterPanel";

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
      console.error("Failed to fetch jobs:", error);
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
            {jobs.map((job) => (
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
import { NextApiRequest, NextApiResponse } from "next";
import { getJobsWithFilters, JobFilters } from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      skills,
      workArrangement,
      location,
      industry,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object using Prisma-compatible filters
    const filters: JobFilters = {
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : undefined,
      workArrangement: workArrangement as string,
      location: location as string,
      industry: industry as string,
      limit: Math.min(parseInt(limit as string) || 20, 100), // Max 100 per page
      offset:
        ((parseInt(page as string) || 1) - 1) *
        (parseInt(limit as string) || 20),
    };

    const jobs = await getJobsWithFilters(filters);

    // Get total count for pagination
    const { prisma } = await import("../../lib/database");
    const totalJobs = await prisma.job.count({
      where: filters.skills
        ? {
            tags: {
              some: {
                tag: {
                  name: { in: filters.skills },
                },
              },
            },
          }
        : {},
    });

    res.status(200).json({
      jobs,
      pagination: {
        page: parseInt(page as string) || 1,
        limit: filters.limit,
        total: totalJobs,
        totalPages: Math.ceil(totalJobs / filters.limit!),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// pages/api/jobs/[id].ts - Individual job details
import { getJobById } from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const job = await getJobById(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

### Database Integration

```typescript
// lib/database.ts
import { PrismaClient, Job, Tag } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
});

export interface JobFilters {
  skills?: string[];
  workArrangement?: string;
  location?: string;
  industry?: string;
  limit?: number;
  offset?: number;
}

export async function getJobsWithFilters(filters: JobFilters): Promise<Job[]> {
  const {
    skills,
    workArrangement,
    location,
    industry,
    limit = 20,
    offset = 0,
  } = filters;

  const whereConditions: any = {};

  // Skills filter using tag relationships
  if (skills && skills.length > 0) {
    whereConditions.tags = {
      some: {
        tag: {
          name: { in: skills },
        },
      },
    };
  }

  // Work arrangement filter
  if (workArrangement) {
    whereConditions.workArrangement = workArrangement;
  }

  // Location filter
  if (location) {
    whereConditions.location = { contains: location };
  }

  // Industry filter
  if (industry) {
    whereConditions.industry = industry;
  }

  return await prisma.job.findMany({
    where: whereConditions,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [
      // Prioritize jobs with more matching skills
      skills ? { tags: { _count: "desc" } } : {},
      { datePosted: "desc" },
    ].filter((condition) => Object.keys(condition).length > 0),
    take: limit,
    skip: offset,
  });
}

export async function getMarketInsights() {
  // Top skills by demand
  const topSkills = await prisma.tag.findMany({
    include: {
      _count: {
        select: { jobs: true },
      },
    },
    orderBy: {
      jobs: { _count: "desc" },
    },
    take: 10,
  });

  // Work arrangement distribution
  const workArrangementStats = await prisma.job.groupBy({
    by: ["workArrangement"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  // Location distribution (top cities)
  const locationStats = await prisma.job.groupBy({
    by: ["location"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  // Industry distribution
  const industryStats = await prisma.job.groupBy({
    by: ["industry"],
    _count: { id: true },
    where: { industry: { not: null } },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  return {
    topSkills: topSkills.map((skill) => ({
      name: skill.name,
      category: skill.category,
      group: skill.group,
      jobCount: skill._count.jobs,
    })),
    workArrangementStats,
    locationStats,
    industryStats,
  };
}

export async function getJobById(id: string): Promise<Job | null> {
  return await prisma.job.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export { prisma };
```

## Dashboard Components

### Job Card Component

```tsx
// components/JobCard.tsx
import React from "react";
import Link from "next/link";
import { Job, Tag } from "@prisma/client";

interface JobWithTags extends Job {
  tags: Array<{
    tag: Tag;
  }>;
}

interface JobCardProps {
  job: JobWithTags;
  onClick?: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const formatSalary = (salary: string | null) => {
    if (!salary) return "Not specified";
    return salary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getSkills = () => {
    return job.tags.map((jt) => jt.tag.name);
  };

  const getWorkArrangementIcon = (arrangement: string) => {
    switch (arrangement.toLowerCase()) {
      case "vollzeit":
        return "⏰";
      case "teilzeit":
        return "🕐";
      case "befristet":
        return "📅";
      default:
        return "💼";
    }
  };

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-header">
        <h3 className="job-title">{job.title}</h3>
        <span className="job-company">{job.company}</span>
      </div>

      <div className="job-details">
        <div className="job-location">📍 {job.location}</div>
        <div className="job-type">
          {getWorkArrangementIcon(job.workArrangement)} {job.workArrangement}
        </div>
        <div className="job-salary">💰 {formatSalary(job.salary)}</div>
        <div className="job-date">📅 {formatDate(job.datePosted)}</div>
      </div>

      {job.industry && <div className="job-industry">🏢 {job.industry}</div>}

      <div className="job-flags">
        {job.isFullHomeOffice && (
          <span className="flag home-office">🏠 Home Office</span>
        )}
        {job.isPartialHomeOffice && (
          <span className="flag partial-home">🏠/🏢 Hybrid</span>
        )}
        {job.noExperience && (
          <span className="flag entry-level">🎓 Entry Level</span>
        )}
        {job.isManagement && (
          <span className="flag management">👔 Management</span>
        )}
      </div>

      {getSkills().length > 0 && (
        <div className="job-skills">
          {getSkills()
            .slice(0, 4)
            .map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          {getSkills().length > 4 && (
            <span className="skill-more">+{getSkills().length - 4} more</span>
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
import NodeCache from "node-cache";

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

export function getCachedData(key: string, fetchFunction: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetchFunction().then((data) => {
    cache.set(key, data);
    return data;
  });
}

// API route with caching
export default async function insightsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cacheKey = "market_insights";

  try {
    const insights = await getCachedData(cacheKey, async () => {
      return await getMarketInsights();
    });

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch insights" });
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
DATABASE_URL="file:./jobs_data.db"
NEXT_PUBLIC_APP_URL=https://job-market-insights.vercel.app

# For production deployment (optional - can use PostgreSQL)
# DATABASE_URL="postgresql://user:password@host:port/database"
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
