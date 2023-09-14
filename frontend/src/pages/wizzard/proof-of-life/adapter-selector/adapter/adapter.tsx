import styles from './styles.module.scss';
import telegram from '../images/twitter.png';
type Props = {};

export const Adapter = ({}: Props) => {
    return (
        <button className={styles.box}>
            <div>
            <img src={telegram} />
            <span>Twitter</span>
            </div>
        </button>
    )
}