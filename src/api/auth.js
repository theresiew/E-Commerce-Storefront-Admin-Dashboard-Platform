import {
  USERS_STORAGE_KEY,
  readStorage,
  writeStorage,
} from "../lib/storage";
import { requestWithFallback } from "./client";

function normalizeUserPayload(payload) {
  const user = payload?.user || payload?.data?.user || payload?.data || payload;
  const token = payload?.token || payload?.accessToken || payload?.data?.token;

  return {
    token: token || "",
    user: {
      id: user?._id || user?.id || crypto.randomUUID(),
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      role: user?.role || (user?.isAdmin ? "ADMIN" : "USER") || "USER",
    },
  };
}

function readLocalUsers() {
  return readStorage(USERS_STORAGE_KEY, []);
}

function saveLocalUser(userRecord) {
  const users = readLocalUsers();
  const nextUsers = [...users, userRecord];
  writeStorage(USERS_STORAGE_KEY, nextUsers);
}

export async function registerUser(payload) {
  try {
    const response = await requestWithFallback(
      "post",
      ["/auth/users/register", "/users/register", "/auth/register"],
      {
        fullName: payload.fullName,
        name: payload.fullName,
        email: payload.email,
        password: payload.password,
      }
    );

    const normalized = normalizeUserPayload(response);

    saveLocalUser({
      ...normalized.user,
      password: payload.password,
    });

    return normalized;
  } catch {
    const existing = readLocalUsers().find(
      (item) => item.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const localUser = {
      id: crypto.randomUUID(),
      fullName: payload.fullName,
      email: payload.email,
      role: "USER",
      password: payload.password,
    };

    saveLocalUser(localUser);

    return {
      token: "",
      user: {
        id: localUser.id,
        fullName: localUser.fullName,
        email: localUser.email,
        role: localUser.role,
      },
    };
  }
}

export async function loginUser(payload) {
  try {
    const response = await requestWithFallback(
      "post",
      ["/auth/users/login", "/users/login", "/auth/login"],
      payload
    );

    return normalizeUserPayload(response);
  } catch {
    const localUser = readLocalUsers().find(
      (item) =>
        item.email.toLowerCase() === payload.email.toLowerCase() &&
        item.password === payload.password
    );

    if (!localUser) {
      throw new Error("Invalid email or password.");
    }

    return {
      token: "",
      user: {
        id: localUser.id,
        fullName: localUser.fullName,
        email: localUser.email,
        role: localUser.role,
      },
    };
  }
}
