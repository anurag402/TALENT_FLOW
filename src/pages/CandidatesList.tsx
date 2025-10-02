import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  Mail,
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Users,
  Star,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, useDebounce } from "@/lib/utils";
import type { CANDIDATE } from "../../types";
import CandidateKanban from "@/components/CandidateKanban";
import toast from "react-hot-toast";

const stageColors: Record<CANDIDATE["stage"], string> = {
  applied: "bg-blue-500",
  screen: "bg-yellow-500",
  tech: "bg-purple-500",
  offer: "bg-green-500",
  hired: "bg-emerald-500",
  rejected: "bg-red-500",
};

export default function Candidates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [stageFilter, setStageFilter] = useState<CANDIDATE["stage"] | "all">(
    "all"
  );
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [candidatesList, setCandidatesList] = useState<CANDIDATE[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "email" | "stage">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCandidates = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;
      if (stageFilter !== "all") params.stage = stageFilter;
      if (skillsFilter.length > 0) params.skills = skillsFilter.join(",");
      if (locationFilter) params.location = locationFilter;
      // keep page param if backend supports pagination
      params.page = page;
      params.pageSize = 10;

      const res = await axios.get("http://backend/candidates/", { params });
      // Accept multiple possible response shapes
      const data = res.data;
      const list: CANDIDATE[] = Array.isArray(data)
        ? data
        : Array.isArray(data.candidates)
        ? data.candidates
        : Array.isArray(data.results)
        ? data.results
        : data.candidates ?? [];
      setCandidatesList(list);
      if (typeof data.totalPages === "number") setTotalPages(data.totalPages);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.message || "Failed to fetch candidates");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [debouncedSearchQuery, stageFilter, skillsFilter, locationFilter]);

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage]);

 const handleUpdateCandidate = async (
  candidateId: string,
  newStage: CANDIDATE["stage"]
) => {
  const oldCandidate = candidatesList.find((c) => c.id === candidateId);
  if (!oldCandidate) return;

  //Optimistic update
  setCandidatesList((prev) =>
    prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
  );

  try {
    const res = await axios.patch(`http://backend/candidates/${candidateId}`, {
      stage: newStage,
      // notes: `Stage moved from ${oldCandidate.stage} → ${newStage}`, // optional notes
    });

    if (res.data?.candidate) {
      setCandidatesList((prev) =>
        prev.map((c) => (c.id === candidateId ? res.data.candidate : c))
      );
      toast.success(`Stage updated to ${newStage}`);
    } else {
      throw new Error("Invalid server response");
    }
  } catch (e) {
    // Rollback 
    setCandidatesList((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, stage: oldCandidate.stage } : c
      )
    );
    toast.error("Failed to update candidate");
  }
};

  const sortedCandidates = useMemo(() => {
    return [...candidatesList].sort((a, b) => {
      let aValue: string, bValue: string;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "stage":
          aValue = a.stage;
          bValue = b.stage;
          break;
        default:
          return 0;
      }
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [candidatesList, sortBy, sortOrder]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading)
    return <div className="p-8 text-center">Loading candidates...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <motion.div
      className="p-8 min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 rounded-2xl bg-white/20 shadow-lg"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Users className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-white">Candidates</h1>
            <p className="text-white/80 text-lg">
              Manage all candidates in your pipeline
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="bg-white/90 text-[#3B82F6] hover:bg-white shadow-lg hover:shadow-xl border-0"
            onClick={() => navigate("/candidates/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </motion.div>
      </motion.div>

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
              placeholder="Search candidates..."
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
                      Stage
                    </label>
                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    >
                      <option value="all">All Stages</option>
                      <option value="applied">Applied</option>
                      <option value="screen">Screening</option>
                      <option value="tech">Technical</option>
                      <option value="offer">Offer</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Skills
                    </label>
                    <Input
                      placeholder="e.g. React, Node.js"
                      onChange={(e) => setSkillsFilter(e.target.value.split(",").map(s => s.trim()))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    />
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
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                      <option value="stage">Stage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-600">
                      Order
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === "asc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("asc")}
                        className="flex-1"
                      >
                        <SortAsc className="h-4 w-4 mr-1" />
                        Asc
                      </Button>
                      <Button
                        variant={sortOrder === "desc" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortOrder("desc")}
                        className="flex-1"
                      >
                        <SortDesc className="h-4 w-4 mr-1" />
                        Desc
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStageFilter("all");
                        setSkillsFilter([]);
                        setLocationFilter("");
                        setSortBy("name");
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
          Showing {sortedCandidates.length} candidates
        </p>
        {(searchQuery || stageFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStageFilter("all");
            }}
            className="text-white/80 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {viewMode === "kanban" ? (
        <CandidateKanban
          candidates={sortedCandidates}
          onUpdateCandidate={handleUpdateCandidate}
        />
      ) : (
        <motion.div
          className="space-y-4"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
        >
          {sortedCandidates.map((candidate) => (
            <motion.div
              key={candidate.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white font-bold text-lg">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#3B82F6] transition-all duration-300">
                          {candidate.name}
                        </h3>
                        <Badge
                          className={cn(
                            "capitalize shadow-md font-medium text-white",
                            stageColors[candidate.stage]
                          )}
                        >
                          {candidate.stage}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Mail className="h-4 w-4 text-[#14B8A6]" />
                        <span>{candidate.email}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#3B82F6] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10"
                          onClick={() =>
                            navigate(`/candidates/${candidate.id}`)
                          }
                        >
                          View Profile
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {sortedCandidates.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Star className="h-16 w-16 mx-auto text-white/50 mb-4" />
              <p className="text-white/80 text-lg font-medium">
                No candidates found.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="flex justify-center items-center mt-8">
        <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="ghost" className="text-white/80"><ChevronLeft className="h-5 w-5" /></Button>
        <span className="text-white/80 font-medium mx-4">Page {currentPage} of {totalPages}</span>
        <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="ghost" className="text-white/80"><ChevronRight className="h-5 w-5" /></Button>
      </div>
    </motion.div>
  );
}
