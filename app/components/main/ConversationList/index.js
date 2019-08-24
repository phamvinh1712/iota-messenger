import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import ConversationSearch from '../ConversationSearch';
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import style from './ConversationList.css';
import ConversationListItem from '../ConversationListItem';
import { finishLoadingConversationList, notify, startLoadingConversationList } from '../../../store/actions/ui';
import { Contact, Conversation } from '../../../storage';
import { fetchContactInfo, sendContactRequest } from '../../../libs/contact';
import { getSettings } from '../../../store/selectors/settings';
import { getIotaSettings } from '../../../libs/iota';

const ConversationList = () => {
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [isCheckingSuccess, setIsCheckingSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [newContact, setNewContact] = useState(null);
  const [conversations, setConversations] = useState([]);
  const passwordHash = useSelector(state => state.main.password);
  const iotaSettings = getIotaSettings(useSelector(getSettings));

  const closeAddDialog = () => {
    setOpenDialog(false);
    setIsCheckingSuccess(false);
    setNewContact(null);
  };

  const checkAddress = async address => {
    setIsCheckingAddress(true);
    const fetchedData = await fetchContactInfo(iotaSettings, address);
    if (!fetchedData) {
      dispatch(notify('error', 'Cannot find information for this address'));
    } else {
      const contact = Contact.getById(address);
      if (contact) {
        dispatch(notify('error', 'This contact has already been added'));
      } else {
        fetchedData.mamRoot = address;
        console.log(fetchedData);
        setNewContact(fetchedData);
        setIsCheckingSuccess(true);
      }
    }
    setIsCheckingAddress(false);
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

  const addContact = () => {
    if (newContact && newContact.mamRoot) {
      closeAddDialog();
      dispatch(startLoadingConversationList());
      sendContactRequest(iotaSettings, passwordHash, newContact.mamRoot)
        .then(bool => {
          dispatch(finishLoadingConversationList());
          if (bool) {
            dispatch(notify('success', 'New contact added'));
          } else {
            dispatch(notify('error', 'Add new contact fail'));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(finishLoadingConversationList());
          Contact.delete(newContact.mamRoot);
        });
    }
  };

  useEffect(() => {
    const conversationList = Conversation.getDataAsArray();
    setConversations(
      conversationList.map(conversation => {
        let lastMessage = '';
        if (conversation.messages && conversation.messages.length) {
          const { length } = conversation.messages;
          lastMessage = conversation.messages[length - 1].content;
        }
        return {
          username: conversation.participants[0].username,
          lastMessage,
          mamRoot: conversation.mamRoot
        };
      })
    );
  });

  return (
    <React.Fragment>
      <div className={style.conversationList}>
        <Toolbar
          title="Messenger"
          leftItems={[<ToolbarButton key="cog" icon="ion-ios-cog" />]}
          rightItems={[
            <ToolbarButton key="add" icon="ion-ios-add-circle-outline" onClick={() => setOpenDialog(true)} />
          ]}
        />
        <ConversationSearch />
        {conversations.map(conversation => (
          <ConversationListItem key={conversation.mamRoot} data={conversation} />
        ))}
      </div>
      <Dialog fullWidth maxWidth="sm" open={openDialog} onClose={closeAddDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New contact</DialogTitle>
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
    </React.Fragment>
  );
};

export default ConversationList;
