import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  ClipboardList,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  BarChart3,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import type { JOB, CANDIDATE } from "../../types";
import gsap from "gsap";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  candidatesByStage: Record<string, number>;
  recentCandidates: CANDIDATE[];
  recentJobs: JOB[];
  totalAssessments: number;
  hiringVelocity: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }
  }, [loading]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, candidatesResponse] = await Promise.all([
        axios.get("http://backend/jobs?pageSize=1000"),
        axios.get("http://backend/candidates?pageSize=1000"),
      ]);

      const jobs = jobsResponse.data.jobs || [];
      const candidates = candidatesResponse.data.candidates || [];

      let totalAssessments = 0;
      try {
        const assessmentPromises = jobs
          .slice(0, 10)
          .map((job: JOB) =>
            axios
              .get(`http://backend/assessments/${job.id}`)
              .catch(() => ({ data: { assessments: [] } }))
          );
        const assessmentResponses = await Promise.all(assessmentPromises);
        totalAssessments = assessmentResponses.reduce(
          (total, response) => total + (response.data.assessments?.length || 0),
          0
        );
      } catch (error) {
        console.warn("Error fetching assessments:", error);
      }

      const activeJobs = jobs.filter((job: JOB) => job.status === "active");
      const candidatesByStage = candidates.reduce(
        (acc: Record<string, number>, candidate: CANDIDATE) => {
          acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
          return acc;
        },
        {}
      );

      const recentHires = candidates.filter(
        (c: CANDIDATE) => c.stage === "hired"
      );
      const recentCandidates = candidates.slice(0, 5);
      const recentJobs = jobs
        .sort((a: JOB, b: JOB) => b.orderId - a.orderId)
        .slice(0, 5);

      setStats({
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalCandidates: candidates.length,
        candidatesByStage,
        recentCandidates,
        recentJobs,
        totalAssessments,
        hiringVelocity: recentHires.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        totalCandidates: 0,
        candidatesByStage: {},
        recentCandidates: [],
        recentJobs: [],
        totalAssessments: 0,
        hiringVelocity: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const stageColors: Record<string, string> = {
    applied: "bg-blue-500",
    screen: "bg-yellow-500",
    tech: "bg-purple-500",
    offer: "bg-green-500",
    hired: "bg-emerald-500",
    rejected: "bg-red-500",
  };

  const stageLabels: Record<string, string> = {
    applied: "Applied",
    screen: "Screening",
    tech: "Technical",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected",
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={headerRef}>
        <motion.div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="p-3 rounded-2xl bg-white/20 shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-white/80 text-lg">
                Welcome back! Here's your hiring pipeline at a glance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
      >
        {[
          {
            title: "Total Jobs",
            value: stats.totalJobs,
            subtitle: `${stats.activeJobs} active`,
            icon: Briefcase,
            color: "#3B82F6",
          },
          {
            title: "Total Candidates",
            value: stats.totalCandidates,
            subtitle: "Across all positions",
            icon: Users,
            color: "#10B981",
          },
          {
            title: "Assessments",
            value: stats.totalAssessments,
            subtitle: "Active assessments",
            icon: ClipboardList,
            color: "#F59E0B",
          },
          {
            title: "Hiring Velocity",
            value: stats.hiringVelocity,
            subtitle: "Hired recently",
            icon: TrendingUp,
            color: "#8B5CF6",
          },
        ].map((metric) => (
          <motion.div
            key={metric.title}
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {metric.title}
                </CardTitle>
                <div
                  className="p-2 rounded-lg shadow-lg"
                  style={{ backgroundColor: metric.color }}
                >
                  <metric.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800">
                  {metric.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <BarChart3 className="h-5 w-5 text-[#8B5CF6]" />
              Candidate Pipeline
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of candidates across hiring stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.candidatesByStage).map(([stage, count]) => {
                const percentage = (count / stats.totalCandidates) * 100;
                return (
                  <div key={stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-white shadow-md ${stageColors[stage]}`}
                      >
                        {stageLabels[stage]}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">
                        {count}
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-3 [&>div]:bg-gradient-to-r from-[#3B82F6] to-[#14B8A6]"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  title: "Create Job",
                  icon: Briefcase,
                  link: "/jobs/create",
                  color: "#3B82F6",
                },
                {
                  title: "Add Candidate",
                  icon: UserPlus,
                  link: "/candidates/create",
                  color: "#10B981",
                },
                {
                  title: "View Assessments",
                  icon: ClipboardList,
                  link: "/assessments",
                  color: "#F59E0B",
                },
                {
                  title: "Manage Candidates",
                  icon: Users,
                  link: "/candidates",
                  color: "#8B5CF6",
                },
              ].map((action) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className={`h-20 flex-col gap-2 text-white font-medium border-0 shadow-lg hover:shadow-xl`}
                    style={{ backgroundColor: action.color }}
                  >
                    <Link to={action.link}>
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm">{action.title}</span>
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Users className="h-5 w-5 text-emerald-600" />
              Recent Candidates
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest candidates added to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {stats.recentCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {candidate.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-white shadow-md ${
                          stageColors[candidate.stage]
                        }`}
                      >
                        {stageLabels[candidate.stage]}
                      </Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200 rounded-full"
                      >
                        <Link to={`/candidates/${candidate.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {stats.recentCandidates.length === 0 && (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent candidates</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Recent Jobs
            </CardTitle>
            <CardDescription className="text-gray-600">
              Latest job postings and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {stats.recentJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/50 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          job.status === "active" ? "default" : "secondary"
                        }
                        className="shadow-md"
                      >
                        {job.status}
                      </Badge>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-200 rounded-full"
                      >
                        <Link to={`/jobs/${job.id}/edit`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {stats.recentJobs.length === 0 && (
                <motion.div
                  className="text-center py-8 text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent jobs</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
