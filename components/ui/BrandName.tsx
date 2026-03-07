"use client";

interface BrandNameProps {
  className?: string;
}

export default function BrandName({ className = "" }: BrandNameProps) {
  return (
    <span className={`font-bold ${className}`}>
      <span className="text-[#2F4B8F]">Krishi</span>
      <span className="text-[#C46A3D]">Konnect</span>
    </span>
  );
}
