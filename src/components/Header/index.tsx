import Link from "next/link";

import commonStyles from "../../styles/common.module.scss";
import styles from "./header.module.scss";

function Header(): JSX.Element {
  return (
    <nav className={commonStyles.container}>
      <Link href="/">
        <a className={styles.logo}>
          <img src="/images/logo.png" alt="logo" />
        </a>
      </Link>
    </nav>
  );
}

export default Header;
