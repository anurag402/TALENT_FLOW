import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Search, Eye, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import type { JOB, ASSESSMENT } from "../../types";

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState<JOB[]>([]);
  const [assessments, setAssessments] = useState<Record<string, ASSESSMENT[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchJobsAndAssessments();
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    }
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current) {
      const nodes = Array.from(gridRef.current.querySelectorAll(".card-item"));
      if (nodes.length > 0) {
        gsap.fromTo(nodes, { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" });
      }
    }
  }, [loading]);

  const fetchJobsAndAssessments = async () => {
    try {
      setLoading(true);
      const jobsResponse = await fetch("http://backend/jobs?pageSize=12");
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);

      const assessmentsMap: Record<string, ASSESSMENT[]> = {};
      for (const job of jobsData.jobs || []) {
        try {
          const assessmentResponse = await fetch(`http://backend/assessments/${job.id}`);
          const assessmentData = await assessmentResponse.json();
          assessmentsMap[job.id] = Array.isArray(assessmentData.assessments) ? assessmentData.assessments : assessmentData.assessment ? [assessmentData.assessment] : [];
        } catch (error) {
          console.error(`Error fetching assessment for job ${job.id}:`, error);
          assessmentsMap[job.id] = [];
        }
      }
      setAssessments(assessmentsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchTerm ? job.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const jobsWithAssessments = filteredJobs.filter((job) => (assessments[String(job.id)] || []).length > 0);
  const jobsWithoutAssessments = filteredJobs.filter((job) => (assessments[String(job.id)] || []).length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <div className="container mx-auto p-6 max-w-7xl">
        <div ref={heroRef} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-white/20 shadow-md"><ClipboardList className="h-8 w-8 text-white" /></div>
            <h1 className="text-3xl font-extrabold text-white">Assessments</h1>
          </div>
          <p className="text-white/80 max-w-2xl">Create, preview and manage job-specific assessments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B82F6]" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border-0 shadow-lg"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Jobs</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent>
          </Select>
          <Button onClick={() => fetchJobsAndAssessments()} variant="ghost" className="text-white/80 hover:text-white"><svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.72" /><path d="M21 3v6h-6" /></svg>Refresh</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="text-white/80">Loading assessments...</div></div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white/90 border-b-2 border-white/20 pb-2 mb-4">Jobs with Assessments <span className="text-sm text-white/70">({jobsWithAssessments.length})</span></h2>
            {jobsWithAssessments.length > 0 && (
              <div ref={gridRef} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobsWithAssessments.map((job, idx) => (
                    <motion.div key={String(job.id)} className="card-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.03, y: -5 }}>
                      <Card className="hover:shadow-2xl transition-shadow transform-gpu border-0 bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2 text-gray-800">{job.title}</CardTitle>
                              <CardDescription className="text-sm text-gray-500">{job.department}</CardDescription>
                            </div>
                            <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">{job.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-sm text-gray-600">
                              {(() => {
                                const jobAssessments = assessments[String(job.id)] || [];
                                const totalQuestions = jobAssessments.reduce((sum, a) => sum + (a.questions?.length || 0), 0);
                                if (jobAssessments.length === 0) return "0 questions";
                                if (jobAssessments.length === 1) return `${totalQuestions} questions`;
                                return `${jobAssessments.length} assessments • ${totalQuestions} questions`;
                              })()}
                            </div>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm" className="flex-1"><Link to={`/assessments/${job.id}/submit`}><Eye className="h-4 w-4 mr-2" />Preview</Link></Button>
                              <Button asChild size="sm" className="flex-1 bg-[#3B82F6] hover:bg-[#3B82F6]/90"><Link to={`/assessments/${job.id}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link></Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold text-white/90 border-b-2 border-white/20 pb-2 mb-4">Jobs without Assessments <span className="text-sm text-white/70">({jobsWithoutAssessments.length})</span></h2>
            {jobsWithoutAssessments.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobsWithoutAssessments.map((job, idx) => (
                    <motion.div key={String(job.id)} className="card-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -5 }}>
                      <Card className="hover:shadow-lg transition-shadow border-dashed border-2 border-white/30 bg-white/50 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2 text-gray-800">{job.title}</CardTitle>
                              <CardDescription className="text-sm text-gray-500">{job.department}</CardDescription>
                            </div>
                            <Badge variant={job.status === "active" ? "default" : "secondary"} className="capitalize">{job.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <Button asChild className="w-full bg-gradient-to-r from-[#14B8A6] to-[#3B82F6] text-white hover:from-[#14B8A6]/90"><Link to={`/assessments/new/${job.id}`}><Plus className="h-4 w-4 mr-2" />Create Assessment</Link></Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12"><ClipboardList className="h-12 w-12 text-white/50 mx-auto mb-4" /><p className="text-white/80">No jobs found</p></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
