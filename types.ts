export type StatusType = "active"|"archived";
export type StageType = "applied"|"screen"|"tech"|"offer"|"hired"|"rejected"

export const STATUS:StatusType[] = ["active","archived"];
export const STAGES:StageType[] = ["applied","screen","tech","offer","hired","rejected"]

// Enum for question types
export type QuestionType = 
  | 'single-choice' 
  | 'multi-choice' 
  | 'short-text' 
  | 'long-text' 
  | 'numeric' 
  | 'file-upload';

export interface ValidationRules {
  required?: boolean;
  maxLength?: number; // For text types
  min?: number; // For numeric
  max?: number; // For numeric
}

// conditional logic (eg. show one ques depending on other)
export interface Condition {
  dependsOnQuestionId: string; 
  value: string | number | boolean | string[]; // Expected value(s) for showing
}

export interface Question {
  id: string; // TODO: decide(e.g., UUID or sequential)
  type: QuestionType;
  text: string; // Question text
  options?: string[]; // For single/multi-choice (array of choices)
  validation?: ValidationRules; 
  condition?: Condition; // Optional conditional display
  // File-upload type has no extra fields per doc (stub)
}

export interface CandidateResponse {
  candidateId: string;
  jobId: string; // TODO: Or assessmentId
  responses: Record<string, string | number | string[] | File | null>; // Map questionId to value
  submittedAt: Date;
}

export interface TimelineEntry {
  id: string; // Unique ID for each entry
  candidateId: string; // Links to candidate
  stage: StageType; // The new stage
  changedAt: Date; // Timestamp of change
  notes?: string; // Optional notes (from doc's "Attach notes with @mentions")
}

export interface JOB{
    id: string,
    title: string,
    department: string;
    location: string;
    type: string;
    slug: string,
    salary: string;
    applicants: number;
    status: StatusType,
    tags: string[],
    orderId:number
}

export interface CANDIDATE{
    id:string,
    name:string,
    email:string,
    stage:StageType
}


export interface ASSESSMENT{
    id?: string;
    title: string; 
    // jobId: string; 
    questions: Question[]; 
}