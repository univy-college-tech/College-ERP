import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

export function ProfessorsPage() {
    // Mock data
    const professors = [
        { id: 1, name: 'Dr. Rajesh Kumar', employeeId: 'EMP001', department: 'Computer Science', designation: 'Professor', status: 'active' },
        { id: 2, name: 'Dr. Priya Sharma', employeeId: 'EMP002', department: 'Electronics', designation: 'Associate Professor', status: 'active' },
        { id: 3, name: 'Dr. Amit Patel', employeeId: 'EMP003', department: 'Mathematics', designation: 'Assistant Professor', status: 'active' },
        { id: 4, name: 'Dr. Sunita Verma', employeeId: 'EMP004', department: 'Physics', designation: 'Professor', status: 'inactive' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Professors</h1>
                    <p className="text-text-secondary mt-1">Manage faculty members</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Professor
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search professors..."
                            className="input pl-10"
                        />
                    </div>
                    <button className="btn-ghost flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
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
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Employee ID</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Department</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Designation</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Status</th>
                                <th className="text-left p-4 text-text-secondary font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {professors.map((professor) => (
                                <tr key={professor.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="text-primary font-medium">
                                                    {professor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-text-primary">{professor.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-text-secondary">{professor.employeeId}</td>
                                    <td className="p-4 text-text-secondary">{professor.department}</td>
                                    <td className="p-4 text-text-secondary">{professor.designation}</td>
                                    <td className="p-4">
                                        <span className={`badge ${professor.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                            {professor.status}
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
