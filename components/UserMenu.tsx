import React, { useState, useRef, useEffect } from "react";
import { Settings, LogOut, User } from "lucide-react";

interface UserMenuProps {
  userName: string;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsOpen(!isOpen);
    } else if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center text-sm font-medium text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-md transition-colors"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs mr-2">
          {getInitials(userName)}
        </div>
        {userName}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 mt-1">user@example.com</p>
          </div>
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              // Handle settings action
              setIsOpen(false);
            }}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
          >
            <LogOut size={16} className="mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
