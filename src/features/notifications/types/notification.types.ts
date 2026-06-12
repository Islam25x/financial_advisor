export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  shouldToast: boolean;
  isRead: boolean;
  readAt: Date | null;
  relatedEntityType: null;
  relatedEntityId: null;
  actionUrl: null;
  createdAt: Date;
}

