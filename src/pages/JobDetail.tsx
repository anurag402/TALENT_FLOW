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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">Department</p>
          <p className="text-lg font-semibold">{job.department}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="text-lg font-semibold">{job.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="text-lg font-semibold">{job.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Salary</p>
          <p className="text-lg font-semibold">{job.salary}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Applicants</p>
          <p className="text-lg font-semibold">{job.applicants}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-lg font-semibold capitalize">{job.status}</p>
        </div>
      </div>
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      {/* <div className="prose max-w-none"> */}
      {/* <h2 className="text-2xl font-bold mb-4">Job Description</h2> */}
      {/* <p>{job.description}</p> */}
      {/* </div> */}
    </div>
  );
}
