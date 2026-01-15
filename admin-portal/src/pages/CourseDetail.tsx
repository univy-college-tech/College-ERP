// ============================================
// Admin Portal - Course Detail Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    ChevronRight,
    ArrowLeft,
    Users,
    Layers,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Edit,
    GitBranch,
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

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
    course_id: string;
    is_active: boolean;
    section_count?: number;
}

interface Batch {
    id: string;
    batch_name: string;
}

// ============================================
// Course Detail Page
// ============================================

export default function CourseDetail() {
    const { batchId, courseId } = useParams<{ batchId: string; courseId: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        branch_name: '',
        branch_code: '',
    });
    const [editFormData, setEditFormData] = useState({
        course_name: '',
        course_code: '',
        duration_years: 4,
        total_semesters: 8,
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !courseId || !batchId) {
                // Mock data
                setBatch({ id: batchId || '1', batch_name: '2024-2028' });
                setCourse({ id: courseId || '1', course_name: 'B.Tech Computer Science', course_code: 'BTCS', duration_years: 4, total_semesters: 8 });
                setBranches([
                    { id: '1', branch_name: 'Computer Science & Engineering', branch_code: 'CSE', course_id: courseId || '1', is_active: true, section_count: 3 },
                    { id: '2', branch_name: 'Information Technology', branch_code: 'IT', course_id: courseId || '1', is_active: true, section_count: 2 },
                    { id: '3', branch_name: 'Artificial Intelligence', branch_code: 'AI', course_id: courseId || '1', is_active: true, section_count: 2 },
                ]);
                setLoading(false);
                return;
            }

            try {
                const [batchRes, courseRes, branchesRes] = await Promise.all([
                    supabase.from('batches').select('id, batch_name').eq('id', batchId).single(),
                    supabase.from('courses').select('*').eq('id', courseId).single(),
                    supabase.from('branches').select('*').eq('course_id', courseId).eq('is_active', true).order('branch_name'),
                ]);

                if (batchRes.error) throw batchRes.error;
                if (courseRes.error) throw courseRes.error;

                setBatch(batchRes.data);
                setCourse(courseRes.data);
                setBranches(branchesRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, courseId]);

    // Handle add branch
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:4003/api/admin/v1/academic/branches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, course_id: courseId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create branch');
            }

            const result = await response.json();
            setBranches([...branches, result.data]);
            setSuccessMessage('Branch created successfully!');
            setIsModalOpen(false);
            setFormData({ branch_name: '', branch_code: '' });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit course
    const handleEditCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch(`http://localhost:4003/api/admin/v1/academic/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update course');
            }

            const result = await response.json();
            setCourse(result.data);
            setSuccessMessage('Course updated successfully!');
            setIsEditModalOpen(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    // Open edit modal
    const openEditModal = () => {
        if (course) {
            setEditFormData({
                course_name: course.course_name,
                course_code: course.course_code,
                duration_years: course.duration_years,
                total_semesters: course.total_semesters,
            });
            setIsEditModalOpen(true);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded w-64 animate-pulse" />
                <div className="h-24 bg-white/5 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-36 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-text-primary">Course not found</h2>
                <button onClick={() => navigate(`/batches/${batchId}`)} className="mt-4 text-primary hover:underline">
                    Go back to Batch
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
            <nav className="flex items-center gap-2 text-sm flex-wrap">
                <Link to="/batches" className="text-text-secondary hover:text-primary">Batches</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <Link to={`/batches/${batchId}`} className="text-text-secondary hover:text-primary">{batch?.batch_name}</Link>
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
                        onClick={openEditModal}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add Branch
                    </button>
                </div>
            </div>

            {/* Branches Section */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Branches / Specializations</h2>

                {branches.length === 0 ? (
                    <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <GitBranch className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Branches Added</h3>
                        <p className="text-text-secondary mb-4">Add branches/specializations to this course</p>
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
                                        <span className="text-sm text-text-secondary">{branch.section_count || 0} Sections</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-teal group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Branch Modal */}
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
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    value={formData.branch_name}
                                    onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="Computer Science & Engineering"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Code</label>
                                <input
                                    type="text"
                                    value={formData.branch_code}
                                    onChange={(e) => setFormData({ ...formData, branch_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono"
                                    placeholder="CSE"
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

            {/* Edit Course Modal */}
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
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="B.Tech Computer Science"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={editFormData.course_code}
                                    onChange={(e) => setEditFormData({ ...editFormData, course_code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono"
                                    placeholder="BTCS"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Duration (Years)</label>
                                    <input
                                        type="number"
                                        value={editFormData.duration_years}
                                        onChange={(e) => setEditFormData({ ...editFormData, duration_years: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                        min="1"
                                        max="6"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Semesters</label>
                                    <input
                                        type="number"
                                        value={editFormData.total_semesters}
                                        onChange={(e) => setEditFormData({ ...editFormData, total_semesters: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                        min="1"
                                        max="12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
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
