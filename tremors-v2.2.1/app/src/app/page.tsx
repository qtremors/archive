import { getGitHubData } from "@/lib/data";
import { Header } from "@/components/Header";
import { DefaultPage } from "./DefaultPage";

export default async function HomePage() {
  const data = await getGitHubData();

  return (
    <main className="min-h-screen pt-0 md:pt-16 pb-24 md:pb-0">
      <Header currentMode="default" />
      <DefaultPage data={data} />
    </main>
  );
}
