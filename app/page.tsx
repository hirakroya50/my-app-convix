"use client";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
export default function Home() {
  const tasks = useQuery(api.tasks.get);
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {tasks?.map(({ _id, text }) => (
          <div key={_id}>{text}</div>
        ))}
      </main>
    </div>
  );
}
