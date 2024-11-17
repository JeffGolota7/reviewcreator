import { useLoaderData } from "@remix-run/react";
import { Reorder } from "framer-motion";
import RankingList from "./RankingList";

import styles from "~/styles/RankingList.module.css";

export default function AOTYRankings() {
  const reviews = useLoaderData();
  const todaysDate = new Date();

  return (
    <div className={styles.rankingListContainer}>
      <RankingList></RankingList>
    </div>
  );
}
