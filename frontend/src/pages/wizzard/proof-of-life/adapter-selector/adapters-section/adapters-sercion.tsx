import { Adapter } from '../adapter/adapter';
import styles from './styles.module.scss';

type Props = {
    title: string;
};

export const AdaptersSection = ({title}: Props) => {
    return (
        <div>
            <h1>{title}</h1>
            <div className={styles.wrapper}>
                <Adapter />
                <Adapter />
                <Adapter />
            </div>
        </div>
    )
}
