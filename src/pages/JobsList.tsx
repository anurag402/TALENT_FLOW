/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Archive,
  Edit,
  Grip,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Filter,
  X,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type JOB } from "../../types";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, useDebounce } from "@/lib/utils";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import JobKanban from "@/components/JobKanban";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [jobs, setJobs] = useState<JOB[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">(
    "all"
  );
  const [sortBy, setSortBy] = useState<
    "title" | "department" | "applicants" | "orderId"
  >("orderId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [salaryMin, setSalaryMin] = useState<number>(0);
  const [salaryMax, setSalaryMax] = useState<number>(300000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const createBtnRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );
    }
    if (createBtnRef.current) {
      gsap.fromTo(
        createBtnRef.current,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.5,
        }
      );
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchJobs = async (page: number) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize: 10,
        search: debouncedSearchQuery || undefined,
        department: departmentFilter === "all" ? undefined : departmentFilter,
        jobType: jobTypeFilter === "all" ? undefined : jobTypeFilter,
        location: locationFilter || undefined,
        salaryMin: salaryMin > 0 ? salaryMin : undefined,
        salaryMax: salaryMax < 300000 ? salaryMax : undefined,
      };
      const { data } = await axios.get("http://backend/jobs", { params });
      setJobs(data.jobs as JOB[]);
      console.log("jobs set: ", jobs.length);
      setTotalPages(data.totalPages);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [
    debouncedSearchQuery,
    departmentFilter,
    jobTypeFilter,
    locationFilter,
    salaryMin,
    salaryMax,
  ]);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const activeJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "active")
        .sort((a, b) => a.orderId - b.orderId),
    [jobs]
  );
  const archivedJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === "archived")
        .sort((a, b) => a.orderId - b.orderId),
    [jobs]
  );

  const handleMoveToColumn = async (
    jobId: string,
    targetStatus: "active" | "archived"
  ) => {
    // Optimistic update
    const originalJobs = [...jobs];
    const updatedJobs = jobs.map((j) =>
      j.id === jobId ? { ...j, status: targetStatus } : j
    );
    setJobs(updatedJobs);

    try {
      await axios.patch(`http://backend/jobs/${jobId}`, {
        status: targetStatus,
      });
    } catch {
      setJobs(originalJobs);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (overId === "active-placeholder" || overId === "archived-placeholder") {
      const newStatus = overId === "active-placeholder" ? "active" : "archived";
      const activeJob = jobs.find((j) => j.id === activeId);
      if (activeJob && activeJob.status !== newStatus) {
        handleMoveToColumn(activeId as string, newStatus);
      }
      return;
    }

    const activeJob = jobs.find((j) => j.id === activeId);
    const overJob = jobs.find((j) => j.id === overId);

    if (!activeJob || !overJob) return;

    if (activeJob.status !== overJob.status) {
      // Moving between columns
      handleMoveToColumn(activeId as string, overJob.status);
    } else {
      // Reordering within a column
      setJobs((previousJobs) => {
        const oldIndex = previousJobs.findIndex((j) => j.id === activeId);
        const newIndex = previousJobs.findIndex((j) => j.id === overId);
        if (oldIndex === -1 || newIndex === -1) return previousJobs; // Should not happen

        const reorderedJobs = arrayMove(previousJobs, oldIndex, newIndex);

        (async () => {
          try {
            await axios.patch(`http://backend/jobs/reorder`, {
              jobs: reorderedJobs.map(({ id }, index) => ({
                id,
                orderId: index,
              })),
            });
          } catch (error) {
            setJobs(previousJobs); // Revert on error
          }
        })();

        return reorderedJobs;
      });
    }
  };

  const currentJobs = useMemo(() => {
    let jobsToShow = jobs;
    if (activeTab === "active") jobsToShow = activeJobs;
    if (activeTab === "archived") jobsToShow = archivedJobs;

    return jobsToShow.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "department":
          aValue = a.department;
          bValue = b.department;
          break;
        case "applicants":
          aValue = a.applicants;
          bValue = b.applicants;
          break;
        default:
          aValue = a.orderId;
          bValue = b.orderId;
          break;
      }
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      return sortOrder === "asc"
        ? aValue < bValue
          ? -1
          : 1
        : aValue > bValue
        ? -1
        : 1;
    });
  }, [activeTab, jobs, activeJobs, archivedJobs, sortBy, sortOrder]);

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={headerRef}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-white/20 shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">Jobs</h1>
              <p className="text-white/80 text-lg">
                Manage your open positions
              </p>
            </div>
          </div>
          <div ref={createBtnRef}>
            <Button
              className="bg-white/90 text-[#3B82F6] hover:bg-white shadow-lg hover:shadow-xl border-0"
              onClick={() => navigate("/jobs/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>
      </div>

      <motion.div
        className="flex flex-col gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3B82F6]" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger
                  value="list"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#3B82F6] text-white/80"
                >
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#3B82F6] text-white/80"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="p-4 bg-white/50 backdrop-blur-sm border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">
                    Advanced Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Department
                    </label>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    >
                      <option value="all">All Departments</option>
                      {[...new Set(jobs.map((j) => j.department))].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Job Type
                    </label>
                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    >
                      <option value="all">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Location
                    </label>
                    <Input
                      placeholder="e.g. San Francisco"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Salary Range
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(Number(e.target.value))}
                        className="w-full"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setDepartmentFilter("all");
                        setJobTypeFilter("all");
                        setLocationFilter("");
                        setSalaryMin(0);
                        setSalaryMax(300000);
                        setSortBy("orderId");
                        setSortOrder("asc");
                      }}
                      className="w-full"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/80">
          Showing {currentJobs.length} jobs
        </p>
        {(searchQuery ||
          departmentFilter !== "all" ||
          jobTypeFilter !== "all" ||
          locationFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setDepartmentFilter("all");
              setJobTypeFilter("all");
              setLocationFilter("");
              setSalaryMin(0);
              setSalaryMax(300000);
            }}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {viewMode === "list" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentJobs.map((job) => job.id)}
            strategy={verticalListSortingStrategy}
          >
            <motion.div
              className="space-y-4"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="show"
            >
              {loading && (
                <div className="text-center text-white/80 py-8">
                  Loading jobs...
                </div>
              )}
              {!loading &&
                currentJobs.map((job) => (
                  <SortableJobItem
                    key={job.id}
                    job={job}
                    onMoveToColumn={handleMoveToColumn}
                  />
                ))}
            </motion.div>
          </SortableContext>
        </DndContext>
      ) : (
        <JobKanban
          jobs={jobs}
          onDragEnd={handleDragEnd}
          onMoveToColumn={handleMoveToColumn}
        />
      )}

      <div className="flex justify-center items-center mt-8">
        <Button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          variant="ghost"
          className="text-white/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-white/80 font-medium mx-4">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          variant="ghost"
          className="text-white/80"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

