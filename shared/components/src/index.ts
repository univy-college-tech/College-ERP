// ============================================
// College ERP Shared Components
// ============================================

// Buttons
export { Button, type ButtonProps } from './buttons/Button';
export { IconButton, type IconButtonProps } from './buttons/IconButton';
export { FAB, type FABProps } from './buttons/FAB';

// Cards
export { Card, type CardProps } from './cards/Card';
export { TimetableCard, type TimetableCardProps } from './cards/TimetableCard';
export { StatCard, type StatCardProps } from './cards/StatCard';

// Inputs
export { Input, type InputProps } from './inputs/Input';
export { Checkbox, type CheckboxProps } from './inputs/Checkbox';
export { Select, type SelectProps, type SelectOption } from './inputs/Select';
export { SearchInput, type SearchInputProps } from './inputs/SearchInput';

// Navigation
export { BottomNav, type BottomNavProps, type NavItem } from './navigation/BottomNav';
export { Sidebar, type SidebarProps, type SidebarItem } from './navigation/Sidebar';
export { TopBar, type TopBarProps } from './navigation/TopBar';

// Feedback
export { Modal, type ModalProps } from './feedback/Modal';
export { Toast, type ToastProps, useToast } from './feedback/Toast';

// Loading
export { Spinner, type SpinnerProps } from './loading/Spinner';
export { Skeleton, type SkeletonProps } from './loading/Skeleton';
export { ProgressBar, type ProgressBarProps } from './loading/ProgressBar';

// Data Display
export { Table, type TableProps, type TableColumn } from './data/Table';
export { Badge, type BadgeProps } from './data/Badge';
export { EmptyState, type EmptyStateProps } from './data/EmptyState';
export { Avatar, type AvatarProps } from './data/Avatar';

// Utilities
export { cn } from './utils/cn';
