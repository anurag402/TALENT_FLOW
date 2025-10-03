import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { type JOB } from "../../types";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JOB | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        //all jobs
        const { data } = await axios.get("http://backend/jobs", {
          params: {
            page: 1,
            pageSize: 1000, //Large to fetch all jobs
          },
        });

        const foundJob = data.jobs.find((j: JOB) => j.id === jobId);
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError("Job not found");
        }
      } catch (e) {
        console.log(e);
        setError(`Failed to fetch job details: ${e}`);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (loading)
    return <div className="p-8 text-center">Loading job details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!job) return <div className="p-8 text-center">Job not found</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">{job.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-500">{job.department}</span>
            <span className="text-gray-500">&#x2022;</span>
            <span className="text-gray-500">{job.location}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center">
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Type</p>
              <p className="text-lg font-semibold text-gray-800">{job.type}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Salary</p>
              <p className="text-lg font-semibold text-gray-800">{job.salary}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Applicants</p>
              <p className="text-lg font-semibold text-gray-800">{job.applicants}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold capitalize text-gray-800">{job.status}</p>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Job Description</h2>
            <p className="text-gray-600">{job.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
