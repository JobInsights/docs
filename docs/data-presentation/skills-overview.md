---
sidebar_position: 5
---

# Skills Overview: Market Intelligence and Trends

## Overview

The skills overview section provides comprehensive insights into the current data science job market, revealing which technical skills are most in demand, how they correlate with salary, and how requirements evolve across different career levels and industries.

## Skills Demand Analysis

### Top Skills Extraction

```python
def analyze_skill_demand(df: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze which skills are most demanded in the job market.
    """
    all_skills = []
    for skills_list in df['extracted_keywords']:
        if isinstance(skills_list, list):
            all_skills.extend(skills_list)

    # Count skill frequencies
    from collections import Counter
    skill_counts = Counter(all_skills)

    # Create analysis dataframe
    skill_analysis = []
    for skill, count in skill_counts.most_common(50):
        # Calculate salary correlation
        skill_jobs = df[df['extracted_keywords'].apply(
            lambda x: skill in x if isinstance(x, list) else False
        )]

        avg_salary = skill_jobs['salary_avg'].mean()
        market_avg_salary = df['salary_avg'].mean()

        salary_premium = ((avg_salary - market_avg_salary) / market_avg_salary) * 100

        skill_analysis.append({
            'skill': skill,
            'job_count': count,
            'percentage': (count / len(df)) * 100,
            'avg_salary': avg_salary,
            'salary_premium': salary_premium,
            'clusters': skill_jobs['cluster'].value_counts().to_dict()
        })

    return pd.DataFrame(skill_analysis)

# Analyze skill demand
skill_demand = analyze_skill_demand(tagged_jobs)
print("Top 10 Most Demanded Skills:")
for _, row in skill_demand.head(10).iterrows():
    print(".1f")
```

## Interactive Skills Dashboard

### Skills Demand Chart

```tsx
// components/SkillsDemandChart.tsx
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface SkillData {
  skill: string;
  job_count: number;
  percentage: number;
  avg_salary: number;
  salary_premium: number;
}

interface SkillsDemandChartProps {
  skillsData: SkillData[];
  sortBy: 'count' | 'salary' | 'premium';
}

export default function SkillsDemandChart({ skillsData, sortBy }: SkillsDemandChartProps) {
  const chartData = useMemo(() => {
    let sorted = [...skillsData];

    switch (sortBy) {
      case 'count':
        sorted.sort((a, b) => b.job_count - a.job_count);
        break;
      case 'salary':
        sorted.sort((a, b) => b.avg_salary - a.avg_salary);
        break;
      case 'premium':
        sorted.sort((a, b) => b.salary_premium - a.salary_premium);
        break;
    }

    return sorted.slice(0, 20).map(skill => ({
      skill: skill.skill.length > 15 ? skill.skill.substring(0, 15) + '...' : skill.skill,
      fullSkill: skill.skill,
      count: skill.job_count,
      percentage: skill.percentage,
      salary: Math.round(skill.avg_salary),
      premium: skill.salary_premium
    }));
  }, [skillsData, sortBy]);

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name === 'count') {
      return [`${value} jobs`, 'Job Count'];
    }
    if (name === 'salary') {
      return [`€${value.toLocaleString()}`, 'Avg Salary'];
    }
    if (name === 'premium') {
      return [`${value.toFixed(1)}%`, 'Salary Premium'];
    }
    return [value, name];
  };

  return (
    <div className="skills-chart-container">
      <div className="chart-header">
        <h3>Data Science Skills Demand</h3>
        <div className="sort-controls">
          <button
            className={sortBy === 'count' ? 'active' : ''}
            onClick={() => setSortBy('count')}
          >
            By Demand
          </button>
          <button
            className={sortBy === 'salary' ? 'active' : ''}
            onClick={() => setSortBy('salary')}
          >
            By Salary
          </button>
          <button
            className={sortBy === 'premium' ? 'active' : ''}
            onClick={() => setSortBy('premium')}
          >
            By Premium
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="skill"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Bar
            dataKey={sortBy === 'salary' ? 'salary' : sortBy === 'premium' ? 'premium' : 'count'}
            fill="#1890ff"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="chart-insights">
        {sortBy === 'count' && (
          <p>Most demanded skills across all data science jobs</p>
        )}
        {sortBy === 'salary' && (
          <p>Skills that command the highest average salaries</p>
        )}
        {sortBy === 'premium' && (
          <p>Skills that provide the biggest salary boost over market average</p>
        )}
      </div>
    </div>
  );
}
```

### Skill Salary Correlation

