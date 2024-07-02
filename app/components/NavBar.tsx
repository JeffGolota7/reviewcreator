import React from "react";
import { NavLink } from "@remix-run/react";
import { useLocation } from "react-router-dom";

import styles from "../styles/NavBar.module.css";

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.navDisplay}>
      <div className={styles.links}>
        <NavLink to="/" className={styles.link}>
          Review
        </NavLink>
        <NavLink to="/aoty" className={styles.link}>
          AOTY
        </NavLink>
      </div>
      <NavLink to="/" className={styles.link}>
        <img className={styles.logo} src={"./images/icon.jpg"} />
      </NavLink>
    </nav>
  );
};

export default NavBar;
