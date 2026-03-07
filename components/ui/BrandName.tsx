"use client";

interface BrandNameProps {
  className?: string;
}

export default function BrandName({ className = "" }: BrandNameProps) {
  return (
    <span className={`font-bold ${className}`}>
      <span className="text-krishi-indigo">Krishi</span>
      <span className="text-krishi-clay">Konnect</span>
    </span>
  );
}
