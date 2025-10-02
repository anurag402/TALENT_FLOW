import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import type { CANDIDATE, StageType } from '../../types';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CANDIDATE | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
    }
  }, [loading]);

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://backend/candidates`);
      const foundCandidate = response.data.candidates?.find((c: CANDIDATE) => c.id === id);
      if (foundCandidate) {
        setCandidate(foundCandidate);
      } else {
        toast.error('Candidate not found');
        navigate('/candidates');
      }
    } catch (error) {
      toast.error('Failed to fetch candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (newStage: StageType) => {
    if (!candidate || !id) return;
    setUpdating(true);
    try {
      await axios.patch(`http://backend/candidates/${id}`, { stage: newStage });
      setCandidate({ ...candidate, stage: newStage });
      toast.success('Candidate stage updated');
    } catch (error) {
      toast.error('Failed to update stage');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const stageColors: Record<StageType, string> = { applied: 'bg-blue-500', screen: 'bg-yellow-500', tech: 'bg-purple-500', offer: 'bg-green-500', hired: 'bg-emerald-500', rejected: 'bg-red-500' };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!candidate) return <div className="p-8 text-center text-red-500">Candidate not found</div>;

  return (
    <div ref={pageRef} className="min-h-screen p-8 bg-gradient-to-br from-[#3B82F6] via-[#14B8A6] to-[#F9FAFB]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/candidates')} className="text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div><h1 className="text-3xl font-bold text-white">Candidate Details</h1><p className="text-white/80">View and manage candidate information</p></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white text-xl font-bold">{getInitials(candidate.name)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-gray-800">{candidate.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 text-gray-500"><Mail className="h-4 w-4" />{candidate.email}</CardDescription>
                </div>
                <Badge className={`capitalize text-white ${stageColors[candidate.stage]}`}>{candidate.stage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div><h3 className="font-semibold mb-2 text-gray-700">Current Stage</h3><Select value={candidate.stage} onValueChange={handleStageUpdate} disabled={updating}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="applied">Applied</SelectItem><SelectItem value="screen">Screening</SelectItem><SelectItem value="tech">Technical Interview</SelectItem><SelectItem value="offer">Offer</SelectItem><SelectItem value="hired">Hired</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader><CardTitle className="text-gray-800">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full bg-gradient-to-r from-[#3B82F6] to-[#14B8A6] text-white"><Link to={`/candidates/${id}/timeline`}><Calendar className="h-4 w-4 mr-2" />View Timeline</Link></Button>
              <Button variant="outline" className="w-full"><Edit className="h-4 w-4 mr-2" />Edit Details</Button>
              <Button variant="outline" className="w-full text-red-500 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2" />Delete Candidate</Button>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader><CardTitle className="text-gray-800">Candidate Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ID:</span><span className="font-mono text-gray-700">{candidate.id.slice(0, 8)}...</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><Badge variant="outline" className="capitalize">{candidate.stage}</Badge></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
