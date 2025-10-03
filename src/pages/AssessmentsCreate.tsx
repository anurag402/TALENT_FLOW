/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  Save,
  Eye,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import type { JOB, ASSESSMENT } from "../../types";
import AssessmentModal from "@/components/AssessmentModal";
import { prompt, model } from "@/utils/llm_chat";
import { JsonOutputParser } from "@langchain/core/output_parsers";

type QuestionType =
  | "single-choice"
  | "multi-choice"
  | "short-text"
  | "long-text"
  | "numeric"
  | "file-upload";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  validation?: {
    required?: boolean;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  condition?: {
    questionId: string;
    value: string;
  };
}

const questionTypeLabels: Record<QuestionType, string> = {
  "single-choice": "Single Choice",
  "multi-choice": "Multiple Choice",
  "short-text": "Short Text",
  "long-text": "Long Text",
  numeric: "Numeric",
  "file-upload": "File Upload",
};
const typeColorMap: Record<QuestionType, string> = {
  "single-choice": "text-green-500 bg-green-100 border-green-500",
  "multi-choice": "text-indigo-500 bg-indigo-100 border-indigo-500",
  "short-text": "text-yellow-600 bg-yellow-100 border-yellow-500",
  "long-text": "text-orange-500 bg-orange-100 border-orange-500",
  numeric: "text-rose-500 bg-rose-100 border-rose-500",
  "file-upload": "text-cyan-500 bg-cyan-100 border-cyan-500",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const questionItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function AssessmentBuilder() {
  const { jobId, assessmentId } = useParams<{
    jobId?: string;
    assessmentId?: string;
  }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JOB | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isEditMode = !!assessmentId;
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<any>(null);

  useEffect(() => {
    const fetchJobAndAssessment = async () => {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 500));
      const jobResponse = await fetch(`http://backend/jobs?pageSize=100`);
      const jobData = await jobResponse.json();
      const foundJob = jobData.jobs?.find((j: JOB) => j.id === jobId);
      try {
        if (!foundJob) {
          const mockJob: JOB = {
            id: jobId || "job-123",
            title: "Senior Frontend Developer",
            department: "Engineering",
            location: "Remote",
            description: "Build amazing UIs.",
            status: "Open",
          };

          if (isEditMode && assessmentId) {
            const mockAssessment: ASSESSMENT = {
              id: assessmentId,
              title: "Frontend Skills",
              questions: [
                {
                  id: "q-1",
                  type: "single-choice",
                  text: "What is Virtual DOM?",
                  options: ["A real DOM", "A copy of the real DOM"],
                  validation: { required: true },
                },
              ],
            };
            setJob(mockJob);
            setAssessmentTitle(mockAssessment.title);
            setQuestions(mockAssessment.questions);
          }
        } else {
          setJob(foundJob);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndAssessment();
  }, [jobId, assessmentId, isEditMode]);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleGenerate = async (UserPrompt: string) => {
    try {
      const newPrompt = await prompt.invoke({
        text: UserPrompt,
      });
      const parser = new JsonOutputParser<Question[]>();
      const modelResult = await model.invoke(newPrompt);
      const generated = await parser.invoke(modelResult);

      setQuestions((prev) => {
        const newQs = generated.map((gq, idx) => {
          const id = `q-${Date.now()}-${idx}`;
          return {
            id,
            type: gq.type,
            text: gq.text || "",
            options:
              gq.type === "single-choice" || gq.type === "multi-choice"
                ? gq.options && gq.options.length > 0
                  ? gq.options
                  : ["Option 1"]
                : undefined,
            validation: gq.validation || { required: false },
          } as Question;
        });
        return [...prev, ...newQs];
      });

      toast.success("AI-generated questions added!");
    } catch (e) {
      console.log(e);
      toast.error(`${e.message} Failed to generate questions`);
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type,
      text: "",
      validation: { required: false },
    };
    if (type === "single-choice" || type === "multi-choice")
      newQ.options = ["Option 1"];
    setQuestions((prev) => [...prev, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) =>
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  const addOption = (qId: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [
                ...(q.options || []),
                `Option ${(q.options?.length || 0) + 1}`,
              ],
            }
          : q
      )
    );
  const updateOption = (qId: string, oIdx: number, val: string) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options?.map((opt, idx) => (idx === oIdx ? val : opt)),
            }
          : q
      )
    );
  const deleteOption = (qId: string, oIdx: number) =>
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: q.options?.filter((_, idx) => idx !== oIdx) }
          : q
      )
    );

  const saveAssessment = async () => {
    if (!assessmentTitle.trim() || questions.length === 0) {
      toast.error("Title and at least one question are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("http://backend/assessments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assessmentTitle,
          jobId: jobId,
          questions: questions,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save assessment");
      }
      toast.success(`Assessment ${isEditMode ? "updated" : "created"}!`);
      navigate("/assessments");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save assessment");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
        <div className="text-white">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 pt-4" ref={heroRef}>
          <Button
            variant="ghost"
            asChild
            className="mb-6 text-white/80 hover:text-white"
          >
            <Link to="/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4 border-white/20">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                {isEditMode ? "Edit Assessment" : "Create Assessment"}
              </h1>
              <p className="text-lg text-white/80 font-medium">
                <span className="text-white/60">For:</span> {job?.title}
              </p>
            </div>
            <div className="flex gap-3">
              {isEditMode && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    asChild
                    className="text-white border-white/50 hover:bg-white/20"
                  >
                    <Link to={`/assessments/preview/${assessmentId}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setAiModalOpen(true)}
                  className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <AssessmentModal
                  open={aiModalOpen}
                  onClose={() => setAiModalOpen(false)}
                  onGenerate={handleGenerate}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={saveAssessment}
                  disabled={saving}
                  className="bg-white text-[#3B82F6] hover:bg-white/90 shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <Card className="mb-8 shadow-xl bg-white/80 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Assessment Title
            </CardTitle>
            <CardDescription>
              A clear name for internal tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={assessmentTitle}
              onChange={(e) => setAssessmentTitle(e.target.value)}
              placeholder="e.g., Frontend Skills Check"
              className="bg-white/90 text-lg py-6"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div className="lg:col-span-1 xl:col-span-1">
            <Card className="shadow-2xl sticky top-6 bg-white/80 backdrop-blur-sm border-0">
              <CardHeader className="border-b border-gray-200/50">
                <CardTitle className="text-xl">Toolbox</CardTitle>
                <CardDescription>Add a new question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {(Object.keys(questionTypeLabels) as QuestionType[]).map(
                  (type) => (
                    <motion.div
                      key={type}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className={`w-full justify-start font-semibold border-2 ${typeColorMap[type]}`}
                        onClick={() => addQuestion(type)}
                      >
                        <div
                          className={`w-5 h-5 mr-3 ${
                            typeColorMap[type]
                              .replace("text", "bg")
                              .split(" ")[0]
                          } rounded-sm`}
                        ></div>
                        {questionTypeLabels[type]}
                      </Button>
                    </motion.div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          <motion.div
            className="lg:col-span-2 xl:col-span-3 space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {questions.length === 0 ? (
                <Card className="border-4 border-dashed border-white/30 bg-white/20">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Plus className="h-16 w-16 text-white/50 mb-4" />
                    <p className="text-xl font-medium text-white/80">
                      Add your first question
                    </p>
                  </CardContent>
                </Card>
              ) : (
                questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    variants={questionItemVariants}
                    layout
                  >
                    <Card
                      className={`shadow-lg bg-white/90 backdrop-blur-sm border-l-4 ${
                        typeColorMap[question.type].split(" ")[2]
                      }`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <GripVertical className="h-6 w-6 text-gray-400 mt-1 cursor-grab" />
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className={`capitalize text-sm font-semibold ${
                                  typeColorMap[question.type]
                                }`}
                              >
                                {questionTypeLabels[question.type]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteQuestion(question.id)}
                                className="text-red-500/80 hover:bg-red-100/50 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-base font-semibold text-gray-700">
                                Question {index + 1}
                              </Label>
                              <Textarea
                                value={question.text}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    text: e.target.value,
                                  })
                                }
                                placeholder="Type your question..."
                                rows={2}
                                className="bg-white"
                              />
                            </div>
                            {(question.type === "single-choice" ||
                              question.type === "multi-choice") && (
                              <div className="space-y-2 pt-2 border-t">
                                <Label className="font-medium">Options</Label>
                                <div className="space-y-2">
                                  {question.options?.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        value={opt}
                                        onChange={(e) =>
                                          updateOption(
                                            question.id,
                                            oIdx,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          deleteOption(question.id, oIdx)
                                        }
                                        disabled={
                                          (question.options?.length || 0) <= 1
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addOption(question.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Option
                                </Button>
                              </div>
                            )}
                            {question.type === "file-upload" && (
                              <div className="space-y-2 pt-2 border-t">
                                <Label className="font-medium">File Upload</Label>
                                <div className="flex items-center gap-2">
                                  <Input type="file" />
                                </div>
                              </div>
                            )}
                            <div className="space-y-3 pt-3 border-t">
                              <Label className="font-medium">Constraints</Label>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`req-${question.id}`}
                                  checked={
                                    question.validation?.required || false
                                  }
                                  onCheckedChange={(c) =>
                                    updateQuestion(question.id, {
                                      validation: {
                                        ...question.validation,
                                        required: c as boolean,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor={`req-${question.id}`}>
                                  Required
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cond-${question.id}`}
                                  checked={!!question.condition}
                                  onCheckedChange={(c) =>
                                    updateQuestion(question.id, {
                                      condition: c
                                        ? { questionId: "", value: "" }
                                        : undefined,
                                    })
                                  }
                                />
                                <Label htmlFor={`cond-${question.id}`}>
                                  Conditional
                                </Label>
                              </div>
                              {question.condition && (
                                <div className="space-y-2 pl-6">
                                  <select
                                    value={question.condition.questionId}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        condition: {
                                          ...question.condition,
                                          questionId: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                                  >
                                    <option value="">Select a question</option>
                                    {questions
                                      .filter((q) => q.id !== question.id)
                                      .map((q) => (
                                        <option key={q.id} value={q.id}>
                                          {q.text}
                                        </option>
                                      ))}
                                  </select>
                                  <Input
                                    value={question.condition.value}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        condition: {
                                          ...question.condition,
                                          value: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="Value to match"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}