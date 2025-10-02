import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { StageType } from "../../types";
import { motion } from "framer-motion";
import { gsap } from "gsap";

export default function CandidateCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", stage: "applied" as StageType });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("http://backend/candidates", formData);
      toast.success("Candidate added successfully!");
      navigate("/candidates");
    } catch (error) {
      console.error("Error creating candidate:", error);
      toast.error("Failed to create candidate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4">
            <Link to="/candidates">
              <Button variant="ghost" className="gap-2 text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" />Back</Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Add New Candidate</h1>
              <p className="mt-1 text-white/80">Register a new candidate in the system</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#14B8A6]"><UserPlus className="h-6 w-6 text-white" /></div>
                <div>
                  <CardTitle className="text-gray-800">Candidate Information</CardTitle>
                  <CardDescription className="text-gray-500">Enter the candidate's details below</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" placeholder="e.g., Jane Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" placeholder="e.g., jane.doe@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                <div className="space-y-2"><Label htmlFor="stage">Current Stage</Label><Select value={formData.stage} onValueChange={(value: any) => setFormData({ ...formData, stage: value })}><SelectTrigger id="stage"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="applied">Applied</SelectItem><SelectItem value="screen">Screen</SelectItem><SelectItem value="tech">Tech Interview</SelectItem><SelectItem value="offer">Offer</SelectItem><SelectItem value="hired">Hired</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select><p className="text-xs text-gray-500">Select the candidate's current stage</p></div>
                <div className="flex gap-3 pt-6 border-t border-gray-200"><Button type="submit" className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Candidate"}</Button><Button type="button" variant="outline" onClick={() => navigate("/candidates")} className="flex-1">Cancel</Button></div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
