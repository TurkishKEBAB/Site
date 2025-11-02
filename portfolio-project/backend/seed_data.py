"""
Seed Database with Yiğit Okur's CV Data
This script populates the database with all CV information from the frontend mock data
"""
import asyncio
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import *
from app.utils.security import get_password_hash
from datetime import datetime, date
from slugify import slugify
import uuid

def seed_skills(db: Session):
    """Add skills from CV to database"""
    print("🔧 Adding skills from CV...")
    
    skills_data = [
        # Programming Languages
        {"name": "Java", "category": "Programming Languages", "proficiency": 95, "icon": "☕", "display_order": 1},
        {"name": "Python", "category": "Programming Languages", "proficiency": 90, "icon": "🐍", "display_order": 2},
        {"name": "C++", "category": "Programming Languages", "proficiency": 85, "icon": "⚙️", "display_order": 3},
        {"name": "C#", "category": "Programming Languages", "proficiency": 85, "icon": "#️⃣", "display_order": 4},
        {"name": "R", "category": "Programming Languages", "proficiency": 75, "icon": "📊", "display_order": 5},
        {"name": "JavaScript/TypeScript", "category": "Programming Languages", "proficiency": 85, "icon": "📜", "display_order": 6},
        {"name": "SQL", "category": "Programming Languages", "proficiency": 85, "icon": "🗄️", "display_order": 7},
        
        # Cloud & DevOps
        {"name": "Cloud Computing", "category": "Cloud & DevOps", "proficiency": 85, "icon": "☁️", "display_order": 8},
        {"name": "DevSecOps", "category": "Cloud & DevOps", "proficiency": 80, "icon": "🔒", "display_order": 9},
    {"name": "Git/GitHub", "category": "Cloud & DevOps", "proficiency": 95, "icon": "🐙", "display_order": 10},
        {"name": "CI/CD Pipelines", "category": "Cloud & DevOps", "proficiency": 80, "icon": "🔄", "display_order": 11},
        {"name": "Docker", "category": "Cloud & DevOps", "proficiency": 80, "icon": "🐳", "display_order": 12},
        {"name": "Kubernetes", "category": "Cloud & DevOps", "proficiency": 70, "icon": "☸️", "display_order": 13},
        {"name": "Linux", "category": "Cloud & DevOps", "proficiency": 85, "icon": "🐧", "display_order": 14},
        
        # Software Engineering
        {"name": "OOP & Design Patterns", "category": "Software Engineering", "proficiency": 90, "icon": "🏗️", "display_order": 15},
        {"name": "Software Architecture", "category": "Software Engineering", "proficiency": 85, "icon": "🏛️", "display_order": 16},
    {"name": "Data Structures & Algorithms", "category": "Software Engineering", "proficiency": 90, "icon": "🧮", "display_order": 17},
        {"name": "Databases & JDBC", "category": "Software Engineering", "proficiency": 85, "icon": "🗄️", "display_order": 18},
        {"name": "UML Modeling", "category": "Software Engineering", "proficiency": 80, "icon": "📐", "display_order": 19},
        {"name": "Multithreading", "category": "Software Engineering", "proficiency": 85, "icon": "🧵", "display_order": 20},
        
        # Frontend Development
        {"name": "React", "category": "Frontend", "proficiency": 85, "icon": "⚛️", "display_order": 21},
        {"name": "Tailwind CSS", "category": "Frontend", "proficiency": 80, "icon": "🎨", "display_order": 22},
        {"name": "HTML/CSS", "category": "Frontend", "proficiency": 90, "icon": "🌐", "display_order": 23},
        
        # Backend Development
        {"name": "FastAPI", "category": "Backend", "proficiency": 85, "icon": "⚡", "display_order": 24},
        {"name": "Django", "category": "Backend", "proficiency": 75, "icon": "🎸", "display_order": 25},
    {"name": "REST APIs", "category": "Backend", "proficiency": 90, "icon": "🔌", "display_order": 26},
        
        # Data Science & ML
        {"name": "Machine Learning", "category": "Data Science & AI", "proficiency": 75, "icon": "🤖", "display_order": 27},
        {"name": "TensorFlow", "category": "Data Science & AI", "proficiency": 70, "icon": "🧠", "display_order": 28},
        {"name": "Pandas", "category": "Data Science & AI", "proficiency": 80, "icon": "🐼", "display_order": 29},
        {"name": "NumPy", "category": "Data Science & AI", "proficiency": 80, "icon": "🔢", "display_order": 30},
        
        # Other Technical Skills
        {"name": "Logic Design", "category": "Other", "proficiency": 80, "icon": "🔌", "display_order": 31},
    {"name": "Computer Organization", "category": "Other", "proficiency": 80, "icon": "🖥️", "display_order": 32},
    {"name": "Microsoft Office", "category": "Other", "proficiency": 90, "icon": "📊", "display_order": 33},
        {"name": "PostgreSQL", "category": "Other", "proficiency": 85, "icon": "🐘", "display_order": 34},
        {"name": "Redis", "category": "Other", "proficiency": 75, "icon": "🔴", "display_order": 35},
    ]
    
    for skill_data in skills_data:
        skill = Skill(
            name=skill_data["name"],
            category=skill_data["category"],
            proficiency=skill_data["proficiency"],
            icon=skill_data["icon"],
            display_order=skill_data["display_order"]
        )
        db.add(skill)
    
    db.commit()
    print(f"✅ Added {len(skills_data)} skills")