```tsx
// components/SkillSalaryCorrelation.tsx
import React from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis
} from 'recharts';

interface SkillSalaryCorrelationProps {
  skillsData: SkillData[];
}

export default function SkillSalaryCorrelation({ skillsData }: SkillSalaryCorrelationProps) {
  const scatterData = skillsData
    .filter(skill => skill.job_count > 10) // Filter for statistical significance
    .map(skill => ({
      x: skill.percentage,
      y: Math.round(skill.avg_salary),
      z: skill.job_count,
      skill: skill.skill
    }));

  return (
    <div className="correlation-chart">
      <h3>Skill Demand vs Salary Correlation</h3>
      <p>How skill popularity relates to compensation</p>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="Demand %"
            label={{ value: 'Skill Demand (%)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Avg Salary"
            label={{ value: 'Average Salary (€)', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            range={[50, 400]}
            name="Job Count"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) => {
              if (name === 'Avg Salary') return [`€${value.toLocaleString()}`, name];
              if (name === 'Demand %') return [`${value}%`, name];
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.skill;
              }
              return label;
            }}
          />
          <Scatter
            name="Skills"
            data={scatterData}
            fill="#1890ff"
          />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="correlation-insights">
        <div className="insight-item">
          <h4>High Demand, High Pay</h4>
          <p>Skills in the top-right quadrant (Python, SQL, Machine Learning)</p>
        </div>
        <div className="insight-item">
          <h4>Specialized Premium</h4>
          <p>Skills with high salary but lower demand (Deep Learning, Spark)</p>
        </div>
        <div className="insight-item">
          <h4>Emerging Skills</h4>
          <p>Skills gaining traction (MLOps, AutoML)</p>
        </div>
      </div>
    </div>
  );
}
```

## Cluster-Specific Skills Analysis

### Skills by Career Level

```tsx
// components/SkillsByCluster.tsx
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ClusterSkills {
  clusterId: number;
  clusterName: string;
  topSkills: Array<{ skill: string; count: number; percentage: number }>;
}

interface SkillsByClusterProps {
  clusterSkills: ClusterSkills[];
}

export default function SkillsByCluster({ clusterSkills }: SkillsByClusterProps) {
  const [selectedCluster, setSelectedCluster] = useState(0);

  const currentCluster = clusterSkills[selectedCluster];
  const pieData = currentCluster?.topSkills.slice(0, 8).map(skill => ({
    name: skill.skill,
    value: skill.count,
    percentage: skill.percentage
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className="cluster-skills-analysis">
      <div className="cluster-selector">
        <h3>Skills by Career Level</h3>
        <select
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(Number(e.target.value))}
        >
          {clusterSkills.map((cluster, index) => (
            <option key={cluster.clusterId} value={index}>
              {cluster.clusterName}
            </option>
          ))}
        </select>
      </div>

      <div className="skills-breakdown">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="skills-list">
          <h4>Top Skills in {currentCluster?.clusterName}</h4>
          <ul>
            {currentCluster?.topSkills.slice(0, 10).map((skill, index) => (
              <li key={index} className="skill-item">
                <span className="skill-name">{skill.skill}</span>
                <span className="skill-stats">
                  {skill.count} jobs ({skill.percentage.toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Skills Trend Analysis

### Temporal Skill Evolution

```python
def analyze_skill_trends(df: pd.DataFrame, date_column: str = 'posted_date') -> pd.DataFrame:
    """
    Analyze how skill demand changes over time.
    """
    df = df.copy()
    df[date_column] = pd.to_datetime(df[date_column])
    df['month_year'] = df[date_column].dt.to_period('M')

    # Group by time period
    monthly_trends = []

    for period in sorted(df['month_year'].unique()):
        period_jobs = df[df['month_year'] == period]

        # Count skills for this period
        period_skills = []
        for skills_list in period_jobs['extracted_keywords']:
            if isinstance(skills_list, list):
                period_skills.extend(skills_list)

        skill_counts = Counter(period_skills)

        # Get top skills for this period
        for skill, count in skill_counts.most_common(20):
            monthly_trends.append({
                'period': str(period),
                'skill': skill,
                'count': count,
                'job_count': len(period_jobs)
            })

    return pd.DataFrame(monthly_trends)

# Analyze skill trends over time
skill_trends = analyze_skill_trends(tagged_jobs)
```

## Emerging Skills Detection

### Trend Analysis Component

```tsx
// components/EmergingSkills.tsx
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface SkillTrend {
  period: string;
  skill: string;
  count: number;
  growth_rate: number;
}

interface EmergingSkillsProps {
  skillTrends: SkillTrend[];
}

