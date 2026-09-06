export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role: Role;
    [key: string]: unknown;
};

export type Role = {
    id: number;
    name: string;
};

export type Auth = {
    user: User;
};