def seed_experiences(db: Session):
    """Add experiences to database from Yiğit Okur's CV"""
    print("💼 Adding experiences...")
    
    experiences_data = [
        # EDUCATION
        {
            "title": "Bachelor of Software Engineering",
            "organization": "Işık University",
            "location": "Istanbul/Şile, Turkey",
            "experience_type": "education",
            "start_date": date(2023, 9, 1),
            "end_date": None,
            "is_current": True,
            "description": "Expected graduation: 2027. Member of Işık IEEE Student Branch (Vice President), Student Assistant in CSE Department (OOP), AdaLab Assistant at The Academic Data Analytics Laboratory.",
            "display_order": 1
        },
        {
            "title": "High School - Software & Electronics",
            "organization": "Ergün Öner-Mehmet Öner Anatolian High School",
            "location": "Istanbul/Güngören, Turkey",
            "experience_type": "education",
            "start_date": date(2019, 9, 1),
            "end_date": date(2023, 6, 1),
            "is_current": False,
            "description": "Software & Electronics Department. FRC (FIRST Robotics Competition) Team EMONER 7840 member. TÜBİTAK 4009 participant.",
            "display_order": 2
        },
        
        # WORK EXPERIENCE
        {
            "title": "Vice President",
            "organization": "Işık University IEEE Student Branch",
            "location": "Istanbul, Turkey",
            "experience_type": "work",
            "start_date": date(2024, 1, 1),
            "end_date": None,
            "is_current": True,
            "description": "Leading student branch operations, organizing 35+ technical events and workshops. Managing cross-functional teams, coordinating with industry partners, and fostering technical community engagement.",
            "display_order": 3
        },
        {
            "title": "Student Assistant - OOP",
            "organization": "CSE Department, Işık University",
            "location": "Istanbul, Turkey",
            "experience_type": "work",
            "start_date": date(2024, 9, 1),
            "end_date": None,
            "is_current": True,
            "description": "Teaching assistant for Object-Oriented Programming courses. Mentoring students in C++, Java, design patterns, and software architecture. Holding office hours, grading assignments, and conducting lab sessions.",
            "display_order": 4
        },
        {
            "title": "Research Assistant",
            "organization": "AdaLab - The Academic Data Analytics Laboratory",
            "location": "Işık University",
            "experience_type": "work",
            "start_date": date(2024, 9, 1),
            "end_date": None,
            "is_current": True,
            "description": "Conducting research on adaptive algorithms, data analytics, and machine learning applications. Collaborating on academic publications and research projects.",
            "display_order": 5
        },
        {
            "title": "Software & Electronics Team Member",
            "organization": "FRC Team EMONER 7840",
            "location": "Istanbul, Turkey",
            "experience_type": "work",
            "start_date": date(2019, 9, 1),
            "end_date": date(2023, 6, 1),
            "is_current": False,
            "description": "Developed autonomous robot control systems, programmed robot behaviors, and competed in international FIRST Robotics Competition. Gained hands-on experience in system optimization, teamwork under pressure, and technical leadership.",
            "display_order": 6
        },
        
        # VOLUNTEER ACTIVITIES
        {
            "title": "IEEEXtreme'24 Camp Organizer",
            "organization": "Işık University",
            "location": "Şile Campus, Istanbul",
            "experience_type": "volunteer",
            "start_date": date(2024, 7, 22),
            "end_date": date(2024, 7, 26),
            "is_current": False,
            "description": "Organized Turkey-wide programming camp focused on algorithms and data structures. Hosted participants from multiple universities, coordinated logistics, and facilitated technical workshops.",
            "display_order": 7
        },
        {
            "title": "Organization Committee Member",
            "organization": "SIU 2025 Conference",
            "location": "Turkey",
            "experience_type": "volunteer",
            "start_date": date(2024, 9, 1),
            "end_date": None,
            "is_current": True,
            "description": "Contributing to planning and coordination for the 2025 Signal Processing and Communications Applications Conference (SIU 2025).",
            "display_order": 8
        },
        {
            "title": "Environmental Volunteer",
            "organization": "WWF & TEMA Foundation",
            "location": "Turkey",
            "experience_type": "volunteer",
            "start_date": date(2022, 1, 1),
            "end_date": None,
            "is_current": True,
            "description": "Active volunteer supporting animal welfare and environmental protection initiatives. Participated in reforestation projects and wildlife conservation programs.",
            "display_order": 9
        },
        
        # PROJECTS & ACTIVITIES
        {
            "title": "Project Lead & Software Developer",
            "organization": "Sarkan UAV Project",
            "location": "Işık University",
            "experience_type": "activity",
            "start_date": date(2024, 3, 1),
            "end_date": None,
            "is_current": True,
            "description": "Leading software development and cross-team coordination for Sarkan UAV platform. Secured TÜBİTAK grant of ₺65,000 (2024) and Savronik sponsorship. Total project budget: ₺200,000. Supervising graduation projects on anti-jamming communication for UAV telemetry/control.",
            "display_order": 10
        },
        {
            "title": "Competitive Programmer",
            "organization": "IEEEXtreme 18.0 Competition",
            "location": "Global (Online)",
            "experience_type": "activity",
            "start_date": date(2024, 10, 1),
            "end_date": date(2024, 10, 1),
            "is_current": False,
            "description": "Participated in 24-hour global programming competition focusing on algorithms, data structures, and problem-solving challenges.",
            "display_order": 11
        },
    ]
    
    for exp_data in experiences_data:
        experience = Experience(
            title=exp_data["title"],
            organization=exp_data["organization"],
            location=exp_data["location"],
            experience_type=exp_data["experience_type"],
            start_date=exp_data["start_date"],
            end_date=exp_data["end_date"],
            is_current=exp_data["is_current"],
            description=exp_data["description"],
            display_order=exp_data["display_order"]
        )
        db.add(experience)
    
    db.commit()
    print(f"✅ Added {len(experiences_data)} experiences (Education, Work, Volunteer, Activities)")



