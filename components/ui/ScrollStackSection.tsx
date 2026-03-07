"use client";

import { ReactNode } from "react";

interface ScrollStackSectionProps {
  children: ReactNode;
  index: number;
}

export default function ScrollStackSection({
  children,
  index
}: ScrollStackSectionProps) {
  return (
    <section
      className="sticky top-24 min-h-[90vh] flex items-center"
      style={{
        zIndex: 50 - index
      }}
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        {children}
      </div>
    </section>
  );
}
