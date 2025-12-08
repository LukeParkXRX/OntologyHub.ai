// Domain-related TypeScript types and interfaces

export interface Domain {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    category?: string;
    settings: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface DomainData {
    id: string;
    domain_id: string;
    user_id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    graph_data?: GraphData;
    created_at: string;
    updated_at: string;
}

export interface GraphData {
    elements: {
        nodes: GraphNode[];
        edges: GraphEdge[];
    };
}

export interface GraphNode {
    data: {
        id: string;
        label: string;
        type: string;
        depth?: number;
        role?: string;
        expanded?: boolean;
    };
}

export interface GraphEdge {
    data: {
        source: string;
        target: string;
        label: string;
        explanation?: string;
        depth?: number;
    };
}

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    features: SubscriptionFeatures;
    created_at: string;
    expires_at?: string;
    updated_at: string;
}

export interface SubscriptionFeatures {
    max_domains: number;
    max_data_per_domain: number;
    export_formats: ExportFormat[];
    max_export_size_mb: number;
}

export interface ExportHistory {
    id: string;
    user_id: string;
    domain_id?: string;
    format: ExportFormat;
    file_size_bytes?: number;
    status: 'success' | 'failed';
    created_at: string;
}

export enum ExportFormat {
    JSON = 'json',
    CSV = 'csv',
    GRAPHML = 'graphml',
}

export interface CreateDomainInput {
    name: string;
    description?: string;
    category?: string;
    settings?: Record<string, any>;
}

export interface UpdateDomainInput {
    name?: string;
    description?: string;
    category?: string;
    settings?: Record<string, any>;
}

export interface CreateDomainDataInput {
    title: string;
    content: string;
    metadata?: Record<string, any>;
    graph_data?: GraphData;
}

export interface ExportOptions {
    format: ExportFormat;
    include_graphs?: boolean;
    data_ids?: string[]; // Specific data entries to export
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface DomainWithStats extends Domain {
    data_count: number;
    graph_count: number;
    last_activity?: string;
}
