export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  shouldToast: boolean;
  isRead: boolean;
  readAt: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  actionUrl: string | null;
  createdAt: string;
}

