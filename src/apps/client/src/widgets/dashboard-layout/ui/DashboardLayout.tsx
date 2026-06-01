"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthModal, useAuthStore, AuthContextProvider } from "@/features/auth";
import { AppHeader } from "@/widgets/header";
import { Sidebar, CreateChannelModal } from "@/widgets/sidebar";
import { useChannels, deleteChannel } from "@/features/channel";
import styles from "./DashboardLayout.module.scss";

const LS_KEY = "sidebar-collapsed";
const SIDEBAR_TOGGLE_EVENT = "sidebar-toggle";

const subscribeSidebarCollapsed = (cb: () => void) => {
  window.addEventListener(SIDEBAR_TOGGLE_EVENT, cb);
  return () => window.removeEventListener(SIDEBAR_TOGGLE_EVENT, cb);
};
const getSidebarCollapsedSnapshot = () => localStorage.getItem(LS_KEY) === "true";
const getSidebarCollapsedServerSnapshot = () => false;

const ChevronLeft = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

let initialModalShown = false;
let permissionRequested = false;

type Props = { children: ReactNode };

export const DashboardLayout = ({ children }: Props) => {
  const [modalRequested, setModalRequested] = useState(false);

  const isSidebarCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );

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
          <div className={styles.sidebarWrapper}>
            <Sidebar
              rooms={sidebarRooms}
              activeRoomId={activeCategoryId}
              onSelectRoom={handleSelectCategory}
              onAddChannel={canManage ? handleAddChannel : undefined}
              onDeleteChannel={role === "ADMIN" ? handleDeleteChannel : undefined}
              isCollapsed={isSidebarCollapsed}
            />
            <button
              className={styles.sidebarToggleEdge}
              onClick={() => {
                const next = !isSidebarCollapsed;
                localStorage.setItem(LS_KEY, String(next));
                window.dispatchEvent(new Event(SIDEBAR_TOGGLE_EVENT));
              }}
              title={isSidebarCollapsed ? "사이드바 열기" : "사이드바 닫기"}
            >
              {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>

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
