import styles from './styles.module.scss';

type Props = {
  progress: string;
};

export const ProgressBar = ({ progress }: Props) => (
  <div className={styles.wrapper}>
    <div className={styles.progress} style={{ width: progress }} />
  </div>
);
