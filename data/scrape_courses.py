import requests
from bs4 import BeautifulSoup
import csv
import re

# List of (department, url) tuples
COURSE_URLS = [
    ("AM", "https://courses.engineering.ucsc.edu/courses/am/2025"),
    ("BME", "https://courses.engineering.ucsc.edu/courses/bme/2024"),
    ("CMPM", "https://courses.engineering.ucsc.edu/courses/cmpm/2024"),
    ("ECE", "https://courses.engineering.ucsc.edu/courses/ece/2024"),
    ("GAME", "https://courses.engineering.ucsc.edu/courses/game/2025"),
    ("HCI", "https://courses.engineering.ucsc.edu/courses/hci/2025"),
    ("NLP", "https://courses.engineering.ucsc.edu/courses/nlp/2025"),
    ("STAT", "https://courses.engineering.ucsc.edu/courses/stat/2025"),
    ("TIM", "https://courses.engineering.ucsc.edu/courses/tim/2025"),
]

OUTPUT_CSV = "courses.csv"

# Helper to clean up whitespace
def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def scrape_department(dept, url):
    print(f"Scraping {dept} from {url}")
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    courses = []
    # Find all course links (e.g., /courses/am3)
    for a in soup.find_all('a', href=True):
        href = a['href']
        if re.match(r"/courses/[a-z]+[0-9a-z]+", href):
            course_id = a.text.split(':')[0].strip()
            title = a.text.split(':', 1)[-1].strip() if ':' in a.text else a.text.strip()
            # Find the row/section for this course to get term/instructor
            parent = a.find_parent('td')
            if parent:
                row = parent.find_parent('tr')
                if row:
                    # Try to get term_offered and instructor from the row
                    cells = row.find_all('td')
                    term_offered = ''
                    instructor = ''
                    if len(cells) > 0:
                        # Try to infer term from column position
                        col_idx = list(row.find_parent('table').find_all('tr')).index(row)
                        # Not always reliable, so fallback to blank
                    if len(cells) > 1:
                        instructor = clean(cells[-1].text)
                    # Description will require a second request
                    course_url = 'https://courses.engineering.ucsc.edu' + href
                    desc = ''
                    try:
                        cr = requests.get(course_url)
                        csoup = BeautifulSoup(cr.text, 'html.parser')
                        desc_tag = csoup.find('div', class_='courseblockdesc')
                        if desc_tag:
                            desc = clean(desc_tag.text)
                    except Exception:
                        pass
                    courses.append({
                        'course_id': course_id,
                        'title': title,
                        'description': desc,
                        'tags': '',
                        'term_offered': term_offered,
                        'instructor': instructor,
                        'department': dept
                    })
    return courses

def main():
    all_courses = []
    for dept, url in COURSE_URLS:
        all_courses.extend(scrape_department(dept, url))
    # Write to CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['course_id', 'title', 'description', 'tags', 'term_offered', 'instructor', 'department'])
        writer.writeheader()
        for course in all_courses:
            writer.writerow(course)
    print(f"Wrote {len(all_courses)} courses to {OUTPUT_CSV}")

if __name__ == '__main__':
    main() 