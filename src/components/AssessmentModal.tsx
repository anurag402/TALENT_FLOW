import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AssessmentModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    console.log("prompt here: ",prompt)
    onGenerate(prompt); // pass prompt to parent
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Assessment with AI</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the job role, skills, and difficulty for the assessment..."
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}