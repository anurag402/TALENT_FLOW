import {faker} from "@faker-js/faker";
import {STATUS, STAGES, type CANDIDATE, type JOB} from "../../types";
import { slugify } from "../utils/utils";

export function createJob(orderId:number): JOB{
    const id = faker.string.uuid();
    const title = faker.person.jobTitle();
    const slug = slugify(title);
    const status = faker.helpers.arrayElement(STATUS);
    const tagsarr:string[] = faker.helpers.arrayElements(TAGS,{min:1,max:3});
    const department = faker.helpers.arrayElement([
        "Engineering", "Product", "Design", "Marketing", "Sales", 
        "Operations", "Finance", "HR", "Legal", "Customer Success"
    ]);
    const location = faker.helpers.arrayElement([
        "Remote", "New York, NY", "San Francisco, CA", "Austin, TX", 
        "Seattle, WA", "Boston, MA", "Chicago, IL", "Denver, CO"
    ]);
    const type = faker.helpers.arrayElement(["Full-time", "Part-time", "Contract", "Internship"]);
    const salary = faker.helpers.arrayElement([
        "$50,000 - $70,000", "$70,000 - $90,000", "$90,000 - $120,000", 
        "$120,000 - $150,000", "$150,000 - $200,000", "$200,000+"
    ]);
    const applicants = faker.number.int({ min: 0, max: 150 });
    
    return {
        id,
        title,
        department,
        location,
        type,
        slug,
        salary,
        applicants,
        status,
        tags: tagsarr,
        orderId
    }
}

export function createCandidate():CANDIDATE{
    const id = faker.string.uuid();
    const name = faker.person.fullName();
    const email = faker.internet.email({provider: 'google.com'});
    const stage = faker.helpers.arrayElement(STAGES);
    return {
        id,
        name,
        email,
        stage
    }
}

const TAGS = [
  "Software Engineer",
  "Software Developer",
  "Full Stack Developer",
  "Front End Developer",
  "Back End Developer",
  "Web Developer",
  "Mobile Developer",
  "iOS Developer",
  "Android Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "AWS",
  "Azure",
  "Google Cloud Platform (GCP)",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "Artificial Intelligence",
  "Deep Learning",
  "Natural Language Processing (NLP)",
  "Computer Vision",
  "Big Data Engineer",
  "Database Administrator (DBA)",
  "SQL",
  "NoSQL",
  "Cybersecurity Analyst",
  "Information Security",
  "Penetration Tester",
  "Security Engineer",
  "Network Engineer",
  "Systems Administrator",
  "IT Support Specialist",
  "Technical Support",
  "Project Manager (Tech)",
  "Scrum Master",
  "Product Manager (Tech)",
  "Business Analyst (Tech)",
  "UX Designer",
  "UI Designer",
  "User Experience",
  "User Interface",
  "Quality Assurance (QA)",
  "Software Tester",
  "Automation Testing",
  "Embedded Systems Engineer",
  "Firmware Developer",
  "Computer Architect",
  "Research Scientist (CS)",
  "Academic Researcher (CS)",
  "Algorithm Developer",
  "Distributed Systems",
  "Blockchain Developer",
  "Game Developer",
  "AR/VR Developer",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Scala",
  "HTML",
  "CSS",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "CI/CD",
  "Agile",
  "Waterfall",
  "Linux",
  "Unix",
  "Windows Server",
  "Cloud Computing",
  "Data Mining",
  "Statistical Modeling",
  "MERN Stack",
  "MEAN Stack",
  "PERN Stack",
  "Fullstack",
  "Backend",
  "Frontend",
  "SRE (Site Reliability Engineer)",
  "Technical Writer (CS)",
  "Solutions Architect",
  "Enterprise Architect",
  "Machine Learning Operations (MLOps)",
  "Data Engineering",
  "Data Warehousing"
]