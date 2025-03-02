import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Header from "../components/Header";
import { getUserStats } from "../utils/userProgressService";
import { UserStats } from "../types/userProgress";

function MyApp({ Component, pageProps }: AppProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    termsLearned: 0,
    totalTerms: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
    ranking: 0,
    totalUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  const refreshUserStats = useCallback(async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error refreshing user stats:", error);
    }
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const stats = await getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/brain-icon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {!loading && <Header userStats={userStats} />}
      <Component {...pageProps} refreshUserStats={refreshUserStats} />
    </>
  );
}

export default MyApp;
