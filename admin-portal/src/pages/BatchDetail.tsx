// ============================================
// Admin Portal - Batch Detail Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    ChevronRight,
    ArrowLeft,
    Users,
    BookOpen,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Edit,
    Trash2,
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

interface Batch {
    id: string;
    batch_name: string;
    batch_year: number;
    start_year: number;
    end_year: number;
    is_active: boolean;
}

interface Course {
    id: string;
    course_name: string;
    course_code: string;
    duration_years: number;
    total_semesters: number;
    is_active: boolean;
    branch_count?: number;
}

// ============================================
// Batch Detail Page
// ============================================

export default function BatchDetail() {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        course_name: '',
        course_code: '',
        duration_years: 4,
        total_semesters: 8,
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch batch and courses
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !batchId) {
                // Mock data
                setBatch({ id: batchId || '1', batch_name: '2024-2028', batch_year: 2024, start_year: 2024, end_year: 2028, is_active: true });
                setCourses([
                    { id: '1', course_name: 'B.Tech Computer Science', course_code: 'BTCS', duration_years: 4, total_semesters: 8, is_active: true, branch_count: 3 },
                    { id: '2', course_name: 'B.Tech Electronics', course_code: 'BTEC', duration_years: 4, total_semesters: 8, is_active: true, branch_count: 2 },
                    { id: '3', course_name: 'BBA', course_code: 'BBA', duration_years: 3, total_semesters: 6, is_active: true, branch_count: 1 },
                ]);
                setLoading(false);
                return;
            }

            try {
                // Fetch batch
                const { data: batchData, error: batchError } = await supabase
                    .from('batches')
                    .select('*')
                    .eq('id', batchId)
                    .single();

                if (batchError) throw batchError;
                setBatch(batchData);

                // Fetch courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('is_active', true)
                    .order('course_name');

                if (coursesError) throw coursesError;
                setCourses(coursesData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load batch details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId]);

    // Handle add course
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:4003/api/admin/v1/academic/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create course');
            }

            const result = await response.json();
            setCourses([...courses, result.data]);
            setSuccessMessage('Course created successfully!');
            setIsModalOpen(false);
            setFormData({ course_name: '', course_code: '', duration_years: 4, total_semesters: 8 });
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
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

    if (!batch) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-text-primary">Batch not found</h2>
                <button onClick={() => navigate('/batches')} className="mt-4 text-primary hover:underline">
                    Go back to Batches
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
                <Link to="/batches" className="text-text-secondary hover:text-primary">Batches</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{batch.batch_name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/batches')}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{batch.batch_name}</h1>
                        <p className="text-text-secondary">
                            Academic Year {batch.start_year} - {batch.end_year}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add Course
                    </button>
                </div>
            </div>

            {/* Batch Info Card */}
            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-text-muted text-sm">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium ${batch.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                            }`}>
                            {batch.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Duration</p>
                        <p className="text-text-primary font-semibold mt-1">{batch.end_year - batch.start_year} Years</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Courses</p>
                        <p className="text-text-primary font-semibold mt-1">{courses.length}</p>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm">Start Year</p>
                        <p className="text-text-primary font-semibold mt-1">{batch.start_year}</p>
                    </div>
                </div>
            </div>

            {/* Courses Section */}
            <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Courses in this Batch</h2>

                {courses.length === 0 ? (
                    <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Courses Added</h3>
                        <p className="text-text-secondary mb-4">Add courses to this batch</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Add Course
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/batches/${batchId}/courses/${course.id}`)}
                                className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-1 rounded">
                                        {course.course_code}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                                    {course.course_name}
                                </h3>

                                <div className="flex gap-4 text-sm text-text-secondary mb-4">
                                    <span>{course.duration_years} Years</span>
                                    <span>{course.total_semesters} Semesters</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-text-muted" />
                                        <span className="text-sm text-text-secondary">{course.branch_count || 0} Branches</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Course Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Add Course</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Course Name</label>
                                <input
                                    type="text"
                                    value={formData.course_name}
                                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                    placeholder="B.Tech Computer Science"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Course Code</label>
                                <input
                                    type="text"
                                    value={formData.course_code}
                                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
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
                                        value={formData.duration_years}
                                        onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                        min="1"
                                        max="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Semesters</label>
                                    <input
                                        type="number"
                                        value={formData.total_semesters}
                                        onChange={(e) => setFormData({ ...formData, total_semesters: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                        min="1"
                                        max="12"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Course
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
