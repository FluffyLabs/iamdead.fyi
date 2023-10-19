import 'react-quill/dist/quill.snow.css';

import ReactQuill from 'react-quill';

import styles from './styles.module.scss';

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

const noToolbar = {
  toolbar: [],
};

type Props = {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
};

export const MessageEditor = ({ onChange, value, placeholder, readOnly }: Props) => {
  return (
    <ReactQuill
      readOnly={readOnly}
      theme="snow"
      value={value}
      modules={readOnly ? { toolbar: [] } : modules}
      onChange={onChange}
      className={styles.editor}
      placeholder={placeholder}
    />
  );
};
