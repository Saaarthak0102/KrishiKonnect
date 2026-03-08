"use client";


import React from "react";
import { motion } from "framer-motion";
import { FaUniversity, FaLeaf, FaSeedling, FaWater, FaMoneyBill, FaChartLine, FaUserShield, FaAppleAlt, FaWarehouse, FaIndustry, FaTractor, FaLandmark } from "react-icons/fa";
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
  // 1️⃣ PM Kisan Maan Dhan Yojana
  {
    name_en: "PM Kisan Maan Dhan Yojana",
    name_hi: "प्रधानमंत्री किसान मानधन योजना",
    description_en: "Pension scheme providing financial security to small and marginal farmers after retirement.",
    description_hi: "छोटे और सीमांत किसानों को वृद्धावस्था में पेंशन प्रदान करने वाली योजना।",
    eligibility_en: "Farmers aged 18–40 years",
    eligibility_hi: "18–40 वर्ष आयु के किसान",
    link: "https://maandhan.in/",
    icon: FaUserShield,
  },
  // 2️⃣ Paramparagat Krishi Vikas Yojana
  {
    name_en: "Paramparagat Krishi Vikas Yojana",
    name_hi: "परंपरागत कृषि विकास योजना",
    description_en: "Promotes organic farming through cluster-based approaches.",
    description_hi: "जैविक खेती को बढ़ावा देने के लिए क्लस्टर आधारित योजना।",
    eligibility_en: "Farmers interested in organic farming",
    eligibility_hi: "जैविक खेती करने वाले किसान",
    link: "https://pgsindia-ncof.gov.in/",
    icon: FaLeaf,
  },
  // 3️⃣ National Food Security Mission
  {
    name_en: "National Food Security Mission",
    name_hi: "राष्ट्रीय खाद्य सुरक्षा मिशन",
    description_en: "Aims to increase production of rice, wheat, pulses and coarse cereals.",
    description_hi: "धान, गेहूं, दाल और मोटे अनाज के उत्पादन को बढ़ाने की योजना।",
    eligibility_en: "Farmers cultivating food grains",
    eligibility_hi: "खाद्यान्न उगाने वाले किसान",
    link: "https://nfsm.gov.in/",
    icon: FaSeedling,
  },
  // 4️⃣ Mission for Integrated Development of Horticulture
  {
    name_en: "Mission for Integrated Development of Horticulture",
    name_hi: "एकीकृत बागवानी विकास मिशन",
    description_en: "Promotes growth of horticulture sector including fruits, vegetables and spices.",
    description_hi: "फल, सब्जी और मसालों के उत्पादन को बढ़ावा देने वाली योजना।",
    eligibility_en: "Farmers engaged in horticulture",
    eligibility_hi: "बागवानी करने वाले किसान",
    link: "https://midh.gov.in/",
    icon: FaAppleAlt,
  },
  // 5️⃣ Agriculture Infrastructure Fund
  {
    name_en: "Agriculture Infrastructure Fund",
    name_hi: "कृषि अवसंरचना कोष",
    description_en: "Provides financing support for building farm infrastructure.",
    description_hi: "कृषि अवसंरचना निर्माण के लिए वित्तीय सहायता प्रदान करने वाली योजना।",
    eligibility_en: "Farmers, FPOs and agri entrepreneurs",
    eligibility_hi: "किसान, एफपीओ और कृषि उद्यमी",
    link: "https://agriinfra.dac.gov.in/",
    icon: FaWarehouse,
  },
  // 6️⃣ Rashtriya Krishi Vikas Yojana
  {
    name_en: "Rashtriya Krishi Vikas Yojana",
    name_hi: "राष्ट्रीय कृषि विकास योजना",
    description_en: "Supports states in increasing agricultural productivity and infrastructure.",
    description_hi: "कृषि उत्पादकता और बुनियादी ढांचे को बढ़ाने के लिए सहायता योजना।",
    eligibility_en: "Farmers through state agriculture programs",
    eligibility_hi: "राज्य कृषि कार्यक्रमों के माध्यम से किसान",
    link: "https://rkvy.nic.in/",
    icon: FaChartLine,
  },
  // 7️⃣ PM Formalisation of Micro Food Processing Enterprises
  {
    name_en: "PM Formalisation of Micro Food Processing Enterprises",
    name_hi: "प्रधानमंत्री सूक्ष्म खाद्य प्रसंस्करण उद्यम योजना",
    description_en: "Supports micro food processing industries and farmers.",
    description_hi: "सूक्ष्म खाद्य प्रसंस्करण उद्योगों को समर्थन देने वाली योजना।",
    eligibility_en: "Food processing entrepreneurs and farmers",
    eligibility_hi: "खाद्य प्रसंस्करण उद्यमी और किसान",
    link: "https://pmfme.mofpi.gov.in/",
    icon: FaIndustry,
  },
  // 8️⃣ Soil Health Management Scheme
  {
    name_en: "Soil Health Management Scheme",
    name_hi: "मृदा स्वास्थ्य प्रबंधन योजना",
    description_en: "Improves soil fertility and sustainable farming practices.",
    description_hi: "मिट्टी की उर्वरता और टिकाऊ खेती को बढ़ावा देने वाली योजना।",
    eligibility_en: "All farmers",
    eligibility_hi: "सभी किसान",
    link: "https://soilhealth.dac.gov.in/",
    icon: FaLeaf,
  },
  // 9️⃣ Sub Mission on Agricultural Mechanization
  {
    name_en: "Sub Mission on Agricultural Mechanization",
    name_hi: "कृषि यंत्रीकरण उप मिशन",
    description_en: "Promotes farm mechanization and modern equipment.",
    description_hi: "कृषि मशीनरी और आधुनिक उपकरणों को बढ़ावा देने वाली योजना।",
    eligibility_en: "Farmers adopting agricultural machinery",
    eligibility_hi: "कृषि मशीनरी उपयोग करने वाले किसान",
    link: "https://agrimachinery.nic.in/",
    icon: FaTractor,
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
    <DashboardLayout pageTitle="Krishi Yojna">
      <div className="px-10 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-10">
          <div className="flex items-center justify-center">
            <h1 className="text-4xl font-semibold flex items-center gap-2">
              Krishi <span className="text-[#C46A3D]">Yojna</span>
              <FaLandmark className="text-[#2D2A6E] text-[26px] ml-1" />
            </h1>
          </div>
          <p className="mt-2 text-lg text-[#C46A3D]">
            Government Schemes for Farmers
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {schemes.map((scheme, idx) => {
            const Icon = scheme.icon;
            return (
              <motion.div
                key={scheme.name_en}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(44,42,110,0.13)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/55 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-6 flex flex-col items-start relative transition hover:scale-[1.02] hover:shadow-2xl duration-200"
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 bg-indigo-100 text-[#2D2A6E] px-3 py-1 rounded-full text-xs font-medium">
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
                  className="mt-auto inline-block bg-[#C46A3D] text-white rounded-xl px-5 py-2 shadow-md font-semibold transition hover:bg-[#b85d34] hover:scale-[1.03] active:scale-[0.97]"
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
