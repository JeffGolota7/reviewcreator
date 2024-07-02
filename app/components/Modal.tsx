import { Link, useNavigate } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";

import styles from "~/styles/Modal.module.css";

export default function Modal({ showModal, toggleModal, children }) {
  if (!showModal) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        onClick={(e) => {
          if (e.target.classList.contains(styles.modalOverlay)) {
            toggleModal(false);
          }
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
