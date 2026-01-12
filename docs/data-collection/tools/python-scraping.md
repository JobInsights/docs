---
sidebar_position: 4
---

# Python Alternative Approach

For academic documentation, here's how detailed job descriptions could be scraped programmatically:

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
from urllib.parse import urljoin
from typing import List, Dict, Optional

class StepStoneDetailedJobScraper:
    """
    Python implementation matching the WebScraper.io StepStone configuration.
    Demonstrates technical approach while showing why WebScraper.io was preferred.
    """

    def __init__(self, login_credentials: Optional[Dict[str, str]] = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.login_credentials = login_credentials

    def login_stepstone(self) -> bool:
        """
        Handle StepStone login using the same actions as WebScraper.io configuration.
        """
        if not self.login_credentials:
            return False

        try:
            # Navigate to StepStone and check if login is needed
            response = self.session.get("https://www.stepstone.de/jobs/data-science")
            soup = BeautifulSoup(response.content, 'html.parser')

            # Check for login trigger element
            login_trigger = soup.select_one("span.hf-provider-xya6pk")
            if not login_trigger:
                return True  # Already logged in or no login required

            # Perform login sequence matching WebScraper configuration
            login_url = "https://www.stepstone.de/login"
            response = self.session.get(login_url)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find and click sign-in menu
            signin_menu = soup.select_one("[data-testid='menu-item-sign-in-menu'] div")
            if signin_menu:
                # This would require Selenium for actual clicking, simplified for demo
                print("Login sequence would be performed here...")
                return True

            return False

        except Exception as e:
            print(f"Login failed: {e}")
            return False

    def scrape_job_search_results(self, search_url: str, max_pages: int = 5) -> List[str]:
        """
        Scrape job listing pages to collect job URLs, matching pagination logic.
        """
        job_urls = []

        current_url = search_url

        for page in range(max_pages):
            try:
                time.sleep(random.uniform(2, 5))
                response = self.session.get(current_url)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')

                # Extract job links using the same selector as WebScraper
                job_links = soup.select("a[href*='/stellenangebote']")

                for link in job_links:
                    href = link.get('href')
                    if href:
                        full_url = urljoin("https://www.stepstone.de", href)
                        if full_url not in job_urls:
                            job_urls.append(full_url)

                # Find next page using pagination selector
                next_page = soup.select_one("a.res-1f70saq")
                if next_page and next_page.get('href'):
                    current_url = urljoin("https://www.stepstone.de", next_page['href'])
                else:
                    break

                print(f"Collected {len(job_urls)} job URLs from page {page + 1}")

            except Exception as e:
                print(f"Error scraping page {page + 1}: {e}")
                break

        return job_urls

    def scrape_job_details(self, job_urls: List[str]) -> List[Dict]:
        """
        Scrape detailed information from individual job posting URLs.
        """
        detailed_jobs = []

        for url in job_urls:
            try:
                time.sleep(random.uniform(2, 5))

                response = self.session.get(url)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                job_details = self._extract_job_details(soup, url)

                if job_details:
                    detailed_jobs.append(job_details)

                print(f"Scraped: {job_details.get('title', 'Unknown')}")

            except Exception as e:
                print(f"Error scraping {url}: {e}")
                continue

        return detailed_jobs

    def _extract_job_details(self, soup: BeautifulSoup, url: str) -> Optional[Dict]:
        """
        Extract job details using the exact selectors from WebScraper.io configuration.
        """
        try:
            # Job title - h1
            title_elem = soup.select_one("h1")
            title = title_elem.get_text(strip=True) if title_elem else None

            # Company - span[class*='job-ad-display']:not([class*='location'])
            company_elem = soup.select_one("span[class*='job-ad-display']:not([class*='location'])")
            company = company_elem.get_text(strip=True) if company_elem else None

            # Location - span.job-ad-display-kyg8or, span.job-ad-display-du9bhi
            location_elem = soup.select_one("span.job-ad-display-kyg8or, span.job-ad-display-du9bhi")
            location = location_elem.get_text(strip=True) if location_elem else None

            # Job Type - .at-listing__list-icons_contract-type span
            job_type_elem = soup.select_one(".at-listing__list-icons_contract-type span")
            job_type = job_type_elem.get_text(strip=True) if job_type_elem else None

            # Work Arrangement - .at-listing__list-icons_work-type span
            work_arrangement_elem = soup.select_one(".at-listing__list-icons_work-type span")
            work_arrangement = work_arrangement_elem.get_text(strip=True) if work_arrangement_elem else None

            # Posted - time
            posted_elem = soup.select_one("time")
            posted = posted_elem.get_text(strip=True) if posted_elem else None

            # Description - div[data-atx-component='JobAdContent']
            description_elem = soup.select_one("div[data-atx-component='JobAdContent']")
            description = description_elem.get_text(strip=True) if description_elem else None

            # Tasks - .at-section-text-description-content ul
            tasks_elem = soup.select_one(".at-section-text-description-content ul")
            tasks = tasks_elem.get_text(strip=True) if tasks_elem else None

            # Profile - .at-section-text-profile-content ul
            profile_elem = soup.select_one(".at-section-text-profile-content ul")
            profile = profile_elem.get_text(strip=True) if profile_elem else None

            # Benefits - .at-section-text-benefits-content ul
            benefits_elem = soup.select_one(".at-section-text-benefits-content ul")
            benefits = benefits_elem.get_text(strip=True) if benefits_elem else None

            # Logo - img (just check if exists)
            logo_elem = soup.select_one("img")
            logo_url = logo_elem.get('src') if logo_elem else None

            return {
                'url': url,
                'title': title,
                'company': company,
                'location': location,
                'job_type': job_type,
                'work_arrangement': work_arrangement,
                'posted': posted,
                'description': description,
                'tasks': tasks,
                'profile': profile,
                'benefits': benefits,
                'logo_url': logo_url,
                'scraped_at': pd.Timestamp.now()
            }

        except Exception as e:
            print(f"Error extracting details: {e}")
            return None

    def save_detailed_jobs(self, jobs: List[Dict], filename: str):
        """Save detailed job data to CSV."""
        df = pd.DataFrame(jobs)
        df.to_csv(filename, index=False, encoding='utf-8')
        print(f"Saved {len(jobs)} detailed job records to {filename}")

## Alternative: Structured Data Collection (Instant Data Scraper Equivalent)

For collecting structured job metadata (similar to Instant Data Scraper), here's a Python implementation:

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
from typing import List, Dict

def scrape_indeed_jobs_table(query: str, location: str, max_pages: int = 5) -> pd.DataFrame:
    """
    Python equivalent of Instant Data Scraper for structured job data extraction.
    Collects tabular job information from Indeed search results.
    """
    base_url = "https://de.indeed.com"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    all_jobs = []

    for page in range(max_pages):
        search_url = f"{base_url}/jobs?q={query}&l={location}&start={page*10}"

        try:
            response = requests.get(search_url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract structured job data (equivalent to Instant Data Scraper's AI detection)
            job_cards = soup.find_all('div', {'class': 'job_seen_beacon'})

            for card in job_cards:
                job_data = {
                    'title': extract_job_title(card),
                    'company': extract_company(card),
                    'location': extract_location(card),
                    'salary': extract_salary(card),
                    'date': extract_date(card),
                    'job_url': extract_job_url(card)
                }
                all_jobs.append(job_data)

            time.sleep(2)  # Respectful delay

        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

    return pd.DataFrame(all_jobs)

# Helper functions for data extraction
def extract_job_title(card):
    title_elem = card.find('h2', {'class': 'jobTitle'})
    return title_elem.get_text(strip=True) if title_elem else None

def extract_company(card):
    company_elem = card.find('span', {'class': 'companyName'})
    return company_elem.get_text(strip=True) if company_elem else None

def extract_location(card):
    location_elem = card.find('div', {'class': 'companyLocation'})
    return location_elem.get_text(strip=True) if location_elem else None

def extract_salary(card):
    salary_elem = card.find('div', {'class': 'salary-snippet'})
    return salary_elem.get_text(strip=True) if salary_elem else None

def extract_date(card):
    date_elem = card.find('span', {'class': 'date'})
    return date_elem.get_text(strip=True) if date_elem else None

def extract_job_url(card):
    link_elem = card.find('a', {'class': 'jcs-JobTitle'})
    if link_elem and link_elem.get('href'):
        return f"https://de.indeed.com{link_elem['href']}"
    return None

# Example usage
jobs_df = scrape_indeed_jobs_table("Data Scientist", "Deutschland", 3)
jobs_df.to_csv("indeed_jobs_structured.csv", index=False)
```

# Integration Examples

## WebScraper.io Workflow Equivalent

```python
if __name__ == "__main__":
    # Initialize scraper with login credentials (optional)
    login_creds = {
        'email': 'daxah12232@agenra.com',
        'password': 'tdXimBvNQK43Lf'
    }

    scraper = StepStoneDetailedJobScraper(login_credentials=login_creds)

    # Login to StepStone (matches websiteStateSetup)
    if scraper.login_stepstone():
        print("Successfully logged in or no login required")

        # Scrape job URLs from search results (matches pagination + jobLink selectors)
        search_url = "https://www.stepstone.de/jobs/data-science"
        job_urls = scraper.scrape_job_search_results(search_url, max_pages=3)

        # Scrape detailed information from each job page
        detailed_jobs = scraper.scrape_job_details(job_urls[:10])  # Limit for demo

        # Save results
        scraper.save_detailed_jobs(detailed_jobs, "stepstone_detailed_job_descriptions.csv")
    else:
        print("Failed to login to StepStone")
```

## Instant Data Scraper Workflow Equivalent

```python
if __name__ == "__main__":
    # Collect structured job data (equivalent to Instant Data Scraper)
    structured_jobs = scrape_indeed_jobs_table("Data Scientist", "Deutschland", max_pages=5)
    structured_jobs.to_csv("indeed_structured_jobs.csv", index=False)
    print(f"Collected {len(structured_jobs)} structured job records")
```
