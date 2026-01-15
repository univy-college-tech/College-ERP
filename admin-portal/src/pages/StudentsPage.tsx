import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

export function StudentsPage() {
    // Mock data
    const students = [
        { id: 1, name: 'Rahul Singh', rollNumber: '2024CSE001', branch: 'CSE', section: 'A', semester: 3, status: 'active' },
        { id: 2, name: 'Priya Patel', rollNumber: '2024CSE002', branch: 'CSE', section: 'A', semester: 3, status: 'active' },
        { id: 3, name: 'Amit Kumar', rollNumber: '2024ECE001', branch: 'ECE', section: 'B', semester: 3, status: 'active' },
        { id: 4, name: 'Sneha Sharma', rollNumber: '2024IT001', branch: 'IT', section: 'A', semester: 3, status: 'dropped' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Students</h1>
                    <p className="text-text-secondary mt-1">Manage student records</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="input pl-10"
                        />
                    </div>
                    <select className="input w-auto">
                        <option value="">All Branches</option>
                        <option value="cse">CSE</option>
                        <option value="ece">ECE</option>
                        <option value="it">IT</option>
                    </select>
                    <button className="btn-ghost flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        More Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Name</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Roll Number</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Branch</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Section</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Semester</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Status</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent-teal/20 flex items-center justify-center">
                                                <span className="text-accent-teal font-medium">
                                                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-text-primary">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-text-secondary">{student.rollNumber}</td>
                                    <td className="p-4 text-text-secondary">{student.branch}</td>
                                    <td className="p-4 text-text-secondary">{student.section}</td>
                                    <td className="p-4 text-text-secondary">{student.semester}</td>
                                    <td className="p-4">
                                        <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="p-2 rounded-md hover:bg-white/5 text-text-secondary transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
