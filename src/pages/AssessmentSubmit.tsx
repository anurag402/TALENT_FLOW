/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Upload as UploadIcon,
} from "lucide-react";
import type { JOB, ASSESSMENT } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";

export default function AssessmentSubmit() {
  const { jobId, assessmentId } = useParams<{
    jobId: string;
    assessmentId: string;
  }>();
  const [job, setJob] = useState<JOB | null>(null);
  const [assessment, setAssessment] = useState<ASSESSMENT | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
    }
  }, [loading]);

  useEffect(() => {
    fetchJobAndAssessment();
  }, [assessmentIdParam, jobIdParam]);

  const fetchJobAndAssessment = async () => {
    setLoading(true);
    try {
      const jobResponse = await fetch(`http://backend/jobs?pageSize=100`);
      const jobData = await jobResponse.json();
      const foundJob = jobData.jobs?.find((j: JOB) => j.id === jobId);
      if (!foundJob) {
        toast.error("Job not found");
        return;
      }
      setJob(foundJob);

      const assessmentResponse = await fetch(
        `http://backend/assessments/${jobId}`
      );
      const assessmentData = await assessmentResponse.json();
      console.log(assessmentData);
      if (!assessmentData.assessments) {
        toast.error("Assessment not found");
        return;
      }
      const Data = assessmentData.assessments.find(
        (assess) => assess.id == assessmentId
      );
      if (!Data) {
        toast.error("Assessment not found");
        return;
      }
      setAssessment(Data);
    } catch (error) {
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const validateResponse = (qId: string, val: any, q: any) => {
    const v = q.validation || {};
    if (v.required && (!val || (Array.isArray(val) && val.length === 0)))
      return "This field is required";
    if (q.type === "numeric" && val && isNaN(Number(val)))
      return "Must be a number";
    return null;
  };

  const updateResponse = (qId: string, val: any, q: any) => {
    setResponses({ ...responses, [qId]: val });
    if (errors[qId]) {
      const newErrors = { ...errors };
      delete newErrors[qId];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;
    const newErrors: Record<string, string> = {};
    assessment.questions.forEach((q) => {
      const error = validateResponse(q.id, responses[q.id], q);
      if (error) newErrors[q.id] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix errors");
      return;
    }

    try {
      await fetch(`http://backend/assessments/${jobId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          responses,
          submittedAt: new Date().toISOString(),
        }),
      });
      setSubmitted(true);
      toast.success("Assessment submitted!");
    } catch (error) {
      toast.error("Failed to submit");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
        <div className="text-white">Loading...</div>
      </div>
    );
  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
        <Card className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="pt-12 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Submitted!</h2>
            <p className="text-gray-500 mb-6">
              Thank you for completing the assessment for {job?.title}.
            </p>
            <Button asChild>
              <Link to="/assessments">Back to Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
    >
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            asChild
            className="mb-4 text-white/80 hover:text-white"
          >
            <Link to="/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Card className="bg-white/20 text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{job?.title}</CardTitle>
              <CardDescription className="text-white/80">
                {job?.department} • {job?.location}
              </CardDescription>
              <div className="pt-4">
                <p className="text-white/90">
                  Please complete all required questions below.
                </p>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {assessment?.questions.map((q, idx) => (
              <motion.div
                key={q.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate="visible"
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${
                    errors[q.id] ? "border-red-500" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between">
                      <Label className="text-lg font-semibold">
                        Question {idx + 1}
                        {q.validation?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Badge variant="outline">
                        {q.type.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mt-2">{q.text}</p>
                  </CardHeader>
                  <CardContent>
                    {q.type === "single-choice" && (
                      <RadioGroup
                        value={responses[q.id] || ""}
                        onValueChange={(v) => updateResponse(q.id, v, q)}
                      >
                        {q.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="flex items-center space-x-2 py-2"
                          >
                            <RadioGroupItem
                              value={opt}
                              id={`${q.id}-${oIdx}`}
                            />
                            <Label htmlFor={`${q.id}-${oIdx}`}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.type === "multi-choice" && (
                      <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="flex items-center space-x-2 py-2"
                          >
                            <Checkbox
                              id={`${q.id}-${oIdx}`}
                              checked={(responses[q.id] || []).includes(opt)}
                              onCheckedChange={(c) =>
                                updateResponse(
                                  q.id,
                                  c
                                    ? [...(responses[q.id] || []), opt]
                                    : (responses[q.id] || []).filter(
                                        (v: string) => v !== opt
                                      ),
                                  q
                                )
                              }
                            />
                            <Label htmlFor={`${q.id}-${oIdx}`}>{opt}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === "short-text" && (
                      <Input
                        value={responses[q.id] || ""}
                        onChange={(e) =>
                          updateResponse(q.id, e.target.value, q)
                        }
                        placeholder="Your answer..."
                        maxLength={q.validation?.maxLength}
                      />
                    )}
                    {q.type === "long-text" && (
                      <Textarea
                        value={responses[q.id] || ""}
                        onChange={(e) =>
                          updateResponse(q.id, e.target.value, q)
                        }
                        placeholder="Your answer..."
                        rows={4}
                        maxLength={q.validation?.maxLength}
                      />
                    )}
                    {q.type === "numeric" && (
                      <Input
                        type="number"
                        value={responses[q.id] || ""}
                        onChange={(e) =>
                          updateResponse(q.id, e.target.value, q)
                        }
                        placeholder="Enter a number..."
                        min={q.validation?.min}
                        max={q.validation?.max}
                      />
                    )}
                    {q.type === "file-upload" && (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          File upload demo
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => updateResponse(q.id, "file.pdf", q)}
                        >
                          {responses[q.id] ? "File Selected" : "Select File"}
                        </Button>
                      </div>
                    )}
                    {errors[q.id] && (
                      <p className="text-sm text-red-500 mt-2">
                        {errors[q.id]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  <span className="text-red-500">*</span> Required
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
