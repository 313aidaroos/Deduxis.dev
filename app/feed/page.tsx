import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { DeduxisFeed } from "./DeduxisFeed";
import "./feed.css";

export const metadata: Metadata = {
  title: "Feed",
  description: "Posts from every Apixis company, in one feed.",
};

export default function FeedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container dx-feed-page">
        <div className="page-intro dx-feed-intro">
          <p className="eyebrow">Socixis Social · Every Apixis company</p>
          <h1>One feed. Every company.</h1>
          <p>What people across the Apixis family are sharing. Sign in with your Apixis ID to post, follow, comment and tip in Ixis.</p>
        </div>
        <DeduxisFeed />
      </main>
      <SiteFooter />
    </>
  );
}
