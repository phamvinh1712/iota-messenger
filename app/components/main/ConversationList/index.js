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
import Toolbar from '../Toolbar';
import ToolbarButton from '../ToolbarButton';
import style from './ConversationList.css';
import ConversationListItem from '../ConversationListItem';
import { finishLoadingConversationList, notify, startLoadingConversationList } from '../../../store/actions/ui';
import { Account, Contact, Conversation } from '../../../storage';
import { fetchContactInfo, sendConversationRequest } from '../../../libs/contact';
import { getSettings } from '../../../store/selectors/settings';
import { getIotaSettings } from '../../../libs/iota';
import { updateMamChannel } from '../../../libs/mam';
import { getSeed } from '../../../libs/crypto';

const ConversationList = ({ updateConversationAddress }) => {
  const dispatch = useDispatch();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isCheckingSuccess, setIsCheckingSuccess] = useState(false);
  const [address, setAddress] = useState('');
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  const [newContact, setNewContact] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const passwordHash = useSelector(state => state.main.password);
  const iotaSettings = getIotaSettings(useSelector(getSettings));
  const accountData = Account.data;
  const [username, setUsername] = useState(accountData.username);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const closeAddDialog = () => {
    setOpenAddDialog(false);
    setIsCheckingSuccess(false);
    setNewContact(null);
  };

  const checkAddress = async address => {
    setIsCheckingAddress(true);
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
      sendConversationRequest(iotaSettings, passwordHash, newContact.mamRoot)
        .then(bool => {
          dispatch(finishLoadingConversationList());
          if (bool) {
            dispatch(notify('success', 'New contact added'));
            updateConversationAddress();
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

  const changeUsername = async () => {
    const oldUsername = accountData.username;
    setIsSavingUsername(true);
    try {
      const seed = await getSeed(passwordHash, 'string');
      const updatedAccountData = {
        username,
        publicKey: accountData.publicKey,
        address: accountData.address
      };
      await updateMamChannel(iotaSettings, updatedAccountData, seed, 'private');
      Account.update({ username });
      dispatch(notify('success', 'Change username success'));
    } catch (e) {
      console.log(e);
      Account.update({ username: oldUsername });
      dispatch(notify('error', 'Change username failed'));
    }
    setIsSavingUsername(false);
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
          conversationName: conversation.channels.map(channel => channel.owner.username).join(','),
          lastMessage,
          seed: conversation.seed
        };
      })
    );
  });

  return (
    <React.Fragment>
      <div className={style.conversationList}>
        <Toolbar
          title="Messenger"
          leftItems={[<ToolbarButton key="cog" icon="ion-ios-cog" onClick={() => setOpenAccountDialog(true)} />]}
          rightItems={[
            <ToolbarButton key="add" icon="ion-ios-add-circle-outline" onClick={() => setOpenAddDialog(true)} />
          ]}
        />
        {conversations.map(conversation => (
          <ConversationListItem key={conversation.seed} data={conversation} />
        ))}
      </div>
      <Dialog fullWidth maxWidth="sm" open={openAddDialog} onClose={closeAddDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">New conversation</DialogTitle>
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

      <Dialog
        fullWidth
        maxWidth="sm"
        open={openAccountDialog}
        onClose={() => setOpenAccountDialog(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Account setting</DialogTitle>
        <DialogContent>
          <DialogContentText>Your address : {accountData.mamRoot}</DialogContentText>
          <TextField
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAccountDialog(false)} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => changeUsername()}
            disabled={!username || username === accountData.username}
            color="primary"
            variant="contained"
          >
            Save
            {isSavingUsername && <CheckIcon />}
            {isSavingUsername && <CircularProgress size={24} />}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default ConversationList;
