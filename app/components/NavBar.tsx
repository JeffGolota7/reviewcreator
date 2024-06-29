import React from "react";
import { useLocation } from "react-router-dom";

import styles from "../styles/NavBar.module.css";

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.navDisplay}>
      <ul className={styles.links}>
        <li
          className={styles.link}
          style={{
            boxShadow: location.pathname === "/" ? "0 1px 0 green" : "none",
          }}
        >
          Album
        </li>
        <li className={styles.link}>Song</li>
        <li className={styles.link}>AOTY</li>
      </ul>
      <img className={styles.logo} src={"./images/icon.jpg"} />
    </nav>
  );
};

export default NavBar;
