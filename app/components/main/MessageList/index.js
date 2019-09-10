import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/core/SvgIcon/SvgIcon';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import { getCurrentConversation, getSelfMamRoot } from '../../../store/selectors/main';
import style from './MessageList.css';
import { Account, Contact, Conversation } from '../../../storage';
import Compose from '../Compose';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import Message from '../Message';
import { getIotaSettings } from '../../../libs/iota';
import { getSettings } from '../../../store/selectors/settings';
import { fetchContactInfo, sendConversationRequest } from '../../../libs/contact';
import { finishLoadingMessageList, notify, startLoadingMessageList } from '../../../store/actions/ui';

const MessageList = props => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const currentConversation = useSelector(getCurrentConversation);
  const [conversationName, setConversationName] = useState('');
  const selfMamRoot = useSelector(getSelfMamRoot);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isCheckingSuccess, setIsCheckingSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [newContact, setNewContact] = useState(null);
  const iotaSettings = getIotaSettings(useSelector(getSettings));
  const passwordHash = useSelector(state => state.main.password);
  const accountData = Account.data;

  useEffect(() => {
    if (currentConversation) {
      setMessages(Conversation.getMessagesFromId(currentConversation));
      setConversationName(Conversation.getConversationName());
    }
  });

  const closeAddDialog = () => {
    setOpenAddDialog(false);
    setIsCheckingSuccess(false);
    setNewContact(null);
  };

  const checkAddress = async address => {
    setIsCheckingAddress(true);
    if (address === accountData.mamRoot) {
      dispatch(notify('error', 'You are already in this conversation'));
      return;
    }
    const checkContactInConversation = Conversation.getParticipantFromConversation(currentConversation, address);
    if (checkContactInConversation) {
      dispatch(notify('error', 'This contact is already in the conversation'));
      return;
    }
    const contact = Contact.getById(address);

    if (contact) {
      setNewContact(contact);
      setIsCheckingSuccess(true);
    } else {
      const fetchedData = await fetchContactInfo(iotaSettings, address);
      if (!fetchedData) {
        dispatch(notify('error', 'Cannot find information for this address'));
      } else {
        fetchedData.mamRoot = address;
        console.log(fetchedData);
        setNewContact(fetchedData);
        setIsCheckingSuccess(true);
      }
    }
    setIsCheckingAddress(false);
  };

  const addContact = () => {
    if (newContact && newContact.mamRoot) {
      closeAddDialog();
      dispatch(startLoadingMessageList());
      sendConversationRequest(iotaSettings, passwordHash, newContact.mamRoot, false)
        .then(bool => {
          dispatch(finishLoadingMessageList());
          if (bool) {
            dispatch(notify('success', 'New contact added'));
          } else {
            dispatch(notify('error', 'Add new contact fail'));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(finishLoadingMessageList());
          Contact.delete(newContact.mamRoot);
        });
    }
  };

  const onInputAddressChange = e => {
    setAddress(e.target.value);
    if (isCheckingSuccess) {
      setIsCheckingSuccess(false);
    }
    if (newContact) {
      setNewContact(null);
    }
  };

  const renderMessages = () => {
    let i = 0;
    const renderedMessages = [];
    const messageCount = messages.length;
    while (i < messageCount) {
      const previous = messages[i - 1];
      const current = messages[i];
      const next = messages[i + 1];
      const isMine = current.sender.mamRoot === selfMamRoot;
      const currentMoment = moment(current.createdTime);
      let prevBySameAuthor = false;
      let nextBySameAuthor = false;
      let startsSequence = true;
      let endsSequence = true;
      let showTimestamp = true;

      if (previous) {
        const previousMoment = moment(previous.createdTime);
        const previousDuration = moment.duration(currentMoment.diff(previousMoment));
        prevBySameAuthor = previous.sender.mamRoot === current.sender.mamRoot;

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false;
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false;
        }
      }

      if (next) {
        const nextMoment = moment(next.createdTime);
        const nextDuration = moment.duration(nextMoment.diff(currentMoment));
        nextBySameAuthor = next.sender.mamRoot === current.sender.mamRoot;

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false;
        }
      }

      renderedMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />
      );

      // Proceed to the next message.
      i += 1;
    }

    return renderedMessages;
  };

  return (
    <div>
      <Toolbar
        title={conversationName}
        rightItems={[<ToolbarButton key="info" icon="ion-ios-information-circle-outline" />]}
      />

      <div className={style.messageListContainer}>{renderMessages()}</div>

      {currentConversation ? <Compose conversation={currentConversation} /> : ''}

      <Dialog fullWidth maxWidth="sm" open={openAddDialog} onClose={closeAddDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add new member to conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add contact
            {isCheckingSuccess && newContact && newContact.username ? `: ${newContact.username}` : ''}
          </DialogContentText>
          <TextField
            autoFocus
            id="address"
            label="Address"
            type="text"
            value={address}
            onChange={onInputAddressChange}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeAddDialog} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => checkAddress(address)}
            disabled={isCheckingAddress || !address}
            color="primary"
            variant="contained"
          >
            Check
            {isCheckingSuccess && <CheckIcon />}
            {isCheckingAddress && <CircularProgress size={24} />}
          </Button>

          <Button disabled={!isCheckingSuccess} color="primary" variant="contained" onClick={addContact}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default MessageList;
