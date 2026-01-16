// ============================================
// Admin Portal - Course Branches Page
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
    Edit,
    BookOpen,
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
}

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    course_id: string;
    is_active: boolean;
    class_count?: number;
}

// ============================================
// Course Branches Page
// ============================================

export default function CourseBranches() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [formData, setFormData] = useState({
        branch_name: '',
        branch_code: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch course and branches
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !courseId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch course
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();

                if (courseError) throw courseError;
                setCourse(courseData);

                // Fetch branches for this course
                const { data: branchesData, error: branchesError } = await supabase
                    .from('branches')
                    .select('*')
                    .eq('course_id', courseId)
                    .order('branch_name');

                if (branchesError) throw branchesError;

                // Get class count for each branch
                const branchesWithCounts = await Promise.all(
                    (branchesData || []).map(async (branch) => {
                        const { count } = await supabase
                            .from('classes')
                            .select('id', { count: 'exact', head: true })
                            .eq('branch_id', branch.id);

                        return {
                            ...branch,
                            class_count: count || 0
                        };
                    })
                );

                setBranches(branchesWithCounts);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    // Handle create branch
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !courseId) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            const { data, error } = await supabase
                .from('branches')
                .insert({
                    ...formData,
                    course_id: courseId,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            setBranches([...branches, { ...data, class_count: 0 }]);
            setSuccessMessage('Branch created successfully!');
            setIsModalOpen(false);
            setFormData({ branch_name: '', branch_code: '' });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error creating branch:', error);
            setErrorMessage('Failed to create branch');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit branch
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase || !editingBranch) return;
        setSubmitting(true);
        setErrorMessage('');

        try {
            const { error } = await supabase
                .from('branches')
                .update({ branch_name: formData.branch_name })
                .eq('id', editingBranch.id);

            if (error) throw error;

            setBranches(branches.map(b =>
                b.id === editingBranch.id
                    ? { ...b, branch_name: formData.branch_name }
                    : b
            ));
            setSuccessMessage('Branch updated successfully!');
            setIsEditModalOpen(false);
            setEditingBranch(null);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating branch:', error);
            setErrorMessage('Failed to update branch');
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = (branch: Branch) => {
        setEditingBranch(branch);
        setFormData({
            branch_name: branch.branch_name,
            branch_code: branch.branch_code,
        });
        setIsEditModalOpen(true);
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

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-text-primary">Course not found</h2>
                <button onClick={() => navigate('/courses')} className="mt-4 text-primary hover:underline">
                    Go back to Courses
                </button>
            </div>
        );
    }

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
            <nav className="flex items-center gap-2 text-sm">
                <Link to="/courses" className="text-text-secondary hover:text-primary">Courses</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{course.course_name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/courses')}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-text-primary">{course.course_name}</h1>
                            <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded">
                                {course.course_code}
                            </span>
                        </div>
                        <p className="text-text-secondary">Manage branches for this course</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Branch
                </button>
            </div>

            {/* Course Info Card */}
            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-text-muted text-sm">Course Code</p>
                        <p className="text-text-primary font-semibold mt-1">{course.course_code}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Duration</p>
                        <p className="text-text-primary font-semibold mt-1">{course.duration_years} Years</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Branches</p>
                        <p className="text-text-primary font-semibold mt-1">{branches.length}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Total Classes</p>
                        <p className="text-text-primary font-semibold mt-1">{branches.reduce((sum, b) => sum + (b.class_count || 0), 0)}</p>
                    </div>
                </div>
            </div>

            {/* Branches Section */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Branches</h2>

                {branches.length === 0 ? (
                    <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <GitBranch className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Branches Yet</h3>
                        <p className="text-text-secondary mb-4">Add specialization branches for this course</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Branch
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {branches.map((branch) => (
                            <div
                                key={branch.id}
                                className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                                        <GitBranch className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded">
                                            {branch.branch_code}
                                        </span>
                                        <button
                                            onClick={() => openEditModal(branch)}
                                            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-semibold text-text-primary mb-2">{branch.branch_name}</h3>

                                <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        {branch.class_count || 0} Classes
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${branch.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                        {branch.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Branch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Add Branch</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name *</label>
                                <input
                                    type="text"
                                    value={formData.branch_name}
                                    onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="e.g., Computer Science & Engineering"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Code *</label>
                                <input
                                    type="text"
                                    value={formData.branch_code}
                                    onChange={(e) => setFormData({ ...formData, branch_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="e.g., CSE"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Branch Modal */}
            {isEditModalOpen && editingBranch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Edit Branch</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name *</label>
                                <input
                                    type="text"
                                    value={formData.branch_name}
                                    onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Code</label>
                                <input
                                    type="text"
                                    value={formData.branch_code}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-text-muted cursor-not-allowed"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-teal to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
