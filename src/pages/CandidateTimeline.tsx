/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { CANDIDATE, TimelineEntry, StageType } from "../../types";
import { motion } from "framer-motion";
import { gsap } from "gsap";

export default function CandidateTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CANDIDATE | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newStage, setNewStage] = useState<StageType>("applied");

  // All candidates for @mention suggestions
  const [allCandidates, setAllCandidates] = useState<CANDIDATE[]>([]);
  // Mentions UI state
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);

  // Portal positioning
  const [menuPos, setMenuPos] = useState<{
    left: number;
    top: number;
    width: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
  });

  const pageRef = useRef(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
    }
  }, [loading]);

  useEffect(() => {
    if (id) fetchCandidateAndTimeline();
  }, [id]);

  const fetchCandidateAndTimeline = async () => {
    setLoading(true);
    try {
      const candidateResponse = await axios.get(`http://backend/candidates`);
      const list: CANDIDATE[] =
        candidateResponse.data?.candidates ??
        candidateResponse.data?.results ??
        candidateResponse.data ??
        [];
      setAllCandidates(list);

      const foundCandidate = list.find(
        (c: CANDIDATE) => String(c.id) === String(id)
      );
      if (!foundCandidate) {
        toast.error("Candidate not found");
        navigate("/candidates");
        return;
      }
      setCandidate(foundCandidate);

      const timelineResponse = await axios.get(
        `http://backend/candidates/${id}/timeline`
      );
      setTimeline(timelineResponse.data?.timeline || []);
    } catch (error) {
      toast.error("Failed to fetch timeline data");
    } finally {
      setLoading(false);
    }
  };

  const addTimelineEntry = async () => {
    if (!newNote.trim() || !id) return;
    try {
      await axios.patch(`http://backend/candidates/${id}`, {
        stage: newStage,
        notes: newNote,
      });
      toast.success("Timeline entry added");
      setNewNote("");
      fetchCandidateAndTimeline();
    } catch (error) {
      toast.error("Failed to add entry");
    }
  };

  const getStageColor = (stage: StageType) =>
    ({
      applied: "bg-blue-500",
      screen: "bg-yellow-500",
      tech: "bg-purple-500",
      offer: "bg-green-500",
      hired: "bg-emerald-500",
      rejected: "bg-red-500",
    }[stage]);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Filtered mention suggestions (from real candidates)
  const filteredMentions = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return allCandidates.slice(0, 8);
    return allCandidates
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [mentionQuery, allCandidates]);

  // Keep the dropdown positioned under the textarea using the anchor's rect
  useLayoutEffect(() => {
    function updatePos() {
      if (!mentionAnchorRef.current) return;
      const rect = mentionAnchorRef.current.getBoundingClientRect();
      setMenuPos({
        left: Math.max(8, rect.left), // slight clamp from the very edge
        top: rect.bottom + 4,
        width: rect.width,
      });
    }
    if (showMentionMenu) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
    }
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [showMentionMenu, newNote]);

  // Insert selected mention into the textarea as @[Full Name]
  function insertMention(target: CANDIDATE) {
    const ta = textareaRef.current;
    const val = newNote;
    if (!ta) return;

    const cursor = ta.selectionStart ?? val.length;
    let i = cursor - 1;
    while (i >= 0 && val[i] !== " " && val[i] !== "\n") i--;
    const tokenStart = i + 1;

    if (val[tokenStart] !== "@") {
      setShowMentionMenu(false);
      setMentionQuery("");
      return;
    }

    const prefix = val.slice(0, tokenStart);
    const suffix = val.slice(cursor);
    const mentionText = `@[${target.name}]`;
    const next = `${prefix}${mentionText} ${suffix}`;

    setNewNote(next);
    setShowMentionMenu(false);
    setMentionQuery("");
    setMentionIndex(0);

    requestAnimationFrame(() => {
      const pos = (prefix + mentionText + " ").length;
      ta.setSelectionRange(pos, pos);
      ta.focus();
    });
  }

  // Render notes with highlighted/clickable mentions
  function renderNotes(text: string) {
    const parts: Array<JSX.Element | string> = [];
    const regex = /\@\[(.+?)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      const fullName = match[1];

      if (start > lastIndex) parts.push(text.slice(lastIndex, start));

      const found = allCandidates.find(
        (c) => c.name?.toLowerCase() === fullName.toLowerCase()
      );

      if (found) {
        parts.push(
          <Link
            key={`${found.id}-${start}`}
            to={`/candidates/${found.id}`}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            @{fullName}
          </Link>
        );
      } else {
        parts.push(
          <span
            key={`unknown-${start}`}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-800"
          >
            @{fullName}
          </span>
        );
      }

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!candidate)
    return (
      <div className="p-8 text-center text-red-500">Candidate not found</div>
    );

  return (
    <div
      ref={pageRef}
      className="min-h-screen p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/candidates/${id}`)}
            className="text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Candidate Timeline
            </h1>
            <p className="text-white/80">
              {candidate.name} - Track progress and add notes
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
              <CardDescription className="text-gray-500">
                Candidate's progress through the hiring process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No timeline entries yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline
                    .sort(
                      (a, b) =>
                        new Date(b.changedAt).getTime() -
                        new Date(a.changedAt).getTime()
                    )
                    .map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        className="flex gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${getStageColor(
                              entry.stage
                            )}`}
                          />
                          {index < timeline.length - 1 && (
                            <div className="w-px h-full bg-gray-300 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`capitalize text-white ${getStageColor(
                                entry.stage
                              )}`}
                            >
                              {entry.stage}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(entry.changedAt)}
                            </span>
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                              {renderNotes(entry.notes)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Plus className="h-5 w-5" />
                Add Entry
              </CardTitle>
              <CardDescription className="text-gray-500">
                Update stage and add notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stage">New Stage</Label>
                <select
                  id="stage"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as StageType)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="applied">Applied</option>
                  <option value="screen">Screening</option>
                  <option value="tech">Technical Interview</option>
                  <option value="offer">Offer</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Notes with @mentions (suggestions from real candidates) */}
              <div className="relative" ref={mentionAnchorRef}>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  ref={textareaRef}
                  value={newNote}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewNote(val);

                    const cursor = e.target.selectionStart ?? val.length;
                    const before = val.slice(0, cursor);
                    let j = before.length - 1;
                    while (j >= 0 && before[j] !== " " && before[j] !== "\n")
                      j--;
                    const token = before.slice(j + 1);

                    if (token.startsWith("@")) {
                      const q = token.slice(1);
                      setMentionQuery(q);
                      setShowMentionMenu(true);
                      setMentionIndex(0);
                    } else {
                      setShowMentionMenu(false);
                      setMentionQuery("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!showMentionMenu || filteredMentions.length === 0)
                      return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMentionIndex((i) => (i + 1) % filteredMentions.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setMentionIndex(
                        (i) =>
                          (i - 1 + filteredMentions.length) %
                          filteredMentions.length
                      );
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const pick = filteredMentions[mentionIndex];
                      if (pick) insertMention(pick);
                    } else if (e.key === "Escape") {
                      setShowMentionMenu(false);
                      setMentionQuery("");
                    }
                  }}
                  placeholder="Add notes... Type @ to mention someone (e.g., @Aarav)"
                  rows={3}
                />

                {/* RENDER THE SAME DROPDOWN VIA A PORTAL TO AVOID CLIPPING */}
                {showMentionMenu &&
                  filteredMentions.length > 0 &&
                  createPortal(
                    <div
                      style={{
                        position: "fixed",
                        left: menuPos.left,
                        top: menuPos.top,
                        width: menuPos.width,
                        zIndex: 9999,
                      }}
                      className="mt-1 max-h-60 overflow-auto rounded-md border bg-white shadow-lg"
                      // prevent blur on mousedown so textarea keeps focus
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredMentions.map((c, i) => (
                        <button
                          type="button"
                          key={c.id}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            i === mentionIndex ? "bg-gray-100" : ""
                          }`}
                          onMouseEnter={() => setMentionIndex(i)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            insertMention(c);
                          }}
                        >
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
              </div>

              <Button
                onClick={addTimelineEntry}
                disabled={!newNote.trim()}
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white"
              >
                Add Timeline Entry
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <User className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Badge
                className={`capitalize text-lg px-4 py-2 text-white ${getStageColor(
                  candidate.stage
                )}`}
              >
                {candidate.stage}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">{candidate.name}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
