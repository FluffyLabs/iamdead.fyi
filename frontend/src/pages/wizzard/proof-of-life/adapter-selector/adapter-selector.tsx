import React from 'react';

import { AdaptersSection } from './adapters-section';

import styles from './styles.module.scss';

type Props = {};

export const AdapterSelector = ({}: Props) => {
    return (
        <div>
            <h1>Select an adapter</h1>
            <AdaptersSection title="Social media adapters" />
            <AdaptersSection title="Message adapters" />
        </div>
    )
}