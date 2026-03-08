"use client";


import React from "react";
import { motion } from "framer-motion";
import { FaUniversity, FaLeaf, FaSeedling, FaWater, FaMoneyBill, FaChartLine } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

const schemes = [
  {
    name_en: "PM-Kisan Samman Nidhi",
    name_hi: "पीएम-किसान सम्मान निधि",
    description_en: "Income support scheme providing ₹6000 annually to farmers.",
    description_hi: "किसानों को प्रति वर्ष ₹6000 की आय सहायता प्रदान करने वाली योजना।",
    eligibility_en: "Small and marginal farmers",
    eligibility_hi: "छोटे और सीमांत किसान",
    link: "https://pmkisan.gov.in/",
    icon: FaMoneyBill,
  },
  {
    name_en: "PM Fasal Bima Yojana",
    name_hi: "पीएम फसल बीमा योजना",
    description_en: "Crop insurance scheme protecting farmers from crop losses.",
    description_hi: "फसल नुकसान से किसानों को सुरक्षा देने वाली बीमा योजना।",
    eligibility_en: "All farmers enrolled in notified crops",
    eligibility_hi: "सूचित फसलों के लिए पंजीकृत सभी किसान",
    link: "https://pmfby.gov.in/",
    icon: FaLeaf,
  },
  {
    name_en: "Soil Health Card Scheme",
    name_hi: "मृदा स्वास्थ्य कार्ड योजना",
    description_en: "Provides soil nutrient reports and recommendations.",
    description_hi: "मिट्टी की गुणवत्ता और पोषक तत्वों की जानकारी प्रदान करता है।",
    eligibility_en: "All farmers",
    eligibility_hi: "सभी किसान",
    link: "https://soilhealth.dac.gov.in/",
    icon: FaSeedling,
  },
  {
    name_en: "PM Krishi Sinchai Yojana",
    name_hi: "पीएम कृषि सिंचाई योजना",
    description_en: "Promotes irrigation and efficient water usage.",
    description_hi: "सिंचाई और जल उपयोग दक्षता को बढ़ावा देने वाली योजना।",
    eligibility_en: "Farmers practicing irrigation",
    eligibility_hi: "सिंचाई करने वाले किसान",
    link: "https://pmksy.gov.in/",
    icon: FaWater,
  },
  {
    name_en: "e-NAM",
    name_hi: "ई-नाम",
    description_en: "Online agricultural marketplace for crop trading.",
    description_hi: "फसलों के ऑनलाइन व्यापार के लिए राष्ट्रीय कृषि बाजार।",
    eligibility_en: "Registered farmers, traders, FPOs",
    eligibility_hi: "पंजीकृत किसान, व्यापारी, एफपीओ",
    link: "https://www.enam.gov.in/",
    icon: FaChartLine,
  },
  {
    name_en: "Kisan Credit Card",
    name_hi: "किसान क्रेडिट कार्ड",
    description_en: "Provides affordable credit for agriculture activities.",
    description_hi: "कृषि कार्यों के लिए सस्ती ऋण सुविधा प्रदान करता है।",
    eligibility_en: "All farmers",
    eligibility_hi: "सभी किसान",
    link: "https://pmkisan.gov.in/Documents/Kcc.pdf",
    icon: FaUniversity,
  },
];

const badgeText = {
  en: "Government Scheme",
  hi: "सरकारी योजना",
};

const buttonText = {
  en: "View Details",
  hi: "विवरण देखें",
};


const Page = () => {
  const { language } = useLanguage ? useLanguage() : { language: "en" };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#fff7d6] via-[#ffe6b8] to-[#ffd79a] px-10 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-10">
          <div className="flex items-center justify-center gap-3">
            <FaUniversity className="text-[#2D2A6E] text-3xl" />
            <h1 className="text-4xl font-bold">
              <span className="text-[#2D2A6E]">Krishi</span>{" "}
              <span className="text-[#C46A3D]">Yojna</span>
            </h1>
          </div>
          <p className="text-gray-600 mt-2 text-lg">
            Government Schemes for Farmers
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {schemes.map((scheme, idx) => {
            const Icon = scheme.icon;
            return (
              <motion.div
                key={scheme.name_en}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(44,42,110,0.10)" }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl shadow-lg backdrop-blur border border-[rgba(196,106,61,0.25)] p-6 bg-white/70 flex flex-col items-start relative transition-transform duration-200"
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold">
                  {language === "hi" ? badgeText.hi : badgeText.en}
                </span>
                {/* Icon */}
                <div className="mb-4">
                  <Icon color="#C46A3D" size={26} />
                </div>
                {/* Name */}
                <h2 className="text-xl font-bold mb-2 text-[#2D2A6E]">
                  {language === "hi" ? scheme.name_hi : scheme.name_en}
                </h2>
                {/* Description */}
                <p className="mb-3 text-gray-800 min-h-[48px]">
                  {language === "hi" ? scheme.description_hi : scheme.description_en}
                </p>
                {/* Eligibility */}
                <div className="mb-4">
                  <span className="font-semibold text-[#C46A3D]">
                    {language === "hi" ? "पात्रता:" : "Eligibility:"}
                  </span>{" "}
                  <span>
                    {language === "hi" ? scheme.eligibility_hi : scheme.eligibility_en}
                  </span>
                </div>
                {/* Button */}
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block bg-[#C46A3D] text-white rounded-xl px-4 py-2 shadow-md font-semibold transition-all duration-150 hover:bg-[#b85d34] hover:scale-105 active:scale-95"
                >
                  {language === "hi" ? buttonText.hi : buttonText.en}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Page;