def seed_projects(db: Session):
    """Add projects to database"""
    print("🚀 Adding projects...")
    
    projects_data = [
        {
            "slug": "sarkan-uav",
            "title": "Sarkan UAV Platform",
            "short_description": "Autonomous UAV control and mission planning platform",
            "description": """An advanced autonomous UAV (Unmanned Aerial Vehicle) control platform designed for real-time mission planning, 
            autonomous flight control, and data processing. The platform integrates computer vision for object detection and tracking, 
            supports multiple communication protocols, and includes a comprehensive ground control station.
            
            Key Features:
            - Real-time flight control and telemetry
            - Computer vision-based object detection
            - Autonomous mission planning and execution
            - Multi-drone coordination support
            - Advanced data logging and analysis
            - Web-based ground control interface""",
            "cover_image": "/projects/sarkan-uav.jpg",
            "github_url": "https://github.com/TurkishKEBAB/sarkan-uav",
            "demo_url": None,
            "featured": True,
            "display_order": 1
        },
        {
            "slug": "schedule-optimizer",
            "title": "Schedule Optimizer",
            "short_description": "AI-powered university schedule optimization tool",
            "description": """An intelligent scheduling system that optimizes university course schedules using genetic algorithms and constraint satisfaction.
            The tool considers multiple factors including professor preferences, room availability, student conflicts, and time constraints.
            
            Key Features:
            - Genetic algorithm-based optimization
            - Constraint satisfaction problem solving
            - Multi-objective optimization (minimize conflicts, balance workload)
            - Interactive schedule visualization
            - Export to various formats (PDF, Excel, iCal)
            - Real-time conflict detection""",
            "cover_image": "/projects/schedule-optimizer.jpg",
            "github_url": "https://github.com/TurkishKEBAB/schedule-optimizer",
            "demo_url": None,
            "featured": True,
            "display_order": 2
        },
        {
            "slug": "frc-robot-2024",
            "title": "FRC Robot Control System",
            "short_description": "Competition robot control and autonomous system",
            "description": """Advanced robot control system developed for FIRST Robotics Competition (FRC). 
            Includes autonomous navigation, vision-based object tracking, and precise mechanical control.
            
            Key Features:
            - Autonomous path planning and navigation
            - Computer vision for game piece detection
            - PID-based motor control
            - Sensor fusion for accurate positioning
            - Custom dashboard for driver feedback
            - Competition-ready reliability and performance""",
            "cover_image": "/projects/frc-robot.jpg",
            "github_url": "https://github.com/TurkishKEBAB/frc-2024",
            "demo_url": None,
            "featured": True,
            "display_order": 3
        },
        {
            "slug": "ieeextreme-camp",
            "title": "IEEEXtreme Programming Camp",
            "short_description": "Intensive programming competition preparation program",
            "description": """Organized and conducted a comprehensive programming camp to prepare students for the IEEEXtreme 24-hour programming competition.
            The camp covered advanced algorithms, data structures, competitive programming techniques, and team collaboration strategies.
            
            Program Highlights:
            - 2-week intensive training program
            - 50+ participating students
            - Daily algorithm challenges and contests
            - Team formation and collaboration training
            - Mock competition simulations
            - Mentorship from experienced competitors""",
            "cover_image": "/projects/ieeextreme-camp.jpg",
            "github_url": None,
            "demo_url": None,
            "featured": False,
            "display_order": 4
        },
        {
            "slug": "ml-projects",
            "title": "Machine Learning Projects Portfolio",
            "short_description": "Collection of ML/AI projects and experiments",
            "description": """A comprehensive portfolio of machine learning projects covering various domains including computer vision, 
            natural language processing, and predictive analytics.
            
            Projects Include:
            - Image classification with CNNs
            - Sentiment analysis using transformers
            - Time series forecasting
            - Recommendation systems
            - Anomaly detection
            - Transfer learning applications""",
            "cover_image": "/projects/ml-portfolio.jpg",
            "github_url": "https://github.com/TurkishKEBAB/ml-projects",
            "demo_url": None,
            "featured": False,
            "display_order": 5
        },
        {
            "slug": "portfolio-website",
            "title": "Personal Portfolio Website",
            "short_description": "Modern full-stack portfolio with admin panel",
            "description": """A professional portfolio website built with modern web technologies, featuring a complete admin panel for content management.
            
            Technical Stack:
            - Frontend: React, TypeScript, Tailwind CSS
            - Backend: FastAPI, SQLAlchemy, PostgreSQL
            - Infrastructure: Docker, Redis
            - Features: JWT authentication, RESTful API, responsive design
            - Admin panel for dynamic content management""",
            "cover_image": "/projects/portfolio.jpg",
            "github_url": "https://github.com/TurkishKEBAB/portfolio",
            "demo_url": "https://yigitokur.dev",
            "featured": True,
            "display_order": 6
        }
    ]
    
    for proj_data in projects_data:
        project = Project(
            slug=proj_data["slug"],
            title=proj_data["title"],
            short_description=proj_data["short_description"],
            description=proj_data["description"],
            cover_image=proj_data["cover_image"],
            github_url=proj_data["github_url"],
            demo_url=proj_data["demo_url"],
            featured=proj_data["featured"],
            display_order=proj_data["display_order"]
        )
        db.add(project)
    
    db.commit()
    print(f"✅ Added {len(projects_data)} projects")


