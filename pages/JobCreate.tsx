import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Briefcase, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { StatusType } from "../../types";
import { motion } from "framer-motion";
import { gsap } from "gsap";

export default function JobCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "",
    slug: "",
    salary: "",
    status: "active" as StatusType,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.location || !formData.type || !formData.slug || !formData.salary || formData.tags.length === 0) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: jobsData } = await axios.get("http://backend/jobs", { params: { page: 1, pageSize: 1000 } });
      const maxOrderId = jobsData.jobs.length > 0 ? Math.max(...jobsData.jobs.map((job: any) => job.orderId)) : 0;
      const jobData = { ...formData, applicants: 0, orderId: maxOrderId + 1 };
      await axios.post("http://backend/jobs", jobData);
      toast.success("Job created successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  return (
    <div ref={pageRef} className="min-h-screen p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4">
            <Link to="/jobs">
              <Button variant="ghost" className="gap-2 text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" />Back</Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Create New Job</h1>
              <p className="mt-1 text-white/80">Add a new position to your hiring pipeline</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#14B8A6]"><Briefcase className="h-6 w-6 text-white" /></div>
                <div>
                  <CardTitle className="text-gray-800">Job Details</CardTitle>
                  <CardDescription className="text-gray-500">Fill in the information for this position</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"><Label htmlFor="title">Job Title *</Label><Input id="title" placeholder="e.g., Senior Frontend Engineer" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="department">Department *</Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger id="department"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Product">Product</SelectItem><SelectItem value="Design">Design</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="location">Location *</Label><Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}><SelectTrigger id="location"><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent><SelectItem value="Remote">Remote</SelectItem><SelectItem value="New York, NY">New York, NY</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="type">Employment Type *</Label><Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}><SelectTrigger id="type"><SelectValue placeholder="Select employment type" /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="salary">Salary Range *</Label><Select value={formData.salary} onValueChange={(value) => setFormData({ ...formData, salary: value })}><SelectTrigger id="salary"><SelectValue placeholder="Select salary range" /></SelectTrigger><SelectContent><SelectItem value="$70,000 - $90,000">$70,000 - $90,000</SelectItem><SelectItem value="$90,000 - $120,000">$90,000 - $120,000</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="slug">URL Slug *</Label><Input id="slug" placeholder="e.g., senior-frontend-engineer" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required /><p className="text-xs text-gray-500">/jobs/{formData.slug || "your-slug"}</p></div>
                <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="tags">Tags</Label><div className="flex gap-2"><Input id="tags" placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} /><Button type="button" onClick={addTag} variant="outline" className="gap-2"><Plus className="h-4 w-4" />Add</Button></div>
                  {formData.tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">{formData.tags.map((tag) => (<Badge key={tag} variant="secondary" className="gap-2 pr-1 bg-[#3B82F6]/10 text-[#3B82F6]">{tag}<button type="button" onClick={() => removeTag(tag)} className="rounded-full p-0.5 transition-colors"><X className="h-3 w-3" /></button></Badge>))}</div>)}
                </div>
                <div className="flex gap-3 pt-6 border-t border-gray-200"><Button type="submit" className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Job"}</Button><Button type="button" variant="outline" onClick={() => navigate("/jobs")} className="flex-1">Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
