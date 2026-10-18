"use client";
import { useMemo } from "react";
import { createFeedClient } from "@/feed-client/api";
import { FeedView, type FeedSkin } from "@/feed-client/FeedView";

// Deduxis skin: only Deduxis's own classes from app/globals.css (content-card, button, badge, notice…). Layout in ./feed.css.
const skin: FeedSkin = {
  tabs: "dx-feed-tabs",
  tab: "dx-feed-tab",
  tabActive: "dx-feed-tab-on",
  card: "content-card dx-feed-card",
  cardHead: "",
  title: "dx-feed-title",
  button: "button primary small",
  buttonSecondary: "button secondary small",
  buttonSmall: "",
  chip: "badge dx-feed-chip",
  aiChip: "badge dx-feed-ai",
  input: "",
  label: "field-label",
  muted: "muted",
  alert: "notice error",
  notice: "notice",
  empty: "muted",
  listRow: "dx-feed-row",
  signInUrl: "/auth/apixis/start?next=%2Ffeed",
  buyIxisUrl: "https://apixis-wallet.vercel.app/buy?product=deduxis",
};

export function DeduxisFeed() {
  const client = useMemo(() => createFeedClient({ client: "deduxis", sessionUrl: "/api/feed-session" }), []);
  return <FeedView client={client} skin={skin} siteName="Deduxis" />;
}