function SortableJobItem({
  job,
  onMoveToColumn,
}: {
  job: JOB;
  onMoveToColumn: (jobId: string, status: "active" | "archived") => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const navigate = useNavigate();

  return (
    <motion.div
      className="job-card"
      variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "border-0 shadow-xl hover:shadow-2xl transition-all cursor-grab group bg-white/80 backdrop-blur-sm",
          job.status === "archived" && "opacity-60",
          isDragging && "opacity-50 rotate-2 scale-105"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div
                {...attributes}
                {...listeners}
                role="button"
                aria-label="Drag handle"
              >
                <Grip className="h-5 w-5 text-[#3B82F6] mt-1 cursor-grab" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#3B82F6] transition-all duration-300">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 font-medium">
                  {job.department}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-[#3B82F6]/10 text-[#3B82F6] text-xs border-[#3B82F6]/20 shadow-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    {
                      icon: MapPin,
                      text: job.location,
                      color: "text-emerald-500",
                    },
                    {
                      icon: DollarSign,
                      text: job.salary,
                      color: "text-green-500",
                    },
                    { icon: Clock, text: job.type, color: "text-orange-500" },
                    {
                      icon: Users,
                      text: `${job.applicants} applicants`,
                      color: "text-purple-500",
                    },
                  ].map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <detail.icon className={`h-4 w-4 ${detail.color}`} />
                      <span className="font-medium">{detail.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Posted {Math.floor(Math.random() * 30) + 1} days ago
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge
                variant={job.status === "active" ? "default" : "secondary"}
                className={cn(
                  "text-white font-medium shadow-lg",
                  job.status === "active" ? "bg-green-500" : "bg-gray-500"
                )}
              >
                {job.status}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-200 p-2 rounded-lg"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}`);
                  }}
                  title="View job"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-200 p-2 rounded-lg"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToColumn(
                      job.id,
                      job.status === "active" ? "archived" : "active"
                    );
                  }}
                  title={
                    job.status === "active" ? "Archive job" : "Restore job"
                  }
                >
                  <Archive className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-200 p-2 rounded-lg"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}/edit`, { state: { job } });
                  }}
                  title="Edit job"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
