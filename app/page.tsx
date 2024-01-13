"use client";

import { Button } from "@/components/ui/button";
import { connect } from "./actions";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button
        onClick={() => {
          console.log("click");
          connect();
        }}
      >
        test
      </Button>
    </main>
  );
}
