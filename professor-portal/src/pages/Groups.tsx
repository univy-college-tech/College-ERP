// ============================================
// Professor Portal - Groups Page
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header, PageContainer, Card, Badge, LoadingSpinner, EmptyState } from '../components/Layout';
import { createClient } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================
interface Group {
    id: string;
    class_subject_id: string;
    class_id: string;
    name: string;
    subject_name: string;
    subject_code: string;
    class_label: string;
    member_count: number;
    is_class_incharge: boolean;
    cr: {
        id: string;
        name: string;
        phone: string;
        email: string;
        roll_number: string;
    } | null;
    unread_count: number;
    type: string;
}

interface Message {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender: {
        id: string;
        name: string;
        role: string;
    };
}

interface ClassCR {
    class_id: string;
    class_label: string;
    is_class_incharge: boolean;
    cr: {
        id: string;
        name: string;
        phone: string;
        email: string;
        roll_number: string;
    } | null;
}

// ============================================
// API & Supabase Configuration
// ============================================
const API_BASE = import.meta.env.VITE_ACADEMIC_API_URL || 'http://localhost:4002/api/academic/v1';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============================================
// Group List Component
// ============================================
interface GroupListProps {
    onSelectGroup: (group: Group) => void;
    onSelectCR: (cr: ClassCR) => void;
}

function GroupList({ onSelectGroup, onSelectCR }: GroupListProps) {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [crs, setCRs] = useState<ClassCR[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'groups' | 'crs'>('groups');

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Fetch groups
            const groupsRes = await fetch(`${API_BASE}/groups?user_id=${user.id}&role=professor`);
            const groupsData = await groupsRes.json();
            if (groupsData.success) {
                setGroups(groupsData.data);
            }

            // Fetch CRs
            const crsRes = await fetch(`${API_BASE}/groups/crs/my-classes?user_id=${user.id}`);
            const crsData = await crsRes.json();
            if (crsData.success) {
                setCRs(crsData.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-secondary mb-4">
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'groups'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Groups
                </button>
                <button
                    onClick={() => setActiveTab('crs')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'crs'
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    Class CRs
                </button>
            </div>

            {/* Groups Tab */}
            {activeTab === 'groups' && (
                <div className="space-y-3">
                    {groups.length === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            }
                            title="No groups yet"
                            description="Subject groups will appear here when you're assigned to classes."
                        />
                    ) : (
                        groups.map((group) => (
                            <Card
                                key={group.id}
                                onClick={() => onSelectGroup(group)}
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-text-primary truncate">{group.subject_name}</h3>
                                            {group.is_class_incharge && (
                                                <Badge variant="success">In-charge</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-text-secondary">{group.class_label}</p>
                                        <p className="text-xs text-text-muted mt-1">{group.member_count} members</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {group.unread_count > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                                                {group.unread_count}
                                            </span>
                                        )}
                                        <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* CRs Tab */}
            {activeTab === 'crs' && (
                <div className="space-y-3">
                    {crs.length === 0 ? (
                        <EmptyState
                            icon={
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                            title="No class representatives"
                            description="CRs for your assigned classes will appear here."
                        />
                    ) : (
                        crs.map((classItem) => (
                            <Card
                                key={classItem.class_id}
                                onClick={() => classItem.cr && onSelectCR(classItem)}
                                className={classItem.cr ? "cursor-pointer hover:border-primary/50 transition-colors" : "opacity-60"}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-text-primary">{classItem.class_label}</h3>
                                            {classItem.is_class_incharge && (
                                                <Badge variant="success">In-charge</Badge>
                                            )}
                                        </div>
                                        {classItem.cr ? (
                                            <div className="mt-1">
                                                <p className="text-sm text-text-secondary">{classItem.cr.name}</p>
                                                <p className="text-xs text-text-muted">{classItem.cr.roll_number}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-text-muted mt-1">No CR assigned</p>
                                        )}
                                    </div>
                                    {classItem.cr && (
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`tel:${classItem.cr.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-2 rounded-full bg-success/10 text-success"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// Chat Component
// ============================================
interface ChatProps {
    group: Group;
    onBack: () => void;
}

function Chat({ group, onBack }: ChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();

        // Subscribe to realtime updates
        if (supabase) {
            const channel = supabase
                .channel(`group-${group.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'group_messages',
                        filter: `group_id=eq.${group.id}`,
                    },
                    () => {
                        // Fetch the new message with sender info
                        fetchMessages();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
        return undefined;
    }, [group]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_BASE}/groups/${group.id}/messages`);
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            const response = await fetch(`${API_BASE}/groups/${group.id}/messages?user_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage.trim() }),
            });
            const data = await response.json();

            if (data.success) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-bg-secondary">
                <button onClick={onBack} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-text-primary truncate">{group.subject_name}</h2>
                    <p className="text-xs text-text-secondary">{group.class_label} • {group.member_count} members</p>
                </div>
                {group.cr && (
                    <a
                        href={`tel:${group.cr.phone}`}
                        className="p-2 rounded-full bg-success/10 text-success"
                        title={`Call CR: ${group.cr.name}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </a>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-text-secondary">No messages yet</p>
                        <p className="text-text-muted text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            const isOwn = message.sender.id === user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-bg-secondary text-text-primary rounded-bl-md'
                                            }`}
                                    >
                                        {!isOwn && (
                                            <p className={`text-xs font-medium mb-1 ${message.sender.role === 'professor' ? 'text-primary' : 'text-text-secondary'
                                                }`}>
                                                {message.sender.name}
                                                {message.sender.role === 'professor' && ' (Prof)'}
                                            </p>
                                        )}
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-text-muted'}`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10 bg-bg-secondary safe-area-bottom">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-full bg-bg-tertiary border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary"
                        disabled={sending}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="p-3 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {sending ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// CR Contact Modal
// ============================================
function CRContactModal({ cr, className, onClose }: { cr: ClassCR['cr']; className: string; onClose: () => void }) {
    if (!cr) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-bg-secondary rounded-t-2xl sm:rounded-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
                <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-primary">
                            {cr.name?.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{cr.name}</h3>
                    <p className="text-sm text-text-secondary">Class Representative • {className}</p>
                    <p className="text-xs text-text-muted mt-1">{cr.roll_number}</p>
                </div>

                <div className="space-y-3">
                    {cr.phone && (
                        <a
                            href={`tel:${cr.phone}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Call</p>
                                <p className="text-xs text-text-secondary">{cr.phone}</p>
                            </div>
                        </a>
                    )}

                    {cr.email && (
                        <a
                            href={`mailto:${cr.email}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-white/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Email</p>
                                <p className="text-xs text-text-secondary truncate max-w-[200px]">{cr.email}</p>
                            </div>
                        </a>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 py-3 text-text-secondary hover:text-text-primary transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ============================================
// Main Groups Component
// ============================================
export default function Groups() {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [selectedCR, setSelectedCR] = useState<ClassCR | null>(null);

    if (selectedGroup) {
        return (
            <PageContainer noPadding noBottomNav>
                <Chat
                    group={selectedGroup}
                    onBack={() => setSelectedGroup(null)}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer
            header={<Header title="Groups & Communication" />}
        >
            <GroupList
                onSelectGroup={setSelectedGroup}
                onSelectCR={setSelectedCR}
            />

            {/* CR Contact Modal */}
            {selectedCR?.cr && (
                <CRContactModal
                    cr={selectedCR.cr}
                    className={selectedCR.class_label}
                    onClose={() => setSelectedCR(null)}
                />
            )}
        </PageContainer>
    );
}
