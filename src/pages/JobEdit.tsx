/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

type StatusType = "active" | "archived";

export interface JOB {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  slug: string;
  salary: string;
  applicants: number;
  status: StatusType;
  tags: string[];
  orderId: number;
}

type FormValues = {
  title: string;
  department: string;
  location: string;
  type: string;
  slug: string;
  salary: string;
  applicants: number;
  status: StatusType;
  tagsCsv: string;
};

export default function JobEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      department: "",
      location: "",
      type: "",
      slug: "",
      salary: "",
      applicants: 0,
      status: "active",
      tagsCsv: "",
    },
  });

  const watchedStatus = watch("status");
  const watchedTitle = watch("title");
  const watchedTagsCsv = watch("tagsCsv");

  useEffect(() => {
    const navJob = (location.state as any)?.job;
    if (navJob) {
      reset({ ...navJob, tagsCsv: (navJob.tags || []).join(", ") });
    } else {
      toast.error("No job data provided. Please access from the jobs list.");
    }
  }, [location.state, reset]);

  const parseTags = (csv?: string) =>
    (csv || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  const tagsPreview = useMemo(
    () => parseTags(watchedTagsCsv),
    [watchedTagsCsv]
  );

  async function onSubmit(values: FormValues) {
    if (!id) {
      toast.error("No job ID provided.");
      return;
    }
    const payload: Partial<JOB> = {
      ...values,
      tags: parseTags(values.tagsCsv),
      applicants: Number(values.applicants),
    };
    try {
      await axios.patch(`http://backend/jobs/${id}`, payload);
      toast.success("Job updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save job. Please try again.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <Link to="/jobs">
              <Button
                variant="ghost"
                className="gap-2 text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">Edit Job</h1>
              <p className="mt-1 text-white/80">
                Update the details for this position
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">Job Details</CardTitle>
              <CardDescription className="text-gray-500">
                Make changes to the job information below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="mb-1 block">Job Title</Label>
                  <Input
                    placeholder="Software Engineer"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-1 block">Department</Label>
                  <Input
                    placeholder="Engineering"
                    {...register("department", {
                      required: "Department is required",
                    })}
                  />
                  {errors.department && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Location</Label>
                    <Input
                      {...register("location", {
                        required: "Location required",
                      })}
                      placeholder="Remote / City"
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-1 block">Type</Label>
                    <Input
                      {...register("type", { required: "Type required" })}
                      placeholder="Full-time / Contract"
                    />
                    {errors.type && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.type.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Salary</Label>
                    <Input
                      {...register("salary", { required: "Salary required" })}
                      placeholder="$80,000 - $120,000"
                    />
                    {errors.salary && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.salary.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-1 block">Applicants</Label>
                    <Input
                      type="number"
                      {...register("applicants", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                    />
                    {errors.applicants && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.applicants.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Slug</Label>
                    <Input
                      {...register("slug", { required: "Slug is required" })}
                      placeholder="software-engineer"
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="mb-1 block">Status</Label>
                    <Select
                      value={watchedStatus}
                      onValueChange={(v: any) =>
                        setValue("status", v, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Tags (comma separated)</Label>
                  <Input
                    placeholder="react, typescript, backend"
                    {...register("tagsCsv")}
                  />
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {tagsPreview.length === 0 ? (
                      <span className="text-sm text-gray-500">No tags</span>
                    ) : (
                      tagsPreview.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="bg-[#3B82F6]/10 text-[#3B82F6]"
                        >
                          {t}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="pt-4 flex gap-3 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="ghost" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