def seed_site_config(db: Session):
    """Add site configuration"""
    print("⚙️  Adding site configuration...")
    
    config_data = [
        {"key": "site_name", "value": "Yiğit Okur", "description": "Site display name"},
        {"key": "site_title", "value": "Yiğit Okur - Software Engineer & Computer Science Student", "description": "Page title"},
        {"key": "site_description", "value": "Portfolio website of Yiğit Okur - Full-stack developer, ML enthusiast, and competitive programmer specializing in web development, robotics, and AI.", "description": "Meta description"},
        {"key": "contact_email", "value": "yigitokur@ieee.org", "description": "Contact email address"},
        {"key": "github_url", "value": "https://github.com/TurkishKEBAB", "description": "GitHub profile URL"},
        {"key": "linkedin_url", "value": "https://www.linkedin.com/in/yiğit-okur-050b5b278", "description": "LinkedIn profile URL"},
        {"key": "meta_keywords", "value": "Yiğit Okur, Software Engineer, Full Stack Developer, Machine Learning, Python, React, Portfolio", "description": "SEO keywords"},
        {"key": "maintenance_mode", "value": "false", "description": "Maintenance mode flag"},
    ]
    
    for config_item in config_data:
        config = SiteConfig(
            key=config_item["key"],
            value=config_item["value"],
            description=config_item["description"]
        )
        db.add(config)
    
    db.commit()
    print(f"✅ Added {len(config_data)} site configuration items")


