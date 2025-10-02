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
  // arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type JOB } from "../../types";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import {
  Grip,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Archive,
  Edit,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          "border-0 shadow-xl hover:shadow-2xl transition-all cursor-grab group bg-white/80 backdrop-blur-sm",
          job.status === "archived" && "opacity-60",
          isDragging && "opacity-50 rotate-2 scale-105"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div role="button" aria-label="Drag handle">
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
    </div>
  );
}

const Placeholder = ({ id, active }: { id: string, active: boolean}) => {
  const { setNodeRef } = useSortable({ id });
  return <div ref={setNodeRef} className={cn("h-24 border-2 border-dashed border-gray-400 rounded-lg", !active && "hidden")} />
}

export default function JobKanban({ jobs, onDragEnd, onMoveToColumn }: { jobs: JOB[], onDragEnd: (event: DragEndEvent) => void, onMoveToColumn: (jobId: string, status: "active" | "archived") => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const activeJobs = jobs.filter((j) => j.status === "active");
  const archivedJobs = jobs.filter((j) => j.status === "archived");

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Active</h2>
          <SortableContext items={activeJobs.map(j => j.id).concat(['active-placeholder'])} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 min-h-[100px]">
              {activeJobs.map(job => <SortableJobItem key={job.id} job={job} onMoveToColumn={onMoveToColumn} />)}
              <Placeholder id="active-placeholder" active={activeJobs.length === 0} />
            </div>
          </SortableContext>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white">Archived</h2>
          <SortableContext items={archivedJobs.map(j => j.id).concat(['archived-placeholder'])} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 min-h-[100px]">
              {archivedJobs.map(job => <SortableJobItem key={job.id} job={job} onMoveToColumn={onMoveToColumn} />)}
              <Placeholder id="archived-placeholder" active={archivedJobs.length === 0} />
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
