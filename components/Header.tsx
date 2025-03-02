import React from "react";
import Link from "next/link";
import { Trophy, Star, Users } from "lucide-react";
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
  const {
    termsLearned,
    totalTerms,
    lessonsCompleted,
    totalLessons,
    ranking,
    totalUsers,
  } = userStats;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3">
                <svg
                  width="24"
                  height="24"
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
              <h1 className="text-xl font-semibold text-gray-900">
                Silv<span className="text-indigo-600">Learn</span>
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Terms learned */}
              <div className="flex items-center text-sm">
                <Star size={16} className="text-yellow-500 mr-1" />
                <span className="font-medium">
                  {termsLearned}/{totalTerms}
                </span>
                <span className="text-gray-500 ml-1">terms</span>
              </div>

              {/* Lessons completed */}
              <div className="flex items-center text-sm">
                <Trophy size={16} className="text-blue-500 mr-1" />
                <span className="font-medium">
                  {lessonsCompleted}/{totalLessons}
                </span>
                <span className="text-gray-500 ml-1">lessons</span>
              </div>

              {/* Ranking */}
              <div className="flex items-center text-sm">
                <Users size={16} className="text-green-500 mr-1" />
                <span className="font-medium">#{ranking}</span>
                <span className="text-gray-500 ml-1">of {totalUsers}</span>
              </div>
            </div>

            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
