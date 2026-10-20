import { SnapApp } from "./SnapApp";

export const metadata = { title: "Send answer photos · StudyBuddy" };

export default async function SnapPage({ params }: { params: Promise<{ token: string }> }) {
  return <SnapApp token={(await params).token} />;
}
