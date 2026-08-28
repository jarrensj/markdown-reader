import MarkdownEditor from "./markdown-editor";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-center text-2xl font-semibold">markdown reader</h1>
      <MarkdownEditor />
    </main>
  );
}
