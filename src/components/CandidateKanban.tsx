import { useState } from "react";
import { motion } from "framer-motion";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CANDIDATE } from "../../types";

// const stageColors: Record<CANDIDATE["stage"], string> = { applied: "bg-blue-500", screen: "bg-yellow-500", tech: "bg-purple-500", offer: "bg-green-500", hired: "bg-emerald-500", rejected: "bg-red-500" };

function SortableCandidate({ candidate }: { candidate: CANDIDATE }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <motion.div ref={setNodeRef} style={style} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={cn(isDragging && "opacity-50")}>
      <Card className="mb-3 border-0 shadow-lg hover:shadow-xl transition-all cursor-grab active:cursor-grabbing bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4 text-gray-400" /></div>
            <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white font-bold text-xs">{getInitials(candidate.name)}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-800 truncate">{candidate.name}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-500"><Mail className="h-3 w-3" /><span className="truncate">{candidate.email}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KanbanColumn({ stage, candidates, title, color }: { stage: CANDIDATE["stage"], candidates: CANDIDATE[], title: string, color: string }) {
  const { setNodeRef } = useDroppable({ id: stage });
  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <div className={cn("rounded-lg p-3 mb-3 sticky top-0 z-10", color)}><h3 className="font-semibold text-sm flex items-center justify-between text-white">{title}<Badge variant="secondary" className="ml-2 bg-white/20 text-white">{candidates.length}</Badge></h3></div>
      <SortableContext items={candidates.map((c) => c.id)} strategy={verticalListSortingStrategy}><div className="space-y-0 min-h-[400px]">{candidates.map((c) => <SortableCandidate key={c.id} candidate={c} />)}</div></SortableContext>
    </div>
  );
}

export default function CandidateKanban({ candidates, onUpdateCandidate }: { candidates: CANDIDATE[], onUpdateCandidate: (candidateId: string, newStage: CANDIDATE["stage"]) => void; }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const stages: Array<{ stage: CANDIDATE["stage"], title: string, color: string }> = [ { stage: "applied", title: "Applied", color: "bg-blue-500" }, { stage: "screen", title: "Screening", color: "bg-yellow-500" }, { stage: "tech", title: "Technical", color: "bg-purple-500" }, { stage: "offer", title: "Offer", color: "bg-green-500" }, { stage: "hired", title: "Hired", color: "bg-emerald-500" } ];

  const handleDragStart = (event: any) => setActiveId(event.active.id as string);
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCandidate = candidates.find((c) => c.id === active.id);
    if (!activeCandidate) return;

    // Check if dropping into a column
    const overIsColumn = stages.some(s => s.stage === over.id);
    if (overIsColumn) {
      if (activeCandidate.stage !== over.id) {
        onUpdateCandidate(activeCandidate.id, over.id as CANDIDATE["stage"]);
      }
      return;
    }

    // Check if dropping over another candidate
    const overCandidate = candidates.find((c) => c.id === over.id);
    if (overCandidate && activeCandidate.stage !== overCandidate.stage) {
      onUpdateCandidate(activeCandidate.id, overCandidate.stage);
    }
  };

  const activeCandidate = candidates.find((c) => c.id === activeId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(({ stage, title, color }) => <KanbanColumn key={stage} stage={stage} title={title} color={color} candidates={candidates.filter((c) => c.stage === stage)} />)}
      </div>
      <DragOverlay>{activeCandidate ? <Card className="w-80 border-0 shadow-2xl rotate-3 bg-white/95"><CardContent className="p-4"><div className="flex items-start gap-3"><Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white font-bold text-xs">{activeCandidate.name.split(" ").map((n) => n[0]).join("").toUpperCase()}</AvatarFallback></Avatar><div className="flex-1"><h4 className="font-semibold text-sm text-gray-800">{activeCandidate.name}</h4></div></div></CardContent></Card> : null}</DragOverlay>
    </DndContext>
  );
}
