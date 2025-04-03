import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

interface GetQueryFnOptions {
  on401?: "returnNull" | "throw";
}

export function getQueryFn(options: GetQueryFnOptions = {}) {
  const { on401 = "throw" } = options;
  
  return async (url: string) => {
    const response = await fetch(url);
    
    if (response.status === 401) {
      if (on401 === "returnNull") {
        return undefined;
      } else {
        throw new Error("Unauthorized");
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || response.statusText || "An error occurred";
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) {
      return undefined;
    }
    
    return response.json();
  };
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(method: HttpMethod, url: string, data?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
    body: data ? JSON.stringify(data) : undefined,
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText || "An error occurred";
    throw new Error(errorMessage);
  }
  
  return response;
}