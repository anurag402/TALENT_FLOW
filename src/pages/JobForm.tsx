import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
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

type JobShape = {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  slug: string;
  salary: string;
  status: StatusType;
  tags: string[];
  applicants?: number;
  orderId?: number;
};

export default function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<JobShape>({
    title: "",
    department: "",
    location: "",
    type: "",
    slug: "",
    salary: "",
    status: "active",
    tags: [],
    applicants: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSlug, setShowSlug] = useState(false);

  // Prefill when editing: prefer location.state.job, else fetch by id
  useEffect(() => {
    const navJob = (location.state as any)?.job;
    if (navJob) {
      setFormData({
        id: navJob.id,
        title: navJob.title ?? "",
        department: navJob.department ?? "",
        location: navJob.location ?? "",
        type: navJob.type ?? "",
        slug: navJob.slug ?? "",
        salary: navJob.salary ?? "",
        status: navJob.status ?? "active",
        tags: navJob.tags || [],
        applicants: navJob.applicants ?? 0,
        orderId: navJob.orderId,
      });
      return;
    }

    if (isEdit && id) {
      // try to fetch job data
      let cancelled = false;
      (async () => {
        try {
          const { data } = await axios.get(`http://backend/jobs/${id}`);
          if (cancelled) return;
          const job = data.job ?? data;
          setFormData({
            id: job.id,
            title: job.title ?? "",
            department: job.department ?? "",
            location: job.location ?? "",
            type: job.type ?? "",
            slug: job.slug ?? "",
            salary: job.salary ?? "",
            status: job.status ?? "active",
            tags: job.tags || [],
            applicants: job.applicants ?? 0,
            orderId: job.orderId,
          });
        } catch (err) {
          console.error("Failed to fetch job:", err);
          toast.error("Failed to load job data.");
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [id, isEdit, location.state]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (title: string) => {
    setFormData((s) => ({ ...s, title, slug: generateSlug(title) }));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData((s) => ({ ...s, tags: [...s.tags, t] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) =>
    setFormData((s) => ({ ...s, tags: s.tags.filter((t) => t !== tagToRemove) }));

  const validate = () => {
    if (!formData.title) return "Please enter a job title";
    if (!formData.department) return "Please select a department";
    if (!formData.location) return "Please enter a location";
    if (!formData.type) return "Please select an employment type";
    if (!formData.slug) return "Missing job slug";
    if (!formData.salary) return "Please enter a salary range";
    if (!formData.tags || formData.tags.length === 0) return "Please add at least one tag";
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await axios.patch(`http://backend/jobs/${id}`, formData);
        toast.success("Job updated successfully!");
      } else {
        // create: compute orderId
        const { data: jobsData } = await axios.get("http://backend/jobs", { params: { page: 1, pageSize: 1000 } });
        const maxOrderId = jobsData.jobs && jobsData.jobs.length > 0 ? Math.max(...jobsData.jobs.map((j: any) => j.orderId)) : 0;
        const payload = { ...formData, applicants: formData.applicants ?? 0, orderId: maxOrderId + 1 };
        await axios.post("http://backend/jobs", payload);
        toast.success("Job created successfully!");
      }
      navigate("/jobs");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "var(--gradient-subtle)", color: "var(--foreground)" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/jobs">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>{isEdit ? "Edit Job" : "Create New Job"}</h1>
            <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>{isEdit ? "Update the job details" : "Add a new position to your hiring pipeline"}</p>
          </div>
        </div>

        <Card className="shadow-lg" style={{ borderColor: "var(--border)", borderWidth: 1, background: "var(--card)", color: "var(--card-foreground)" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <Briefcase className="h-6 w-6" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <div>
                <CardTitle style={{ color: "var(--foreground)" }}>Job Details</CardTitle>
                <CardDescription style={{ color: "var(--muted-foreground)" }}>{isEdit ? "Edit the information for this position" : "Fill in the information for this position"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="title" placeholder="e.g., Senior Frontend Engineer" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Customer Success">Customer Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                    <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                    <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                    <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                    <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Employment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1 block">Salary</Label>
                  <Input id="salary" placeholder="e.g., $90,000 - $120,000" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required />
                </div>
                <div>
                  <Label className="mb-1 block">Applicants</Label>
                  <Input type="number" value={formData.applicants} onChange={(e) => setFormData({ ...formData, applicants: Number(e.target.value) })} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="mb-1 block">Status</Label>
                  <Select value={formData.status} onValueChange={(v: StatusType) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1 block">Slug</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowSlug((s) => !s)}>{showSlug ? "Hide" : "Show"}</Button>
                    {showSlug ? (
                      <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                    ) : (
                      <span className="text-sm text-muted-foreground">(slug hidden)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input id="tags" placeholder="Add a tag (e.g., React, Remote)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                  <Button type="button" onClick={addTag} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-2 pr-1" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="rounded-full p-0.5 transition-colors" style={{ background: "transparent" }}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                <Button type="button" className="flex-1 shadow-primary" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }} onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save changes" : "Create Job")}</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/jobs")} className="flex-1" style={{ background: "var(--card)", color: "var(--card-foreground)" }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
