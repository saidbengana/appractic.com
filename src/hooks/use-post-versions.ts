import { useQuery } from "@tanstack/react-query";

interface PostVersion {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  accountId?: string;
  isOriginal?: boolean;
}

export function usePostVersions() {
  const query = useQuery<PostVersion[]>({
    queryKey: ["post-versions"],
    queryFn: async () => {
      const response = await fetch("/api/post-versions");
      if (!response.ok) {
        throw new Error("Failed to fetch post versions");
      }
      return response.json();
    },
  });

  const getOriginalVersion = (postId: string) => {
    return query.data?.find(
      (version) => version.postId === postId && version.isOriginal
    );
  };

  const getAccountVersion = (postId: string, accountId: string) => {
    return query.data?.find(
      (version) => version.postId === postId && version.accountId === accountId
    );
  };

  return {
    ...query,
    getOriginalVersion,
    getAccountVersion,
  };
}
