const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/backend";

const defaultHeaders = {
    Accept: "application/json",
};

function buildHeaders(extra) {
    const headers = { ...defaultHeaders, ...(extra || {}) };
    if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("auth_token");
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

async function handle(res, path) {
    if (!res.ok) {
        throw new Error(`API request failed: ${res.status} ${path}`);
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

export async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: buildHeaders(),
    });
    return handle(res, path);
}

export async function apiPost(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        cache: "no-store",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
    });
    return handle(res, path);
}

export async function apiPut(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        cache: "no-store",
        headers: buildHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
    });
    return handle(res, path);
}

export async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "DELETE",
        cache: "no-store",
        headers: buildHeaders(),
    });
    return handle(res, path);
}
