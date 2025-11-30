export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Stock {
    id: number;
    symbol: string;
    name: string;
    exchange: string;
    sector: string;
}

export interface Alert {
    id: number;
    stock_id: number;
    stock?: Stock;
    type: 'volume_spike' | 'price_jump';
    severity: 'low' | 'medium' | 'high';
    z_score: number;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface News {
    id: number;
    title: string;
    content: string;
    url: string;
    source: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    sentiment_score: number;
    published_at: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
