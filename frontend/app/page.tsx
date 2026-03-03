// 'use client';

import ProtectedPage from "@/components/ProtectedPage";
import HomeFragment from "@/fragments/HomeFragment";
import { PlayerProvider } from "@/providers/player/provider";

export default function Home() {
  return (
    <ProtectedPage>
      <PlayerProvider>
        <HomeFragment />
      </PlayerProvider>
    </ProtectedPage>
  );
}
