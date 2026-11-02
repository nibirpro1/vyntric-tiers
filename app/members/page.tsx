"use client";

import React from "react";
import { VyntricMembersSection } from "@/components/sections/VyntricMembersSection";
import { VYNTRIC_MEMBERS } from "@/lib/data";

export default function MembersPage() {
  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <VyntricMembersSection members={VYNTRIC_MEMBERS} />
    </div>
  );
}
