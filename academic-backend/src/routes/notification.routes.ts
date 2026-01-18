// ============================================
// Academic Backend - Notification Routes
// ============================================

import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// ============================================
// GET /api/academic/v1/notifications
// Get user's notifications with pagination
// ============================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        const { data: notifications, count, error } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
            return;
        }

        res.json({
            success: true,
            data: notifications || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            }
        });
    } catch (error) {
        console.error('Error in GET /notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/notifications/unread-count
// Get count of unread notifications
// ============================================
router.get('/unread-count', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        const { count, error } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error counting notifications:', error);
            res.status(500).json({ success: false, message: 'Failed to count notifications' });
            return;
        }

        res.json({ success: true, count: count || 0 });
    } catch (error) {
        console.error('Error in GET /notifications/unread-count:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/academic/v1/notifications/:id/read
// Mark notification as read
// ============================================
router.put('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error marking notification:', error);
            res.status(500).json({ success: false, message: 'Failed to mark notification' });
            return;
        }

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error in PUT /notifications/:id/read:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// PUT /api/academic/v1/notifications/read-all
// Mark all notifications as read
// ============================================
router.put('/read-all', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string || req.body.user_id;

        if (!userId) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }

        const { error } = await supabaseAdmin
            .from('notifications')
            .update({
                is_read: true,
                read_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications:', error);
            res.status(500).json({ success: false, message: 'Failed to mark notifications' });
            return;
        }

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error in PUT /notifications/read-all:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// GET /api/academic/v1/notifications/announcements
// Get announcements for user
// ============================================
router.get('/announcements', async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string;
        const userRole = req.query.role as string || 'student';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        // Get announcements targeted at user's role or 'all'
        let query = supabaseAdmin
            .from('announcements')
            .select(`
                id,
                title,
                content,
                announcement_type,
                priority,
                target_audience,
                created_at,
                expires_at,
                users:created_by (full_name)
            `, { count: 'exact' })
            .or(`target_audience.eq.all,target_audience.eq.${userRole}`)
            .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: announcements, count, error } = await query;

        if (error) {
            console.error('Error fetching announcements:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
            return;
        }

        const formattedAnnouncements = (announcements || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            type: a.announcement_type,
            priority: a.priority,
            created_at: a.created_at,
            expires_at: a.expires_at,
            created_by: a.users?.full_name,
        }));

        res.json({
            success: true,
            data: formattedAnnouncements,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            }
        });
    } catch (error) {
        console.error('Error in GET /notifications/announcements:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// POST /api/academic/v1/notifications
// Create notification (internal use)
// ============================================
router.post('/', async (req: Request, res: Response) => {
    try {
        const { user_id, title, message, notification_type, reference_id, reference_type } = req.body;

        if (!user_id || !title || !message) {
            res.status(400).json({ success: false, message: 'user_id, title, and message are required' });
            return;
        }

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id,
                title,
                message,
                notification_type: notification_type || 'general',
                reference_id: reference_id || null,
                reference_type: reference_type || null,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ success: false, message: 'Failed to create notification' });
            return;
        }

        res.status(201).json({ success: true, message: 'Notification created', data });
    } catch (error) {
        console.error('Error in POST /notifications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ============================================
// DELETE /api/academic/v1/notifications/:id
// Delete notification
// ============================================
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ success: false, message: 'Failed to delete notification' });
            return;
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Error in DELETE /notifications/:id:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;
