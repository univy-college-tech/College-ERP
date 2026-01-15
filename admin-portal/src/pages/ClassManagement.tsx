// ============================================
// Admin Portal - Class Management Page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    ArrowLeft,
    Users,
    BookOpen,
    Clock,
    UserCheck,
    Crown,
    Plus,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Edit,
    Trash2,
    Search,
    GraduationCap,
    Calendar,
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

interface ClassInfo {
    id: string;
    class_name: string;
    section: string;
    current_semester: number;
    batch_id: string;
    batch_name: string;
    branch_id: string;
    branch_name: string;
    branch_code: string;
    course_id?: string;
    class_incharge_id?: string;
    class_incharge_name?: string;
    class_representative_id?: string;
    class_representative_name?: string;
}

interface Student {
    id: string;
    roll_number: string;
    full_name: string;
    email: string;
    is_active: boolean;
}

interface Subject {
    id: string;
    subject_name: string;
    subject_code: string;
    credits: number;
    professor_name?: string;
    semester: number;
}

interface TimetableEntry {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    subject_name: string;
    subject_code: string;
    professor_name: string;
    room_number: string;
}

interface Professor {
    id: string;
    employee_id: string;
    full_name: string;
    designation: string;
}

// ============================================
// Tab Components
// ============================================

// Students Tab
function StudentsTab({ classId, className: _className }: { classId: string; className: string }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Mock data
        setStudents([
            { id: '1', roll_number: '2024CSE001', full_name: 'Rahul Singh', email: 'rahul@college.edu', is_active: true },
            { id: '2', roll_number: '2024CSE002', full_name: 'Priya Sharma', email: 'priya@college.edu', is_active: true },
            { id: '3', roll_number: '2024CSE003', full_name: 'Amit Kumar', email: 'amit@college.edu', is_active: true },
            { id: '4', roll_number: '2024CSE004', full_name: 'Neha Gupta', email: 'neha@college.edu', is_active: true },
            { id: '5', roll_number: '2024CSE005', full_name: 'Vikram Reddy', email: 'vikram@college.edu', is_active: false },
        ]);
        setLoading(false);
    }, [classId]);

    const filteredStudents = students.filter(
        (s) =>
            s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-teal to-primary text-white font-semibold rounded-lg">
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
            </div>

            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Roll No.</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Name</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm hidden md:table-cell">Email</th>
                            <th className="text-left p-4 text-text-secondary font-medium text-sm">Status</th>
                            <th className="text-right p-4 text-text-secondary font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j} className="p-4">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center">
                                    <GraduationCap className="w-12 h-12 text-text-muted mx-auto mb-3" />
                                    <p className="text-text-secondary">No students found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4 font-mono text-sm text-accent-teal">{student.roll_number}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="text-primary text-sm font-semibold">{student.full_name.charAt(0)}</span>
                                            </div>
                                            <span className="font-medium text-text-primary">{student.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-text-secondary">{student.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                            {student.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Subjects Tab
function SubjectsTab({ classId, semester }: { classId: string; semester: number }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Mock data
        setSubjects([
            { id: '1', subject_name: 'Data Structures', subject_code: 'CS201', credits: 4, professor_name: 'Dr. John Smith', semester: 1 },
            { id: '2', subject_name: 'Database Systems', subject_code: 'CS202', credits: 4, professor_name: 'Dr. Sarah Johnson', semester: 1 },
            { id: '3', subject_name: 'Operating Systems', subject_code: 'CS203', credits: 3, professor_name: 'Dr. Mike Brown', semester: 1 },
            { id: '4', subject_name: 'Computer Networks', subject_code: 'CS204', credits: 3, professor_name: 'Dr. Emily Davis', semester: 1 },
            { id: '5', subject_name: 'Software Engineering', subject_code: 'CS205', credits: 3, professor_name: 'Dr. Robert Wilson', semester: 1 },
        ]);
        setLoading(false);
    }, [classId, semester]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-text-secondary">
                    Semester {semester} • {subjects.length} subjects • {subjects.reduce((acc, s) => acc + s.credits, 0)} credits
                </p>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Assign Subject
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
                    ))
                ) : subjects.length === 0 ? (
                    <div className="col-span-full bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-12 text-center">
                        <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No Subjects Assigned</h3>
                        <p className="text-text-secondary">Assign subjects for this semester</p>
                    </div>
                ) : (
                    subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-5 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                                    {subject.subject_code}
                                </span>
                                <span className="text-xs text-text-muted">{subject.credits} Credits</span>
                            </div>
                            <h3 className="font-semibold text-text-primary mb-2">{subject.subject_name}</h3>
                            <p className="text-sm text-text-secondary">
                                {subject.professor_name || 'No professor assigned'}
                            </p>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                <button className="flex-1 text-sm px-3 py-1.5 border border-white/10 text-text-secondary rounded hover:bg-white/5">
                                    Edit
                                </button>
                                <button className="flex-1 text-sm px-3 py-1.5 border border-white/10 text-text-secondary rounded hover:bg-white/5">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Timetable Tab
function TimetableTab({ classId }: { classId: string }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock timetable
        setTimetable([
            { id: '1', day_of_week: 0, start_time: '09:00', end_time: '10:00', subject_name: 'Data Structures', subject_code: 'CS201', professor_name: 'Dr. John', room_number: 'A101' },
            { id: '2', day_of_week: 0, start_time: '10:00', end_time: '11:00', subject_name: 'Database', subject_code: 'CS202', professor_name: 'Dr. Sarah', room_number: 'A102' },
            { id: '3', day_of_week: 1, start_time: '09:00', end_time: '10:00', subject_name: 'OS', subject_code: 'CS203', professor_name: 'Dr. Mike', room_number: 'A103' },
            { id: '4', day_of_week: 2, start_time: '11:00', end_time: '12:00', subject_name: 'Networks', subject_code: 'CS204', professor_name: 'Dr. Emily', room_number: 'Lab1' },
        ]);
        setLoading(false);
    }, [classId]);

    const getSlot = (day: number, time: string) => {
        return timetable.find((t) => t.day_of_week === day && t.start_time === time);
    };

    if (loading) {
        return <div className="h-96 bg-white/5 rounded-xl animate-pulse" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-text-secondary">Weekly class schedule</p>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-orange to-secondary text-white font-semibold rounded-lg">
                    <Plus className="w-4 h-4" />
                    Add Slot
                </button>
            </div>

            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="p-3 text-text-secondary font-medium text-sm w-20">Time</th>
                            {days.map((day) => (
                                <th key={day} className="p-3 text-text-secondary font-medium text-sm">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {times.map((time) => (
                            <tr key={time} className="border-b border-white/5">
                                <td className="p-3 text-text-muted text-sm font-mono">{time}</td>
                                {days.map((_, dayIndex) => {
                                    const slot = getSlot(dayIndex, time);
                                    return (
                                        <td key={dayIndex} className="p-2">
                                            {slot ? (
                                                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-xs">
                                                    <p className="font-semibold text-primary">{slot.subject_code}</p>
                                                    <p className="text-text-secondary truncate">{slot.professor_name}</p>
                                                    <p className="text-text-muted">{slot.room_number}</p>
                                                </div>
                                            ) : (
                                                <div className="h-16 border border-dashed border-white/10 rounded-lg flex items-center justify-center">
                                                    <Plus className="w-4 h-4 text-text-muted opacity-0 hover:opacity-100" />
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Class Representative Tab
function CRTab({ classId, currentCR }: { classId: string; currentCR?: { id: string; name: string } }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>(currentCR?.id || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Mock students
        setStudents([
            { id: '1', roll_number: '2024CSE001', full_name: 'Rahul Singh', email: 'rahul@college.edu', is_active: true },
            { id: '2', roll_number: '2024CSE002', full_name: 'Priya Sharma', email: 'priya@college.edu', is_active: true },
            { id: '3', roll_number: '2024CSE003', full_name: 'Amit Kumar', email: 'amit@college.edu', is_active: true },
        ]);
    }, [classId]);

    const handleSave = async () => {
        setSaving(true);
        // API call would go here
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
        alert('CR updated successfully!');
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-accent-orange/20 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-accent-orange" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Class Representative</h3>
                        <p className="text-text-secondary">Select a student to be the CR for this class</p>
                    </div>
                </div>

                {currentCR && (
                    <div className="mb-6 p-4 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
                        <p className="text-sm text-text-muted">Current CR</p>
                        <p className="text-lg font-semibold text-accent-orange">{currentCR.name}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-secondary">Select New CR</label>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    >
                        <option value="">Select a student...</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.roll_number} - {student.full_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!selectedStudent || saving}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-orange to-secondary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update CR
                    </button>
                    {currentCR && (
                        <button className="px-4 py-2.5 border border-error/50 text-error rounded-lg hover:bg-error/10">
                            Remove CR
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Class In-Charge Tab
function InChargeTab({ classId, currentInCharge }: { classId: string; currentInCharge?: { id: string; name: string } }) {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [selectedProfessor, setSelectedProfessor] = useState<string>(currentInCharge?.id || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Mock professors
        setProfessors([
            { id: '1', employee_id: 'EMP001', full_name: 'Dr. John Smith', designation: 'Associate Professor' },
            { id: '2', employee_id: 'EMP002', full_name: 'Dr. Sarah Johnson', designation: 'Professor' },
            { id: '3', employee_id: 'EMP003', full_name: 'Dr. Mike Brown', designation: 'Assistant Professor' },
        ]);
    }, [classId]);

    const handleSave = async () => {
        setSaving(true);
        // API call would go here
        await new Promise((r) => setTimeout(r, 1000));
        setSaving(false);
        alert('Class In-Charge updated successfully!');
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                        <UserCheck className="w-8 h-8 text-secondary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Class In-Charge</h3>
                        <p className="text-text-secondary">Assign a professor as the class coordinator</p>
                    </div>
                </div>

                {currentInCharge && (
                    <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                        <p className="text-sm text-text-muted">Current In-Charge</p>
                        <p className="text-lg font-semibold text-secondary">{currentInCharge.name}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="block text-sm font-medium text-text-secondary">Select Professor</label>
                    <select
                        value={selectedProfessor}
                        onChange={(e) => setSelectedProfessor(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                    >
                        <option value="">Select a professor...</option>
                        {professors.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                                {prof.full_name} - {prof.designation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!selectedProfessor || saving}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Update In-Charge
                    </button>
                    {currentInCharge && (
                        <button className="px-4 py-2.5 border border-error/50 text-error rounded-lg hover:bg-error/10">
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main Class Management Page
// ============================================

export default function ClassManagement() {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'subjects' | 'timetable' | 'cr' | 'incharge'>('students');
    const [loading, setLoading] = useState(true);
    const [successMessage, _setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Tabs configuration
    const tabs = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'timetable', label: 'Timetable', icon: Clock },
        { id: 'cr', label: 'CR', icon: Crown },
        { id: 'incharge', label: 'In-Charge', icon: UserCheck },
    ] as const;

    // Fetch class info
    useEffect(() => {
        const fetchClass = async () => {
            if (!classId) {
                setLoading(false);
                return;
            }

            if (!supabase) {
                // Mock data
                setClassInfo({
                    id: classId,
                    class_name: '2024-CSE-A',
                    section: 'A',
                    current_semester: 1,
                    batch_id: '1',
                    batch_name: '2024-2028',
                    branch_id: '1',
                    branch_name: 'Computer Science & Engineering',
                    branch_code: 'CSE',
                    class_incharge_id: '1',
                    class_incharge_name: 'Dr. John Smith',
                    class_representative_id: '1',
                    class_representative_name: 'Rahul Singh',
                });
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('classes')
                    .select(`
            *,
            batches(id, batch_name),
            branches(id, branch_name, branch_code, course_id)
          `)
                    .eq('id', classId)
                    .single();

                if (error) throw error;

                setClassInfo({
                    id: data.id,
                    class_name: data.class_name,
                    section: data.section,
                    current_semester: data.current_semester,
                    batch_id: data.batch_id,
                    batch_name: data.batches?.batch_name || '',
                    branch_id: data.branch_id,
                    branch_name: data.branches?.branch_name || '',
                    branch_code: data.branches?.branch_code || '',
                    course_id: data.branches?.course_id,
                });
            } catch (error) {
                console.error('Error fetching class:', error);
                setErrorMessage('Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        fetchClass();
    }, [classId]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white/5 rounded w-64 animate-pulse" />
                <div className="h-24 bg-white/5 rounded animate-pulse" />
                <div className="h-12 bg-white/5 rounded animate-pulse" />
                <div className="h-96 bg-white/5 rounded animate-pulse" />
            </div>
        );
    }

    if (!classInfo) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-text-primary">Class not found</h2>
                <button onClick={() => navigate('/batches')} className="mt-4 text-primary hover:underline">
                    Go to Batches
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
                <Link to={`/batches/${classInfo.batch_id}`} className="text-text-secondary hover:text-primary">
                    {classInfo.batch_name}
                </Link>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-muted">{classInfo.branch_code}</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
                <span className="text-text-primary font-medium">{classInfo.class_name}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-accent-orange/20 flex items-center justify-center">
                                <span className="text-xl font-bold text-accent-orange">{classInfo.section}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-text-primary">{classInfo.class_name}</h1>
                                <p className="text-text-secondary">{classInfo.branch_name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">Sem {classInfo.current_semester}</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/10 text-text-secondary rounded-lg hover:bg-white/5">
                        <Edit className="w-4 h-4" />
                        Edit Class
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-text-muted">Batch</p>
                    <p className="text-lg font-semibold text-text-primary mt-1">{classInfo.batch_name}</p>
                </div>
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-text-muted">Current Semester</p>
                    <p className="text-lg font-semibold text-text-primary mt-1">Semester {classInfo.current_semester}</p>
                </div>
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-text-muted">Class In-Charge</p>
                    <p className="text-lg font-semibold text-secondary mt-1">{classInfo.class_incharge_name || 'Not assigned'}</p>
                </div>
                <div className="bg-gradient-to-br from-bg-secondary/95 to-bg-tertiary/95 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-text-muted">Class Representative</p>
                    <p className="text-lg font-semibold text-accent-orange mt-1">{classInfo.class_representative_name || 'Not assigned'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-1 overflow-x-auto pb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'students' && <StudentsTab classId={classId!} className={classInfo.class_name} />}
                {activeTab === 'subjects' && <SubjectsTab classId={classId!} semester={classInfo.current_semester} />}
                {activeTab === 'timetable' && <TimetableTab classId={classId!} />}
                {activeTab === 'cr' && (
                    <CRTab
                        classId={classId!}
                        currentCR={classInfo.class_representative_id ? { id: classInfo.class_representative_id, name: classInfo.class_representative_name! } : undefined}
                    />
                )}
                {activeTab === 'incharge' && (
                    <InChargeTab
                        classId={classId!}
                        currentInCharge={classInfo.class_incharge_id ? { id: classInfo.class_incharge_id, name: classInfo.class_incharge_name! } : undefined}
                    />
                )}
            </div>
        </div>
    );
}
