import {createServer, Model, belongsTo, hasMany, Response} from "miragejs"
import {createJob,createCandidate} from "./seedUtils.ts";
import localforage from "localforage";

localforage.config({
  name: "DB",
  storeName: "mirageDB"
});
console.log(Model)

export default async function createMjsServer(){
    return new Promise((resolve) => {
    return createServer({
        models:{
            candidate: Model.extend({
                job: belongsTo("job"),
                timeline: hasMany("timelineEntry")
            }),
            job: Model.extend({
                candidates: hasMany("candidate"),
                assessment: hasMany("assessment")
            }),
            assessment: Model.extend({
                job: belongsTo("job"),   
            }),
            timelineEntry: Model.extend({
                candidate: belongsTo("candidate") // Links back to candidate
            })
        },
        routes(){
            // Create a new assessment
            this.urlPrefix = "http://backend";
            this.get("/jobs", (schema, req) => {
                try{
                    let search = req.queryParams.search || null;
                    let status = req.queryParams.status || null;
                    let page = parseInt(req.queryParams.page, 10) || 1;
                    let pageSize = parseInt(req.queryParams.pageSize, 10) || 20;
                    
                    let jobs = schema.jobs.all().models;
                    // console.log("jobs: ",jobs)
                    // search by title
                    if (search) {
                        jobs = jobs.filter(job => {
                            return job.title && job.title.toLowerCase().includes(search.toLowerCase());
                        });
                    }

                    if (status) {
                        jobs = jobs.filter(job => job.status === status);
                    }

                    const totalJobs = jobs.length;
                    // console.log("total jobs: ",totalJobs);
                    const totalPages = Math.ceil(totalJobs / pageSize);

                    if (page < 1) page = 1;
                    if (page > totalPages) page = totalPages;
                    const startIdx = (page - 1) * pageSize;
                    const endIdx = startIdx + pageSize;
                    const pagedJobs = jobs.slice(startIdx, endIdx);

                    return new Response (
                        200,
                        {},
                        {
                            jobs: pagedJobs,
                            page,
                            pageSize,
                            totalJobs,
                            totalPages
                        }
                    );
                }catch (e) {
                    return new Response(500, {}, { error: `Something went wrong in fetching jobs: ${e}` });
                }
            });
            this.post("/jobs",(schema,req)=>{
                try {
                    const attrs = JSON.parse(req.requestBody);

                    const requiredFields = ["title", "department", "location", "type", "slug", "salary", "applicants", "status", "tags", "orderId"];
                    const missing = requiredFields.filter(f => attrs[f] === undefined || attrs[f] === null);

                    if (missing.length > 0) {
                        return new Response(
                            400,
                            {},
                            { error: `Missing required fields: ${missing.join(", ")}` }
                        );
                    }

                    if (!["active", "archived"].includes(attrs.status)) {
                        return new Response(
                            400,
                            {},
                            { error: "Invalid status value" }
                        );
                    }

                    // Validate tags
                    if (!Array.isArray(attrs.tags) || attrs.tags.length === 0) {
                        return new Response(
                            400,
                            {},
                            { error: "Tags must be a non-empty array" }
                        );
                    }

                    // Validate applicants is a number
                    if (typeof attrs.applicants !== 'number' || attrs.applicants < 0) {
                        return new Response(
                            400,
                            {},
                            { error: "Applicants must be a non-negative number" }
                        );
                    }
                    
                    const job = schema.jobs.create(attrs);
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { job };
                } catch (e) {
                    return new Response(400, {}, { error: "Invalid request body" });
                }
            })
            this.patch("/jobs/:id",(schema,req)=>{
                try {
                    const id = req.params.id;
                    const attrs = JSON.parse(req.requestBody);

                    const job = schema.jobs.find(id);
                    if (!job) {
                        return new Response(404, {}, { error: "Job not found" });
                    }

                    const updatableFields = ["title", "department", "location", "type", "slug", "salary", "applicants", "status", "tags", "orderId"];
                    const updateAttrs = {};
                    for (const key of updatableFields) {
                        if (attrs[key] !== undefined) {
                            updateAttrs[key] = attrs[key];
                        }
                    }
                    
                    if (Object.keys(updateAttrs).length === 0) {
                        return new Response(400, {}, { error: "No valid fields to update" });
                    }

                    if (updateAttrs.status && !["active", "archived"].includes(updateAttrs.status)) {
                        return new Response(400, {}, { error: "Invalid status value" });
                    }

                    if (updateAttrs.tags && (!Array.isArray(updateAttrs.tags) || updateAttrs.tags.length === 0)) {
                        return new Response(400, {}, { error: "Tags must be a non-empty array" });
                    }

                    if (updateAttrs.applicants && (typeof updateAttrs.applicants !== 'number' || updateAttrs.applicants < 0)) {
                        return new Response(400, {}, { error: "Applicants must be a non-negative number" });
                    }

                    job.update(updateAttrs);
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { job };
                } catch (e) {
                    return new Response(400, {}, { error: "Invalid request body" });
                }
            })
            this.patch("/jobs/:id/reorder",(schema,req)=>{
                // Parse the request body for fromOrder and toOrder
                const { fromOrder, toOrder } = JSON.parse(request.requestBody);
                const jobId = request.params.id;

                // Find the job to ensure it exists (optional validation)
                const job = schema.jobs.find(jobId);
                if (!job) {
                    return new Response(404, {}, { error: 'Job not found' });
                }

                // Get all jobs, sort by current orderId
                const allJobs = schema.jobs.all().models;
                const originalOrder = [...allJobs].sort((a, b) => a.orderId - b.orderId);

                // Store original state for rollback
                const originalDump = server.db.dump();

                // Recompute orderIds based on new position
                const newOrder = [...originalOrder];
                const movedJob = newOrder.splice(fromOrder, 1)[0]; // Remove job from original position
                newOrder.splice(toOrder, 0, movedJob); // Insert at new position
                newOrder.forEach((job, index) => {
                    job.update({ orderId: index }); // Reassign orderIds from 0 to n-1
                });

                // Simulate 5-10% failure rate for rollback testing
                if (Math.random() < 0.1) {
                    // Rollback by reloading original state
                    server.db.loadData(originalDump);
                    return new Response(500, {}, { error: 'Reorder failed, rolled back' });
                }

                // Return success or updated job (for optimistic update verification)
                return { success: true, jobs: newOrder.map(job => ({ id: job.id, orderId: job.orderId })) };
            })    
            this.get("/candidates",(schema,req)=>{
                try{
                    let search = req.queryParams.search || null;
                    let stage = req.queryParams.stage || null;
                    let page = parseInt(req.queryParams.page, 10) || 1;
                    let pageSize = 10;

                    let candidates = schema.candidates.all().models;
                    // search by name
                    if (search) {
                        candidates = candidates.filter(candidate => {
                            return candidate.name && candidate.name.toLowerCase().includes(search.toLowerCase());
                        });
                    }

                    const totalCandids = candidates.length;
                    const totalPages = Math.ceil(totalCandids / pageSize);

                    if (page < 1) page = 1;
                    if (page > totalPages) page = totalPages;
                    const startIdx = (page - 1) * pageSize;
                    const endIdx = startIdx + pageSize;
                    const pagedCandidates = candidates.slice(startIdx, endIdx);

                    return new Response (
                        200,
                        {},
                        {
                            candidates: pagedCandidates,
                            page,
                            pageSize,
                            totalCandids,
                            totalPages
                        }
                    );
                }catch (e) {
                    console.log(e)
                    return new Response(500, {}, { error: `Something went wrong in fetching candidates: ${e}` });
                }
            }) 
            this.post("/candidates",(schema,req)=>{
                try {
                    const attrs = JSON.parse(req.requestBody);
                    
                    const requiredFields = ["name", "email", "stage"];
                    const missing = requiredFields.filter(f => attrs[f] === undefined || attrs[f] === null);
                    if (missing.length > 0) {
                        return new Response(
                            400,
                            {},
                            { error: `Missing required fields: ${missing.join(", ")}` }
                        );
                    }
                    
                    const validStages = ["applied","screen","tech","offer","hired","rejected"];
                    if (!validStages.includes(attrs.stage)) {
                        return new Response(
                            400,
                            {},
                            { error: "Invalid stage value" }
                        );
                    }
                    // Create candidate
                    const candidate = schema.candidates.create(attrs);
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { candidate };
                } catch (e) {
                    return new Response(400, {}, { error: "Invalid request body" });
                }
            }) 
            this.patch("/candidates/:id",(schema,req)=>{
                try {
                    const id = req.params.id;
                    const attrs = JSON.parse(req.requestBody);
                    const candidate = schema.candidates.find(id);
                    if (!candidate) {
                        return new Response(404, {}, { error: "Candidate not found" });
                    }

                    const updatableFields = ["name", "email", "stage"];
                    const updateAttrs = {};
                    for (const key of updatableFields) {
                        if (attrs[key] !== undefined) {
                        updateAttrs[key] = attrs[key];
                        }
                    }
                    if (Object.keys(updateAttrs).length === 0) {
                        return new Response(400, {}, { error: "No valid fields to update" });
                    }

                    const validStages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
                    if (updateAttrs.stage && !validStages.includes(updateAttrs.stage)) {
                        return new Response(400, {}, { error: "Invalid stage value" });
                    }
                    console.log("reached here in candidate patch")

                    if (updateAttrs.stage && updateAttrs.stage !== candidate.stage) {
                        schema.timelineEntries.create({
                        candidate: candidate,                       // link relation
                        candidateId: candidate.id,                  // useful for queries/where
                        stage: updateAttrs.stage,
                        changedAt: new Date().toISOString(),
                        notes: attrs.notes || null,
                    });
                    }

                    candidate.update(updateAttrs);
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { candidate };
                } catch (e) {
                    return new Response(400, {}, { error: `Invalid request body ${e}` });
                }
            })
            //TODO: all these endpoints
            this.get("candidates/:id/timeline",(schema,req)=>{
                try{
                    const id = req.params.id;
                    const candidate = schema.candidates.find(id);
                    if(!candidate){
                        return new Response(
                            404,
                            {},
                            {error: "Candidate not found"}
                        )
                    }
                    const timeline = candidate.timeline.models || [];
                    return new Response(
                        200,
                        {},
                        {timeline}
                    )
                } catch(e){
                    return new Response(
                        500,
                        {},
                        {error: `failed to fetch timelines ${e}`}
                    )
                }
            })
            this.get("/assessments/:param",(schema,req)=>{
                try {
                    const param = req.params.param;
                    // If param matches an assessment id, return single assessment
                    const foundAssessment = schema.assessments.find(param);
                    if (foundAssessment) {
                        return new Response(200, {}, { assessment: foundAssessment });
                    }

                    // Otherwise treat param as jobId and return all assessments for that job
                    const assessments = schema.assessments.where({ jobId: param }).models || [];
                    return new Response(200, {}, { assessments });
                } catch (e) {
                    return new Response(500, {}, { error: `Something went wrong in fetching assessments: ${e}` });
                }
            })
            this.put("/assessments/:AssessmentId",(schema,req)=>{
                try {
                    const id = req.params.AssessmentId;
                    const attrs = JSON.parse(req.requestBody);
                    const assessment = schema.assessments.where({ id }).models[0];
                    if (!assessment) {
                        return new Response(404, {}, { error: "Assessment not found for this job" });
                    }
                    if (!('questions' in attrs) || !Array.isArray(attrs.questions)) {
                        return new Response(400, {}, { error: "Missing or invalid 'questions' array in request body" });
                    }
                    assessment.update({ questions: attrs.questions });
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { assessment };
                } catch (e) {
                    return new Response(400, {}, { error: "Invalid request body" });
                }
            }),
             this.post("/assessments/create", (schema, req) => {
                try {
                    const attrs = JSON.parse(req.requestBody);
                    // Required fields: title, jobId, questions (array)
                    if (!attrs.title || !attrs.jobId || !Array.isArray(attrs.questions)) {
                        return new Response(400, {}, { error: "Missing required fields: title, jobId, questions[]" });
                    }
                    // Optionally: check if job exists
                    const job = schema.jobs.findBy({ id: attrs.jobId });
                    if (!job) {
                        return new Response(400, {}, { error: "Job not found for jobId" });
                    }
                    // Create assessment (pass job model for Mirage, jobId for app logic)
                    const assessment = schema.assessments.create({
                        title: attrs.title,
                        job: job,
                        jobId: job.id,
                        questions: attrs.questions
                    });
                    if (typeof localforage !== 'undefined') {
                        localforage.setItem("mirage-db", this.db.dump());
                    }
                    return { assessment };
                } catch (e) {
                    return new Response(400, {}, { error: "Invalid request body" });
                }
            })
            this.post("/assessments/:jobId/submit",(schema,req)=>{
                return {}
            })
            this.namespace = "https://generativelanguage.googleapis.com/*"
            this.passthrough((request) => {
            // Custom comparator function
            // Return true if Mirage should allow the request
            // to pass through, or false if it should be
            // intercepted
            return request.url.includes("google");
            });
        },
        async seeds(server){
            // Try to load from localForage first
            const seedData = async () => {
                const existing = await localforage.getItem("mirage-db");
                if (existing) {
                    server.db.loadData(existing);
                    return;
                }
                // Generate jobs
                const jobs = [];
                for(let i=1; i<=25; i++){
                    const newJob = createJob(i);
                    const jobModel = server.create("job",newJob);
                    jobs.push(jobModel);
                }
                // Generate candidates
                for(let i=1; i<=1000; i++){
                    const newCandidate = createCandidate();
                    const randomIndex = Math.floor(Math.random() * jobs.length);
                    const randomJob = jobs[randomIndex];
                    server.create('candidate', { ...newCandidate, job: randomJob });
                }
                const questionTypes = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric'];
                function randomQuestion(idx) {
                    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
                    return {
                        id: `q${idx}-${Math.random().toString(36).slice(2,8)}`,
                        type,
                        text: `Sample question ${idx + 1}?`,
                        options: (type === 'single-choice' || type === 'multi-choice') ? [
                            'Option A', 'Option B', 'Option C', 'Option D'
                        ] : undefined,
                        validation: { required: true }
                    };
                }
                // Create assessments for the first 4 jobs only
                const jobsToSeed = jobs.slice(0, 4);
                for (const job of jobsToSeed) {
                    // create between 3 and 4 assessments per job
                    const count = 3 + Math.floor(Math.random() * 2); // 3 or 4
                    for (let a = 0; a < count; a++) {
                        const questions = Array.from({ length: 10 }, (_, idx) => randomQuestion(idx));
                        server.create('assessment', {
                            title: `Assessment ${a + 1} for ${job.title}`,
                            job: job,
                            jobId: job.id,
                            questions
                        });
                    }
                }
                // Save to localForage
                const dbDump = server.db.dump();
                await localforage.setItem("mirage-db", dbDump);
            };
            // Mirage expects seeds to be sync, so use IIFE with async
            await seedData();
            resolve(server)
        }
    })
    })
}