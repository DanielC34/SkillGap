/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleResume {
  name: string;
  roleTarget: string;
  summary: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    name: "Alex Rivera (Frontend seeking AI Integration)",
    roleTarget: "AI / Machine Learning Engineer",
    summary: "Senior Web App Specialist with 4 years React/TypeScript expertise, looking to pivot into AI Core Engineering.",
    text: `ALEX RIVERA
Email: alex.rivera@example.com | LinkedIn: linkedin.com/in/alex-rivera-dev

PROFESSIONAL SUMMARY
Highly creative Frontend Engineer with 4+ years of professional experience designing, building, and optimizing responsive single-page applications. Proficient in TypeScript, React, and modern Tailwind CSS design. Energetically pivoting to implement AI/ML pipelines, LLM interfaces, and vector index retrievals.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python (Basic scripting)
- Frameworks & libraries: React 18, Next.js, Redux Toolkit, Tailwind CSS
- Tooling: Git, Webpack, Vite, Jest, Cypress
- Databases: PostgreSQL, MongoDB (Familiar)

EXPERIENCE
Frontend Systems Engineer - Vercel Solutions (2024 - Present)
* Lead development of SaaS state analytics platform using React & Tailwind.
* Promoted design systems resulting in a 40% reduction in user onboarding friction.
* Integrated third-party RESTful APIs and optimized front-end packet rendering times.

React Developer - Acme Digital (2022 - 2024)
* Created robust client-interactive dashboards with complex live filtering.
* Partnered with UI/UX design teams to implement pixel-perfect mockup templates.`
  },
  {
    name: "Marcus Vance (Backend seeking Full-Stack)",
    roleTarget: "Full-Stack Engineer",
    summary: "Strong Java & SQLite server engineer aiming to master modern cloud deployment and React ecosystems.",
    text: `MARCUS VANCE
Email: marcus.vance@example.com | GitHub: github.com/marcusv

PROFESSIONAL SUMMARY
Structured, quality-focused Backend Developer with deep expertise in Unix systems, database query design, and persistent Java/Python API structures. Looking to integrate modular frontend frameworks like React to design premium, end-to-end cloud platforms.

TECHNICAL SKILLS
- Back-End: Java, Spring Boot, Python, Express, RESTful APIs
- Persistence: SQL, PostgreSQL, Redis caches, Hibernate ORM
- Cloud/Sytems: Linux CLI, Docker, AWS (S3, EC2)

EXPERIENCE
Core Backend Developer - Apex Data Corp (2023 - Present)
* Managed secure microservices processing over 50,000 transactions per hour.
* Migrated relational schemas, optimizing query retrieval index speeds by 30%.
* Configured automated Docker containers for container integration.

Systems Engineer - ByteCraft Studio (2021 - 2023)
* Wrote clean python data loaders and scheduled complex automation scripts.`
  },
  {
    name: "Elena Rostova (UI/UX seeking PM role)",
    roleTarget: "Product Manager",
    summary: "Interactive architect and Figma veteran ready to command roadmap timelines and product strategy.",
    text: `ELENA ROSTOVA
Email: elena.r@example.com | Website: elenarostova.design

PROFESSIONAL SUMMARY
Award-winning Senior UX Designer with 5+ years of experience leading the visual design of Web3 and fintech SaaS tools. Highly skilled in user research, layout architecture, and interactive prototyping. Pivoting into Product Management to own product roadmaps, write PRDs, and guide cross-functional teams.

KEY COMPETENCIES
- Interactive prototyping, Visual grids, Typography Pairing, Figma Design Systems
- Competitive teardowns, Customer satisfaction logs, User Journeys
- Fast prototyping, CSS systems, Agile/Scrum templates

EXPERIENCE
Lead Product Designer - StripeFlow Labs (2023 - Present)
* Engineered comprehensive visual guidelines for developer platform, reducing churn by 18%.
* Managed user testing teams of 12 specialists, distilling quantitative satisfaction logs.
* Collaborated with engineers to check layout fidelity and visual assets.`
  }
];