def seed_technologies(db: Session):
    """Add technologies to database"""
    print("💻 Adding technologies...")
    
    technologies_data = [
        # Programming Languages
        {"name": "Python", "category": "language", "icon": "devicon-python-plain", "color": "#3776AB"},
        {"name": "C++", "category": "language", "icon": "devicon-cplusplus-plain", "color": "#00599C"},
        {"name": "Java", "category": "language", "icon": "devicon-java-plain", "color": "#007396"},
        {"name": "JavaScript", "category": "language", "icon": "devicon-javascript-plain", "color": "#F7DF1E"},
        {"name": "TypeScript", "category": "language", "icon": "devicon-typescript-plain", "color": "#3178C6"},
        
        # Frontend
        {"name": "React", "category": "framework", "icon": "devicon-react-original", "color": "#61DAFB"},
        {"name": "Vue.js", "category": "framework", "icon": "devicon-vuejs-plain", "color": "#4FC08D"},
        {"name": "Tailwind CSS", "category": "framework", "icon": "devicon-tailwindcss-plain", "color": "#06B6D4"},
        {"name": "HTML5", "category": "language", "icon": "devicon-html5-plain", "color": "#E34F26"},
        {"name": "CSS3", "category": "language", "icon": "devicon-css3-plain", "color": "#1572B6"},
        
        # Backend
        {"name": "FastAPI", "category": "framework", "icon": "devicon-fastapi-plain", "color": "#009688"},
        {"name": "Django", "category": "framework", "icon": "devicon-django-plain", "color": "#092E20"},
        {"name": "Node.js", "category": "framework", "icon": "devicon-nodejs-plain", "color": "#339933"},
        {"name": "Express", "category": "framework", "icon": "devicon-express-original", "color": "#000000"},
        
        # Databases
        {"name": "PostgreSQL", "category": "database", "icon": "devicon-postgresql-plain", "color": "#4169E1"},
        {"name": "MongoDB", "category": "database", "icon": "devicon-mongodb-plain", "color": "#47A248"},
        {"name": "Redis", "category": "database", "icon": "devicon-redis-plain", "color": "#DC382D"},
        {"name": "MySQL", "category": "database", "icon": "devicon-mysql-plain", "color": "#4479A1"},
        
        # Cloud & DevOps
        {"name": "Docker", "category": "tool", "icon": "devicon-docker-plain", "color": "#2496ED"},
        {"name": "Git", "category": "tool", "icon": "devicon-git-plain", "color": "#F05032"},
        {"name": "AWS", "category": "cloud", "icon": "devicon-amazonwebservices-original", "color": "#FF9900"},
        {"name": "Linux", "category": "tool", "icon": "devicon-linux-plain", "color": "#FCC624"},
        
        # Data Science & ML
        {"name": "PyTorch", "category": "framework", "icon": "devicon-pytorch-original", "color": "#EE4C2C"},
        {"name": "TensorFlow", "category": "framework", "icon": "devicon-tensorflow-original", "color": "#FF6F00"},
        {"name": "NumPy", "category": "library", "icon": "devicon-numpy-original", "color": "#013243"},
        {"name": "Pandas", "category": "library", "icon": "devicon-pandas-original", "color": "#150458"},
        {"name": "Scikit-learn", "category": "library", "icon": None, "color": "#F7931E"},
        
        # Other Tools
        {"name": "ROS", "category": "framework", "icon": None, "color": "#22314E"},
        {"name": "OpenCV", "category": "library", "icon": "devicon-opencv-plain", "color": "#5C3EE8"},
        {"name": "Qt", "category": "framework", "icon": "devicon-qt-original", "color": "#41CD52"},
    ]
    
    for tech_data in technologies_data:
        tech = Technology(
            name=tech_data["name"],
            slug=slugify(tech_data["name"]),
            category=tech_data["category"],
            icon=tech_data["icon"],
            color=tech_data["color"]
        )
        db.add(tech)
    
    db.commit()
    print(f"✅ Added {len(technologies_data)} technologies")
    
    return {tech.name: tech.id for tech in db.query(Technology).all()}


