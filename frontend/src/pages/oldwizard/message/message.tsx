import { MessageEditor } from '../../../components/message-editor';
import { useWizardContext } from '../wizard-context';
import { MESSAGE_PLACEHODLER } from './message-placeholder';

export const Message = () => {
  const { message } = useWizardContext();

  return <MessageEditor value={message.value} onChange={message.setValue} placeholder={MESSAGE_PLACEHODLER} />;
};
