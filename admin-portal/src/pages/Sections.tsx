// ============================================
// Admin Portal - Sections Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    ChevronRight,
    ArrowLeft,
    Users,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    LayoutGrid,
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

interface Class {
    id: string;
    class_name: string;
    section: string;
    current_semester: number;
    student_count?: number;
    class_incharge_name?: string;
    cr_name?: string;
}

interface Branch {
    id: string;
    branch_name: string;
    branch_code: string;
}

interface Course {
    id: string;
    course_name: string;
    course_code: string;
}

interface Batch {
    id: string;
    batch_name: string;
}

// ============================================
// Sections Page
// ============================================

export default function Sections() {
    const { batchId, courseId, branchId } = useParams<{ batchId: string; courseId: string; branchId: string }>();
    const navigate = useNavigate();

    const [batch, setBatch] = useState<Batch | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        section: '',
        current_semester: 1,
    });
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            if (!supabase || !branchId || !courseId || !batchId) {
                // Mock data
                setBatch({ id: batchId || '1', batch_name: '2024-2028' });
                setCourse({ id: courseId || '1', course_name: 'B.Tech Computer Science', course_code: 'BTCS' });
                setBranch({ id: branchId || '1', branch_name: 'Computer Science & Engineering', branch_code: 'CSE' });
                setClasses([
                    { id: '1', class_name: '2024-CSE-A', section: 'A', current_semester: 1, student_count: 60, class_incharge_name: 'Dr. John Smith', cr_name: 'Rahul Singh' },
                    { id: '2', class_name: '2024-CSE-B', section: 'B', current_semester: 1, student_count: 58, class_incharge_name: 'Dr. Sarah Johnson', cr_name: 'Priya Sharma' },
                    { id: '3', class_name: '2024-CSE-C', section: 'C', current_semester: 1, student_count: 55, class_incharge_name: 'Dr. Mike Brown' },
                ]);
                setLoading(false);
                return;
            }

            try {
                const [batchRes, courseRes, branchRes, classesRes] = await Promise.all([
                    supabase.from('batches').select('id, batch_name').eq('id', batchId).single(),
                    supabase.from('courses').select('id, course_name, course_code').eq('id', courseId).single(),
                    supabase.from('branches').select('id, branch_name, branch_code').eq('id', branchId).single(),
                    supabase.from('classes').select('*').eq('branch_id', branchId).eq('batch_id', batchId).order('section'),
                ]);

                if (batchRes.error) throw batchRes.error;
                if (courseRes.error) throw courseRes.error;
                if (branchRes.error) throw branchRes.error;

                setBatch(batchRes.data);
                setCourse(courseRes.data);
                setBranch(branchRes.data);
                setClasses(classesRes.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to load sections');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [batchId, courseId, branchId]);

    // Handle create section/class
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');

        const className = `${batch?.batch_name?.split('-')[0] || ''}-${branch?.branch_code || ''}-${formData.section}`;

        try {
            const response = await fetch('http://localhost:4003/api/admin/v1/academic/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    class_name: className,
                    section: formData.section,
                    current_semester: formData.current_semester,
                    batch_id: batchId,
                    branch_id: branchId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create class');
            }

            const result = await response.json();
            setClasses([...classes, result.data]);
            setSuccessMessage('Section created successfully!');
            setIsModalOpen(false);
            setFormData({ section: '', current_semester: 1 });
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
                <div className="h-8 bg-white/5 rounded w-80 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
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
                <Link to={`/batches/${batchId}/courses/${courseId}`} className="text-text-secondary hover:text-primary">{course?.course_code}</Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{branch?.branch_code} Sections</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/batches/${batchId}/courses/${courseId}`)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{branch?.branch_name}</h1>
                        <p className="text-text-secondary">
                            {batch?.batch_name} | {course?.course_code}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-teal to-primary text-white font-semibold rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>

            {/* Sections Grid */}
            {classes.length === 0 ? (
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                    <LayoutGrid className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No Sections Yet</h3>
                    <p className="text-text-secondary mb-4">Create sections (A, B, C, etc.) for this branch</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-teal to-primary text-white rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Add Section
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            onClick={() => navigate(`/classes/${cls.id}`)}
                            className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6 cursor-pointer hover:border-accent-orange/50 hover:-translate-y-1 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-14 h-14 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-accent-orange">{cls.section}</span>
                                </div>
                                <span className="text-xs font-medium text-text-muted bg-white/5 px-2 py-1 rounded">
                                    Sem {cls.current_semester}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-text-primary mb-3 group-hover:text-accent-orange transition-colors">
                                {cls.class_name}
                            </h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-text-muted" />
                                    <span className="text-sm text-text-secondary">{cls.student_count || 0} students</span>
                                </div>
                                {cls.class_incharge_name && (
                                    <p className="text-sm text-text-muted">In-Charge: {cls.class_incharge_name}</p>
                                )}
                                {cls.cr_name && (
                                    <p className="text-sm text-text-muted">CR: {cls.cr_name}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-sm text-text-muted">Manage Class</span>
                                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-orange group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Section Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-text-primary">Add Section</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-secondary hover:text-text-primary">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Section</label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary text-center text-2xl font-bold focus:outline-none focus:border-primary"
                                    placeholder="A"
                                    maxLength={1}
                                    required
                                />
                                <p className="text-text-muted text-xs mt-1 text-center">
                                    Class: {batch?.batch_name?.split('-')[0]}-{branch?.branch_code}-{formData.section || '?'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Current Semester</label>
                                <select
                                    value={formData.current_semester}
                                    onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting || !formData.section} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-teal to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