def seed_blog_posts(db: Session):
    """Add blog posts to database"""
    print("📝 Adding blog posts...")
    
    # First, get or create an admin user for blog posts
    admin_user = db.query(User).filter(User.email == "admin@portfolio.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@portfolio.com",
            username="admin",
            password_hash=get_password_hash("changethispassword"),
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    
    blog_posts_data = [
        {
            "title": "Getting Started with FastAPI and PostgreSQL",
            "slug": "getting-started-fastapi-postgresql",
            "excerpt": "Learn how to build a modern REST API using FastAPI and PostgreSQL with advanced features.",
            "content": """# Getting Started with FastAPI and PostgreSQL

FastAPI is a modern, fast web framework for building APIs with Python. In this tutorial, we'll explore how to create a production-ready API with PostgreSQL integration.

## Why FastAPI?

- **Fast**: Very high performance, on par with NodeJS and Go
- **Easy**: Designed to be easy to use and learn
- **Robust**: Production-ready code with automatic interactive documentation

## Prerequisites

- Python 3.8+
- PostgreSQL database
- Basic understanding of Python and REST APIs

## Installation

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary
```

## Building Your First API

Let's create a simple API endpoint:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

This is just the beginning! Stay tuned for more advanced tutorials.""",
            "cover_image": None,
            "published": True,
            "reading_time": 8,
            "views": 0,
        },
        {
            "title": "Building Scalable UAV Communication Systems",
            "slug": "scalable-uav-communication-systems",
            "excerpt": "Exploring anti-jamming techniques and secure telemetry for unmanned aerial vehicles.",
            "content": """# Building Scalable UAV Communication Systems

In my work on the Sarkan UAV project, I've learned valuable lessons about building robust communication systems for autonomous vehicles.

## The Challenge

UAVs require reliable, low-latency communication for:
- Real-time telemetry
- Command and control
- Video streaming
- Emergency protocols

## Anti-Jamming Techniques

We implemented several strategies:
1. Frequency hopping
2. Error correction codes
3. Redundant communication channels
4. Autonomous failover modes

Stay tuned for more technical details!""",
            "cover_image": None,
            "published": True,
            "reading_time": 12,
            "views": 0,
        },
        {
            "title": "React + TypeScript Best Practices",
            "slug": "react-typescript-best-practices",
            "excerpt": "Essential patterns and tips for building type-safe React applications with TypeScript.",
            "content": """# React + TypeScript Best Practices

TypeScript brings type safety to React, making your code more maintainable and bug-free.

## Key Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Improved autocomplete and refactoring
- **Documentation**: Types serve as inline documentation

## Essential Patterns

### 1. Typed Props

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

More patterns coming soon!""",
            "cover_image": None,
            "published": True,
            "reading_time": 6,
            "views": 0,
        },
        {
            "title": "DevOps with Docker and Kubernetes",
            "slug": "devops-docker-kubernetes",
            "excerpt": "A comprehensive guide to containerization and orchestration for modern cloud applications.",
            "content": """# DevOps with Docker and Kubernetes

Modern cloud applications require efficient deployment and scaling strategies. Docker and Kubernetes are essential tools in this ecosystem.

## Docker Basics

Docker containers package your application with all its dependencies:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## Kubernetes Orchestration

Kubernetes manages your containers at scale:
- Auto-scaling
- Load balancing
- Self-healing
- Rolling updates

More content coming soon!""",
            "cover_image": None,
            "published": True,
            "reading_time": 10,
            "views": 0,
        },
        {
            "title": "Machine Learning with Python and scikit-learn",
            "slug": "machine-learning-python-scikit-learn",
            "excerpt": "Understanding supervised and unsupervised learning algorithms with practical examples.",
            "content": """# Machine Learning with Python and scikit-learn

Machine learning doesn't have to be complicated. Let's explore practical ML with Python and scikit-learn.

## Supervised Learning

Training models with labeled data:

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
clf = RandomForestClassifier()
clf.fit(X_train, y_train)

# Evaluate
accuracy = clf.score(X_test, y_test)
print(f"Accuracy: {accuracy:.2f}")
```

## Unsupervised Learning

Finding patterns without labels - stay tuned!""",
            "cover_image": None,
            "published": True,
            "reading_time": 15,
            "views": 0,
        },
        {
            "title": "Competitive Programming Tips for IEEEXtreme",
            "slug": "competitive-programming-tips-ieeextreme",
            "excerpt": "Strategies and techniques for succeeding in 24-hour programming competitions.",
            "content": """# Competitive Programming Tips for IEEEXtreme

Having organized the IEEEXtreme camp and participated in the competition, here are my top tips:

## Preparation

1. **Master Data Structures**: Arrays, trees, graphs, heaps
2. **Learn Algorithms**: Sorting, searching, dynamic programming
3. **Practice**: Solve problems on Codeforces, LeetCode

## During Competition

- **Read all problems first**: Prioritize easier ones
- **Team coordination**: Divide and conquer
- **Don't get stuck**: Move on if you're blocked
- **Test thoroughly**: Edge cases matter!

## Time Management

A 24-hour competition requires stamina and strategy. More tips coming!""",
            "cover_image": None,
            "published": True,
            "reading_time": 7,
            "views": 0,
        }
    ]
    
    for post_data in blog_posts_data:
        post = BlogPost(
            title=post_data["title"],
            slug=post_data["slug"],
            excerpt=post_data["excerpt"],
            content=post_data["content"],
            cover_image=post_data["cover_image"],
            author_id=admin_user.id,
            published=post_data["published"],
            reading_time=post_data["reading_time"],
            views=post_data["views"],
            published_at=datetime.utcnow() if post_data["published"] else None
        )
        db.add(post)
    
    db.commit()
    print(f"✅ Added {len(blog_posts_data)} blog posts")


def link_project_technologies(db: Session, tech_ids: dict):
    """Link technologies to projects"""
    print("🔗 Linking technologies to projects...")
    
    from app.models.project import ProjectTechnology
    
    # Technology mapping for each project
    project_tech_mapping = {
        "sarkan-uav": ["Python", "C++", "ROS", "OpenCV", "Linux", "Qt"],
        "schedule-optimizer": ["Python", "JavaScript", "FastAPI", "React", "PostgreSQL"],
        "frc-robot-2024": ["Java", "Git", "Linux"],
        "ieeextreme-camp": ["Python", "C++", "Java"],
        "ml-projects": ["Python", "PyTorch", "TensorFlow", "NumPy", "Pandas", "Scikit-learn"],
        "portfolio-website": ["TypeScript", "React", "FastAPI", "PostgreSQL", "Docker", "Redis", "Tailwind CSS"]
    }
    
    for project_slug, tech_names in project_tech_mapping.items():
        project = db.query(Project).filter(Project.slug == project_slug).first()
        if project:
            for tech_name in tech_names:
                if tech_name in tech_ids:
                    pt = ProjectTechnology(
                        project_id=project.id,
                        technology_id=tech_ids[tech_name]
                    )
                    db.add(pt)
    
    db.commit()
    
    # Count total links created
    link_count = db.query(ProjectTechnology).count()
    print(f"✅ Created {link_count} project-technology links")


def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("🌱 SEEDING DATABASE WITH YIĞIT OKUR'S CV DATA")
    print("="*60 + "\n")
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_skills = db.query(Skill).count()
        existing_projects = db.query(Project).count()
        
        if existing_skills > 0 or existing_projects > 0:
            print("⚠️  WARNING: Database already has data!")
            print(f"  - Skills: {existing_skills}")
            print(f"  - Experiences: {db.query(Experience).count()}")
            print(f"  - Projects: {existing_projects}")
            print("\n❓ Clearing existing data and re-seeding...")
            
            # Clear existing data (in correct order due to foreign keys)
            db.query(ProjectTechnology).delete()
            db.query(ProjectImage).delete()
            db.query(ProjectTranslation).delete()
            db.query(Project).delete()
            db.query(Technology).delete()
            db.query(BlogPost).delete()
            db.query(ExperienceTranslation).delete()
            db.query(Experience).delete()
            db.query(Skill).delete()
            db.query(SiteConfig).delete()
            db.commit()
            print("✅ Cleared existing data\n")
        
        # Seed data in order
        seed_skills(db)
        seed_experiences(db)
        seed_projects(db)
        seed_blog_posts(db)
        tech_ids = seed_technologies(db)
        link_project_technologies(db, tech_ids)
        seed_site_config(db)
        
        print("\n" + "="*60)
        print("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"  - Skills: {db.query(Skill).count()}")
        print(f"  - Experiences: {db.query(Experience).count()}")
        print(f"  - Projects: {db.query(Project).count()}")
        print(f"  - Blog Posts: {db.query(BlogPost).count()}")
        print(f"  - Technologies: {db.query(Technology).count()}")
        print(f"  - Project-Technology Links: {db.query(ProjectTechnology).count()}")
        print(f"  - Site Config: {db.query(SiteConfig).count()}")
        print(f"  - Users: {db.query(User).count()}")
        print("\n🚀 Your database is now ready to use!")
        print("\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
