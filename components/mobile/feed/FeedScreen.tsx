"use client";

import { useFeed } from "@/hooks/useFeed";
import AppShell from "@/components/mobile/AppShell";
import FeedHeader from "./FeedHeader";
import GreetingBar from "./GreetingBar";
import FeedList from "./FeedList";

export default function FeedScreen() {
  const { posts, loading, error, refresh, setPosts } = useFeed();

  return (
    <AppShell active="home">
      <FeedHeader />
      <GreetingBar />
      <FeedList
        posts={posts}
        loading={loading}
        error={error}
        onRefresh={refresh}
        setPosts={setPosts}
      />
    </AppShell>
  );
}
