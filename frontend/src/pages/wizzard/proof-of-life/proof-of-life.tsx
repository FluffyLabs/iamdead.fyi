import styles from './styles.module.scss';

export const ProofOfLife = () => {
  return (
    <div>
      <h2 className={styles.header}>I want the pieces to be send when:</h2>
      <ul className={styles.mainList}>
        <li>
          <ul className={styles.subList}>
            <li>I don't respond to email for 3 months</li>
            <li>or I'm not active on twitter for 2 months </li>
            <li>+ or</li>
          </ul>
        </li>

        <li>and</li>

        <li>
          <ul className={styles.subList}>
            <li>I don't respond to email for 3 months</li>
            <li>or I'm not active on twitter for 2 months </li>
            <li>+ or</li>
          </ul>
        </li>

        <li>+ and</li>
      </ul>
    </div>
  );
};
