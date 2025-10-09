// src/services/commentService.ts
import apiClient from './api';

export interface Comment {
  id: number;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  productId: number;
  userId: number;
  productName?: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

export interface CommentResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  statistics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  productId?: number;
  userId?: number;
  rating?: number;
}

export interface ModerateCommentData {
  action: 'approve' | 'reject' | 'delete';
  adminNote?: string;
}

export const getComments = async (filters: CommentFilters = {}): Promise<CommentResponse> => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.productId) params.append('productId', filters.productId.toString());
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.rating) params.append('rating', filters.rating.toString());
    
    const response = await apiClient.get(`/customers/comments?${params.toString()}`);
    console.log('Comments API response:', response.data);
    
    // Based on the provided response structure, the data is in response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      console.warn('Unexpected comments API response structure:', response.data);
      return {
        comments: [],
        pagination: { total: 0, page: 1, pages: 0, limit: 20 },
        statistics: { total: 0, pending: 0, approved: 0, rejected: 0 }
      };
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const moderateComment = async (
  commentId: number,
  data: ModerateCommentData
): Promise<Comment> => {
  try {
    const response = await apiClient.patch(`/customers/comments/${commentId}`, data);
    console.log('Moderate comment response:', response.data);
    
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      console.warn('Unexpected moderate comment response structure:', response.data);
      throw new Error('Failed to moderate comment');
    }
  } catch (error) {
    console.error('Error moderating comment:', error);
    throw error;
  }
};