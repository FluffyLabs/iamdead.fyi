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

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const MessageEditor = ({ onChange, value, placeholder }: Props) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      modules={modules}
      onChange={onChange}
      className={styles.editor}
      placeholder={placeholder}
    />
  );
};
