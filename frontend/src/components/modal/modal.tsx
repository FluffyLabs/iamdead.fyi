import { clsx } from 'clsx';
import { ReactNode } from 'react';
import {ReactComponent as CloseButton} from './close-button.svg';
import styles from './styles.module.scss';

export type ModalProps = {
  title: string;
  children?: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const Modal = ({ title, children, onCancel, onConfirm }: ModalProps) => {
  return (
    <div
      className={clsx(
        'hs-overlay w-full h-full fixed top-0 left-0 z-[160] overflow-x-hidden overflow-y-auto',
        styles.overlay,
      )}
    >
      <div
        className={clsx(
          'hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0  ease-out transition-all md:max-w-2xl md:w-full m-3 md:mx-auto',
          styles.center,
        )}
      >
        <div className="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7]">
          <div className="flex justify-between items-center py-3 px-4 border-b dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-white">{title}</h3>
            <button
              onClick={onCancel}
              type="button"
              className="hs-dropdown-toggle inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-sm dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800"
            >
              <span className="sr-only">Close</span>
              <CloseButton 
                className="w-3.5 h-3.5"
                />
            </button>
          </div>
          <div className="p-4 overflow-y-auto">{children}</div>
          <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-gray-700">
            <button
              type="button"
              className="hs-dropdown-toggle py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
              onClick={onCancel}
            >
              Close
            </button>
            <button
              type="button"
              className="hs-dropdown-toggle py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
              onClick={onConfirm}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
