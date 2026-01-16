// ============================================
// Admin Portal - Course Batch Branches Page
// Shows branches linked to a batch and allows linking/creating branches
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
    BookOpen,
    Users,
    Link2,
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
}

interface Class {
    id: string;
    class_label: string;
    current_strength: number;
    branch_id: string;
}

// ============================================
// Course Batch Branches Page
// ============================================

export default function CourseBatchBranches() {
    const { courseId, batchId } = useParams<{ courseId: string; batchId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [batch, setBatch] = useState<Batch | null>(null);
    const [allBranches, setAllBranches] = useState<Branch[]>([]); // All branches of this course
    const [linkedBranches, setLinkedBranches] = useState<Branch[]>([]); // Branches linked to this batch
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateBranchModalOpen, setIsCreateBranchModalOpen] = useState(false);
    const [isLinkBranchModalOpen, setIsLinkBranchModalOpen] = useState(false);
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [branchFormData, setBranchFormData] = useState({ branch_name: '', branch_code: '' });
    const [classLabel, setClassLabel] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !courseId || !batchId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch course
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('id, course_name, course_code')
                    .eq('id', courseId)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);

                // Fetch batch
                const { data: batchData, error: batchError } = await supabase
                    .from('batches')
                    .select('id, batch_name, batch_year')
                    .eq('id', batchId)
                    .single();

                if (batchError) throw batchError;
                setBatch(batchData);

                // Fetch ALL branches for this course
                const { data: allBranchesData } = await supabase
                    .from('branches')
                    .select('*')
                    .eq('course_id', courseId)
                    .eq('is_active', true)
                    .order('branch_name');

                setAllBranches(allBranchesData || []);

                // Check if batch_branches table exists and fetch linked branches
                const { data: batchBranchesData, error: bbError } = await supabase
                    .from('batch_branches')
                    .select(`
                        branch_id,
                        branches(*)
                    `)
                    .eq('batch_id', batchId)
                    .eq('is_active', true);

                if (bbError) {
                    // If table doesn't exist, fall back to showing all branches
                    console.log('batch_branches table may not exist, showing all branches');
                    setLinkedBranches(allBranchesData || []);
                } else {
                    // Extract linked branches
                    const linked = (batchBranchesData || [])
                        .map((bb: any) => bb.branches)
                        .filter((b: Branch | null): b is Branch => b !== null && b.is_active);
                    setLinkedBranches(linked);
                }

                // Fetch classes for this batch + all course branches
                const branchIds = (allBranchesData || []).map(b => b.id);
                if (branchIds.length > 0) {
                    const { data: classesData, error: classesError } = await supabase
                        .from('classes')
                        .select('*')
                        .eq('batch_id', batchId)
                        .in('branch_id', branchIds)
                        .order('class_label');

                    if (classesError) throw classesError;

                    // Get student count for each class
                    const classesWithCounts = await Promise.all(
                        (classesData || []).map(async (cls) => {
                            const { count } = await supabase
                                .from('class_students')
                                .select('id', { count: 'exact', head: true })
                                .eq('class_id', cls.id)
                                .eq('is_active', true);

                            return {
                                ...cls,
                                current_strength: count || 0
                            };
                        })
                    );

                    setClasses(classesWithCounts);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, batchId]);

    // Link branch to batch
    const handleLinkBranch = async () => {
        if (!supabase || !batchId || !selectedBranchId) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            const { error } = await supabase
                .from('batch_branches')
                .insert({ batch_id: batchId, branch_id: selectedBranchId });

            if (error) {
                if (error.code === '23505') {
                    setErrorMessage('This branch is already linked to this batch');
                } else {
                    throw error;
                }
            } else {
                setSuccessMessage('Branch linked successfully!');
                setIsLinkBranchModalOpen(false);
                setSelectedBranchId('');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error linking branch:', error);
            setErrorMessage('Failed to link branch. Make sure to run the migration SQL first.');
        } finally {
            setSubmitting(false);
        }
    };

    // Create new branch (and auto-link to this batch)
    const handleCreateBranch = async () => {
        if (!supabase || !courseId || !batchId || !branchFormData.branch_name || !branchFormData.branch_code) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            // Create the branch
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

            // Link to this batch
            const { error: linkError } = await supabase
                .from('batch_branches')
                .insert({ batch_id: batchId, branch_id: newBranch.id });

            if (linkError) {
                console.warn('Could not link branch to batch:', linkError);
            }

            setSuccessMessage('Branch created and linked successfully!');
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

    // Create class
    const handleCreateClass = async () => {
        if (!supabase || !batchId || !selectedBranchId || !classLabel) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            const { data, error } = await supabase
                .from('classes')
                .insert({
                    class_label: classLabel,
                    batch_id: batchId,
                    branch_id: selectedBranchId,
                })
                .select()
                .single();

            if (error) throw error;

            setClasses([...classes, { ...data, current_strength: 0 }]);
            setSuccessMessage('Class created successfully!');
            setIsCreateClassModalOpen(false);
            setClassLabel('');
            setSelectedBranchId('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error creating class:', error);
            setErrorMessage('Failed to create class');
        } finally {
            setSubmitting(false);
        }
    };

    // Generate class label suggestion
    const generateClassLabel = (branchId: string) => {
        const branch = allBranches.find(b => b.id === branchId);
        if (!branch || !batch) return '';

        const existingClasses = classes.filter(c => c.branch_id === branchId);
        const nextLetter = String.fromCharCode(65 + existingClasses.length); // A, B, C...
        return `${batch.batch_year}-${branch.branch_code}-${nextLetter}`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
                <div className="h-24 bg-white/5 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!course || !batch) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-text-primary">Data not found</h2>
                <button onClick={() => navigate('/courses')} className="mt-4 text-primary hover:underline">
                    Go back to Courses
                </button>
            </div>
        );
    }

    // Group classes by branch (show linked branches)
    const classesByBranch = linkedBranches.map(branch => ({
        branch,
        classes: classes.filter(c => c.branch_id === branch.id)
    }));

    // Get unlinked branches
    const unlinkedBranches = allBranches.filter(b => !linkedBranches.some(lb => lb.id === b.id));

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

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm flex-wrap">
                <Link to="/courses" className="text-text-secondary hover:text-primary">Courses</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <Link to={`/courses/${courseId}`} className="text-text-secondary hover:text-primary">{course.course_name}</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{batch.batch_name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/courses/${courseId}`)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{batch.batch_name}</h1>
                        <p className="text-text-secondary">{course.course_name} ({course.course_code})</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsLinkBranchModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10"
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

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-text-muted text-sm">Course</p>
                        <p className="text-text-primary font-semibold mt-1">{course.course_code}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Batch Year</p>
                        <p className="text-text-primary font-semibold mt-1">{batch.batch_year}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Linked Branches</p>
                        <p className="text-text-primary font-semibold mt-1">{linkedBranches.length}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Total Classes</p>
                        <p className="text-text-primary font-semibold mt-1">{classes.length}</p>
                    </div>
                </div>
            </div>

            {/* Branches with Classes */}
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-text-primary">Branches & Classes</h2>

                {linkedBranches.length === 0 ? (
                    <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <GitBranch className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Branches Linked</h3>
                        <p className="text-text-secondary mb-4">Link existing branches or create new ones for this batch</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setIsLinkBranchModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10"
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
                    <div className="space-y-4">
                        {classesByBranch.map(({ branch, classes: branchClasses }) => (
                            <div key={branch.id} className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                            <GitBranch className="w-5 h-5 text-secondary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text-primary">{branch.branch_name}</h3>
                                            <p className="text-xs text-text-muted">{branch.branch_code}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedBranchId(branch.id);
                                            setClassLabel(generateClassLabel(branch.id));
                                            setIsCreateClassModalOpen(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Class
                                    </button>
                                </div>

                                {branchClasses.length === 0 ? (
                                    <p className="text-text-muted text-sm py-4 text-center border-t border-white/5">
                                        No classes created yet for this branch
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4 border-t border-white/5">
                                        {branchClasses.map((cls) => (
                                            <div
                                                key={cls.id}
                                                onClick={() => navigate(`/classes/${cls.id}`)}
                                                className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-text-primary">{cls.class_label}</span>
                                                    <BookOpen className="w-4 h-4 text-text-muted" />
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-text-secondary">
                                                    <Users className="w-4 h-4" />
                                                    {cls.current_strength} Students
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                            <h2 className="text-xl font-bold text-text-primary">Link Branch to Batch</h2>
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
                                <div className="text-sm text-warning">
                                    All branches are already linked.
                                    <button
                                        onClick={() => {
                                            setIsLinkBranchModalOpen(false);
                                            setIsCreateBranchModalOpen(true);
                                        }}
                                        className="ml-1 underline hover:no-underline"
                                    >
                                        Create a new branch
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsLinkBranchModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLinkBranch}
                                    disabled={submitting || !selectedBranchId}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Link Branch
                                </button>
                            </div>
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
                            <p className="text-sm text-text-muted">
                                This branch will be created for <strong>{course.course_name}</strong> and automatically linked to <strong>{batch.batch_name}</strong>.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name *</label>
                                <input
                                    type="text"
                                    value={branchFormData.branch_name}
                                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="e.g., Computer Science & Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Code *</label>
                                <input
                                    type="text"
                                    value={branchFormData.branch_code}
                                    onChange={(e) => setBranchFormData({ ...branchFormData, branch_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="e.g., CSE"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateBranchModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateBranch}
                                    disabled={submitting || !branchFormData.branch_name || !branchFormData.branch_code}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Branch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Class Modal */}
            {isCreateClassModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Create Class</h2>
                            <button onClick={() => setIsCreateClassModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch</label>
                                <input
                                    type="text"
                                    value={linkedBranches.find(b => b.id === selectedBranchId)?.branch_name || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-text-muted cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Class Label *</label>
                                <input
                                    type="text"
                                    value={classLabel}
                                    onChange={(e) => setClassLabel(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="e.g., 2024-CSE-A"
                                />
                                <p className="text-xs text-text-muted mt-1">Suggested format: YEAR-BRANCH-SECTION</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateClassModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateClass}
                                    disabled={submitting || !selectedBranchId || !classLabel}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Class
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
