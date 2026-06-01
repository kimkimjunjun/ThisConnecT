"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

let initialModalShown = false;
let permissionRequested = false;

import { AuthModal, useAuthStore, AuthContextProvider } from "@/features/auth";
import { AppHeader } from "@/widgets/header";
import { Sidebar, CreateChannelModal } from "@/widgets/sidebar";
import { useChannels, deleteChannel } from "@/features/channel";
import styles from "./DashboardLayout.module.scss";

type Props = { children: ReactNode };

export const DashboardLayout = ({ children }: Props) => {
  const [modalRequested, setModalRequested] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (initialModalShown) return;
    initialModalShown = true;
    Promise.resolve().then(() => {
      if (!useAuthStore.getState().accessToken) setModalRequested(true);
    });
  }, []);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const pendingRouteRef = useRef<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const canManage = role === "USER" || role === "ADMIN";

  const isModalOpen = modalRequested && !accessToken;

  const { channels, refresh: refreshChannels } = useChannels();
  const sidebarRooms = channels.map((c) => ({
    id: c.id.toString(),
    name: c.name,
  }));

  const activeCategoryId = pathname.match(/^\/channels\/([^/]+)/)?.[1] ?? null;

  useEffect(() => {
    if (permissionRequested) return;
    permissionRequested = true;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    )
      return;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => stream.getTracks().forEach((t) => t.stop()))
      .catch(() => {});
  }, []);

  // After login, navigate to the pending route if one was set
  useEffect(() => {
    if (!accessToken || !pendingRouteRef.current) return;
    const dest = pendingRouteRef.current;
    pendingRouteRef.current = null;
    sessionStorage.removeItem("auth_pending_route");
    router.push(dest);
  }, [accessToken, router]);

  const openModal = useCallback((redirectTo?: string) => {
    if (typeof redirectTo === "string") {
      pendingRouteRef.current = redirectTo;
      sessionStorage.setItem("auth_pending_route", redirectTo);
    }
    setModalRequested(true);
  }, []);
  const closeModal = useCallback(() => setModalRequested(false), []);

  const handleSelectCategory = useCallback(
    (id: string) => router.push(`/channels/${id}`),
    [router],
  );

  const handleAddChannel = useCallback(() => {
    if (!accessToken) {
      openModal();
      return;
    }
    setIsChannelModalOpen(true);
  }, [accessToken, openModal]);

  const handleDeleteChannel = useCallback(
    async (channelId: string) => {
      await deleteChannel(channelId);
      refreshChannels();
      if (activeCategoryId === channelId) router.push("/");
    },
    [refreshChannels, activeCategoryId, router],
  );

  return (
    <AuthContextProvider
      value={{ isLoggedIn: !!accessToken, openLoginModal: openModal }}
    >
      <div className={styles.app}>
        <AppHeader onLoginClick={openModal} />

        <div className={styles.body}>
          <Sidebar
            rooms={sidebarRooms}
            activeRoomId={activeCategoryId}
            onSelectRoom={handleSelectCategory}
            onAddChannel={canManage ? handleAddChannel : undefined}
            onDeleteChannel={role === "ADMIN" ? handleDeleteChannel : undefined}
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
          />

          <main className={styles.content}>{children}</main>
        </div>

        <AuthModal isOpen={isModalOpen} onClose={closeModal} />

        {isChannelModalOpen && (
          <CreateChannelModal
            onClose={() => setIsChannelModalOpen(false)}
            onCreated={refreshChannels}
          />
        )}
      </div>
    </AuthContextProvider>
  );
};
