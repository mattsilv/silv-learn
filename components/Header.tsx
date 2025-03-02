import React, { useState } from "react";
import Link from "next/link";
import { Users, Menu, X } from "lucide-react";
import LoginButton from "./LoginButton";

type HeaderProps = {
  userStats: {
    termsLearned: number;
    totalTerms: number;
    lessonsCompleted: number;
    totalLessons: number;
    ranking: number;
    totalUsers: number;
  };
};

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { ranking, totalUsers } = userStats;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-2 sm:mr-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5C9 5 6.5 7.5 6.5 10.5C6.5 13 8 15 10 16.25V17.5H14V16.25C16 15 17.5 13 17.5 10.5C17.5 7.5 15 5 12 5ZM10 18H14V19H10V18Z"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Silv<span className="text-indigo-600">Learn</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* Ranking - visible on all screens */}
            <div className="flex items-center text-sm">
              <Users size={16} className="text-green-500 mr-1 flex-shrink-0" />
              <span className="text-gray-600 mr-1">Global Rank:</span>
              <span className="font-medium">#{ranking}</span>
              <span className="text-gray-500 ml-1 hidden sm:inline">
                of {totalUsers}
              </span>
            </div>

            {/* Login button */}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
