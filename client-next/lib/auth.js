/**
 * Auth helpers — Sanctum bearer-token flow.
 * The server returns { user, token } on /login and /register; we persist
 * `token` and `user` in localStorage so lib/api.js can read the token,
 * and the UI can avoid an extra /api/user round-trip on every load.
 */
import { apiPost, apiGet } from "@/lib/api"

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export function getToken() {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
    if (typeof window === "undefined") return null
    const raw = window.localStorage.getItem(USER_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
}

export function isLoggedIn() {
    return !!getToken()
}

function persist(token, user) {
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function login({ email, password }) {
    const res = await apiPost("/api/login", { email, password })
    if (!res?.token) throw new Error("Login response missing token")
    persist(res.token, res.user)
    return res.user
}

export async function register({ name, email, password, password_confirmation }) {
    const res = await apiPost("/api/register", {
        name,
        email,
        password,
        password_confirmation,
        role: "user",
    })
    if (!res?.token) throw new Error("Register response missing token")
    persist(res.token, res.user)
    return res.user
}

export async function logout() {
    try {
        await apiPost("/api/logout", {})
    } catch {
        // Server might be down — clear local state anyway so the user
        // never gets stuck "logged in" with a dead token.
    }
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
}

export async function refreshUser() {
    const user = await apiGet("/api/user")
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    return user
}
