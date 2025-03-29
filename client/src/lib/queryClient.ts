import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = `HTTP Error: ${res.status}`;
    try {
      const errorDetail = await res.json();
      if (errorDetail && errorDetail.error) {
        errorMessage = errorDetail.error;
      }
    } catch (e) {
      // If parsing error details fails, just use the status text
      errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return res;
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => {
  return async (url: string): Promise<T> => {
    try {
      const response = await fetch(url);
      
      if (response.status === 401) {
        if (options.on401 === "throw") {
          throw new Error("Unauthorized");
        }
        // Handle the null case in a type-safe way
        return (null as any) as T;
      }
      
      await throwIfResNotOk(response);
      return response.json();
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});