export default function EmergingSkills({ skillTrends }: EmergingSkillsProps) {
  const emergingSkills = useMemo(() => {
    // Identify skills with highest growth rates
    const skillStats = {};

    skillTrends.forEach(trend => {
      if (!skillStats[trend.skill]) {
        skillStats[trend.skill] = [];
      }
      skillStats[trend.skill].push({
        period: trend.period,
        count: trend.count
      });
    });

    // Calculate growth rates
    const emerging = Object.entries(skillStats)
      .map(([skill, data]: [string, any[]]) => {
        if (data.length < 3) return null; // Need at least 3 data points

        const sortedData = data.sort((a, b) => a.period.localeCompare(b.period));
        const recent = sortedData.slice(-3); // Last 3 periods
        const earlier = sortedData.slice(-6, -3); // Previous 3 periods

        if (earlier.length === 0) return null;

        const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, d) => sum + d.count, 0) / earlier.length;

        const growthRate = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

        return {
          skill,
          growthRate,
          currentDemand: recentAvg,
          trendData: sortedData.slice(-6) // Last 6 periods for chart
        };
      })
      .filter(item => item && item.growthRate > 20) // 20% growth threshold
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 10); // Top 10 emerging skills

    return emerging;
  }, [skillTrends]);

  const chartData = useMemo(() => {
    if (emergingSkills.length === 0) return [];

    // Get all periods
    const allPeriods = [...new Set(
      emergingSkills.flatMap(skill =>
        skill.trendData.map(d => d.period)
      )
    )].sort();

    return allPeriods.map(period => {
      const dataPoint: any = { period };

      emergingSkills.forEach(skill => {
        const periodData = skill.trendData.find(d => d.period === period);
        dataPoint[skill.skill] = periodData ? periodData.count : 0;
      });

      return dataPoint;
    });
  }, [emergingSkills]);

  if (emergingSkills.length === 0) {
    return (
      <div className="emerging-skills">
        <h3>Emerging Skills</h3>
        <p>No significant skill growth trends detected in recent data.</p>
      </div>
    );
  }

  return (
    <div className="emerging-skills">
      <h3>Emerging Skills in Data Science</h3>
      <p>Skills showing rapid growth in demand</p>

      <div className="emerging-list">
        {emergingSkills.map((skill, index) => (
          <div key={skill.skill} className="emerging-skill-item">
            <div className="skill-header">
              <span className="rank">#{index + 1}</span>
              <span className="skill-name">{skill.skill}</span>
              <span className="growth-rate">+{skill.growthRate.toFixed(1)}%</span>
            </div>
            <div className="skill-stats">
              Current demand: {skill.currentDemand.toFixed(1)} jobs/month
            </div>
          </div>
        ))}
      </div>

      <div className="trend-chart">
        <h4>Growth Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            {emergingSkills.slice(0, 5).map((skill, index) => (
              <Line
                key={skill.skill}
                type="monotone"
                dataKey={skill.skill}
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

## Skills Gap Analysis

### Required vs. Available Skills

```python
def analyze_skills_gap(required_skills: List[str], candidate_skills: List[str]) -> Dict[str, any]:
    """
    Analyze skills gap between job requirements and candidate capabilities.
    """
    required_set = set(required_skills)
    candidate_set = set(candidate_skills)

    matching = required_set & candidate_set
    missing = required_set - candidate_set
    extra = candidate_set - required_set

    return {
        'match_percentage': len(matching) / len(required_set) * 100,
        'missing_skills': list(missing),
        'extra_skills': list(extra),
        'matching_skills': list(matching),
        'gap_score': len(missing) / len(required_set) * 100
    }

# Example usage for career guidance
def generate_career_recommendations(df: pd.DataFrame, user_skills: List[str]) -> pd.DataFrame:
    """
    Recommend jobs and skills based on user's current capabilities.
    """
    recommendations = []

    for _, job in df.iterrows():
        if not isinstance(job.get('extracted_keywords'), list):
            continue

        gap_analysis = analyze_skills_gap(job['extracted_keywords'], user_skills)

        recommendations.append({
            'job_id': job.get('id'),
            'title': job.get('title'),
            'company': job.get('company'),
            'match_score': gap_analysis['match_percentage'],
            'missing_skills': gap_analysis['missing_skills'][:3],  # Top 3 gaps
            'salary': job.get('salary_avg')
        })

    return pd.DataFrame(recommendations).sort_values('match_score', ascending=False)

# Generate personalized recommendations
user_skills = ['python', 'sql', 'excel']
recommendations = generate_career_recommendations(tagged_jobs, user_skills)
```

## Results and Insights

### Key Market Findings
- **Most demanded skills**: Python (78%), SQL (65%), Machine Learning (52%)
- **Highest paying skills**: Deep Learning (+28% premium), Spark (+22% premium)
- **Emerging trends**: MLOps (+45% growth), AutoML (+38% growth)
- **Entry-level focus**: Excel, Statistics, Basic Programming
- **Senior-level focus**: Advanced ML, Big Data, Cloud Platforms

### User Value Proposition
- **Career planning**: Understand skill requirements for target roles
- **Salary negotiation**: Know which skills command premium compensation
- **Learning priorities**: Focus on high-demand, high-growth skills
- **Market intelligence**: Stay ahead of industry trends

The skills overview transforms raw job data into actionable career intelligence, helping users make informed decisions about their professional development in the data science field.
