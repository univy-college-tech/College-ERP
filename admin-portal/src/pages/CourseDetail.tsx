// ============================================
// Admin Portal - Course Detail Page (Batch Context)
// Shows branches linked to a specific batch-course combination
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    ChevronRight,
    ArrowLeft,
    GitBranch,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Layers,
    Link2,
    Edit
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ============================================
// Supabase Client
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ============================================
// Types
// ============================================

interface Course {
    id: string;
    course_name: string;
    course_code: string;
    duration_years: number;
    total_semesters: number;
}

interface Batch {
    id: string;
    batch_name: string;
    batch_year: number;
}

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    is_active: boolean;
    section_count?: number;
}

// ============================================
// Course Detail Page
// ============================================

export default function CourseDetail() {
    const { batchId, courseId } = useParams<{ batchId: string; courseId: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [allBranches, setAllBranches] = useState<Branch[]>([]); // ALL branches for this course
    const [linkedBranches, setLinkedBranches] = useState<Branch[]>([]); // Linked to this batch
    const [loading, setLoading] = useState(true);

    // Modals
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);
    const [isLinkBranchModalOpen, setIsLinkBranchModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form Data
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [branchFormData, setBranchFormData] = useState({ branch_name: '', branch_code: '' });
    const [editFormData, setEditFormData] = useState({
        course_name: '',
        course_code: '',
        duration_years: 4,
        total_semesters: 8,
    });

    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !courseId || !batchId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch Batch & Course
                const [batchRes, courseRes] = await Promise.all([
                    supabase.from('batches').select('*').eq('id', batchId).single(),
                    supabase.from('courses').select('*').eq('id', courseId).single(),
                ]);

                if (batchRes.error) throw batchRes.error;
                if (courseRes.error) throw courseRes.error;

                setBatch(batchRes.data);
                setCourse(courseRes.data);

                // Fetch ALL branches for this course (for linking)
                const { data: allBranchesData } = await supabase
                    .from('branches')
                    .select('*')
                    .eq('course_id', courseId)
                    .eq('is_active', true)
                    .order('branch_name');

                setAllBranches(allBranchesData || []);

                // Fetch Linked Branches via batch_branches
                const { data: batchBranchesData, error: bbError } = await supabase
                    .from('batch_branches')
                    .select(`
                        branch_id,
                        branches(*)
                    `)
                    .eq('batch_id', batchId)
                    .eq('is_active', true);

                let currentLinked: Branch[] = [];

                if (bbError) {
                    console.log('batch_branches table issue or empty', bbError);
                    // Fallback or empty
                } else {
                    currentLinked = (batchBranchesData || [])
                        .map((bb: any) => bb.branches)
                        .filter((b: Branch | null): b is Branch => b !== null && b.is_active);
                }

                // If existing implementation didn't use batch_branches, we might show nothing
                // But user wants "show only linked", so we respect the table.
                setLinkedBranches(currentLinked);

                // Fetch section counts for linked branches
                // (Optional: can add if needed, skipping for now to keep it simple/fast)

            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, courseId]);

    // Handle Link Branch
    const handleLinkBranch = async () => {
        if (!supabase || !batchId || !selectedBranchId) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            const { error } = await supabase
                .from('batch_branches')
                .insert({ batch_id: batchId, branch_id: selectedBranchId });

            if (error) {
                if (error.code === '23505') setErrorMessage('Branch already linked');
                else throw error;
            } else {
                setSuccessMessage('Branch linked successfully!');
                setIsLinkBranchModalOpen(false);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error linking branch:', error);
            setErrorMessage('Failed to link branch');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Create Branch
    const handleCreateBranch = async () => {
        if (!supabase || !courseId || !batchId || !branchFormData.branch_name || !branchFormData.branch_code) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            // 1. Create Branch
            const { data: newBranch, error: branchError } = await supabase
                .from('branches')
                .insert({
                    branch_name: branchFormData.branch_name,
                    branch_code: branchFormData.branch_code,
                    course_id: courseId,
                    is_active: true
                })
                .select()
                .single();

            if (branchError) throw branchError;

            // 2. Link to Batch
            const { error: linkError } = await supabase
                .from('batch_branches')
                .insert({ batch_id: batchId, branch_id: newBranch.id });

            if (linkError) console.warn('Error linking new branch:', linkError);

            setSuccessMessage('Branch created and linked!');
            setIsCreateBranchModalOpen(false);
            setBranchFormData({ branch_name: '', branch_code: '' });
            window.location.reload();
        } catch (error) {
            console.error('Error creating branch:', error);
            setErrorMessage('Failed to create branch');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Edit Course
    const handleEditCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:4003/api/admin/v1/academic/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });
            if (!response.ok) throw new Error('Failed to update course');

            setSuccessMessage('Course updated!');
            setIsEditModalOpen(false);
            window.location.reload();
        } catch (error) {
            setErrorMessage('Failed to update course');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived state for unlinked branches
    const unlinkedBranches = allBranches.filter(b => !linkedBranches.some(lb => lb.id === b.id));

    if (loading) return <div className="p-12 text-center text-text-secondary">Loading...</div>;
    if (!course || !batch) return <div className="p-12 text-center">Not found</div>;

    return (
        <div className="space-y-6">
            {/* Messages */}
            {successMessage && (
                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg text-success">
                    <CheckCircle className="w-5 h-5" />
                    <p>{successMessage}</p>
                </div>
            )}
            {errorMessage && (
                <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
                    <AlertCircle className="w-5 h-5" />
                    <p>{errorMessage}</p>
                    <button onClick={() => setErrorMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Breadcrumb - Batch First Context */}
            <nav className="flex items-center gap-2 text-sm flex-wrap">
                <Link to="/batches" className="text-text-secondary hover:text-primary">Batches</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <Link to={`/batches/${batchId}`} className="text-text-secondary hover:text-primary">{batch.batch_name}</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{course.course_name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/batches/${batchId}`)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-text-primary">{course.course_name}</h1>
                            <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded">{course.course_code}</span>
                        </div>
                        <p className="text-text-secondary">{course.duration_years} Years | {course.total_semesters} Semesters</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditFormData({
                                course_name: course.course_name,
                                course_code: course.course_code,
                                duration_years: course.duration_years,
                                total_semesters: course.total_semesters,
                            });
                            setIsEditModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Course
                    </button>
                    <button
                        onClick={() => setIsLinkBranchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10"
                    >
                        <Link2 className="w-4 h-4" />
                        Link Branch
                    </button>
                    <button
                        onClick={() => setIsCreateBranchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Create Branch
                    </button>
                </div>
            </div>

            {/* Branches List */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Branches / Specializations</h2>

                {linkedBranches.length === 0 ? (
                    <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <GitBranch className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Branches Linked to this Batch</h3>
                        <p className="text-text-secondary mb-4">Link an existing branch or create a new one for {batch.batch_name}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setIsLinkBranchModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-primary/50 text-primary rounded-lg"
                            >
                                <Link2 className="w-4 h-4" />
                                Link Branch
                            </button>
                            <button
                                onClick={() => setIsCreateBranchModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Create Branch
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {linkedBranches.map((branch) => (
                            <div
                                key={branch.id}
                                // Navigate to a section/classes manager for this branch
                                // Currently maps to Sections page: /courses/:courseId/branches/:branchId/sections
                                // But we are in batch context: /batches/:batchId/courses/:courseId/branches/:branchId/sections
                                onClick={() => navigate(`/batches/${batchId}/courses/${courseId}/branches/${branch.id}/sections`)}
                                className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-accent-teal/50 hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-accent-teal/10 flex items-center justify-center">
                                        <GitBranch className="w-6 h-6 text-accent-teal" />
                                    </div>
                                    <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded">
                                        {branch.branch_code}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-teal transition-colors">
                                    {branch.branch_name}
                                </h3>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-text-muted" />
                                        <span className="text-sm text-text-secondary">Manage Sections</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-teal group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Link Branch Modal */}
            {isLinkBranchModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Link Branch</h2>
                            <button onClick={() => setIsLinkBranchModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Select Branch</label>
                                <select
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                >
                                    <option value="">Choose a branch...</option>
                                    {unlinkedBranches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.branch_name} ({branch.branch_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {unlinkedBranches.length === 0 && (
                                <p className="text-sm text-warning">All branches are already linked.</p>
                            )}
                            <button
                                onClick={handleLinkBranch}
                                disabled={submitting || !selectedBranchId}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                                Link Branch
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Branch Modal */}
            {isCreateBranchModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Create Branch</h2>
                            <button onClick={() => setIsCreateBranchModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-text-muted">This will create a new branch for <strong>{course.course_name}</strong> and link it to <strong>{batch.batch_name}</strong>.</p>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    value={branchFormData.branch_name}
                                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                                    placeholder="e.g. Robotics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Code</label>
                                <input
                                    type="text"
                                    value={branchFormData.branch_code}
                                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                                    placeholder="e.g. ROBO"
                                />
                            </div>
                            <button
                                onClick={handleCreateBranch}
                                disabled={submitting || !branchFormData.branch_name}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                                Create & Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Course Modal Omitted for Brevity but can be included if user needs editing */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Edit Course</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditCourse} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Course Name</label>
                                <input
                                    type="text"
                                    value={editFormData.course_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, course_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={editFormData.course_code}
                                    onChange={(e) => setEditFormData({ ...editFormData, course_code: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
